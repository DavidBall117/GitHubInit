const fs = require(`fs`);
const path = require(`path`);

const getCurrentDirectory = () => {
  return path.basename(process.cwd());
};

const directoryOrFileExists = (filePath) => {
  return fs.existsSync(filePath);
};

module.exports = {
  getCurrentDirectory,
  directoryOrFileExists,
};
