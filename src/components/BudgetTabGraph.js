import React, {Component, PropTypes} from "react";
import {Tabs, Tab} from "material-ui/Tabs";
import {BudgetMap} from "./BudgetMap";
import {BudgetGraph} from "./BudgetGraph";
import {ChordGraph} from "./ChordGraph";
import {BudgetBuble} from "./BudgetBuble";
import {BudgetRadial} from "./BudgetRadial";
import {BudgetBracket} from "./BudgetBracket";
import "../static/App.css";

export class BudgetTabGraph extends Component {

  static propTypes = {
    code: PropTypes.string.isRequired,
    year: PropTypes.string.isRequired,
  };

  state = {
    tab: 'map',
  };

  handleChange = (value) => {
    this.setState({tab: value});
    console.log(`handleChange value: ${value}`);
  };

  render() {
    const {code, year, filter, actions} = this.props;
    return (
      <Tabs value={this.state.tab} onChange={this.handleChange}>
        <Tab label="Map" value="map">
          <BudgetMap code={code} year={year} filter={filter} actions={actions}/>
        </Tab>
        <Tab label="Chord" value="chord">
          <ChordGraph code={code} year={year} filter={filter} actions={actions}/>
        </Tab>
        <Tab label="Graph" value="graph">
          <BudgetGraph code={code} year={year} filter={filter} actions={actions}/>
        </Tab>
        <Tab label="Buble" value="buble">
          <BudgetBuble code={code} year={year} filter={filter} actions={actions}/>
        </Tab>
        <Tab label="Radial" value="radial">
          <BudgetRadial code={code} year={year} filter={filter} actions={actions}/>
        </Tab>
      </Tabs>
    );
  }
}
