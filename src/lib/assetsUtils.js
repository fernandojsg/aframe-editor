function insertNewAsset (type, id, src, anonymousCrossOrigin) {
  var element = null;
  switch (type) {
    case 'img': {
      element = document.createElement('img');
      element.id = id;
      element.src = src;
    } break;
  }

  if (anonymousCrossOrigin) {
    element.crossOrigin = 'anonymous';
  }

  if (element) {
    document.getElementsByTagName('a-assets')[0].appendChild(element);
  }
}

module.exports = {
  insertNewAsset: insertNewAsset
};
