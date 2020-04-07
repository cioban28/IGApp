import React from 'react';
import { ContextMenu, MenuItem, SubMenu } from 'react-contextmenu';
import PropTypes from 'prop-types';

class RegionMenu extends React.PureComponent {
    handleMenuItemClick = (event, data) => {
        const { addRegionToChannel } = this.props;
        addRegionToChannel(data.channel, data.region);
    };

    renderMenuItems() {
        const { userRegions } = this.props;

        return userRegions.map(region => (
            <MenuItem
                key={region}
                data={{ region }}
                onClick={this.handleMenuItemClick}
            >
                {region}
            </MenuItem>
        ));
    }

    render() {
        return (
            <ContextMenu id="rightClickEdit">
                <SubMenu title="Segment by" hoverDelay={250}>
                    {this.renderMenuItems()}
                    <MenuItem
                        data={{ percent: 1.5 }}
                        onClick={this.handleMenuItemClick}
                    >
                        Add new
                    </MenuItem>
                </SubMenu>
            </ContextMenu>
        );
    }
}

RegionMenu.defaultProps = {
    userRegions: [],
};

RegionMenu.propTypes = {
    addRegionToChannel: PropTypes.func,
    userRegions: PropTypes.arrayOf(PropTypes.string),
};

export default RegionMenu;
