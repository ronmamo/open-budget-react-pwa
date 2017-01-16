import React, {Component, PropTypes} from "react";
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

// @graphql(gql`
//   query query($year: Int!, $where: String!) {
//     budget(year: $year, where: $where, perPage: 100) {
//       edges {
//         node {
//           code, year, title, netAllocated, groupTop
//         }
//       }
//     }
//   }`, {
//   options: ({year, code}) => ({
//     variables: {
//       year: year,
//       where: `code like '${code}%' and length(code) <= ${code.length + 2}`
//     }
//   })
// })
@withViewport
export class BudgetGraph extends Component {

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

  componentDidMount() {
    const d3 = this.renderD3();
    this.setState({d3})
  }

  render() {
    const {code, data, filter} = this.props;
    // if (data.loading) {
    //   return (<div>Loading...</div>)
    // }

    return (
      <div>
        <RD3Component data={this.state.d3} />
      </div>
    );
  }

  renderD3() {
    const div = document.createElement('div');
    const self = this;
    const {viewport} = this.props;

    var diameter = viewport.width,
      radius = diameter / 2,
      innerRadius = radius - 20;

    var cluster = d3.layout.cluster()
      .size([360, innerRadius])
      .sort(null)
      .value(function(d) { return d.size; });

    var bundle = d3.layout.bundle();

    var line = d3.svg.line.radial()
      .interpolate("bundle")
      .tension(.85)
      .radius(function(d) { return d.y; })
      .angle(function(d) { return d.x / 180 * Math.PI; });

    var svg = d3.select(div).append("svg")
      .attr("width", diameter)
      .attr("height", diameter)
      .append("g")
      .attr("transform", "translate(" + radius + "," + radius + ")");

    var link = svg.append("g").selectAll(".link"),
      node = svg.append("g").selectAll(".node");

    d3.json("/readme-flare-imports.json", function(error, classes) {
      if (error) throw error;

      var nodes = cluster.nodes(self.packageHierarchy(classes)),
        links = self.packageImports(nodes);

      link = link
        .data(bundle(links))
        .enter().append("path")
        .each(function(d) { d.source = d[0], d.target = d[d.length - 1]; })
        .attr("class", "link")
        .attr("d", line);

      node = node
        .data(nodes.filter(function(n) { return !n.children; }))
        .enter().append("text")
        .attr("class", "node")
        .attr("dy", ".31em")
        .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + (d.y + 8) + ",0)" + (d.x < 180 ? "" : "rotate(180)"); })
        .style("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
        .text(function(d) { return d.key; })
        .on("mouseover", mouseovered)
        .on("mouseout", mouseouted);
    });

    function mouseovered(d) {
      node
        .each(function(n) { n.target = n.source = false; });

      link
        .filter(function(l) { return l.target === d || l.source === d; })
        .classed("link--target", function(l) { if (l.target === d) return l.source.source = true; })
        .classed("link--source", function(l) { if (l.source === d) return l.target.target = true; })
        .each(function() { this.parentNode.appendChild(this); });

      node
        .classed("node--target", function(n) { return n.target; })
        .classed("node--source", function(n) { return n.source; });
    }

    function mouseouted(d) {
      link
        .classed("link--target", false)
        .classed("link--source", false);

      node
        .classed("node--target", false)
        .classed("node--source", false);
    }

    d3.select(self.frameElement).style("height", diameter + "px");

    return div;
  }

  // Lazily construct the package hierarchy from class names.
  packageHierarchy(classes) {
    const map = {};

    function find(name, data) {
      let node = map[name], i;
      if (!node) {
        node = map[name] = data || {name: name, children: []};
        if (name.length) {
          node.parent = find(name.substring(0, i = name.lastIndexOf(".")));
          node.parent.children.push(node);
          node.key = name.substring(i + 1);
        }
      }
      return node;
    }

    classes.forEach(function(d) {
      find(d.name, d);
    });

    return map[""];
  }

  // Return a list of imports for the given array of nodes.
  packageImports(nodes) {
    const map = {},
      imports = [];

    // Compute a map from name to node.
    nodes.forEach(function(d) {
      map[d.name] = d;
    });

    // For each import, construct a link from the source to target node.
    nodes.forEach(function(d) {
      if (d.imports) d.imports.forEach(function(i) {
        imports.push({source: map[d.name], target: map[i]});
      });
    });

    return imports;
  }
}
