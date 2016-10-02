/* globals AFRAME */
var Events = require('./Events');
var shouldCaptureKeyEvent = AFRAME.utils.shouldCaptureKeyEvent;
import {removeSelectedEntity, cloneSelectedEntity} from '../actions/entity';

module.exports = {
  onKeyUp: function (event) {
    if (!shouldCaptureKeyEvent(event)) { return; }

    // esc: close inspector
    if (event.keyCode === 27) {
      AFRAME.INSPECTOR.close();
      return;
    }

    // w: translate
    if (event.keyCode === 87) {
      Events.emit('transformModeChanged', 'translate');
    }

    // e: rotate
    if (event.keyCode === 69) {
      Events.emit('transformModeChanged', 'rotate');
    }

    // r: scale
    if (event.keyCode === 82) {
      Events.emit('transformModeChanged', 'scale');
    }

    // g: toggle grid
    if (event.keyCode === 71) {
      Events.emit('toggleGrid');
    }

    // n: new entity
    if (event.keyCode === 78) {
      Events.emit('createNewEntity', {element: 'a-entity', components: {}});
    }

    // backspace & supr: remove selected entity
    if (event.keyCode === 8 || event.keyCode === 46) {
      removeSelectedEntity();
    }

    // d: clone selected entity
    if (event.keyCode === 68) {
      cloneSelectedEntity();
    }
  },
  enable: function () {
    window.addEventListener('keyup', this.onKeyUp, false);
  },
  disable: function () {
    window.removeEventListener('keyup', this.onKeyUp);
  }
};
