/* global AFRAME */
import React from 'react';
import PropertyRow from './PropertyRow';
import Collapsible from '../Collapsible';
import Clipboard from 'clipboard';
import {getClipboardRepresentation, getComponentDocsHtmlLink} from '../../actions/component';
import Events from '../../lib/Events';

const isSingleProperty = AFRAME.schema.isSingleProperty;

/**
 * Single component.
 */
export default class Component extends React.Component {
  static propTypes = {
    component: React.PropTypes.any,
    entity: React.PropTypes.object,
    name: React.PropTypes.string
  };

  constructor (props) {
    super(props);
    this.state = {
      entity: this.props.entity,
      name: this.props.name
    };
  }

  componentDidMount () {
    var clipboard = new Clipboard('[data-action="copy-component-to-clipboard"]', {
      text: trigger => {
        var componentName = trigger.getAttribute('data-component').toLowerCase();
        ga('send', 'event', 'Components', 'copyComponentToClipboard', componentName);
        return getClipboardRepresentation(this.state.entity, componentName);
      }
    });
    clipboard.on('error', e => {
      // @todo Show the error in the UI
      console.error(e);
    });

    Events.on('selectedEntityComponentChanged', detail => {
      if (detail.name === this.props.name) {
        this.forceUpdate();
      }
    });
  }

  componentWillReceiveProps (newProps) {
    if (this.state.entity !== newProps.entity) {
      this.setState({entity: newProps.entity});
    }
    if (this.state.name !== newProps.name) {
      this.setState({name: newProps.name});
    }
  }

  removeComponent = event => {
    var componentName = this.props.name;
    event.stopPropagation();
    if (confirm('Do you really want to remove component `' + componentName + '`?')) {
      this.props.entity.removeAttribute(componentName);
      Events.emit('componentRemoved', {entity: this.props.entity, component: componentName});
      ga('send', 'event', 'Components', 'removeComponent', componentName);
    }
  }

  /**
   * Render propert(ies) of the component.
   */
  renderPropertyRows = () => {
    const componentData = this.props.component;

    if (isSingleProperty(componentData.schema)) {
      const componentName = this.props.name;
      const schema = AFRAME.components[componentName].schema;
      return (
        <PropertyRow key={componentName} name={componentName} schema={schema}
          data={componentData.data} componentname={componentName}
          entity={this.props.entity}/>
      );
    }

    return Object.keys(componentData.schema).map(propertyName => (
      <PropertyRow key={propertyName} name={propertyName}
        schema={componentData.schema[propertyName]}
        data={componentData.data[propertyName]} componentname={this.props.name}
        entity={this.props.entity}/>
    ));
  }

  render () {
    let componentName = this.props.name;
    let subComponentName = '';
    if (componentName.indexOf('__') !== -1) {
      subComponentName = componentName;
      componentName = componentName.substr(0, componentName.indexOf('__'));
    }

    const componentHelp = getComponentDocsHtmlLink(componentName.toLowerCase());

    return (
      <Collapsible>
        <div className='collapsible-header'>
          <span className='component-title' title={subComponentName || componentName}>
            <span>{subComponentName || componentName}</span> {componentHelp}
          </span>
          <div>
            <a title='Copy to clipboard' data-action='copy-component-to-clipboard'
              data-component={subComponentName || componentName}
              className='flat-button' onClick={event => event.stopPropagation()}>
              Copy HTML
            </a>
            <a title='Remove component' className='flat-button'
              onClick={this.removeComponent}>Remove</a>
          </div>
        </div>
        <div className='collapsible-content'>
          {this.renderPropertyRows()}
        </div>
      </Collapsible>
    );
  }
}
