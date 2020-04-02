const fs = require("fs");
const path = require("path");
const archiver = require("archiver");

const ROOT_DIR = path.join(__dirname, "../");
const DIST_DIR = path.join(ROOT_DIR, "./dist");
const LIB_DIR = path.join(ROOT_DIR, "./lib");

function getName(path) {
  const name = path.replace(/^.*[\\/]/, "");
  if (name) {
    return name;
  }
  return "";
}

function statPath(path) {
  return new Promise((resolve, reject) => {
    fs.stat(path, async (error, stat) => {
      if (error) {
        return reject(error);
      }
      resolve(stat);
    });
  });
}

function writeFile(path, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, data, (err, res) => {
      if (err) {
        reject(err);
      }
      resolve(res);
    });
  });
}

function createDir(path) {
  return new Promise((resolve, reject) => {
    fs.mkdir(path, err => {
      if (err) {
        return reject(err);
      }
      resolve(true);
    });
  });
}

function exists(path) {
  return new Promise((resolve, reject) => {
    fs.stat(path, err => {
      if (err) {
        if (err.code === "ENOENT") {
          return resolve(false);
        } else {
          return reject(err);
        }
      }
      return resolve(true);
    });
  });
}

async function verifyDir(path) {
  let pathExists = await exists(path);
  if (!pathExists) {
    pathExists = await createDir(path);
  }
  return pathExists;
}

async function verifyFile(path) {
  let pathExists = await exists(path);
  if (!pathExists) {
    pathExists = await writeFile(path, "");
  }
  return pathExists;
}

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

function copyFile(fileToCopy, outputFile) {
  return new Promise((resolve, reject) => {
    fs.copyFile(fileToCopy, outputFile, function(err) {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
}

module.exports = {
  ROOT_DIR,
  DIST_DIR,
  LIB_DIR,
  getName,
  statPath,
  writeFile,
  createDir,
  exists,
  verifyDir,
  verifyFile,
  archiveDir,
  copyFile
};
