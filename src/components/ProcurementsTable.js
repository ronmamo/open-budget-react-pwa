import React, {Component, PropTypes} from "react";
import {GenericTable} from "./GenericTable";
import {graphql} from "react-apollo";
import gql from "graphql-tag";
import "../static/App.css";

const fields = [
  {name: 'purpose', title: 'purpose'},
  {name: 'publisher', title: 'publisher'},
  {name: 'supplierName', title: 'supplierName'},
  {name: 'reportDate', title: 'reportDate'},
  {name: 'volume', title: 'volume'}
];

@graphql(gql`
  query query($where: String!) {
    procurement(where: $where, orderBy: "order_date DESC, budget_code") {
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
export class ProcurementsTable extends Component {

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
    const procurements = data.procurement.edges.map(edge => edge.node);
    return (<GenericTable fields={fields} data={procurements} actions={actions}/>);
  }
}

