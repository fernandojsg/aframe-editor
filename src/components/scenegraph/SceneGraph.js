import React from 'react';
import debounce from 'lodash.debounce';
import {removeEntity, cloneEntity} from '../../actions/entity';
import Toolbar from './Toolbar';
const Events = require('../../lib/Events.js');

const ICONS = {
  camera: 'fa-video-camera',
  geometry: 'fa-cube',
  light: 'fa-lightbulb-o',
  material: 'fa-picture-o'
};

const gaTrackSearchEntity = debounce(() => {
  ga('send', 'event', 'SceneGraph', 'searchEntity');
}, 3000);

export default class SceneGraph extends React.Component {
  static propTypes = {
    onChange: React.PropTypes.func,
    scene: React.PropTypes.object,
    value: React.PropTypes.string
  };

  static defaultProps = {
    value: '',
    index: -1
  }

  constructor (props) {
    super(props);
    this.state = {
      value: this.props.value || '',
      options: [],
      selectedIndex: -1,
      filterText: ''
    };
  }

  componentDidMount () {
    this.rebuildOptions();

    document.addEventListener('componentremoved', () => {
      this.forceUpdate();
    });

    Events.on('entitySelected', (entity, self) => {
      if (self) { return; }
      this.setValue(entity);
    });
    Events.on('entityIdChanged', this.rebuildOptions);
    document.addEventListener('componentremoved', this.rebuildOptions);
    Events.on('domModified', this.rebuildOptions);
  }

  setValue = value => {
    let found = false;
    for (let i = 0; i < this.state.options.length; i++) {
      const element = this.state.options[i];
      if (element.value === value) {
        this.setState({value: value, selectedIndex: i});

        if (this.props.onChange) {
          this.props.onChange(value);
        }
        Events.emit('entitySelected', value, true);
        found = true;
      }
    }

    if (!found) {
      this.setState({value: null, selectedIndex: -1});
    }
    ga('send', 'event', 'SceneGraph', 'selectEntity');
  }

  update = e => {
    this.setValue(e.target.value);
  }

  rebuildOptions = () => {
    const options = [{static: true, value: this.props.scene, html: '&lt;a-scene&gt;'}];

    function treeIterate (element, depth) {
      if (!element) { return; }

      if (depth === undefined) {
        depth = 1;
      } else {
        depth += 1;
      }
      let children = element.children;
      for (let i = 0; i < children.length; i++) {
        let child = children[i];

        // filter out all entities added by inspector and the canvas added by aframe-core
        if (!child.dataset.isInspector && child.isEntity && !child.isInspector) {
          let extra = '';

          for (let componentName in ICONS) {
            if (child.components && child.components[componentName]) {
              let properties = child.getAttribute(componentName);
              const titles = Object.keys(properties)
                .sort()
                .map(property => {
                  return ' - ' + property + ': ' + properties[property];
                });
              let componentTitle = componentName + (titles.length ? '\n' + titles.join('\n') : '');
              extra += ' <i class="component fa ' + ICONS[componentName] + '" title="' + componentTitle + '"></i>';
            }
          }

          const pad = '&nbsp;&nbsp;&nbsp;'.repeat(depth);
          const label = child.id ? child.id : '&lt;' + child.tagName.toLowerCase() + '&gt;';
          const html = pad + label + extra;

          options.push({
            static: true,
            value: child,
            html: html
          });

          treeIterate(child, depth);
        }
      }
    }
    treeIterate(this.props.scene);
    this.setState({options: options});
  }

  selectIndex = index => {
    if (index >= 0 && index < this.state.options.length) {
      this.setValue(this.state.options[index].value);
    }
  }

  onKeyDown = event => {
    switch (event.keyCode) {
      case 38: // up
      case 40: // down
        event.preventDefault();
        event.stopPropagation();
        break;
    }
  }

  onKeyUp = event => {
    if (this.state.value === null) {
      return;
    }
    switch (event.keyCode) {
      case 38: // up
        this.selectIndex(this.state.selectedIndex - 1);
        ga('send', 'event', 'SceneGraph', 'navigateWithKeyboard');
        break;
      case 40: // down
        this.selectIndex(this.state.selectedIndex + 1);
        ga('send', 'event', 'SceneGraph', 'navigateWithKeyboard');
        break;
    }
  }

  renderOptions () {
    var filterText = this.state.filterText.toUpperCase();
    return this.state.options
      .filter((option, idx) => {
        const value = option.value;
        return value.id.toUpperCase().indexOf(filterText) > -1 ||
               value.tagName.toUpperCase().indexOf(filterText) > -1;
      })
      .map((option, idx) => {
        let className = 'option' + (option.value === this.state.value ? ' active' : '');
        return (
          <div key={idx} className={className} value={option.value}
            onClick={() => this.setValue(option.value)}>
            <span dangerouslySetInnerHTML={{__html: option.html}}></span>
              <span className="icons">
                <a onClick={() => cloneEntity(option.value)}
                  title="Clone entity" className="button fa fa-clone"></a>
                <a onClick={event => { event.stopPropagation(); removeEntity(option.value); } }
                  title="Remove entity" className="button fa fa-trash-o"></a>
              </span>
          </div>
        );
      });
  }

  onChangeFilter = e => {
    this.setState({filterText: e.target.value});
    gaTrackSearchEntity();
  }

  render () {
    return (
      <div className='scenegraph'>
        <div className='scenegraph-toolbar'>
          <Toolbar/>
          <div className='search'>
            <input placeholder='Search...' value={this.state.filterText}
              onChange={this.onChangeFilter}/>
            <span className='fa fa-search'></span>
          </div>
        </div>
        <div className='outliner' tabIndex='0' onKeyDown={this.onKeyDown}
          onKeyUp={this.onKeyUp}>
          {this.renderOptions()}
        </div>
      </div>
    );
  }
}
