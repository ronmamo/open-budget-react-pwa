import React, {Component, PropTypes} from "react";
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip} from "recharts";
import {graphql} from "react-apollo";
import gql from "graphql-tag";
import "tachyons";
import {withViewport} from "./withViewport";
import "../static/App.css";

@graphql(gql`
  query query($code: String!) {
    budget(code: $code, orderBy: "-year") {
      edges {
        node {
          year, netRevised, netAllocated
        }
      }
    }
  }`, {
  options: ({code}) => ({variables: {code}})
})
@withViewport
export class BudgetOverYears extends Component {

  static propTypes = {
    code: PropTypes.string.isRequired
  };

  render() {
    if (this.props.data.loading) {
      return (<div>Loading...</div>)
    }
    const data = this.props.data.budget.edges.map(item => item.node)
      .sort(budget => budget.year)
      .map(budget => ({name: budget.year, value: budget.netAllocated / 1000000}));
    return (
      <div>
        <h3>תקציב לאורך השנים</h3>
        <LineChart
          width={this.props.viewport.width}
          height={200}
          data={data}
          margin={{top: 5, right: 30, left: 20, bottom: 5}}>
          <XAxis dataKey="name"/>
          <YAxis/>
          <CartesianGrid strokeDasharray="3 3"/>
          <Tooltip/>
          <Line type="monotone" dataKey="value" stroke="#82ca9d"/>
        </LineChart>
      </div>
    );
  }
}
