var Events = require('./Events');
var Viewport = require('./viewport/index.js');
var ComponentLoader = require('./componentloader.js');
var ShaderLoader = require('./shaderloader.js');
var Shortcuts = require('./shortcuts.js');

function Inspector () {
  this.opened = false;
  // Detect if the scene is already loaded
  if (document.readyState === 'complete' || document.readyState === 'loaded') {
    this.onDomLoaded();
  } else {
    document.addEventListener('DOMContentLoaded', this.onDomLoaded.bind(this));
  }
}

Inspector.prototype = {
  /**
   * Callback once the DOM is completely loaded so we could query the scene
   */
  onDomLoaded: function () {
    this.componentLoader = new ComponentLoader();
    this.shaderLoader = new ShaderLoader();

    this.sceneEl = document.querySelector('a-scene');
    if (this.sceneEl.hasLoaded) {
      this.onSceneLoaded();
    } else {
      this.sceneEl.addEventListener('loaded', this.onSceneLoaded.bind(this));
    }
  },

  /**
   * Callback when the a-scene is loaded
   */
  onSceneLoaded: function () {
    this.container = document.querySelector('.a-canvas');
    this.currentCameraEl = document.querySelector('[camera]');

    // If the current camera is the default, we should prevent AFRAME from
    // remove it once when we inject the editor's camera
    if (this.currentCameraEl.hasAttribute('data-aframe-default-camera')) {
      this.currentCameraEl.removeAttribute('data-aframe-default-camera');
      this.currentCameraEl.setAttribute('data-aframe-inspector', 'default-camera');
    }

    this.inspectorCameraEl = document.createElement('a-entity');
    this.inspectorCameraEl.isInspector = true;
    this.inspectorCameraEl.addEventListener('loaded', entity => {
      this.EDITOR_CAMERA = this.inspectorCameraEl.getObject3D('camera');
      this.initUI();
    });
    this.inspectorCameraEl.setAttribute('camera', {far: 10000, fov: 50, near: 0.05, active: true});
    document.querySelector('a-scene').appendChild(this.inspectorCameraEl);
  },
  initUI: function () {
    this.EDITOR_CAMERA.position.set(20, 10, 20);
    this.EDITOR_CAMERA.lookAt(new THREE.Vector3());
    this.EDITOR_CAMERA.updateMatrixWorld();
    this.camera = this.EDITOR_CAMERA;

    this.initEvents();

    this.selected = null;

    window.dispatchEvent(new Event('inspector-loaded'));

    this.scene = this.sceneEl.object3D;
    this.helpers = {};
    this.sceneHelpers = new THREE.Scene();
    this.sceneHelpers.visible = true; // false;
    this.inspectorActive = false;

    this.viewport = new Viewport(this);
    Events.emit('windowResize');

    var scope = this;

    function addObjects (object) {
      for (var i = 0; i < object.children.length; i++) {
        var obj = object.children[i];
        for (var j = 0; j < obj.children.length; j++) {
          scope.addObject(obj.children[j]);
        }
      }
    }
    addObjects(this.sceneEl.object3D);

    document.addEventListener('model-loaded', event => {
      this.addObject(event.target.object3D);
    });

    document.addEventListener('selectedEntityComponentChanged', event => {
      this.addObject(event.target.object3D);
    });

    this.scene.add(this.sceneHelpers);

    this.open();
  },

  removeObject: function (object) {
    // Remove just the helper as the object will be deleted by Aframe
    object.traverse(this.removeHelper.bind(this));
  },

  addHelper: (function () {
    var geometry = new THREE.SphereBufferGeometry(2, 4, 2);
    var material = new THREE.MeshBasicMaterial({ color: 0xff0000, visible: false });

    return function (object) {
      var helper;
      if (object instanceof THREE.Camera) {
        helper = new THREE.CameraHelper(object, 1);
      } else if (object instanceof THREE.PointLight) {
        helper = new THREE.PointLightHelper(object, 1);
      } else if (object instanceof THREE.DirectionalLight) {
        helper = new THREE.DirectionalLightHelper(object, 1);
      } else if (object instanceof THREE.SpotLight) {
        helper = new THREE.SpotLightHelper(object, 1);
      } else if (object instanceof THREE.HemisphereLight) {
        helper = new THREE.HemisphereLightHelper(object, 1);
      } else if (object instanceof THREE.SkinnedMesh) {
        helper = new THREE.SkeletonHelper(object);
      } else {
        // no helper for this object type
        return;
      }

      var picker = new THREE.Mesh(geometry, material);
      picker.name = 'picker';
      picker.userData.object = object;
      helper.add(picker);

      this.sceneHelpers.add(helper);
      this.helpers[ object.id ] = helper;

      Events.emit('helperAdded', helper);
    };
  })(),

  removeHelper: function (object) {
    if (this.helpers[ object.id ] !== undefined) {
      var helper = this.helpers[ object.id ];
      helper.parent.remove(helper);

      delete this.helpers[ object.id ];

      Events.emit('helperRemoved', helper);
    }
  },

  selectEntity: function (entity, emit) {
    this.selectedEntity = entity;
    if (entity) {
      this.select(entity.object3D);
    } else {
      this.select(null);
    }

    if (emit === undefined) {
      Events.emit('entitySelected', entity);
    }
  },
  initEvents: function () {
    window.addEventListener('keydown', evt => {
      // Alt + Ctrl + i: Shorcut to toggle the inspector
      var shortcutPressed = evt.keyCode === 73 && evt.ctrlKey && evt.altKey;
      if (shortcutPressed) {
        this.toggle();
      }
    });

    Events.on('entitySelected', entity => {
      this.selectEntity(entity, false);
    });

    Events.on('inspectorModeChanged', active => {
      this.inspectorActive = active;
      this.sceneHelpers.visible = this.inspectorActive;
    });

    Events.on('createNewEntity', definition => {
      this.createNewEntity(definition);
    });

    Events.on('domModified', mutations => {
      if (!mutations) { return; }
      mutations.forEach(mutation => {
        if (mutation.type !== 'childList') { return; }
        Array.prototype.slice.call(mutation.removedNodes).forEach(removedNode => {
          if (this.selectedEntity === removedNode) {
            this.selectEntity(null);
          }
        });
      });
    });
  },
  selectById: function (id) {
    if (id === this.camera.id) {
      this.select(this.camera);
      return;
    }
    this.select(this.scene.getObjectById(id, true));
  },
  // Change to select object
  select: function (object) {
    if (this.selected === object) {
      return;
    }
    this.selected = object;
    Events.emit('objectSelected', object);
  },
  deselect: function () {
    this.select(null);
  },
  /**
   * Reset the current scene, removing its content.
   */
  clear: function () {
    this.camera.copy(this.EDITOR_CAMERA);
    this.deselect();
    document.querySelector('a-scene').innerHTML = '';
    Events.emit('inspectorCleared');
  },
  /**
   * Helper function to add a new entity with a list of components
   * @param  {object} definition Entity definition to add:
   *                             {element: 'a-entity', components: {geometry: 'primitive:box'}}
   * @return {Element}            Entity created
   */
  createNewEntity: function (definition) {
    var entity = document.createElement(definition.element);

    // load default attributes
    for (var attr in definition.components) {
      entity.setAttribute(attr, definition.components[attr]);
    }

    // Ensure the components are loaded before update the UI
    entity.addEventListener('loaded', () => {
      this.addEntity(entity);
    });

    this.sceneEl.appendChild(entity);

    return entity;
  },
  addEntity: function (entity) {
    this.addObject(entity.object3D);
    this.selectEntity(entity);
  },
  /**
   * Toggle the editor
   */
  toggle: function () {
    if (this.opened) {
      this.close();
    } else {
      this.open();
    }
  },
  /**
   * Open the editor UI
   */
  open: function () {
    this.opened = true;
    Events.emit('inspectorModeChanged', true);
    this.sceneEl.pause();
    if (this.sceneEl.hasAttribute('embedded')) {
      // Remove embedded styles, but keep track of it.
      this.sceneEl.removeAttribute('embedded');
      this.sceneEl.setAttribute('aframe-inspector-removed-embedded');
    }
    document.body.classList.add('aframe-inspector-opened');
    this.sceneEl.resize();
    Shortcuts.enable();
  },
  /**
   * Closes the editor and gives the control back to the scene
   * @return {[type]} [description]
   */
  close: function () {
    this.opened = false;
    Events.emit('inspectorModeChanged', false);
    this.sceneEl.play();
    if (this.sceneEl.hasAttribute('aframe-inspector-removed-embedded')) {
      this.sceneEl.setAttribute('embedded', '');
      this.sceneEl.removeAttribute('aframe-inspector-removed-embedded');
    }
    document.body.classList.remove('aframe-inspector-opened');
    this.sceneEl.resize();
    Shortcuts.disable();
  },
  addObject: function (object) {
    var scope = this;
    object.traverse(child => {
      if (!child.el || !child.el.isInspector) {
        scope.addHelper(child);
      }
    });

    Events.emit('objectAdded', object);
    Events.emit('sceneGraphChanged');
  }
};

module.exports = new Inspector();
