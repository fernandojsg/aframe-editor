var React = require('react');

export default class Modal extends React.Component {
  static propTypes = {
    children: React.PropTypes.oneOfType([
      React.PropTypes.array,
      React.PropTypes.element
    ]).isRequired,
    isOpen: React.PropTypes.bool,
    onClose: React.PropTypes.func,
    title: React.PropTypes.string
  };

  constructor (props) {
    super(props);
    this.state = {isOpen: this.props.isOpen};
  }

  componentDidMount () {
    document.addEventListener('keyup', this.handleGlobalKeydown);
    document.addEventListener('mousedown', this.handleGlobalMousedown);
  }

  handleGlobalKeydown = event => {
    if (this.state.isOpen && event.keyCode === 27) {
      this.close();
    }
  }

  shouldClickDismiss = event => {
    var target = event.target;
    // This piece of code isolates targets which are fake clicked by things
    // like file-drop handlers
    if (target.tagName === 'INPUT' && target.type === 'file') {
      return false;
    }
    if (target === this.refs.self || this.refs.self.contains(target)) return false;
    return true;
  }

  handleGlobalMousedown = event => {
    return;
    if (this.state.isOpen && this.shouldClickDismiss(event)) {
      if (typeof this.props.onClose === 'function') {
        this.props.onClose();
      }
    }
  }

  componentWillUnmount () {
    document.removeEventListener('keyup', this.handleGlobalKeydown);
    document.removeEventListener('mousedown', this.handleGlobalMousedown);
  }

  componentWillReceiveProps (newProps) {
    if (this.state.isOpen !== newProps.isOpen) {
      this.setState({isOpen: newProps.isOpen});
    }
  }

  close = () => {
    this.setState({isOpen: false});
    if (this.props.onClose) {
      this.props.onClose();
    }
  }

  render () {
    /*
    if (!this.state.isOpen) {
      return <span></span>;
    }
    <div className='modal'>
*/
    return (
      <div className={this.state.isOpen ? 'modal' : 'modal hide'}>
        <div className='modal-content' ref='self'>
          <div className='modal-header'>
            <span className='close' onClick={this.close}>×</span>
            <h3>{ this.props.title }</h3>
          </div>
          <div className='modal-body'>
            { this.props.children }
          </div>
        </div>
      </div>
    );
  }
}
