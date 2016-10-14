import React from 'react';
import {getMajorVersion} from '../lib/utils.js';

/**
 * Get the list of modified properties
 * @param  {Element} entity        Entity where the component belongs
 * @param  {string} componentName Component name
 * @return {object}               List of modified properties with their value
 */
function getModifiedProperties (entity, componentName) {
  var data = entity.components[componentName].data;
  var defaultData = entity.components[componentName].schema;
  var diff = {};
  for (var key in data) {
    var defaultValue = defaultData[key].default;
    var currentValue = data[key];

    // Some parameters could be null and '' like mergeTo
    if (!(isEmpty(currentValue) && isEmpty(defaultValue)) &&
      currentValue !== defaultValue) {
      diff[key] = data[key];
    }
  }
  return diff;
}

/**
 * [getClipboardRepresentation description]
 * @param  {[type]} entity        [description]
 * @param  {[type]} componentName [description]
 * @return {[type]}               [description]
 */
export function getClipboardRepresentation (entity, componentName) {
  var diff = getModifiedProperties(entity, componentName);
  return AFRAME.utils.styleParser.stringify(diff);
}

/**
 * Get the component docs link
 * @param  {string} componentName Component's name
 * @return {string}               URL to the documentation
 */
export function getComponentDocsUrl (componentName) {
  if (AFRAME.components[componentName]) {
    // Returns link from the core components
    return 'https://aframe.io/docs/' + getMajorVersion(AFRAME.version) + '/components/' +
      (componentName === 'camera' ? '' : componentName.toLowerCase() + '.html');
  }
}

/**
 * Get component documentation html link
 * @param  {string} componentName Component's name
 * @return {string}               Html icon link to the documentation
 */
export function getComponentDocsHtmlLink (componentName) {
  let url = getComponentDocsUrl(componentName);
  if (url) {
    return <a title='Help' className='button help-link fa fa-question-circle'
      target='_blank' onClick={event => event.stopPropagation()}
      href={url}></a>;
  }
  return '';
}

function isEmpty (string) {
  return string === null || string === '';
}
