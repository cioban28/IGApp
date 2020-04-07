import React from 'react';
import Component from 'components/Component';
import Page from 'components/Page';
import style from 'styles/attribution/upload-offline-popup.css';
import Dropzone from 'react-dropzone';
import Button from 'components/controls/Button';
import excelStyle from 'styles/plan-from-excel.css';
import { getChannelsWithNicknames } from 'components/utils/channels';
import Select from 'components/controls/Select';
import Textfield from 'components/controls/Textfield';
import XLSX from 'xlsx';
import Calendar from 'components/controls/Calendar';
import serverCommunication from 'data/serverCommunication';

export default class UploadOfflinePopup extends Component {

  style = style;
  styles = [excelStyle];

  constructor(props) {
    super(props);
    this.state = {
      fileName: '',
      channel: '',
      worksheet: {},
      isFirstName: true,
      isLastName: true,
      isCompany: true,
      dateCell: '',
      isDateGlobal: false,
      globalDate: '',
      isCampaignGlobal: false,
      campaignCell: '',
      globalCampaign: '',
      firstNameCell: '',
      lastNameCell: '',
      companyCell: '',
      emailCell: ''
    };
  }

  parseExcel(files) {
    const reader = new FileReader();
    reader.onload = (e) => {
      let data = e.target.result;
      data = new Uint8Array(data);
      const workbook = XLSX.read(data, {type: 'array', cellDates: true});
      const first_sheet_name = workbook.SheetNames[0];

      /* Get worksheet */
      const worksheet = workbook.Sheets[first_sheet_name];
      this.setState({worksheet: worksheet});
    };
    this.setState({fileName: files[0].name});
    reader.readAsArrayBuffer(files[0]);
  }

  uploadOffline() {
    const {worksheet, channel, dateCell, isDateGlobal, globalDate, isCampaignGlobal, campaignCell, globalCampaign, isFirstName, firstNameCell, isLastName, lastNameCell, isCompany, companyCell, emailCell} = this.state;
    const offlineData = [];
    const emailColumn = emailCell && emailCell.replace(/[0-9]/g, '');
    let row = parseInt(emailCell.replace(emailColumn, ''));
    row++;
    const dateColumn = dateCell && dateCell.replace(/[0-9]/g, '');
    const campaignColumn = campaignCell && campaignCell.replace(/[0-9]/g, '');
    const firstNameColumn = firstNameCell && firstNameCell.replace(/[0-9]/g, '');
    const lastNameColumn = lastNameCell && lastNameCell.replace(/[0-9]/g, '');
    const companyColumn = companyCell && companyCell.replace(/[0-9]/g, '');
    let date = !isDateGlobal && worksheet[dateColumn + row] && worksheet[dateColumn + row].v;
    let campaign = !isCampaignGlobal && worksheet[campaignColumn + row] && worksheet[campaignColumn + row].v;
    let firstName = isFirstName && worksheet[firstNameColumn + row] && worksheet[firstNameColumn + row].v;
    let lastName = isLastName && worksheet[lastNameColumn + row] && worksheet[lastNameColumn + row].v;
    let company = isCompany && worksheet[companyColumn + row] && worksheet[companyColumn + row].v;
    let email = worksheet[emailColumn + row] && worksheet[emailColumn + row].v;

    while (email) {
      date = isDateGlobal ? globalDate : date;
      campaign = isCampaignGlobal ? globalCampaign : campaign;
      offlineData.push({channel, date, campaign, firstName, lastName, company, email});
      row++;
      date = !isDateGlobal && worksheet[dateColumn + row] && worksheet[dateColumn + row].v;
      campaign = !isCampaignGlobal && worksheet[campaignColumn + row] && worksheet[campaignColumn + row].v;
      firstName = isFirstName && worksheet[firstNameColumn + row] && worksheet[firstNameColumn + row].v;
      lastName = isLastName && worksheet[lastNameColumn + row] && worksheet[lastNameColumn + row].v;
      company = isCompany && worksheet[companyColumn + row] && worksheet[companyColumn + row].v;
      email = worksheet[emailColumn + row] && worksheet[emailColumn + row].v;
    }
    serverCommunication.serverRequest('POST', 'offline', JSON.stringify(offlineData), localStorage.getItem('region'))
      .then((response) => {
        if (response.ok) {
          response.json()
            .then((data) => {
              this.props.setDataAsState(data);
              this.props.close();
            });
        }
      });
  }

  render () {
    const {fileName, worksheet, channel, dateCell, isDateGlobal, globalDate, isCampaignGlobal, campaignCell, globalCampaign, isFirstName, firstNameCell, isLastName, lastNameCell, isCompany, companyCell, emailCell} = this.state;
    return <div>
      <Page popup={ true } width={'600px'} contentClassName={ this.classes.content } innerClassName={ this.classes.inner }>
        <div className={this.classes.title}>
          Upload offline attribution data
        </div>
        <Dropzone onDropAccepted={ this.parseExcel.bind(this) } className={ excelStyle.locals.dropZone } activeClassName={ excelStyle.locals.dropZoneActive }>
          <div className={ excelStyle.locals.inner }>
            <div className={ excelStyle.locals.iconWrap }>
              <div className={ excelStyle.locals.icon}/>
            </div>
            <div className={ excelStyle.locals.innerText }>Drag & drop your file here, or browse.</div>
          </div>
        </Dropzone>
        <div className={this.classes.fileName}>
          {fileName}
        </div>
        <div hidden={!worksheet || Object.keys(worksheet).length === 0}>
          <div className={this.classes.row}>
            <div className={this.classes.field}>
              Channel*
            </div>
            <Select select={{options: getChannelsWithNicknames()}} style={{ width: '200px' }} selected={ channel } onChange= { (e) => { this.setState({channel: e.value}) } }/>
          </div>
          <div className={this.classes.row}>
            <div className={this.classes.field}>
              Date*
            </div>
            <input type="checkbox" onChange={ () => { this.setState({isDateGlobal: !isDateGlobal}) } } checked={ !isDateGlobal } style={{ marginLeft: '-23px', marginRight: '10px' }}/>
            <Textfield value={ dateCell } onChange={ (e) => { this.setState({dateCell: e.target.value.toUpperCase()}) } } style={{ width: '80px' }} disabled={isDateGlobal} placeHolder="A2"/>
            <Textfield value={ worksheet && worksheet[dateCell] && worksheet[dateCell].v } style={{ width: '100px', marginLeft: '20px' }} readOnly={true} disabled={isDateGlobal}/>
            <input type="checkbox" onChange={ () => { this.setState({isDateGlobal: !this.state.isDateGlobal}) } } checked={ isDateGlobal } style={{ marginLeft: '20px' }}/>
            <div style={{ width: '125px' }}>
              <Calendar value={ globalDate } onChange={ (e) => { this.setState({globalDate: e}) } } disabled={!isDateGlobal}/>
            </div>
          </div>
          <div className={this.classes.row}>
            <div className={this.classes.field}>
              Campaign Name*
            </div>
            <input type="checkbox" onChange={ () => { this.setState({isCampaignGlobal: !isCampaignGlobal}) } } checked={ !isCampaignGlobal } style={{ marginLeft: '-23px', marginRight: '10px' }}/>
            <Textfield value={ campaignCell } onChange={ (e) => { this.setState({campaignCell: e.target.value.toUpperCase()}) } } style={{ width: '80px' }} disabled={isCampaignGlobal} placeHolder="B2"/>
            <Textfield value={ worksheet && worksheet[campaignCell] && worksheet[campaignCell].v } style={{ width: '100px', marginLeft: '20px' }} readOnly={true} disabled={isCampaignGlobal}/>
            <input type="checkbox" onChange={ () => { this.setState({isCampaignGlobal: !this.state.isCampaignGlobal}) } } checked={ isCampaignGlobal } style={{ marginLeft: '20px' }}/>
            <Textfield value={ globalCampaign } onChange={ (e) => { this.setState({globalCampaign: e.target.value}) } } style={{ width: '93px' }} disabled={!isCampaignGlobal} placeHolder="my campaign"/>
          </div>
          <div className={this.classes.row}>
            <div className={this.classes.field}>
              First Name
            </div>
            <input type="checkbox" onChange={ () => { this.setState({isFirstName: !isFirstName}) } } checked={ isFirstName } style={{ marginLeft: '-23px', marginRight: '10px' }}/>
            <Textfield value={ firstNameCell } onChange={ (e) => { this.setState({firstNameCell: e.target.value.toUpperCase()}) } } style={{ width: '80px' }} disabled={!isFirstName} placeHolder="C2"/>
            <Textfield value={ worksheet && worksheet[firstNameCell] && worksheet[firstNameCell].v } style={{ width: '100px', marginLeft: '20px' }} readOnly={true} disabled={!isFirstName}/>
          </div>
          <div className={this.classes.row}>
            <div className={this.classes.field}>
              Last Name
            </div>
            <input type="checkbox" onChange={ () => { this.setState({isLastName: !isLastName}) } } checked={ isLastName } style={{ marginLeft: '-23px', marginRight: '10px' }}/>
            <Textfield value={ lastNameCell } onChange={ (e) => { this.setState({lastNameCell: e.target.value.toUpperCase()}) } } style={{ width: '80px' }} disabled={!isLastName} placeHolder="D2"/>
            <Textfield value={ worksheet && worksheet[lastNameCell] && worksheet[lastNameCell].v } style={{ width: '100px', marginLeft: '20px' }} readOnly={true} disabled={!isLastName}/>
          </div>
          <div className={this.classes.row}>
            <div className={this.classes.field}>
              Company
            </div>
            <input type="checkbox" onChange={ () => { this.setState({isCompany: !isCompany}) } } checked={ isCompany } style={{ marginLeft: '-23px', marginRight: '10px' }}/>
            <Textfield value={ companyCell } onChange={ (e) => { this.setState({companyCell: e.target.value.toUpperCase()}) } } style={{ width: '80px' }} disabled={!isCompany} placeHolder="E2"/>
            <Textfield value={ worksheet && worksheet[companyCell] && worksheet[companyCell].v } style={{ width: '100px', marginLeft: '20px' }} readOnly={true} disabled={!isCompany}/>
          </div>
          <div className={this.classes.row}>
            <div className={this.classes.field}>
              Email*
            </div>
            <Textfield value={ emailCell } onChange={ (e) => { this.setState({emailCell: e.target.value.toUpperCase()}
            ) } } style={{ width: '80px' }} placeHolder="F2"/>
            <Textfield value={ worksheet && worksheet[emailCell] && worksheet[emailCell].v } style={{ width: '100px', marginLeft: '20px' }} readOnly={true}/>
          </div>
        </div>
        <div className={this.classes.buttons}>
          <Button type="secondary" style={{ width: '100px' }} onClick={ this.props.close }>Cancel</Button>
          <Button type="primary" style={{ width: '100px', marginLeft: 'auto' }} onClick={ this.uploadOffline.bind(this) }>Done</Button>
        </div>
      </Page>
    </div>
  }
}