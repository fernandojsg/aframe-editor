import React from 'react';
import Collapsible from '../Collapsible';
import Events from '../../lib/Events';
var INSPECTOR = require('../../lib/inspector.js');

export default class AddComponent extends React.Component {
  static propTypes = {
    entity: React.PropTypes.object
  };

  /**
   * Add blank component.
   * If component is instanced, generate an ID.
   */
  addComponent = () => {
    var entity = this.props.entity;
    var selectedOption = this.refs.select.selectedOptions[0];
    var origin = selectedOption.getAttribute('origin');

    function addComponent (componentName) {
      if (AFRAME.components[componentName].multiple &&
          isComponentInstanced(entity, componentName)) {
        componentName = componentName + '__' +
                           generateComponentInstanceId(entity, componentName);
      }

      entity.setAttribute(componentName, '');
      Events.emit('componentAdded', {entity: entity, component: componentName});
      ga('send', 'event', 'Components', 'addComponent', componentName);
    }

    if (origin === 'community') {
      var packageName = selectedOption.value;
      INSPECTOR.componentLoader.addComponentToScene(packageName, function (componentName) {
        addComponent(componentName);
      });
    } else {
      var componentName = selectedOption.value;
      addComponent(componentName);
    }
  }

  /**
   * Component dropdown options.
   */
  renderComponentOptions () {
    const usedComponents = Object.keys(this.props.entity.components);
    var commonOptions = Object.keys(AFRAME.components)
      .filter(function (componentName) {
        return AFRAME.components[componentName].multiple ||
               usedComponents.indexOf(componentName) === -1;
      })
      .sort()
      .map(function (value) {
        return <option key={value} origin='core' value={value}>{value}</option>;
      });

    var communityOptions = Object.keys(INSPECTOR.componentLoader.components)
      .filter(function (componentPackageName) {
        var component = INSPECTOR.componentLoader.components[componentPackageName];
        return component.multiple ||
               usedComponents.indexOf(component.name) === -1;
      })
      .sort()
      .map(function (componentPackageName) {
        var component = INSPECTOR.componentLoader.components[componentPackageName];
        var name = component.name;
        return <option key={componentPackageName} origin='community' value={componentPackageName}>{name}</option>;
      });

    return [commonOptions, communityOptions];
  }

  render () {
    const entity = this.props.entity;
    if (!entity) { return <div></div>; }

    var options = this.renderComponentOptions();
    return (
      <Collapsible>
        <div className='collapsible-header'>
          <span>COMPONENTS</span>
        </div>
        <div className='collapsible-content'>
          <div className='row'>
            <span className='text'>Add</span>
            <span className='value'>
              <select ref='select'>
                <optgroup label="registered">
                  {options[0]}
                </optgroup>
                <optgroup label="registry">
                  {options[1]}
                </optgroup>
              </select>
              <a className='button fa fa-plus-circle' onClick={this.addComponent}/>
            </span>
          </div>
        </div>
      </Collapsible>
    );
  }
}

/**
 * Check if component has multiplicity.
 */
function isComponentInstanced (entity, componentName) {
  for (var component in entity.components) {
    if (component.substr(0, component.indexOf('__')) === componentName) {
      return true;
    }
  }
}

/**
 * Generate ID for instanced component.
 */
function generateComponentInstanceId (entity, componentName) {
  var i = 2;
  while (entity.components[componentName + '__' + i]) { i++; }
  return i;
}
