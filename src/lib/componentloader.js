import {getMajorVersion} from './utils.js';

const registryBaseUrl = 'https://aframe.io/aframe-registry/build/';

/**
 * Asynchronously load and register components from the registry.
 */
function ComponentLoader () {
  this.components = null;
  this.loadFromRegistry();
}

ComponentLoader.prototype = {
  /**
   * XHR the registry JSON.
   */
  loadFromRegistry: function () {
    var xhr = new window.XMLHttpRequest();

    // @todo Remove the sync call and use a callback
    xhr.open('GET', registryBaseUrl + getMajorVersion(AFRAME.version) + '.json');

    xhr.onload = () => {
      this.components = window.JSON.parse(xhr.responseText).components;
      console.info('Components in registry:', Object.keys(this.components).length);
    };
    xhr.onerror = () => { console.error('Error loading registry file.'); };
    xhr.send();
  },

  /**
   * Inject component script. If already injected, then resolve.
   *
   * @returns {Promise}
   */
  addComponentToScene: function (packageName, componentName) {
    const component = this.components[packageName];
    if (component.included) { return Promise.resolve(componentName); }

    let script = document.createElement('script');
    script.src = component.file;
    script.setAttribute('data-component-description', component.description);
    script.setAttribute('data-component-names', component.names);
    script.setAttribute('data-component-url', component.npmUrl);
    script.setAttribute('data-package-name', packageName);

    return new Promise(resolve => {
      script.onload = script.onreadystatechange = function () {
        script.onreadystatechange = script.onload = null;
        resolve(componentName);
      };
      (document.head || document.body).appendChild(script);
      component.included = true;
    });
  }
};

module.exports = ComponentLoader;
