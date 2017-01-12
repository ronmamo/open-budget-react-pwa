import React, {Component} from "react";
import {Router, Route, browserHistory} from "react-router";
import {Main} from "./components/Main";

export class Routes extends Component {
  render() {
    return (
      <Router history={browserHistory}>
        <Route path="/" component={Main}/>
        <Route path="/budget(/:code)(/:year)" component={Main}/>
      </Router>
    )
  }
}
