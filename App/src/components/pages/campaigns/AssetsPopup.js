import React from 'react';
import Component from 'components/Component';
import Page from 'components/Page';
import style from 'styles/onboarding/onboarding.css';
import Button from 'components/controls/Button';
import assetsStyle from 'styles/campaigns/assets-popup.css';

export default class AssetsPopup extends Component {

  style = style;
  styles = [assetsStyle];

  static defaultProps = {
    campaign: {
      assets: []
    },
    hidden: true
  };

  handleChange(index, paramerter, event) {
    let update = Object.assign({}, this.props.campaign);
    update.assets[index][paramerter] = event.target.value;
    this.props.updateState({campaign: update});
  }

  addRow() {
    let update = Object.assign({}, this.props.campaign);
    if (!update.assets) {
      update.assets = [];
    }
    update.assets.push({name: '', link: 'http://', category: ''});
    this.props.updateState({campaign: update});
  }

  saveAssets() {
    this.props.updateCampaign();
    this.props.close();
  }

  render() {
    const rows = this.props.campaign.assets && this.props.campaign.assets.length > 0 ?
      this.props.campaign.assets.map((asset, index) =>
        <tr key={ index } className={ assetsStyle.locals.tableCell }>
          <td>
            <input value={ asset.name } className={ assetsStyle.locals.input } onChange={ this.handleChange.bind(this, index, 'name') }/>
          </td>
          <td>
            <input value={ asset.link } className={ assetsStyle.locals.input } onChange={ this.handleChange.bind(this, index, 'link') }/>
          </td>
          <td>
            <input value={ asset.category } className={ assetsStyle.locals.input } onChange={ this.handleChange.bind(this, index, 'category') }/>
          </td>
        </tr>
      )
      : null ;
    return <div hidden={ this.props.hidden }>
      <Page popup={ true } width={'570px'}>
        <table className={ assetsStyle.locals.table }>
          <thead>
          <tr className={ assetsStyle.locals.tableHeader }>
            <th>Name</th>
            <th>Link</th>
            <th>Category</th>
          </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
        <div className={ assetsStyle.locals.add }>
          <Button type="primary" className={ assetsStyle.locals.addButton } contClassName={ assetsStyle.locals.addButtonCont } onClick={ this.addRow.bind(this) }>Add+</Button>
        </div>
        <div className={ this.classes.footer }>
          <div className={ this.classes.footerLeft }>
            <Button type="secondary" style={{ width: '100px' }} onClick={ this.props.close }>Cancel</Button>
          </div>
          <div className={ this.classes.footerRight }>
            <Button type="primary" style={{ width: '100px' }} onClick={ this.saveAssets.bind(this) }>Done</Button>
          </div>
        </div>
      </Page>
    </div>
  }
}