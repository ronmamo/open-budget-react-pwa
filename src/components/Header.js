import React, {Component} from "react";
import AppBar from "material-ui/AppBar";
import MenuItem from "material-ui/MenuItem";
import IconButton from "material-ui/IconButton";
import IconMenu from "material-ui/IconMenu";
import MoreVertIcon from "material-ui/svg-icons/navigation/more-vert";
import "../static/App.css";
import logo from "../static/pkw_logo.png";

const styles = {
  header: {
    margin: '0px',
    padding: '0px',
    textAlign: 'center',
  }
};

export class Header extends Component {
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
