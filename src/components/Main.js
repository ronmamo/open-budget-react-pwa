import React, {Component} from "react";
import {browserHistory} from "react-router";
import Helmet from "react-helmet";
import "tachyons";
import {Header} from "./Header";
import {SearchBar} from "./SearchBar";
import {BudgetMap} from "./BudgetMap";
import {BudgetTabView} from "./BudgetTabView";
import "../static/App.css";

export const currency = value => value ? value >= 1000000 ? `${(value / 1000000).toFixed(3)} מ₪` : `${value.toLocaleString()} ₪` : '';

const styles = {
  container: {
    padding: '8px',
    marginBottom: '8px'
  },
  header: {
    margin: '0px',
    padding: '0px',
    textAlign: 'center',
  },
  center: {
    textAlign: 'center',
  }
};

export class Main extends Component {

  state = {
    filter: ['הכנסות המדינה', 'תשלום חובות', 'תשלום ריבית ועמלות'],
    selected: {}
  };

  componentWillUpdate(nextProps, nextState) {
    this.redirectIfNeeded(nextProps.params);
  }

  componentWillMount() {
    this.redirectIfNeeded(this.props.params);
  }

  redirectIfNeeded(params) {
    const {code, year} = params;
    if (!code || !year) {
      console.log(`redirecting...`);
      browserHistory.push(`/budget/00/2017`);
    } else {
      console.log(`code/year: ${params.code}/${params.year}`);
    }
  }

  onFilter = (f) => {
    const filter = this.state.filter;
    filter.push(f);
    this.setState({filter: filter});
  };

  onSelect = (ref) => {
    const {selected} = this.state;
    if (!selected || (ref.code !== selected.code || ref.year !== selected.year)) {
      this.setState({selected: ref});
      browserHistory.push(`/budget/${ref.code}/${ref.year}`);
    }
  };

  render() {
    const {code, year} = this.props.params;
    if (!code && !year) {
      return (<div>Redirecting...</div>);
    }
    const {selected} = this.state;
    const title = `${selected.title} - מפתח התקציב`;
    const actions = {onFilter: this.onFilter, onSelect: this.onSelect};
    return (
      <div style={styles.container}>
        <Helmet title={title}/>
        <Header/>
        <SearchBar/>
        <Breadcrumbs selected={selected} actions={actions}/>
        <BudgetMap code={code} year={year} filter={this.state.filter} actions={actions}/>
        <BudgetTabView code={code} year={year} actions={actions}/>
      </div>
    );
  }
}

export class Breadcrumbs extends Component {

  render() {
    const {group_top, group_full} = this.props.selected;
    const breadcrumbs = group_top ? `${group_top} / ${group_full}` : '';
    return (
      <div>{breadcrumbs}</div>
    );
  }
}

