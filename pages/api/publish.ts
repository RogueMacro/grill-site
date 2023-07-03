import { NextApiHandler } from "next/types";
import { getPrivateUsers } from "../../lib/users";
import { PackageEntry, getIndex } from "../../lib/index";
import request from "request";
import TOML from "@iarna/toml";

var worker = null;

const handler: NextApiHandler = async (req, res) => {
  if (worker) await worker;
  worker = new Promise(async (resolve, reject) => {
    if (req.method != "POST") {
      return onResponse(res, resolve)
        .status(405)
        .json({ allow: ["POST"] });
    }

    const body = req.body;
    if (!body.hasOwnProperty("access_token")) {
      return onResponse(res, resolve)
        .status(400)
        .json({ message: "'access_token' not found in body." });
    } else if (!body.hasOwnProperty("package")) {
      return onResponse(res, resolve)
        .status(400)
        .json({ message: "'package' not found in body." });
    } else if (!body.hasOwnProperty("metadata")) {
      return onResponse(res, resolve)
        .status(400)
        .json({ message: "'metadata' not found in body." });
    } else if (!body.metadata.hasOwnProperty("version")) {
      return onResponse(res, resolve)
        .status(400)
        .json({ message: "'metadata.version' not found in body." });
    } else if (!body.metadata.hasOwnProperty("revision")) {
      return onResponse(res, resolve)
        .status(400)
        .json({ message: "'metadata.revision' not found in body." });
    } else if (!body.metadata.hasOwnProperty("dependencies")) {
      return onResponse(res, resolve)
        .status(400)
        .json({ message: "'metadata.dependencies' not found in body." });
    } else if (!body.metadata.hasOwnProperty("description")) {
      return onResponse(res, resolve)
        .status(400)
        .json({ message: "'metadata.description' not found in body." });
    }

    const accessToken: string = body.access_token;
    const userId: string = Buffer.from(
      accessToken.split(".")[0],
      "base64"
    ).toString();
    const packageName: string = body.package;
    const { version, revision, dependencies, description } = body.metadata as {
      version: string;
      revision: string;
      dependencies: { [key: string]: string };
      description: string;
    };

    const users = await getPrivateUsers();
    const user = users.find((user) => user.id == userId);
    if (!user) {
      return onResponse(res, resolve)
        .status(404)
        .json({ message: "User not found." });
    }

    if (user.access_token != accessToken) {
      return onResponse(res, resolve)
        .status(403)
        .json({ message: "Invalid access token." });
    }

    let index = await getIndex();
    let newPackage: PackageEntry = null;
    let exists = false;
    if (!index.get(packageName)) {
      if (!body.hasOwnProperty("create_url")) {
        return onResponse(res, resolve).status(400).json({
          message:
            "Package does not exist. Please provide a 'create_url' if you wish to create it.",
        });
      }

      if (!parseRepoUrl(body.create_url)) {
        return onResponse(res, resolve).status(400).json({
          message: "Invalid 'create_url'. Url has to be a github repository.",
          create_url: body.create_url,
        });
      }

      newPackage = {
        url: body.create_url,
        description: "",
        versions: {},
      };

      if (!user.packages.includes(packageName)) {
        await makeUserPackageAuthor(user, packageName);
      }
    } else {
      newPackage = index.get(packageName);
      exists = true;
    }

    if (!user.packages.includes(packageName)) {
      return onResponse(res, resolve)
        .status(403)
        .json({
          message: `User doesn't have access to package '${packageName}'.`,
        });
    }

    const versions = newPackage.versions;
    if (version in versions) {
      return onResponse(res, resolve)
        .status(400)
        .json({ message: "Version already exists." });
    }

    if (!(await revisionExists(newPackage.url, revision))) {
      return onResponse(res, resolve)
        .status(400)
        .json({ message: "Revision was not found." });
    }

    versions[version] = {
      rev: revision,
      deps: dependencies,
    };

    newPackage.description = description;

    let requestBody = {
      message: exists
        ? `bump ${packageName} to ${version}`
        : `create ${packageName}`,
      content: Buffer.from(
        TOML.stringify(newPackage as { [key: string]: any })
      ).toString("base64"),
    };

    if (exists) {
      requestBody["sha"] = index.getSha(packageName);
    }

    request.put(
      "https://api.github.com/repos/RogueMacro/grill-index/contents/" +
        packageName,
      {
        json: true,
        body: requestBody,
        headers: {
          "User-Agent": "node.js",
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
        },
      },
      function (error, response, body) {
        if (error || response.statusCode != 200) {
          return onResponse(res, resolve)
            .status(500)
            .json({
              message: `Could not make GitHub API request: ${error}: ${response.body.message}`,
              statusCode: response.statusCode,
              response: response.body.message || response.body,
            });
        } else {
          return onResponse(res, resolve)
            .status(200)
            .send(`Published v${version} of ${packageName}`);
        }
      }
    );

    // only for backward compatibility for "rust" grill
    // to be removed in "beef" grill
    index.packages[packageName] = newPackage;
    const indexFile = await (
      await fetch(
        "https://api.github.com/repos/RogueMacro/grill-index/contents/index.toml"
      )
    ).json();
    request.put(
      "https://api.github.com/repos/RogueMacro/grill-index/contents/index.toml",
      {
        json: true,
        body: {
          message: `bump ${packageName} to ${version}`,
          content: Buffer.from(
            TOML.stringify(index.packages as { [key: string]: any })
          ).toString("base64"),
          sha: indexFile.sha,
        },
        headers: {
          "User-Agent": "node.js",
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
        },
      },
      function (error, response, body) {
        if (error || response.statusCode != 200) {
          return onResponse(res, resolve)
            .status(500)
            .json({
              message: `Could not make GitHub API request to update index.toml: ${response.body.message}`,
              statusCode: response.statusCode,
              response: response.body.message || response.body,
            });
        } else {
          return onResponse(res, resolve)
            .status(200)
            .send(`Published v${version} of ${packageName}`);
        }
      }
    );
  });

  await worker;
};

const revisionExists = async (
  url: string,
  revision: string
): Promise<boolean> => {
  const result = parseRepoUrl(url);
  if (!result) {
    return false;
  }

  const response = await fetch(
    `https://api.github.com/repos/${result.owner}/${result.repo}/commits/${revision}`
  );

  return response.status == 200;
};

const parseRepoUrl = (url: string): { owner: string; repo: string } | null => {
  const pattern = new RegExp(
    "^(?:git@|https://)github.com[:/](?<owner>[^.]+)/(?<repo>[^.]+)(?:.git)?$"
  );
  const match = pattern.exec(url);
  if (match) {
    return { owner: match.groups.owner, repo: match.groups.repo };
  } else {
    return null;
  }
};

const onResponse = (res, resolve) => {
  resolve();
  worker = null;
  return res;
};

const makeUserPackageAuthor = (user, packageName) => {
  var tokenRequestOptions = {
    method: "POST",
    url: "https://dev-bzktuxhd.us.auth0.com/oauth/token",
    headers: { "content-type": "application/json" },
    body: `{"client_id":"${process.env.SERVER_ID}","client_secret":"${process.env.SERVER_SECRET}","audience":"https://dev-bzktuxhd.us.auth0.com/api/v2/","grant_type":"client_credentials"}`,
  };
  return new Promise((resolve, reject) =>
    request(tokenRequestOptions, function (error, response, body) {
      if (error) {
        return reject(error);
      }

      if (!user.packages.includes(packageName)) {
        user.packages.push(packageName);
      }

      var userRequestOptions = {
        method: "PATCH",
        url: `https://dev-bzktuxhd.us.auth0.com/api/v2/users/${user.id}`,
        headers: {
          authorization: `Bearer ${JSON.parse(body).access_token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          app_metadata: {
            packages: user.packages,
          },
        }),
      };
      request(userRequestOptions, function (error, response, body) {
        if (error) {
          return reject(error);
        }

        resolve(null);
      });
    })
  );
};

export default handler;
