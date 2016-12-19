import React, {Component, PropTypes} from 'react';
import Helmet from "react-helmet";
import logo from './pkw_logo.png';
// import favicon from './favicon.ico';
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend} from 'recharts';
import {Treemap} from 'recharts';
import {BarChart, Bar} from 'recharts';
import {Router, Route, hashHistory} from 'react-router'
import './App.css';

//full text search api
//http://www.obudget.org/api/search/full_text?q=%D7%91%D7%98&limit=100

const api_url = "http://localhost:8888/api";

export default class App extends Component {
  render() {
    return (
      <Router history={hashHistory}>
        <Route path="/" component={Main}/>
        <Route path="/budget(/:code)(/:year)" component={Main}/>
      </Router>
    );
  }
}

export class Main extends Component {
  render() {
    const params = this.props.params;
    console.log(`params: ${JSON.stringify(this.props.params)}`);
    const code = params && params["code"] || "0024";
    const year = params && params["year"] || "2016";
    return (
      <div className="App">
        <Header/>
        <BudgetInfo code={code} year={year}/>
        <BudgetMap code={code} year={year}/>
        <ProcurementList code={code} year={year}/>
        <SupportList code={code} year={year}/>
        <EntityInfo id="500273727"/>
      </div>
    );
  }
}

export class Header extends Component {
  render() {
    return (
      <div className="App-header">
        <Helmet title="מפתח התקציב - {title}"
                link={[
                  {"rel": "shortcut icon", "href": "/favicon.ico"}
                ]}
        />
        <img src={logo} className="App-logo" alt="logo"/>
        <h1>הסדנא לידע ציבורי</h1>
      </div>
    );
  }
}

export class BudgetInfo extends Component {

  static propTypes = {
    code: PropTypes.string,
    year: PropTypes.int,
  };

  state = {
    selected: {}
  };

  componentWillMount() {
    const {code, year} = this.props;
    fetch(`${api_url}/budget/${code}/${year}`)
      .then(res => res.json())
      .then(res => {
        //console.log(res);
        this.setState({selected: res.items[0]});
      });
  }

  render() {
    const {year, title, net_revised, group_top, group_full} = this.state.selected;

    return (
      <div>
        <h3>{title}</h3>
        <div>{group_top} / {group_full}</div>
        <div>תקציב {year}: ₪{net_revised}</div>
      </div>
    );
  }
}

export class SupportList extends Component {

  static propTypes = {
    code: PropTypes.string,
    year: PropTypes.int,
  };

  state = {
    supports: []
  };

  componentWillMount() {
    const {code, year} = this.props;
    fetch(`${api_url}/api/support/${code}/${year}`)
      .then(res => res.json())
      .then(res => {
        //console.log(res);
        this.setState({supports: res.items});
      });
  }

  render() {
    const {supports} = this.state;
    const data = supports.map(support => ({name: support.year, value: support.amount_allocated}));

    return (
      <div>
        <h2>תמיכות</h2>
        {supports.map(support => {
          return (
            <div>
              <b>{support.title}</b>
              <div>{support.subject} -> {support.recipient}</div>
              <div>
                <div>{support.amount_allocated} ₪</div>
              </div>
            </div>
          );
        })}
        <SimpleLineChart data={data}/>
      </div>
    );
  }
}

export class ProcurementList extends Component {

  static propTypes = {
    code: PropTypes.string
  };

  state = {
    procurements: [],
    exemptions: []
  };

  componentWillMount() {
    const {code} = this.props;
    fetch(`${api_url}/procurement/${code}`)
      .then(res => res.json())
      .then(res => {
        //console.log(res);
        this.setState({procurements: res.items});
      });
    fetch(`${api_url}/exemption/${code}`)
      .then(res => res.json())
      .then(res => {
        //console.log(res);
        this.setState({exemptions: res.items});
      });
  }

  render() {
    const {procurements, exemptions} = this.state;
    const data = procurements.map(procurement => ({key: procurement.report_date, value: procurement.volume}));
    const data_exemption = exemptions.map(exemption => ({key: exemption.last_update_date, value1: exemption.volume}));
    const merge = Object.assign({}, data, data_exemption);

    return (
      <div>
        <div>
          <h2>התקשרויות</h2>
          {procurements.map(procurement => {
            return (
              <div>
                <b>{procurement.purpose} ({procurement.budget_title})</b>
                <div>{procurement.publisher} -> {procurement.supplier_name}</div>
                <div>{procurement.report_date}</div>
                <div>
                  <div>{procurement.volume} ₪</div>
                </div>
              </div>
            );
          })}
        </div>
        <div>
          <h2>פטורים</h2>
          {exemptions.map(exemption => {
            return (
              <div>
                <b>{exemption.purpose} ({exemption.page_title})</b>
                <div>{exemption.publisher} -> {exemption.supplier}</div>
                <div>{exemption.last_update_date}</div>
                <div>
                  <div>{exemption.volume} ₪</div>
                </div>
              </div>
            );
          })}
        </div>
        <SimpleBarChart data={data}/>
      </div>
    );
  }
}

export class SimpleTreemap extends Component {

  COLORS = ['#8889DD', '#9597E4', '#8DC77B', '#A5D297', '#E2CF45', '#F8C12D'];

  render() {
    return (
      <Treemap width={400} height={200} ratio={4 / 3} stroke="#fff" fill="#8884d8"
               data={this.props.data} dataKey="size" content={<CustomizedContent colors={this.COLORS}/>}/>
    );
  }
}

const CustomizedContent = React.createClass({
  render() {
    const {root, depth, x, y, width, height, index, colors, name} = this.props;

    return (
      <g>
        <rect x={x} y={y} width={width} height={height} style={{
          fill: depth < 2 ? colors[Math.floor(index / root.children.length * 6)] : 'none',
          stroke: '#fff',
          strokeWidth: 2 / (depth + 1e-10),
          strokeOpacity: 1 / (depth + 1e-10),
        }}
        />
        { depth === 1 ?
          <text x={x + width / 2} y={y + height / 2 + 7} textAnchor="middle" fill="#fff" fontSize={12}>
            {name}
          </text>
          : null
        }
        { depth === 1 ?
          <text x={x + 4} y={y + 18} fill="#fff" fontSize={14} fillOpacity={0.9}>
            {index + 1}
          </text>
          : null
        }
      </g>
    );
  }
});

export class SimpleLineChart extends Component {
  render() {
    return (
      <LineChart width={300} height={200} data={this.props.data}
                 margin={{top: 5, right: 30, left: 20, bottom: 5}}>
        <XAxis dataKey="name"/>
        <YAxis/>
        <CartesianGrid strokeDasharray="3 3"/>
        <Tooltip/>
        <Legend />
        <Line type="monotone" dataKey="value" stroke="#82ca9d"/>
      </LineChart>
    );
  }
}

export class BudgetMap extends Component {

  state = {
    data: [
      {
        children: []
      }]
  };

  componentWillMount() {
    const {code, year} = this.props;
    fetch(`${api_url}/budget/${code}/${year}/kids`)
      .then(res => res.json())
      .then(res => {
        //console.log(res);
        this.setState({data: res.items});
      });

  }

  render() {
    const data = this.state.data.map(item => Object.assign({
      name: item.title,
      children: [{name: item.title, size: item.net_allocated}]
    }));
    return (
      <div>
        <h2>מפת התקציב</h2>
        <SimpleTreemap data={data}/>
      </div>
    );
  }
}

export class SimpleBarChart extends Component {
  render() {
    return (
      <BarChart width={400} height={200} data={this.props.data}
                margin={{top: 5, right: 30, left: 20, bottom: 5}}>
        <XAxis dataKey="key"/>
        <YAxis/>
        <CartesianGrid strokeDasharray="3 3"/>
        <Tooltip/>
        <Legend />
        <Bar dataKey="value" fill="#8884d8"/>
        <Bar dataKey="value1" fill="#8884d8"/>
      </BarChart>
    );
  }
}

export class EntityInfo extends Component {

  static propTypes = {
    id: PropTypes.String,
  };

  state = {
    entity: {}
  };

  componentWillMount() {
    const {id} = this.props;
    fetch(`${api_url}/entity/${id}`)
      .then(res => res.json())
      .then(res => {
        //console.log(res);
        this.setState({entity: res});
      });
  }
  render() {

    const entity = this.state.entity;
    const {id, name, kind, company_address} = entity;
    return (
      <div>
        <h2>ישות</h2>
        <h3>{name}</h3>
        <div>{kind} ({id})</div>
        <div>{company_address}</div>
      </div>
    );
  }
}