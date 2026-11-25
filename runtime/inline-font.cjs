module.exports = function inlineFont(source) {
  return `export default ${JSON.stringify(`data:font/ttf;base64,${source.toString("base64")}`)};`;
};

module.exports.raw = true;
