function insertNewAsset (type, id, src, anonymousCrossOrigin, onLoadedCallback) {
  var element = null;
  switch (type) {
    case 'img': {
      element = document.createElement('img');
      if (anonymousCrossOrigin) { element.crossOrigin = 'anonymous'; }
      element.id = id;
      element.src = src;
    } break;
  }

  if (element) {
    element.onload = function () {
      if (onLoadedCallback) { onLoadedCallback(); }
    }
    document.getElementsByTagName('a-assets')[0].appendChild(element);
  }
}

module.exports = {
  insertNewAsset: insertNewAsset
};
