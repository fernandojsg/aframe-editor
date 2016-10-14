import React from 'react';
import Modal from './Modal';

export default class ModalHelp extends React.Component {
  static propTypes = {
    isOpen: React.PropTypes.bool,
    onClose: React.PropTypes.func
  };

  constructor (props) {
    super(props);
    this.state = {
      isOpen: this.props.isOpen
    };
  }

  componentWillReceiveProps (newProps) {
    if (this.state.isOpen !== newProps.isOpen) {
      this.setState({isOpen: newProps.isOpen});
    }
  }

  onClose = value => {
    if (this.props.onClose) {
      this.props.onClose();
    }
  }

  render () {
    var self = this;

    let shortcuts = [
      [
        {key: ['w'], description: 'Translate'},
        {key: ['e'], description: 'Rotate'},
        {key: ['r'], description: 'Scale'},
        {key: ['d'], description: 'Duplicate selected entity'},
        {key: ['g'], description: 'Toggle grid visibility'},
        {key: ['n'], description: 'Add new entity'}
      ],
      [
        {key: ['h'], description: 'Show this help'},
        {key: ['supr'], description: 'Delete selected entity'},
        {key: ['Esc'], description: 'Exit edit mode'},
        {key: ['backspace'], description: 'Delete selected entity'},
        {key: ['ctrl','alt','i'], description: 'Switch Edit and VR Modes'}
      ]
    ];

    return (
      <Modal title="Shortcuts" isOpen={this.state.isOpen} onClose={this.onClose}>
        <div className="help-lists">
        {
          shortcuts.map(function (column, idx) {
            return <ul className="help-list" key={idx}>
            {
              column.map(function (shortcut) {
                return (
                  <li key={shortcut.key} className="help-key-unit">
                  {
                    shortcut.key.map(function (key) {
                      return <kbd key={key} className="help-key"><span>{key}</span></kbd>
                    })
                  }
                  <span className="help-key-def">{shortcut.description}</span>
                  </li>
                )
              })
            }
            </ul>
          })
        }
        </div>
      </Modal>
    );
  }
}
