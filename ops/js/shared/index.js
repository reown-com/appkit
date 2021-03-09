const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const ROOT_DIR = path.join(__dirname, "../../../");

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

function readFile(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, res) => {
      if (err) {
        reject(err);
      }
      resolve(res);
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

function readDir(path) {
  return new Promise((resolve, reject) => {
    fs.readdir(path, (err, files) => {
      if (err) {
        return reject(err);
      }
      resolve(files);
    });
  });
}

async function isDir(path) {
  const stat = await statPath(path);
  return stat.isDirectory();
}

async function isFile(path) {
  const stat = await statPath(path);
  return stat.isFile();
}

function isJson(fileName) {
  const ext = path.extname(fileName);
  return ext === ".json";
}
function formatJson(json) {
  return JSON.stringify(json, null, 2) + "\n";
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

function execGitCmd(args) {
  return new Promise((resolve, reject) => {
    if (!args.length) {
      reject(new Error("No arguments were given"));
    }

    const commandExecuter = spawn("git", args);
    let stdOutData = "";
    let stderrData = "";

    commandExecuter.stdout.on("data", data => (stdOutData += data));
    commandExecuter.stderr.on("data", data => (stderrData += data));
    commandExecuter.on("close", code =>
      code !== 0 ? reject(stderrData.toString()) : resolve(stdOutData.toString()),
    );
  });
}

function padString(str, length, left, padding = "0") {
  const diff = length - str.length;
  let result = str;
  if (diff > 0) {
    const pad = padding.repeat(diff);
    result = left ? pad + str : str + pad;
  }
  return result;
}

function padLeft(str, length, padding = "0") {
  return padString(str, length, true, padding);
}

function padRight(str, length, padding = "0") {
  return padString(str, length, false, padding);
}

function logResults(results) {
  // eslint-disable-next-line no-console
  console.log("\n----------------- RESULT ------------------\n");
  results.map(entry => {
    if (entry.label === "linebreak") {
      // eslint-disable-next-line no-console
      console.log("\n");
    } else {
      // eslint-disable-next-line no-console
      console.log(padRight(`${entry.label}`, 32, " "), padLeft(`${entry.value}`, 8, " "));
    }
  });
  // eslint-disable-next-line no-console
  console.log("\n-------------------------------------------\n");
}

function logBundles(bundles) {
  const sorted = bundles.sort((a, b) => a.value - b.value);
  const results = [
    { label: "File Name", value: "Size (kb)" },
    { label: "linebreak", value: "" },
    ...sorted,
  ];

  logResults(results);
}

module.exports = {
  ROOT_DIR,
  execGitCmd,
  readFile,
  statPath,
  writeFile,
  copyFile,
  createDir,
  readDir,
  isDir,
  isFile,
  exists,
  verifyDir,
  verifyFile,
  logResults,
  logBundles,
  isJson,
  formatJson,
};
