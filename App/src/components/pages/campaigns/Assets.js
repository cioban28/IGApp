import React from 'react';
import Component from 'components/Component';
import Button from 'components/controls/Button';
import {getProfileSync} from 'components/utils/AuthService';
import serverCommunication from 'data/serverCommunication';
import style from 'styles/campaigns/assets.css';

export default class Assets extends Component {

  style = style;

  constructor(props) {
    super(props);
    this.state = {
      files: []
    }
  };

  componentDidMount() {
    this.getFiles();
  }


  showCloudinary() {
    const profile = getProfileSync();
    cloudinary.openUploadWidget(
      {
        cloud_name: 'infinigrow',
        upload_preset: 'infinigrow-app',
        sources: ['local', 'url'],
        folder: profile.app_metadata.UID,
        tags: [this.props.campaign.name]
      }, (err, result) => {
        if (err) {
          console.log(err);
        }
        else {
          this.getFiles();
        }
      }, false);
  }

  getFiles() {
    serverCommunication.serverRequest('GET', 'files')
      .then((response) => {
        if (response.ok) {
          response.json()
            .then((data) => {
              this.setState({files: data});
            })
        }
        else {
          console.log(response);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  render() {
    const files = this.state.files
      .filter(item => item.tags.includes(this.props.campaign.name))
      .map((item, index) => {
        const thumb = item.resource_type === 'raw' ? '/icons/office.png' : 'http://res.cloudinary.com/infinigrow/' + item.resource_type + '/upload/c_scale,h_60,w_90/v' + item.version + '/' + item.public_id + '.png';
        const fileName = item.public_id.split('/');
        const name = fileName[1] ? fileName[1].substr(0, 10) : fileName[0].substr(0,10);
        return <a key={index} className={this.classes.file} target="_blank"
                  href={item.secure_url}> <img src={thumb} className={ this.classes.fileThumb }/>{name}</a>
      });
    return <div>
      <div className={ this.classes.uploadButton }>
        <Button type="primary" style={{ width: '130px' }} onClick={ this.showCloudinary.bind(this) }>
          Upload
        </Button>
      </div>
      <div className={ this.classes.files }>
        { files ? files : null }
      </div>
    </div>
  }
}