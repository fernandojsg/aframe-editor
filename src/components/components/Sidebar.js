import React from 'react';
import ComponentsContainer from './ComponentsContainer';
import Clipboard from 'clipboard';
import {getClipboardRepresentation} from '../../actions/entity';
import Events from '../../lib/Events';

export default class Sidebar extends React.Component {
  static propTypes = {
    entity: React.PropTypes.object
  };

  constructor (props) {
    super(props);
    this.state = {
      open: false,
      entity: props.entity
    };
  }

  componentDidMount () {
    var clipboard = new Clipboard('[data-action="copy-entity-to-clipboard"]', {
      text: trigger => {
        ga('send', 'event', 'Components', 'copyEntityToClipboard');
        return getClipboardRepresentation(this.state.entity);
      }
    });
    clipboard.on('error', e => {
      // @todo Show the error on the UI
    });

    Events.on('componentRemoved', event => {
      this.forceUpdate();
    });

    Events.on('componentAdded', event => {
      this.forceUpdate();
    });
  }

  handleToggle = () => {
    this.setState({open: !this.state.open});
    ga('send', 'event', 'Components', 'toggleSidebar');
  }

  componentChanged = (event) => {
    Events.emit('selectedEntityComponentChanged', event.detail);
  }

  componentWillReceiveProps (newProps) {
    if (this.state.entity !== newProps.entity) {
      if (this.state.entity) {
        this.state.entity.removeEventListener('componentchanged', this.componentChanged);
      }
      if (newProps.entity) {
        newProps.entity.addEventListener('componentchanged', this.componentChanged);
      }
      this.setState({entity: newProps.entity});
    }
  }

  render () {
    const entity = this.state.entity;
    if (entity) {
      const entityButtons = <div>
        <a href='#' title='Copy entity HTML to clipboard' data-action='copy-entity-to-clipboard'
          className='button fa fa-clipboard' onClick={event => event.stopPropagation()}></a>
      </div>;
      const entityName = '<' + entity.tagName.toLowerCase() + '>';

      return (
        <div id='sidebar'>
          <div className='sidebar-title'>
            <code>{entityName}</code>
            {entityButtons}
          </div>
          <ComponentsContainer entity={this.state.entity}/>
        </div>
      );
    } else {
      return <div/>;
    }
  }
}
