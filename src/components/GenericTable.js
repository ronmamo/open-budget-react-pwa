import React, {Component, PropTypes} from "react";
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from "material-ui/Table";
import "../static/App.css";

export class GenericTable extends Component {

  static propTypes = {
    fields: PropTypes.array.isRequired,
    data: PropTypes.array.isRequired,
    actions: PropTypes.object.isRequired
  };

  render() {
    const {fields, data, actions} = this.props;
    return (
      <Table bodyStyle={{overflow: 'visible'}}>
        <TableHeader displaySelectAll={false}>
          <TableRow>
            { fields.map(field => (
              <TableHeaderColumn tooltip={field.title} key={field.title}>
                {field.title}
              </TableHeaderColumn>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={false} stripedRows={true} showRowHover={true}>
        { data.map((item, index) => (
            <TableRow key={index}>
              { fields.map(field => (
                <TableRowColumn key={field.title} style={{whiteSpace: 'normal', wordWrap: 'break-word'}}>
                  {item[field.name]}
                </TableRowColumn>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }
}

