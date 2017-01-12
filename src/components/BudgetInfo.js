import React, {Component, PropTypes} from "react";
import {BudgetOverYears} from "./BudgetOverYears";
import {graphql} from "react-apollo";
import gql from "graphql-tag";
import {currency} from './Main';
import "tachyons";
import "../static/App.css";

@graphql(gql`
  query query($year: Int!, $code: String!) {
    budget(year: $year, code: $code) {
      edges {
        node {
          code, year, title, netRevised, netAllocated, groupTop, groupFull
        }
      }
    }
  }`, {
  options: ({year, code}) => ({variables: {year, code}})
})
export class BudgetInfo extends Component {

  static propTypes = {
    code: PropTypes.string.isRequired,
    year: PropTypes.string.isRequired,
    actions: PropTypes.object.isRequired,
    data: PropTypes.object.isRequired, // graphql
  };

  render() {
    const {data} = this.props;
    if (data.loading) {
      return (<div>Loading...</div>)
    }
    const budget = data.budget.edges[0].node;
    const {code, year, title, netRevised, groupTop, groupFull} = budget;
    const breadcrumbs = groupTop ? `${groupTop} / ${groupFull}` : '';
    const sum = year ? `תקציב ${year}: ${currency(netRevised)}` : '';
    return (
      <div>
        <h1>{title}</h1>
        <div>{breadcrumbs}</div>
        <h3>{sum}</h3>
        <BudgetOverYears code={code}/>
      </div>
    );
  }
}
