const path = require("path");
const pkg = require("../package.json");

const { DIST_DIR, LIB_DIR, verifyDir, archiveDir } = require("./common");

async function zip() {
  await verifyDir(DIST_DIR);
  const outputPath = path.join(DIST_DIR, pkg.name + ".zip");
  try {
    await archiveDir(LIB_DIR, outputPath);
  } catch (err) {
    console.error(err);
  }
}

zip();
