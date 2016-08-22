import React from 'react';
import ComponentsContainer from './ComponentsContainer';
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
      return (
        <div id='sidebar'>
          <ComponentsContainer entity={this.state.entity}/>
        </div>
      );
    } else {
      return <div/>;
    }
  }
}
