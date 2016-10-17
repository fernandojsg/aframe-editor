import React from 'react';
import debounce from 'lodash.debounce';

import BooleanWidget from '../widgets/BooleanWidget';
import ColorWidget from '../widgets/ColorWidget';
import InputWidget from '../widgets/InputWidget';
import NumberWidget from '../widgets/NumberWidget';
import SelectWidget from '../widgets/SelectWidget';
import TextureWidget from '../widgets/TextureWidget';
import Vec3Widget from '../widgets/Vec3Widget';
import {updateEntity} from '../../actions/entity';
import {getComponentDocsHtmlLink} from '../../actions/component';

export default class PropertyRow extends React.Component {
  static propTypes = {
    componentname: React.PropTypes.string.isRequired,
    id: React.PropTypes.string,
    name: React.PropTypes.string.isRequired,
    schema: React.PropTypes.object.isRequired
  };

  constructor (props) {
    super(props);
    this.id = props.componentname + ':' + props.name;
  }

  getWidget () {
    const props = this.props;
    const isMap = props.componentname === 'material' && (props.name === 'envMap' ||
                                                         props.name === 'src');
    const type = props.schema.type;

    const gaTrackComponentUpdate = debounce(() => {
      ga('send', 'event', 'Components', 'changeProperty', this.id);
    });
    const widgetProps = {
      componentname: props.componentname,
      entity: props.entity,
      name: props.name,
      // Wrap updateEntity for tracking.
      onChange: function () {
        updateEntity.apply(this, arguments);
        gaTrackComponentUpdate();
      },
      value: props.data
    };
    const numberWidgetProps = {
      min: props.schema.hasOwnProperty('min') ? props.schema.min : -Infinity,
      max: props.schema.hasOwnProperty('max') ? props.schema.max : Infinity
    };

    if (props.schema.oneOf && props.schema.oneOf.length > 0) {
      return <SelectWidget {...widgetProps} options={props.schema.oneOf}/>;
    }
    if (type === 'map' || isMap) {
      return <TextureWidget {...widgetProps}/>;
    }

    switch (type) {
      case 'number': {
        return <NumberWidget {...widgetProps} {...numberWidgetProps}/>;
      }
      case 'int': {
        return <NumberWidget {...widgetProps} {...numberWidgetProps} precision={0}/>;
      }
      case 'vec3': {
        return <Vec3Widget {...widgetProps}/>;
      }
      case 'color': {
        return <ColorWidget {...widgetProps}/>;
      }
      case 'boolean': {
        return <BooleanWidget {...widgetProps}/>;
      }
      default: {
        return <InputWidget {...widgetProps}/>;
      }
    }
  }

  render () {
    const props = this.props;
    const title = props.name + '\n - type: ' + props.schema.type + '\n - value: ' + JSON.stringify(props.data);
    const helpLink = props.showHelp ? getComponentDocsHtmlLink(props.name) : '';
    return (
      <div className='row'>
        <label htmlFor={this.id} className='text' title={title}>{props.name}{helpLink}</label>
        {this.getWidget(props.schema.type)}
      </div>
    );
  }
}
