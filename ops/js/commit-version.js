const path = require("path");

const { ROOT_DIR, execGitCmd } = require("./shared");

const LERNA_JSON = path.join(ROOT_DIR, "lerna.json");

const { version } = require(LERNA_JSON);

async function commitVersion() {
  try {
    await execGitCmd(["add", "."]);
    await execGitCmd(["commit", "-am", `${version}`]);
    // eslint-disable-next-line no-console
    console.log(`Committed version ${version} successfully`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    // eslint-disable-next-line no-console
    console.log(`Failed to commit version ${version}`);
  }
}

commitVersion();
