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

    if (origin === 'registry') {
      var [packageName, componentName] = selectedOption.value.split('.');
      INSPECTOR.componentLoader.addComponentToScene(packageName, componentName)
        .then(addComponent);
    } else {
      var componentName = selectedOption.value;
      addComponent(componentName);
    }

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

    // Create the list of components that should appear in the registry group
    var registryComponents = [];
    Object.keys(INSPECTOR.componentLoader.components)
      .forEach(function (componentPackageName) {
        var componentPackage = INSPECTOR.componentLoader.components[componentPackageName];
        componentPackage.names.forEach(function (componentName) {
          if (usedComponents.indexOf(componentName) === -1) {
            registryComponents.push({componentPackageName, componentName});
          }
        });
      });
      var registryOptions = registryComponents
        .sort(function (a, b) {
          return a.componentName >= b.componentName;
        })
        .map(function (item) {
          return <option key={item.componentName} origin='registry'
            value={`${item.componentPackageName}.${item.componentName}`}>{item.componentName}</option>
      });

    return [commonOptions, registryOptions];
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
