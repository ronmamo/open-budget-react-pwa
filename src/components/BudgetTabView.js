import React, {Component, PropTypes} from "react";
import {Tabs, Tab} from "material-ui/Tabs";
import {BudgetInfo} from "./BudgetInfo";
import {ProcurementsTable} from "./ProcurementsTable";
import {SupportsTable} from "./SupportsTable";
import "../static/App.css";

export class BudgetTabView extends Component {

  static propTypes = {
    code: PropTypes.string.isRequired,
    year: PropTypes.string.isRequired,
  };

  state = {
    tab: 'budget',
  };

  handleChange = (value) => {
    this.setState({tab: value});
    console.log(`handleChange value: ${value}`);
  };

  render() {
    const {code, year, actions} = this.props;
    return (
      <Tabs value={this.state.tab} onChange={this.handleChange}>
        <Tab label="תקציב" value="budget">
          <BudgetInfo code={code} year={year} actions={actions}/>
        </Tab>
        <Tab label="התקשרויות" value="procurement">
          <ProcurementsTable code={code} year={year} actions={actions}/>
        </Tab>
        <Tab label="תמיכות" value="support">
          <SupportsTable code={code} year={year} actions={actions}/>
        </Tab>
      </Tabs>
    );
  }
}
