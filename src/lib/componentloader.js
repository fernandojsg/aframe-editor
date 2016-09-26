import {getMajorVersion} from './utils.js';

function ComponentLoader () {
  this.components = null;
  this.loadComponentsData();
}

ComponentLoader.prototype = {
  loadComponentsData: function () {
    return;
    var xhr = new window.XMLHttpRequest();
    // @todo Remove the sync call and use a callback
    xhr.open('GET', 'https://aframe.io/aframe-registry/build/' + getMajorVersion(AFRAME.version) + '.json');
    xhr.onload = function () {
      this.components = window.JSON.parse(xhr.responseText).components;
      console.info('Loaded components:', Object.keys(this.components).length);
    }.bind(this);
    xhr.onerror = function () {
      // process error
    };
    xhr.send();
  },
  addComponentToScene: function (packageName, onLoaded) {
    var component = this.components[packageName];
    var componentName = component.name;
    if (component && !component.included) {
      var script = document.createElement('script');
      script.src = component.file;
      script.setAttribute('data-component-name', componentName);
      script.setAttribute('data-component-description', component.description);
      script.onload = script.onreadystatechange = function () {
        script.onreadystatechange = script.onload = null;
        onLoaded(componentName);
      };
      (document.head || document.body).appendChild(script);

      var link = document.createElement('script');
      link.href = component.url;
      link.type = 'text/css';
      link.rel = 'stylesheet';
      document.getElementsByTagName('head')[0].appendChild(link);
      component.included = true;
    } else {
      onLoaded(componentName);
    }
  }
};

module.exports = ComponentLoader;
