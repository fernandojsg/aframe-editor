import React from 'react';
import Events from '../../lib/Events';
var INSPECTOR = require('../../lib/inspector.js');
import Select from 'react-select';
import 'react-select/dist/react-select.css';

export default class AddComponent extends React.Component {
  static propTypes = {
    entity: React.PropTypes.object
  };

  /**
   * Add blank component.
   * If component is instanced, generate an ID.
   */
  addComponent = (componentName) => {
    var entity = this.props.entity;
    var packageName;
    var selectedOption = this.options.filter(function (option) {
      return option.value === componentName;
    })[0];

    if (selectedOption.origin === 'registry') {
      [packageName, componentName] = selectedOption.value.split('.');
      INSPECTOR.componentLoader.addComponentToScene(packageName, componentName)
        .then(addComponent);
    } else {
      componentName = selectedOption.value;
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
  getComponentsOptions () {
    const usedComponents = Object.keys(this.props.entity.components);
    var commonOptions = Object.keys(AFRAME.components)
      .filter(function (componentName) {
        return AFRAME.components[componentName].multiple ||
               usedComponents.indexOf(componentName) === -1;
      })
      .sort()
      .map(function (value) {
        return {value: value, label: value, origin: 'loaded'};
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
        return {value: item.componentPackageName + '.' + item.componentName,
          label: item.componentName, origin: 'registry'};
      });

    this.options = commonOptions.concat(registryOptions);
  }

  render () {
    const entity = this.props.entity;
    if (!entity) { return <div></div>; }

    this.getComponentsOptions();
    return (
        <div className='add-component2'>
          <Select
            className="add-component"
            ref="select"
            autofocus
            options={this.options}
            simpleValue
            clearable={true}
            placeholder="Add component..."
            noResultsText="No components found"
            onChange={this.addComponent}
            searchable={true}
          />
        </div>
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
