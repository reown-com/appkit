const fs = require('fs')

function getName (path) {
  const name = path.replace(/^.*[\\/]/, '')
  if (name) {
    return name
  }
  return ''
}

function statPath (path) {
  return new Promise((resolve, reject) => {
    fs.stat(path, async (error, stat) => {
      if (error) {
        return reject(error)
      }
      resolve(stat)
    })
  })
}

function writeFile (path, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, data, (err, res) => {
      if (err) {
        reject(err)
      }
      resolve(res)
    })
  })
}

function createDir (path) {
  return new Promise((resolve, reject) => {
    fs.mkdir(path, err => {
      if (err) {
        return reject(err)
      }
      resolve(true)
    })
  })
}

function exists (path) {
  return new Promise((resolve, reject) => {
    fs.stat(path, err => {
      if (err) {
        if (err.code === 'ENOENT') {
          return resolve(false)
        } else {
          return reject(err)
        }
      }
      return resolve(true)
    })
  })
}

async function verifyDir (path) {
  let pathExists = await exists(path)
  if (!pathExists) {
    pathExists = await createDir(path)
  }
  return pathExists
}

async function verifyFile (path) {
  let pathExists = await exists(path)
  if (!pathExists) {
    pathExists = await writeFile(path, '')
  }
  return pathExists
}

module.exports = {
  getName,
  statPath,
  writeFile,
  createDir,
  exists,
  verifyDir,
  verifyFile
}
