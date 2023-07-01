import TOML from "@iarna/toml";

export class Index {
  packages: { [key: string]: PackageEntry };
  packageShas: { [key: string]: string };

  get(packageName: string): PackageEntry {
    for (let key in this.packages) {
      if (key == packageName) {
        console.log("CACHED");
        return this.packages[key];
      }
    }

    return null;
  }

  getSha(packageName: string): string {
    for (let key in this.packageShas) {
      if (key == packageName) {
        return this.packageShas[key];
      }
    }

    return null;
  }
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
  const files: any[] = await (
    await fetch("https://api.github.com/repos/RogueMacro/grill-index/contents")
  ).json();

  let packages = {};
  let packageShas = {};
  for (let file of files) {
    packageShas[file.name] = file.sha;
    const specificFile = await (
      await fetch(
        "https://api.github.com/repos/RogueMacro/grill-index/contents/" +
          file.name
      )
    ).json();
    const text = Buffer.from(
      specificFile.content,
      specificFile.encoding
    ).toString();
    const entry = TOML.parse(text) as {} as PackageEntry;
    packages[file.name] = entry;
  }

  let index = Object.assign(new Index(), {
    packages,
    packageShas,
  });

  return index;
};
