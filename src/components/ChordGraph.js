import React, {Component, PropTypes} from "react";
import {graphql} from "react-apollo";
import gql from "graphql-tag";
import "tachyons";
import {withViewport} from "./withViewport";
import "../static/App.css";
import rd3 from "react-d3-library";
const d3 = require('d3');

const RD3Component = rd3.Component;

const styles = {
  map: {
    padding: '0px',
    marginBottom: '7px',
    textAlign: 'center',
  }
};

export const group = (array, fkey) => {
  return array
    .reduce((map, item) => {
      const key = fkey(item);
      key && (map[key] = map[key] || []).push(item);
      return map;
    }, {});
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
      where: `code like '${code}%' and length(code) <= ${code.length} + 2`
    }
  })
})
@withViewport
export class ChordGraph extends Component {

  static propTypes = {
    code: PropTypes.string.isRequired,
    year: PropTypes.string.isRequired,
    actions: PropTypes.object.isRequired,
    data: PropTypes.object, // graphql
    viewport: PropTypes.object // withViewport
  };

  state = {
    d3: ''
  };

  componentWillUpdate(nextProps, nextState) {
    if (nextProps.data && nextProps.data.budget &&
      (nextProps.data.loading !== this.props.data.loading) ||
      (nextProps.viewport !== this.props.viewport)) {
      const budgets = nextProps.data.budget.edges.map(item => item.node);

      const group1 = budgets.map(item => {
        return Object.assign({
          name: item.title,
          size: item.netAllocated,
          imports: item.groupTop
        })
      });

      const groupBy = group(budgets, item => item.groupTop);
      const group2 = Object.keys(groupBy)
        .filter(key => key)
        .map(key => {
          return Object.assign({
            name: key,
            size: groupBy[key].length,
            imports: groupBy[key].map(item => item.title)
          })
        });

      const items = group1.concat(group2);
      const d3 = this.renderD3(items);
      this.setState({d3})
    }
  }

  render() {
    const {code, data, filter} = this.props;
    if (data.loading) {
      return (<div>Loading...</div>)
    }

    return (
      <div>
        <RD3Component data={this.state.d3}/>
      </div>
    );
  }

  renderD3(imports) {
    const div = document.createElement('div');
    const self = this;
    const {viewport} = this.props;

    const diameter = viewport.width,
      radius = diameter / 2,
      outerRadius = diameter / 2,
      innerRadius = radius - 40;

    const fill = d3.scale.category20c();

    const chord = d3.layout.chord()
      .padding(.04)
      .sortSubgroups(d3.descending)
      .sortChords(d3.descending);

    const arc = d3.svg.arc()
      .innerRadius(innerRadius)
      .outerRadius(innerRadius + 20);

    const svg = d3.select(div).append("svg")
      .attr("width", diameter)
      .attr("height", diameter)
      .append("g").attr("transform", "translate(" + outerRadius + "," + outerRadius + ")");

    const indexByName = d3.map(),
      nameByIndex = d3.map(),
      matrix = [];
    let n = 0;

    function name(name) {
      return name;
      // return name.substring(0, name.lastIndexOf("."));
    }

    // Compute a unique index for each imports
    imports.forEach(function (d) {
      if (!indexByName.has(d = name(d.name))) {
        nameByIndex.set(n, d);
        indexByName.set(d, n++);
      }
    });

    // Construct a square matrix counting imports.
    imports.forEach(function (d) {
      const source = indexByName.get(name(d.name));
      let row = matrix[source];
      if (!row) {
        row = matrix[source] = [];
        for (let i = -1; ++i < n;) row[i] = 0;
      }
      if (d.imports) {
        d.imports.forEach(function (d) {
          row[indexByName.get(name(d))]++;
        });
      }
    });

    chord.matrix(matrix);

    const g = svg.selectAll(".group")
      .data(chord.groups)
      .enter().append("g")
      .attr("class", "group");

    g.append("path")
      .style("fill", function (d) {
        return fill(d.index);
      })
      .style("stroke", function (d) {
        return fill(d.index);
      })
      .attr("d", arc);

    g.append("text")
      .each(function (d) {
        d.angle = (d.startAngle + d.endAngle) / 2;
      })
      .attr("dy", ".35em")
      .attr("transform", function (d) {
        return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
          + "translate(" + (innerRadius + 26) + ")"
          + (d.angle > Math.PI ? "rotate(180)" : "");
      })
      .style("text-anchor", function (d) {
        return d.angle > Math.PI ? "end" : null;
      })
      .text(function (d) {
        return nameByIndex.get(d.index);
      });

    svg.selectAll(".chord")
      .data(chord.chords)
      .enter().append("path")
      .attr("class", "chord")
      .style("stroke", function (d) {
        return d3.rgb(fill(d.source.index)).darker();
      })
      .style("fill", function (d) {
        return fill(d.source.index);
      })
      .attr("d", d3.svg.chord().radius(innerRadius));

    d3.select(self.frameElement).style("height", outerRadius * 2 + "px");

    return div;
  }
}

