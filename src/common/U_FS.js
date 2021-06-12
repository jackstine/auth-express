const fs = require("fs");
const { promisify } = require("util");

module.exports = {
  read: async function (filePath) {
    let readFile = promisify(fs.readFile).bind(fs);
    return readFile(filePath).then((resp) => {
      return resp.toString();
    });
  },
};
