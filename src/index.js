import React, {Component} from "react";
import ReactDOM from "react-dom";
import Helmet from "react-helmet";
import injectTapEventPlugin from "react-tap-event-plugin";
import ApolloClient, {createNetworkInterface} from "apollo-client";
import {ApolloProvider} from "react-apollo";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import getMuiTheme from "material-ui/styles/getMuiTheme";
import {deepOrange500} from "material-ui/styles/colors";
import {Routes} from "./Routes";
import "./static/App.css";

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

const networkInterface = createNetworkInterface('http://localhost:8888/graphql');

const client = new ApolloClient({ networkInterface });

const head = {
  meta: [
    {charset: 'utf-8'},
    {name: 'viewport', content: 'width=device-width, initial-scale=1'}
  ],
  link: [
    {"rel": "shortcut icon", "href": "/favicon.ico"},
//    {rel: 'stylesheet', href: 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css'},
    {rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Roboto:400,300,500'},
//     {rel: 'stylesheet', href: 'http://fonts.googleapis.com/icon?family=Material+Icons'},
    {rel: 'stylesheet', href: '//cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/leaflet.css'}
  ],
  script: [
//    {src: 'http://include.com/pathtojs.js', type: 'text/javascript'}
  ]
};

const muiTheme = getMuiTheme({
  fontFamily: 'Roboto, sans-serif',
  palette: {
    // textColor: darkWhite, // cyan500, deepOrange500, darkBaseTheme
    accent1Color: deepOrange500
  },
  appBar: {
    height: 50
  }
});

class Main extends Component {
  render() {
    const title = "מפתח התקציב";
    return (
      <div>
        <Helmet title={title}
                htmlAttributes={{lang: "he", dir: "rtl"}}
                meta={head.meta}
                link={head.link}
                script={head.script}
        />
        <ApolloProvider client={client}>
          <MuiThemeProvider muiTheme={muiTheme}>
            <Routes/>
          </MuiThemeProvider>
        </ApolloProvider>
      </div>
    );
  }
}

ReactDOM.render(
  <Main />,
  document.getElementById('root')
);
