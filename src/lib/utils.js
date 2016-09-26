function getNumber (value) {
  return parseFloat(value.toFixed(2));
}

function getMajorVersion (version) {
  var major = version.split('.');
  var clean = false;
  for (var i = 0; i < major.length; i++) {
    if (clean) { major[i] = 0; }
    else if (major[i] !== '0') { clean = true; }
  }
  return major.join('.');
}

module.exports = {
  getNumber: getNumber,
  getMajorVersion: getMajorVersion
};
