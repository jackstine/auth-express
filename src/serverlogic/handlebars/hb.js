const handlebars = require("handlebars");
const U_FS = require("../../common/U_FS");

/**
 *
 * @param {*} htmlFile
 * @param {*} data
 * @returns
 */
const createHTML = async function (htmlFile, data) {
  let rawHB = await U_FS.read(htmlFile);
  const template = handlebars.compile(rawHB);
  return template(data);
};

module.exports = {
  createHTML,
};
