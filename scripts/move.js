const path = require("path");
const pkg = require("../package.json");

const {
  DIST_DIR,
  LIB_DIR,
  statPath,
  verifyDir,
  copyFile
} = require("./common");

async function move() {
  await verifyDir(DIST_DIR);
  const fileToCopy = path.join(LIB_DIR, "index.js");
  const newFileName = pkg.name + ".min.js";
  const outputPath = path.join(DIST_DIR, newFileName);
  try {
    await copyFile(fileToCopy, outputPath);
    console.log(
      `${newFileName} (${(await statPath(fileToCopy)).size / 1e3} kB)`
    );
  } catch (err) {
    console.error(err);
  }
}

move();
