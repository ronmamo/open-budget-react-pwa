import React, {Component, PropTypes} from "react";
import {Treemap} from "recharts";
import {graphql} from "react-apollo";
import gql from "graphql-tag";
import "tachyons";
import {withViewport} from "./withViewport";
import {currency} from "./Main";
import "../static/App.css";

const styles = {
  map: {
    padding: '0px',
    marginBottom: '7px',
    textAlign: 'center',
  }
};

@graphql(gql`
  query query($year: Int!, $where: String!) {
    budget(year: $year, where: $where, perPage: 100) {
      edges {
        node {
          code, year, title, netAllocated, groupTop
        }
      }
    }
  }`, {
  options: ({year, code}) => ({
    variables: {
      year: year,
      where: `code like '${code}%' and length(code) <= ${code.length + 2}`
    }
  })
})
@withViewport
export class BudgetMap extends Component {

  static propTypes = {
    code: PropTypes.string.isRequired,
    year: PropTypes.string.isRequired,
    actions: PropTypes.object.isRequired,
    data: PropTypes.object.isRequired, // graphql
    viewport: PropTypes.object.isRequired // withViewport
  };

  COLORS = ['#8889DD', '#9597E4', '#8DC77B', '#A5D297', '#E2CF45', '#F8C12D'];

  hashCode(str) {
    return str.split("").reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
  }

  transform(item, index) {
    // const color = this.COLORS[index % this.COLORS.length];
    const color = this.COLORS[this.hashCode(item.groupTop.toString()) % this.COLORS.length];
    return Object.assign({
      name: item.title,
      ref: item,
      value: item.netAllocated,
      color: color
    });
  }

  render() {
    const {code, data, filter} = this.props;
    if (data.loading) {
      return (<div>Loading...</div>)
    }
    const mapData = data && data.budget.edges
        .map(item => item.node)
        .filter(item => item.code !== code)
        .filter(item => filter.indexOf(item.title) === -1)
        .map((item, index) => this.transform(item, index))
        .filter(item => item.value)
        .sort((a, b) => b.value - a.value);

    return (
      <Treemap
        width={this.props.viewport.width - 16}
        height={300}
        ratio={4 / 3}
        stroke="#fff"
        fill="#8884d8"
        data={mapData}
        dataKey="value"
        style={styles.map}
        content={
          <CustomizedContent
            data={mapData}
            actions={this.props.actions}/>
        }
      />
    );
  }
}

class CustomizedContent extends Component {

  render() {
    const {index, name, value, depth, x, y, width, height} = this.props;
    const data = this.props.data[index];
    if (!data) {
      return <div></div>
    }
    const {ref} = data;
    const pivot = 6;
    return (
      <g>
        <rect x={x} y={y} width={width} height={height}
              onTouchTap={e => this.props.actions.onSelect(ref)}
              style={{
                fill: data.color,
                stroke: '#fff',
                strokeWidth: 2 / (depth + 1e-10),
                strokeOpacity: 1 / (depth + 1e-10),
              }}/>
        <title>
          <div>
            {name} ({ref.code}) - {currency(value)}
          </div>
        </title>
        { index < pivot ?
          <text x={x + width / 2} y={y + height / 2} textAnchor="middle" fill="#fff" fontSize={12}
                onTouchTap={e => this.props.actions.onSelect(ref)}>
            {name}
          </text>
          : null
        }
        { index < pivot ?
          <text x={x + width / 2} y={y + height / 2 + 15} textAnchor="middle" fill="#fff" fontSize={12}>
            {currency(value)}
          </text>
          : null
        }
        { index < pivot ?
          <text x={x + 15} y={y + 18} fill="#fff" fontSize={14} fillOpacity={0.9}
                onTouchTap={e => this.props.actions.onFilter(name)}>
            X
          </text>
          : null
        }
      </g>
    );
  }
}
