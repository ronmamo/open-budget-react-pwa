import React, {Component, PropTypes} from "react";
import Helmet from "react-helmet";
import logo from "./pkw_logo.png";
// import favicon from './favicon.ico';
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Treemap, BarChart, Bar} from "recharts";
import {Router, Route, hashHistory} from "react-router";
import "antd/dist/antd.css";
import {Select, Table, Icon, Switch, Radio, Form} from "antd";
import "./App.css";
import injectTapEventPlugin from 'react-tap-event-plugin';
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import FlatButton from 'material-ui/FlatButton';
import Toggle from 'material-ui/Toggle';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import ActionReportProblem from 'material-ui/svg-icons/action/report-problem';
import ActionBookmark from 'material-ui/svg-icons/action/bookmark';
import ActionInfo from 'material-ui/svg-icons/action/info';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import {
  cyan500, deepOrange500, red500, grey400, grey500, grey600, grey700,
  transparent, lightWhite, white, darkWhite, lightBlack, black, darkBaseTheme
} from 'material-ui/styles/colors';
import {AutoComplete} from 'material-ui';
import RaisedButton from 'material-ui/RaisedButton';
import ActionSearch from 'material-ui/svg-icons/action/search';
import FontIcon from 'material-ui/FontIcon';
import {Tabs, Tab} from 'material-ui/Tabs';
import {fetch_groups} from './app_data';
import SelectField from 'material-ui/SelectField';

// test data todo temporarily
import {
  fetch_budget_00_2017,
  fetch_budget_00_2017_kids,
  fetch_procurements_0024020551,
  fetch_supports_0020,
  fetch_budget_00
} from './test_data';

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

//todo integrate full text search api
//http://www.obudget.org/api/search/full_text?q=%D7%91%D7%98&limit=100

const api_url = "http://localhost:8888/api";

const currency = value => {
  return value ?
    value >= 1000000 ? `${(value / 1000000).toFixed(3)} מ₪` :
      `${value.toLocaleString()} ₪` : '';
};

//
const head = {
  meta: [
    {charset: 'utf-8'},
    {name: 'viewport', content: 'width=device-width, initial-scale=1'}
  ],
  link: [
    {"rel": "shortcut icon", "href": "/favicon.ico"},
//    {rel: 'stylesheet', href: 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css'},
    {rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Roboto:400,300,500'},
    {rel: 'stylesheet', href: 'http://fonts.googleapis.com/icon?family=Material+Icons'},
    {rel: 'stylesheet', href: '//cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/leaflet.css'}
  ],
  script: [
//    {src: 'http://include.com/pathtojs.js', type: 'text/javascript'}
  ]
};

export default class App extends Component {
  render() {
    const title = "מפתח התקציב - {title}";
    return (
      <div>
        <Helmet title={title}
                htmlAttributes={{lang: "he", dir: "rtl"}}
                meta={head.meta}
                link={head.link}
                script={head.script}
        />
        <Router history={hashHistory}>
          <Route path="/" component={Main}/>
          <Route path="/budget(/:code)(/:year)" component={Main}/>
        </Router>
      </div>
    );
  }
}

const styles = {
  container: {
    padding: '7px'
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

const muiTheme = getMuiTheme({
  fontFamily: 'Roboto, sans-serif',
  palette: {
    textColor: darkBaseTheme, // cyan500, deepOrange500, darkBaseTheme
    accent1Color: deepOrange500
  },
  appBar: {
    height: 50
  }
});

export class Main extends Component {

  state = {
    filter: [],
    selected: {}
  };

  componentWillMount() {
    const params = this.props.params;
    console.log(`componentDidMount params: ${JSON.stringify(this.props.params)}`);
    const code = (params && params["code"]) || "00";
    const year = (params && params["year"]) || "2017";
    if (!this.state.selected.title) {
      this.setState({selected: fetch_budget_00_2017});
      // fetch(`${api_url}/budget/${code}/${year}`)
      //   .then(res => res.json())
      //   .then(res => {
      //     console.log(`res: ${JSON.stringify(res)}`);
      //     this.setState({selected: res});
      //   });
    }
  }

  onFilter = (f) => this.setState({filter: f});

  onSelect = (selected) => {
    this.setState({selected: selected});
  };

  render() {
    const {code, year, selected} = this.state;
    const actions = {onFilter: this.onFilter, onSelect: this.onSelect};
    return (
      <div>
        <MuiThemeProvider muiTheme={muiTheme}>
          <div style={styles.container}>
            <Header/>
            <SearchBar />
            <Breadcrumbs selected={selected} actions={actions}/>
            <BudgetMap selected={selected} actions={actions} filter={this.state.filter}/>
            <TabView selected={selected} actions={actions}/>
          </div>
        </MuiThemeProvider>
      </div>
    );
  }
}

const Logged = (props) => (
  <IconMenu
    {...props}
    iconButtonElement={
      <IconButton><MoreVertIcon /></IconButton>
    }
    targetOrigin={{horizontal: 'right', vertical: 'top'}}
    anchorOrigin={{horizontal: 'right', vertical: 'top'}}
  >
    <MenuItem primaryText="Refresh"/>
    <MenuItem primaryText="Help"/>
    <MenuItem primaryText="Sign out"/>
  </IconMenu>
);

Logged.muiName = 'IconMenu';

class Header extends Component {
  render() {
    return (
      <div>
        <AppBar style={styles.header}
                title="הסדנא לידע ציבורי"
                iconElementLeft={<img src={logo} className="App-logo" alt="logo"/>}
                iconElementRight={<Logged />}
        />
      </div>
    );
  }
}

export class SearchBar extends Component {
  state = {
    dataSource: [],
    select: ""
  };

  onChange = value => {
    console.log(`onChange ${value}`);
    this.search(value);
  };

  onSelect = () => {
    console.log("onSelect");
  };

  onClick = () => {
  };

  search = value => {
    const select = value; // todo sanitize
    if (select) {
      this.setState({select: select});
      const shouldFetch = select.length > 2;
      if (shouldFetch) {
        fetch(`http://www.obudget.org/api/search/full_text?q=${select}&limit=10`)
          .then(res => res.json())
          .then(res => {
            console.log(res);
            this.setState({dataSource: res.map(item => `${item.name} :${item.type}`)});
          });
      }
    }
  };

  render() {
    const {dataSource} = this.state;
    return (
      <div style={styles.center}>
        <AutoComplete
          dataSource={dataSource}
          floatingLabelText="חיפוש"
          filter={AutoComplete.fuzzyFilter}
          onNewRequest={this.onChange}/>
        <RaisedButton
          label="חיפוש"
          primary={true}
          icon={<ActionSearch />}
          onClick={this.onClick}
        />
      </div>
    );
  }
}

const COLORS = ['#8889DD', '#9597E4', '#8DC77B', '#A5D297', '#E2CF45', '#F8C12D'];

export class BudgetMap extends Component {


  state = {
    data: [
      {
        children: []
      }]
  };

  onClick = (item) => {
    this.props.actions.onSelect(item);
  };

  componentWillMount() {
    //todo blur until fetched
    const {code, year} = this.props.selected;
    this.setState({data: fetch_budget_00_2017_kids.items});
    // fetch(`${api_url}/budget/${code}/${year}/kids?per_page=100`)
    //   .then(res => res.json())
    //   .then(res => {
    //     //console.log(JSON.stringify(res));
    //     this.setState({data: res.items});
    //   });
  }

  value(item) {
    return item.net_allocated;
  }

  color(index) {
    return COLORS[index % COLORS.length];
  }

  render() {
    const data = this.state.data
      .filter(item => this.value(item))
      .filter(item => this.props.filter.indexOf(item.title) == -1)
      .sort((a, b) => this.value(b) - this.value(a))
      .map((item, index) => Object.assign({
        name: item.title, size: this.value(item), item: item, color: this.color(index)
      }));
    return (
      <div>
        <SimpleTreemap data={data} onClick={this.onClick}/>
      </div>
    );
  }
}

class TabView extends Component {

  state = {
    value: 'budget',
  };

  handleChange = (value) => {
    this.setState({
      value: value,
    });
    console.log(`handleChange value: ${value}`);
  };

  render() {
    const {selected, actions} = this.props;
    const value = this.state.value;
    return (
      <Tabs value={value} onChange={this.handleChange}>
        <Tab label="תקציב" value="budget">
          <div>
            <BudgetInfo selected={selected} actions={actions}/>
          </div>
        </Tab>
        <Tab label="התקשרויות" value="procurement">
          <ProcurementTable selected={value == "procurement" ? selected : {}} actions={actions}/>
        </Tab>
        <Tab label="תמיכות" value="support">
          <SupportTable selected={value == "support" ? selected : {}} actions={actions}/>
        </Tab>
        <Tab label="פטורים" value="exemptions">
          <ExemptionTable selected={value == "exemptions" ? selected : {}} actions={actions}/>
        </Tab>
      </Tabs>
    );
  }
}

export class BudgetInfo extends Component {

  state = {
    data: []
  };

  componentWillMount() {
    this.load();
  }

  componentWillUpdate(nextProps, nextState) {
    if (this.props.selected != nextProps.selected) {
      this.load();
    }
  }

  load() {
    //todo blur until fetched
    const {code} = this.props.selected;
    this.setState({data: fetch_budget_00.items});
    // fetch(`${api_url}/budget/${code}`)
    //   .then(res => res.json())
    //   .then(res => {
    //     //console.log(JSON.stringify(res));
    //     this.setState({data: res.items});
    //   });
  }

  render() {
    const {code, year, title, net_revised, group_top, group_full} = this.props.selected;
    const breadcrumbs = group_top ? `${group_top} / ${group_full}` : '';
    const sum = year ? `תקציב ${year}: ${currency(net_revised)}` : '';
    const data = this.state.data.sort(budget => budget.year)
      .map(budget => ({name: budget.year, value: budget.net_allocated}));
    return (
      <div>
        <h1>{title}</h1>
        <div>{breadcrumbs}</div>
        <h3>{sum}</h3>
        <div>
          תקציב לאורך השנים
          <SimpleLineChart data={data}/>
        </div>
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

class ProcurementTable extends Component {

  state = {
    bordered: false,
    loading: false,
    pagination: true,
    size: 'small',
    expandedRowRender: record => <p>{record.description}</p>,
    title: () => <h3>טבלת התקשרויות</h3>,
    footer: () => 'טבלת התקשרויות',
    rowSelection: {},
    scroll: undefined,
    page: 1,

    procurements: undefined,
    exemptions: []
  };

  componentWillUpdate(nextProps, nextState) {
    if (this.props.selected != nextProps.selected) {
      this.load(nextProps.selected, this.state.page);
    }
  }

  load(selected, page) {
    const {code} = selected;
    if (code) {
      this.setState({
        procurements: fetch_procurements_0024020551.items,
        page: fetch_procurements_0024020551.page,
        total: fetch_procurements_0024020551.total
      });
      // this.setState({loading: true});
      // fetch(`${api_url}/procurement/${code}/kids?page=${page}&per_page=10`)
      //   .then(res => res.json())
      //   .then(res => {
      //     console.log(`res: ${JSON.stringify(res)}`);
      //     this.setState({loading: false, procurements: res.items, page: res.page, total: res.total});
      //   });
    }
  }

  onPage = e => {
    this.setState({page: e});
    this.load(e);
  };

  render() {
    const selected = this.props.selected;
    const procurements = this.state.procurements;
    if (!procurements) {
      return <div></div>
    }

    const columns = [
      {title: 'purpose', dataIndex: 'purpose', key: 'purpose', render: text => <a href="#">{text}</a>,},
      {title: 'budget_title', dataIndex: 'budget_title', key: 'budget_title',},
      {title: 'publisher', dataIndex: 'publisher', key: 'publisher',},
      {title: 'supplier_name', dataIndex: 'supplier_name', key: 'supplier_name',},
      {title: 'report_date', dataIndex: 'report_date', key: 'report_date',},
      {title: 'volume', dataIndex: 'volume', key: 'volume',},
    ];
    const data = procurements.map(procurement => {
      return ({
        key: procurement.purpose,
        purpose: procurement.purpose,
        budget_title: procurement.budget_title,
        publisher: procurement.publisher,
        supplier_name: procurement.supplier_name,
        report_date: procurement.report_date,
        volume: procurement.volume,
      });
    });
    const pagination = {
      current: this.state.page,
      total: this.state.total,
      onChange: this.onPage
    };
    return selected ? (
        <Table {...this.state} columns={columns} dataSource={data} pagination={pagination}/>
      ) : '';
  }
}

class SupportTable extends Component {

  state = {
    bordered: false,
    loading: false,
    pagination: true,
    size: 'small',
    expandedRowRender: record => <p>{record.description}</p>,
    title: () => <h3>טבלת תמיכות</h3>,
    footer: () => 'טבלת תמיכות',
    rowSelection: {},
    scroll: undefined,
    data: [],
    page: 1,
  };

  componentWillUpdate(nextProps, nextState) {
    if (this.props.selected != nextProps.selected) {
      this.load(nextProps.selected, this.state.page);
    }
  }

  load(selected, page) {
    const {code} = selected;
    if (code) {
      this.setState({
        data: fetch_supports_0020.items,
        page: fetch_supports_0020.page,
        total: fetch_supports_0020.total
      });
      // this.setState({loading: true});
      // fetch(`${api_url}/supports/{code}`)
      //   .then(res => res.json())
      //   .then(res => {
      //     //console.log(JSON.stringify(res));
      //     this.setState({loading: false, data: res.items, page: res.page, total: res.total});
      //   });
    }
  }

  onPage = e => {
    this.setState({page: e});
    this.load(e);
  };

  render() {
    const data = this.state.data;
    if (!data) {
      return <div></div>
    }

    const columns = [
      {title: 'subject', dataIndex: 'subject', key: 'subject', render: text => <a href="#">{text}</a>,},
      {title: 'title', dataIndex: 'title', key: 'title',},
      {title: 'entity_id', dataIndex: 'entity_id', key: 'entity_id',},
      {title: 'recipient', dataIndex: 'recipient', key: 'recipient',},
      {title: 'year', dataIndex: 'year', key: 'year',},
      {title: 'amount_supported', dataIndex: 'amount_supported', key: 'amount_supported',},
    ];

    let i = 0;
    const dataSource = data.map(item => {
      return ({
        key: i++,
        subject: item.subject,
        title: item.title,
        entity_id: item.entity_id,
        recipient: item.recipient,
        year: item.year,
        amount_supported: item.amount_supported,
      });
    });
    const pagination = {
      current: this.state.page,
      total: this.state.total,
      onChange: this.onPage
    };
    return (
      <Table {...this.state} columns={columns} dataSource={dataSource} pagination={pagination}/>
    )
  }
}

class ExemptionTable extends Component {

  state = {
    bordered: false,
    loading: false,
    pagination: true,
    size: 'small',
    expandedRowRender: record => <p>{record.description}</p>,
    title: () => <h3>טבלת פטורים</h3>,
    footer: () => 'טבלת פטורים',
    rowSelection: {},
    scroll: undefined,
    data: [],
    page: 1,
  };

  componentWillUpdate(nextProps, nextState) {
    if (this.props.selected != nextProps.selected) {
      this.load(nextProps.selected, this.state.page);
    }
  }

  load(selected, page) {
    const {code} = selected;
    if (code) {
      // this.setState({data: fetch_supports_0020.items, page: fetch_supports_0020.page, total: fetch_supports_0020.total})
      this.setState({loading: true});
      fetch(`${api_url}/exemption/budget/00`)
        .then(res => res.json())
        .then(res => {
          console.log(JSON.stringify(res));
          this.setState({loading: false, data: res.items, page: res.page, total: res.total});
        });
    }
  }

  onPage = e => {
    this.setState({page: e});
    this.load(e);
  };

  render() {
    const data = this.state.data;
    if (!data) {
      return <div></div>
    }

    const columns = [
      {title: 'subject', dataIndex: 'subject', key: 'subject', render: text => <a href="#">{text}</a>,},
      {title: 'title', dataIndex: 'title', key: 'title',},
      {title: 'entity_id', dataIndex: 'entity_id', key: 'entity_id',},
      {title: 'recipient', dataIndex: 'recipient', key: 'recipient',},
      {title: 'year', dataIndex: 'year', key: 'year',},
      {title: 'amount_supported', dataIndex: 'amount_supported', key: 'amount_supported',},
    ];

    let i = 0;
    const dataSource = data.map(item => {
      return ({
        key: i++,
        subject: item.subject,
        title: item.title,
        entity_id: item.entity_id,
        recipient: item.recipient,
        year: item.year,
        amount_supported: item.amount_supported,
      });
    });
    const pagination = {
      current: this.state.page,
      total: this.state.total,
      onChange: this.onPage
    };
    return (
      <Table {...this.state} columns={columns} dataSource={dataSource} pagination={pagination}/>
    )
  }
}

//
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

class CustomizedContent extends Component {

  render() {
    const {index, name, value, depth, x, y, width, height} = this.props;
    const data = this.props.data[index];
    if (!data) {
      return <div></div>
    }
    const item = data.item;
    return (
      <g onClick={e => this.props.onClick(item)}>
        <rect x={x} y={y} width={width} height={height} style={{
          fill: data.color,
          stroke: '#fff',
          strokeWidth: 2 / (depth + 1e-10),
          strokeOpacity: 1 / (depth + 1e-10),
        }}
        />
        { index < 6 ?
          <text x={x + width / 2} y={y + height / 2} textAnchor="middle" fill="#fff" fontSize={12}>
            {name}
          </text>
          : null
        }
        { index < 6 ?
          <text x={x + 60} y={y + 18} fill="#fff" fontSize={14} fillOpacity={0.9}>
            {currency(value)}
          </text>
          : null
        }
      </g>
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

//
export class SimpleTreemap extends Component {

  componentWillMount() {
    this.updateDimensions();
  }

  componentDidMount() {
    window.addEventListener("resize", this.updateDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
  }

  updateDimensions = () => {
    const w = window,
      d = document,
      documentElement = d.documentElement,
      body = d.getElementsByTagName('body')[0],
      width = w.innerWidth || documentElement.clientWidth || body.clientWidth,
      height = w.innerHeight || documentElement.clientHeight || body.clientHeight;
    this.setState({width, height});
  };

  render() {
    const {data} = this.props;
    return (
      <Treemap width={this.state.width} height={300} ratio={4 / 3} stroke="#fff" fill="#8884d8"
               data={data} dataKey="size"
               content={
                 <CustomizedContent data={data} onClick={this.props.onClick}/>
               }
      />
    );
  }
}

export class SimpleLineChart extends Component {

  componentWillMount() {
    this.updateDimensions();
  }

  componentDidMount() {
    window.addEventListener("resize", this.updateDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
  }

  updateDimensions = () => {
    const w = window,
      d = document,
      documentElement = d.documentElement,
      body = d.getElementsByTagName('body')[0],
      width = w.innerWidth || documentElement.clientWidth || body.clientWidth,
      height = w.innerHeight || documentElement.clientHeight || body.clientHeight;
    this.setState({width, height});
  };

  render() {
    const {data} = this.props;
    return (
      <LineChart width={this.state.width} height={200} data={data}
                 margin={{top: 5, right: 30, left: 20, bottom: 5}}>
        <XAxis dataKey="name"/>
        <YAxis/>
        <CartesianGrid strokeDasharray="3 3"/>
        <Tooltip/>
        <Line type="monotone" dataKey="value" stroke="#82ca9d"/>
      </LineChart>
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
