import { NextApiHandler } from "next";
import TOML from "@iarna/toml";
import { Index, PackageEntry, PackageVersion } from "../../lib/index";
import { getPrivateUsers, getPublicUsers } from "../../lib/users";

const handler: NextApiHandler = async (req, res) => {
  // let response: Response = await fetch(
  //   // "https://api.github.com/search/commits?q=repo:roguemacro/dummy+hash:bf02a899c6fd1b4e45de860d83141bedda278ae0"
  //   "https://api.github.com/repos/RogueMacro/grill-index/commits/b2921fec9a2df88ff12457c3b25c4f821470dfe5"
  // );

  // const body = await response.json();
  // console.log(body);

  let pattern = new RegExp(
    "^(?:git@|https://)github.com[:/](?<owner>[^.]+)/(?<repo>[^.]+)(?:.git)?$"
  );
  let match = pattern.exec("https://github.com/RogueMacro/dummy");
  if (match) {
    console.log("Owner:", match.groups.owner);
    console.log("Repo:", match.groups.repo);
  } else {
    console.log("invalid");
  }

  res.status(200).json({});
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default handler;

// console.log(
//     TOML.stringify({
//       dummy2: {
//         url: "https://github.com/RogueMacro/dummy2",
//         versions: {
//           "0.1.0": {
//             rev: "bf02a899c6fd1b4e45de860d83141bedda278ae1",
//             deps: {
//               dummy3: "0.1.0",
//             },
//           },
//           "0.1.1": {
//             rev: "bf02a899c6fd1b4e45de860d83141bedda278ae1",
//             deps: { dummy3: "0.1.0" },
//           },
//           "0.1.2": {
//             rev: "bf02a899c6fd1b4e45de860d83141bedda278ae1",
//             deps: { dummy3: "0.1.0", dummy4: "0.1.0" },
//           },
//           "0.1.3": {
//             rev: "bf02a899c6fd1b4e45de860d83141bedda278ae1",
//             deps: { dummy3: "0.1.0", dummy4: "0.1.0", dummy5: "0.1.0" },
//           },
//         },
//       },
//     })
//   );

// var plain = {
//   packages: {},
//   sha: "abc123",
// };

// plain.packages["dummy2"] = {
//   url: 2,
//   versions: {
//     "0.1.0": {
//       rev: "bf02a899c6fd1b4e45de860d83141bedda278ae1",
//       invalid: "f",
//       deps: {
//         dummy3: "0.1.0",
//       },
//     },
//     "0.1.1": {
//       rev: "bf02a899c6fd1b4e45de860d83141bedda278ae1",
//       deps: { dummy3: "0.1.0" },
//     },
//     "0.1.2": {
//       rev: "bf02a899c6fd1b4e45de860d83141bedda278ae1",
//       deps: { dummy3: "0.1.0", dummy4: "0.1.0" },
//     },
//     "0.1.3": {
//       rev: "bf02a899c6fd1b4e45de860d83141bedda278ae1",
//       deps: { dummy3: "0.1.0", dummy4: "0.1.0", dummy5: "0.1.0" },
//     },
//   },
// };

// const index: Index = Object.assign({}, new Index(), plain as Index);
// console.log(JSON.stringify(index, null, 2));
// console.log(index.packages["dummy2"].url);

// const users = await getPrivateUsers();
// console.log(JSON.stringify(users, null, 2));
