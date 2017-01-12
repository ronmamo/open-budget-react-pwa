import React, {Component, PropTypes} from "react";
import {GenericTable} from "./GenericTable";
import {graphql} from "react-apollo";
import gql from "graphql-tag";
import "../static/App.css";

const fields = [
  {name: 'title', title: 'title'},
  {name: 'subject', title: 'subject'},
  {name: 'recipient', title: 'recipient'},
  {name: 'amountAllocated', title: 'amountAllocated'}
];

@graphql(gql`
  query query() {
    exemption {
      edges {
        node {
          ${fields.map(field => field.name)}
        }
      }
    }
  }`, {
  options: ({code}) => ({
    variables: {
      where: `budget_code like '${code}%' and order_date notnull`
    }
  })
})
export class ExemptionsTable extends Component {

  static propTypes = {
    code: PropTypes.string.isRequired,
    actions: PropTypes.object.isRequired,
    data: PropTypes.object.isRequired, // graphql
  };

  render() {
    const {data, actions} = this.props;
    if (data.loading) {
      return (<div>Loading...</div>)
    }
    const exemptions = data.exemption.edges.map(edge => edge.node);
    return (<GenericTable fields={fields} data={exemptions} actions={actions}/>);
  }
}
