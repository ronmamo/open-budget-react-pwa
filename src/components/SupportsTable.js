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
  query query($where: String!) {
    support(where: $where, orderBy: "year DESC") {
      edges {
        node {
          ${fields.map(field => field.name)}
        }
      }
    }
  }`, {
  options: ({code}) => ({
    variables: {
      where: `code like '${code}%'`
    }
  })
})
export class SupportsTable extends Component {

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
    const supports = data.support.edges.map(edge => edge.node);
    return (<GenericTable fields={fields} data={supports} actions={actions}/>);
  }
}
