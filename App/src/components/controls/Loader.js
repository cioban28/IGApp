import React from 'react';
import Popup from 'components/Popup';
import Loading from 'components/pages/plan/Loading';
import style from 'styles/controls/loader.css';
import Component from 'components/Component';


class Loader extends Component {
    style = style;

    render() {
        return (
            <div className={this.classes.loading}>
                <Popup className={this.classes.popup}>
                    <div>
                        <Loading />
                    </div>
                </Popup>
            </div>
        );
    }
}

export default Loader;
