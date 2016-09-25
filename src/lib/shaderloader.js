// Reuse componentLoader and create just one loader for both types
function ShaderLoader () {
  this.shaders = null;
  this.loadShadersData();
}

ShaderLoader.prototype = {
  loadShadersData: function () {
    return;
    var xhr = new window.XMLHttpRequest();
    // @todo Remove the sync call and use a callback
    xhr.open('GET', 'https://raw.githubusercontent.com/fernandojsg/aframe-shaders/master/shaders.json', false);
    xhr.onload = function () {
      this.shaders = window.JSON.parse(xhr.responseText);
      // console.info('Loaded Shaders:', Object.keys(this.shaders).length);
    }.bind(this);
    xhr.onerror = function () {
      // process error
    };
    xhr.send();
  },
  addShaderToScene: function (shaderName, onLoaded) {
    var shader = this.shaders[shaderName];
    if (shader && !shader.included) {
      var script = document.createElement('script');
      script.src = shader.url;
      script.setAttribute('data-shader-name', shaderName);
      script.setAttribute('data-shader-description', shader.description);
      script.onload = script.onreadystatechange = function () {
        script.onreadystatechange = script.onload = null;
        onLoaded();
      };
      var head = document.getElementsByTagName('head')[0];
      (head || document.body).appendChild(script);

      var link = document.createElement('script');
      link.href = shader.url;
      link.type = 'text/css';
      link.rel = 'stylesheet';
      document.getElementsByTagName('head')[0].appendChild(link);
      shader.included = true;
    } else {
      onLoaded();
    }
  }
};

module.exports = ShaderLoader;
