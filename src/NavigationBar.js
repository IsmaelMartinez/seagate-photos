import React, {Component} from 'react';
import Select from 'react-select';
import 'react-select/dist/react-select.css';

class NavigationBar extends Component {
    state = {
        selectedOption: ''
    }

    constructor(props, context) {
        super(props, context);

        this.loadAllItems = this
            .loadAllItems
            .bind(this);
    }

    loadAllItems(e) {
        this
            .props
            .loadAllItems(e);
    }

    handleChange = (selectedOption) => {
        this.setState({selectedOption});
        if (selectedOption) {
            this
                .props
                .loadFolder(selectedOption.value);
            console.log(`Selected: ${selectedOption.label}`);
        }
    }

    render() {
        const {selectedOption} = this.state;
        const value = selectedOption && selectedOption.value;

        return (
            <nav className="navbar navbar-expand-sm bg-dark navbar-dark fixed-top">
                <ul className="navbar-nav w-100">
                    <li className="w-25">
                        <span className="navbar-text mr-3">
                            Loaded: {this.props.lastLoaded}
                        </span>
                        <span className="navbar-text mr-3">
                            Total: {this.props.linksSize}
                        </span>
                    </li>
                    <li className="nav-item w-50">
                        <Select
                            name="form-field-name"
                            className="form-inline"
                            optionClassName="dropdown-item"
                            value={value}
                            onChange={this.handleChange}
                            options={this.props.folders}/>
                    </li>
                    <div className="nav-item w-25">
                        <button className="btn float-right btn-secondary" onClick={this.loadAllItems}>
                            Load All</button>
                    </div>
                </ul>
            </nav>
        );
    }
}

export default NavigationBar;