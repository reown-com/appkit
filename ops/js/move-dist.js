const path = require("path");

const {
  ROOT_DIR,
  copyFile,
  readDir,
  isDir,
  exists,
  verifyDir,
  statPath,
  logBundles,
} = require("./shared");

const PACKAGES_DIR = path.join(ROOT_DIR, "./packages");
const TARGET_DIR = path.join(ROOT_DIR, "./dist");

const bundles = [];

async function isPackage(filePath) {
  return !!((await isDir(filePath)) && (await exists(path.join(filePath, "package.json"))));
}

function getName(filePath) {
  return path.basename(filePath).replace(path.extname(filePath), "");
}

async function copyUmdBundle(filePath) {
  if (await isDir(filePath)) {
    const newFileExt = ".min.js";
    const pkgName = getName(filePath);
    const newFileName = pkgName + newFileExt;
    const fileToCopy = path.join(filePath, "dist", "umd", "index.min.js");
    const outputFile = path.join(TARGET_DIR, newFileName);

    if (!(await exists(fileToCopy))) return;

    try {
      await copyFile(fileToCopy, outputFile);
      bundles.push({
        label: newFileName,
        value: ((await statPath(fileToCopy)).size / 1e3).toFixed(2),
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  }
}

async function moveDist(targetDir) {
  try {
    const packages = await readDir(targetDir);

    await Promise.all(
      packages.map(async packageDir => {
        if (["node_modules", "dist", "test"].includes(packageDir)) {
          return;
        }
        const filePath = path.join(targetDir, packageDir);
        if (await isPackage(filePath)) {
          return copyUmdBundle(filePath);
        }
        return moveDist(filePath);
      }),
    );
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Could not list the directory.\n", err.message);
    process.exit(1);
  }
}

async function run() {
  await verifyDir(TARGET_DIR);
  await moveDist(PACKAGES_DIR);
  logBundles(bundles);
}

run();
