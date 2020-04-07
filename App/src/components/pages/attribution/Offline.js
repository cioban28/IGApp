import React from 'react';
import Component from 'components/Component';
import style from 'styles/users/users.css';
import {getNickname} from 'components/utils/channels';
import icons from 'styles/icons/plan.css';
import Table from 'components/controls/Table';

export default class Offline extends Component {

  style = style;
  styles = [icons];

  formatDate(dateString) {
    const date = new Date(dateString);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const day = date.getDate();
    const monthIndex = date.getMonth();
    const year = date.getFullYear();

    return day + '-' + monthNames[monthIndex] + '-' + year;
  }

  render() {
    const {offline} = this.props;

    return <div style={{margin: -15}}>
      <Table
        data={offline}
        columns={[
          {
            id: 'channel',
            header: 'Channel',
            cell: (item) => (
              <div style={{display: 'flex'}}>
                <div className={this.classes.icon} data-icon={'plan:' + item.channel}/>
                {getNickname(item.channel)}
              </div>
            )
          },
          {
            id: 'campaign',
            header: 'Campaign',
            cell: (item) => item.campaigns.join(', ')
          },
          {
            id: 'startDate',
            header: 'Start Date',
            cell: (item) => this.formatDate(item.startDate)
          },
          {
            id: 'endDate',
            header: 'End Date',
            cell: (item) => this.formatDate(item.endDate)
          }
        ]}
      />
    </div>;
  }
}