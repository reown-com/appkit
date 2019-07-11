const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const pkg = require("../package.json");

const { getName, verifyFile, verifyDir } = require("./common");

const ROOT_DIR = path.join(__dirname, "../");
const DIST_DIR = path.join(ROOT_DIR, "./dist");

function archiveDir(inputPath, outputPath) {
  return new Promise(async (resolve, reject) => {
    await verifyFile(outputPath);
    const output = fs.createWriteStream(outputPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => {
      console.log(
        `Archived ${getName(outputPath)} (${archive.pointer()} bytes)`
      );
      resolve(true);
    });

    output.on("end", function() {
      console.log("Data has been drained");
      resolve(true);
    });

    archive.on("warning", function(err) {
      if (err.code === "ENOENT") {
        console.log("WARN:", err.message);
      } else {
        reject(err);
      }
    });
    archive.pipe(output);

    archive.directory(inputPath, false);

    archive.finalize();
  });
}

async function zip() {
  await verifyDir(DIST_DIR);
  const inputPath = path.join(ROOT_DIR, "/lib");
  const outputPath = path.join(DIST_DIR, pkg.name + ".zip");
  try {
    await archiveDir(inputPath, outputPath);
  } catch (err) {
    console.error(err);
  }
}

zip();
