function ComponentLoader () {
  this.components = null;
  this.loadComponentsData();
}

ComponentLoader.prototype = {
  loadComponentsData: function () {
    return;
    var xhr = new window.XMLHttpRequest();
    // @todo Remove the sync call and use a callback
    xhr.open('GET', 'https://raw.githubusercontent.com/aframevr/aframe-components/master/components.json', false);
    xhr.onload = function () {
      this.components = window.JSON.parse(xhr.responseText);
      // console.info('Loaded components:', Object.keys(this.components).length);
    }.bind(this);
    xhr.onerror = function () {
      // process error
    };
    xhr.send();
  },
  addComponentToScene: function (componentName, onLoaded) {
    var component = this.components[componentName];
    if (component && !component.included) {
      var script = document.createElement('script');
      script.src = component.url;
      script.setAttribute('data-component-name', componentName);
      script.setAttribute('data-component-description', component.description);
      script.onload = script.onreadystatechange = function () {
        script.onreadystatechange = script.onload = null;
        onLoaded();
      };
      var head = document.getElementsByTagName('head')[0];
      (head || document.body).appendChild(script);

      var link = document.createElement('script');
      link.href = component.url;
      link.type = 'text/css';
      link.rel = 'stylesheet';
      document.getElementsByTagName('head')[0].appendChild(link);
      component.included = true;
    } else {
      onLoaded();
    }
  }
};

module.exports = ComponentLoader;
