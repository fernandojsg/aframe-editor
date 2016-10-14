var React = require('react');
import Select from 'react-select';
import 'react-select/dist/react-select.css';

export default class SelectWidget extends React.Component {
  static propTypes = {
    componentname: React.PropTypes.string.isRequired,
    entity: React.PropTypes.object,
    name: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func,
    options: React.PropTypes.array.isRequired,
    value: React.PropTypes.string
  };

  constructor (props) {
    super(props);
    this.state = {value: this.props.value || ''};
  }

  onChange = value => {
    this.setState({value: value});
    if (this.props.onChange) {
      this.props.onChange(this.props.entity, this.props.componentname, this.props.name, value);
    }
  }

  componentWillReceiveProps (newProps) {
    if (newProps.value !== this.state.value) {
      this.setState({value: newProps.value});
    }
  }

  renderOptions = () => {
    return this.props.options.map(value => {
      return <option key={value} value={value}>{value}</option>;
    });
  }

  render () {
    var options = this.props.options.map(value => {
      return {value: value, label: value};
    });

    return (
      <Select
        className="select-widget"
        options={options}
        simpleValue
        clearable={true}
        placeholder=""
        value={this.state.value}
        noResultsText="No value found"
        onChange={this.onChange}
        searchable={true}
      />

    );
  }
}
