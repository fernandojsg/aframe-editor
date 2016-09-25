import React from 'react';
var INSPECTOR = require('../../lib/inspector.js');
var Events = require('../../lib/Events.js');

function GetFilename (url) {
  if (url) {
    var m = url.toString().match(/.*\/(.+?)\./);
    if (m && m.length > 1) {
      return m[1];
    }
  }
  return '';
}

function insertNewAsset (type, id, src) {
  var element = null;
  switch (type) {
    case 'img': {
      element = document.createElement('img');
      element.id = id;
      element.src = src;
    } break;
  }
  if (element) {
    document.getElementsByTagName('a-assets')[0].appendChild(element);
  }
}

function insertOrGetImageAsset (src) {
  var id = GetFilename(src);
  // Search for already loaded asset by src
  var element = document.querySelector('a-assets > img[src=\'' + src + '\']');

  if (element) {
    id = element.id;
  } else {
    // Check if first char of the ID is a number (Non a valid ID)
    // In that case a 'i' preffix will be added
    if (!isNaN(parseInt(id[0], 10))) {
      id = 'i' + id;
    }
    if (document.getElementById(id)) {
      var i = 1;
      while (document.getElementById(id + '_' + i)) {
        i++;
      }
      id += '_' + i;
    }
    insertNewAsset('img', id, src);
  }

  return id;
}

export default class TextureWidget extends React.Component {
  static propTypes = {
    componentname: React.PropTypes.string,
    entity: React.PropTypes.object,
    mapName: React.PropTypes.string,
    name: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func,
    value: React.PropTypes.string
  };

  static defaultProps = {
    value: '',
    mapName: 'nomap',
    dataURL: ''
  };

  constructor (props) {
    super(props);
    this.state = {value: this.props.value || ''};
  }

  componentDidMount () {
    this.setValue(this.props.value || '');
  }

  componentWillReceiveProps (newProps) {
    // This will be triggered typically when the element is changed directly with element.setAttribute
    if (newProps.value !== this.state.value) {
      this.setValue(newProps.value);
    }
  }

  setValue (value) {
    var canvas = this.refs.canvas;
    var context = canvas.getContext('2d');

    function paintPreviewWithImage (image) {
      var filename = image.src.replace(/^.*[\\\/]/, '');
      if (image !== undefined && image.width > 0) {
        canvas.title = filename;
        var scale = canvas.width / image.width;
        context.drawImage(image, 0, 0, image.width * scale, image.height * scale);
        // self.setState({dataURL: canvas.toDataURL()});
      } else {
        context.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    function paintPreview (texture) {
      var image = texture.image;
      paintPreviewWithImage(image);
    }

    function getTextureFromSrc (src) {
      for (var hash in INSPECTOR.sceneEl.systems.material.textureCache) {
        if (JSON.parse(hash).src === src) {
          return INSPECTOR.sceneEl.systems.material.textureCache[hash];
        }
      }
      return null;
    }

    var url;
    if (value[0] === '#') {
      url = value.length > 1 && document.querySelector(value) && document.querySelector(value).getAttribute('src');
    } else {
      url = AFRAME.utils.srcLoader.parseUrl(value);
    }

    var texture = getTextureFromSrc(value);
    var className = 'hidden';
    if (texture) {
      texture.then(paintPreview);
      className = value[0] === '#' ? 'fa fa-link' : 'fa fa-external-link';
    } else if (url) {
      // The image still didn't load
      className = value[0] === '#' ? 'fa fa-link' : 'fa fa-external-link';
      var image = new Image();
      image.addEventListener('load', () => { paintPreviewWithImage(image); }, false);
      image.src = url;
    } else {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }

    this.setState({value: value, valueType: className});
  }

  notifyChanged = value => {
    if (this.props.onChange) {
      this.props.onChange(this.props.entity, this.props.componentname, this.props.name, value);
    }
    this.setState({value: value});
  }

  onChange = e => {
    var value = e.target.value;
    this.setState({value: value});
    this.notifyChanged(value);
  }

  removeMap = e => {
    this.setValue('');
    this.notifyChanged('');
  }

  openDialog = () => {
    Events.emit('openTexturesModal', image => {
      if (!image) {
        return;
      }

      var value = image.value;
      if (image.type !== 'asset') {
        var assetId = insertOrGetImageAsset(image.src);
        value = '#' + assetId;
      }
      if (this.props.onChange) {
        this.props.onChange(this.props.entity, this.props.componentname, this.props.name, value);
      }
      this.setValue(value);
    });
  }

  render () {
    return (
      <span className='texture'>
        <span className={this.state.valueType}></span>
        <canvas ref='canvas' width='32' height='16' title={this.props.mapName} onClick={this.openDialog}></canvas>
        <input className='map_value string' type='text' value={this.state.value} onChange={this.onChange}/>
        <a onClick={this.removeMap} className='button fa fa-times'></a>
      </span>
    );
  }
}
