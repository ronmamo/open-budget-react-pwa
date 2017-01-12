import React, {Component} from "react";
import {browserHistory} from "react-router";
import RaisedButton from "material-ui/RaisedButton";
import ActionSearch from "material-ui/svg-icons/action/search";
import {AutoComplete} from "material-ui";
import "../static/App.css";
import {fetch_groups} from "../static/app_data";

const search_api = 'http://www.obudget.org/api/search';

const styles = {
  search: {
    margin: '8px',
    textAlign: 'center',
  }
};

const initialDs = () => fetch_groups.map(group => {
  return {text: group.title, value: group.title, code: group.code}
});

export class SearchBar extends Component {

  state = {
    dataSource: initialDs(),
    select: "",
    fetch: false
  };

  componentWillMount() {
    this.setState({dataSource: initialDs()})
  }

  onUpdateInput = (searchText, dataSource, params) => {
    console.log('onUpdateInput ' + searchText);
    this.search(searchText);
  };

  onClick = (chosenRequest, index) => {
    console.log(`onClick ${JSON.stringify(chosenRequest)}`);
    if (chosenRequest.code) {
      browserHistory.push(`/budget/${chosenRequest.code}/2017`);
    }
  };

  search = (value) => {
    const select = value; // todo sanitize
    const shouldFetch = select.length > 2 && !this.state.fetch;
    if (select && shouldFetch) {
      this.setState({select: select, fetch: true});
      fetch(`${search_api}/full_text?q=${select}&limit=10`)
        .then(res => res.json())
        .then(res => res.map(item => ({text: item.name, value: item.name})))
        .then(res => {
          this.setState({dataSource: res, fetch: false});
        })
        .catch(err => this.setState({fetch: false}));
    } else if (select || select.length === 0) {
      this.setState({dataSource: initialDs(), fetch: false});
    }
  };

  render() {
    const {dataSource} = this.state;
    return (
      <div style={styles.search}>
        <AutoComplete
          dataSource={dataSource}
          floatingLabelText="חיפוש"
          filter={AutoComplete.fuzzyFilter}
          onUpdateInput={this.onUpdateInput}
          onNewRequest={this.onClick}
          menuStyle={{maxHeight:"30vh"}}
          style={styles.search}
        />
        <RaisedButton
          primary={true}
          icon={<ActionSearch />}
          onClick={this.onClick}
          style={styles.search}
        />
      </div>
    );
  }
}
