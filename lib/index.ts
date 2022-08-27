import TOML from "@iarna/toml";

export class Index {
  packages: { [key: string]: PackageEntry };
  sha: string;
}

export class PackageEntry {
  url: string;
  description: string;
  versions: { [key: string]: PackageVersion };
}

export class PackageVersion {
  rev: string;
  deps: { [key: string]: string };
}

export const getIndex = async (): Promise<Index> => {
  const file = await (
    await fetch(
      "https://api.github.com/repos/RogueMacro/grill-index/contents/index.toml"
    )
  ).json();

  const text = Buffer.from(file.content, file.encoding).toString();
  return Object.assign(new Index(), {
    packages: TOML.parse(text),
    sha: file.sha,
  });
};
