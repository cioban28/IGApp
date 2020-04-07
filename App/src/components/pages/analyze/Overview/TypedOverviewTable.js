import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { get, groupBy, mapValues, sumBy } from 'lodash';

import { formatBudget } from 'components/utils/budget';
import { compose } from 'components/utils/utils';
import { getMetadata, getNickname } from 'components/utils/channels';
import { getChannelIcon } from 'components/utils/filters/channels';

import OverviewTable from 'components/pages/analyze/OverviewTable';
import EllipsisTooltip from 'components/controls/EllipsisTooltip';

import styles from 'styles/analyze/analyze.css';

const classes = styles.locals;

const enhance = compose(
    inject(({ attributionStore: { data } }) => ({
        data,
    })),
    observer,
);

class TypedOverviewTable extends React.Component {
    types = {
        category: {
            title: 'Revenue by Category',
            generateData: (revenueByCategory, influencedRevenueByCategory) => {
                return Object.keys(revenueByCategory).map(category => ({
                    title: (
                        <div className={classes.cellWithIcon}>
                            <div
                                className={classes.categoryIcon}
                                data-icon={`category:${category
                                    .toLowerCase()
                                    .replace(' ', '-')}`}
                            />
                            <EllipsisTooltip text={category.toLowerCase()} />
                        </div>
                    ),
                    attributedRevenue: formatBudget(
                        revenueByCategory[category],
                    ),
                    touchedRevenue: formatBudget(
                        influencedRevenueByCategory[category],
                    ),
                }));
            },
        },
        channel: {
            title: 'Revenue by Channel',
            generateData: (revenueByChannel, influencedRevenueByChannel) => {
                return Object.keys(revenueByChannel).map(channel => ({
                    title: (
                        <div className={classes.cellWithIcon}>
                            <div
                                className={classes.channelIcon}
                                data-icon={getChannelIcon(channel)}
                            />
                            <EllipsisTooltip text={getNickname(channel)} />
                        </div>
                    ),
                    attributedRevenue: formatBudget(revenueByChannel[channel]),
                    touchedRevenue: formatBudget(
                        influencedRevenueByChannel[channel],
                    ),
                }));
            },
        },
        campaign: {
            title: 'Revenue by Campaign',
            generateData: data => {
                return data
                    .filter(
                        campaign =>
                            campaign.revenue || campaign.influencedRevenue,
                    )
                    .map(campaign => ({
                        title: <EllipsisTooltip text={campaign.name} />,
                        attributedRevenue: formatBudget(campaign.revenue),
                        touchedRevenue: formatBudget(
                            campaign.influencedRevenue,
                        ),
                    }));
            },
        },
        content: {
            title: 'Revenue by Content',
            generateData: pages => {
                return pages.map(page => ({
                    title: <EllipsisTooltip text={page.title} />,
                    attributedRevenue: formatBudget(page.revenue),
                    touchedRevenue: formatBudget(page.influencedRevenue),
                }));
            },
        },
    };

    getColumns = title => {
        return [
            {
                id: title,
                header: title,
                cell: 'title',
                width: 252,
                className: classes.titleColumn,
            },
            {
                id: 'Attributed Revenue',
                header: 'Attributed Revenue',
                cell: ({ attributedRevenue }) =>
                    attributedRevenue === '$0' ? (
                        <span style={{ color: '#99a4c2' }}>
                            {attributedRevenue}
                        </span>
                    ) : (
                        attributedRevenue
                    ),
            },
            {
                id: 'Touched Revenue',
                header: 'Touched Revenue',
                cell: ({ touchedRevenue }) =>
                    touchedRevenue === '$0' ? (
                        <span style={{ color: '#99a4c2' }}>
                            {touchedRevenue}
                        </span>
                    ) : (
                        touchedRevenue
                    ),
            },
        ];
    };

    getData = type => {
        const { data } = this.props;
        const { direct, ...revenueByChannel } = get(
            data,
            'attribution.channelsImpact.revenue',
            {},
        );

        const influencedRevenueByChannel = get(
            data,
            'attribution.channelsImpact.influencedRevenue',
            {},
        );

        if (type === 'category') {
            const channelsByCategories = groupBy(
                Object.keys(revenueByChannel),
                channel => getMetadata('category', channel),
            );

            const revenueByCategory = mapValues(
                channelsByCategories,
                channels =>
                    sumBy(channels, channel => revenueByChannel[channel]),
            );
            const influencedRevenueByCategory = mapValues(
                channelsByCategories,
                channels =>
                    sumBy(
                        channels,
                        channel => influencedRevenueByChannel[channel],
                    ),
            );

            return this.types[type].generateData(
                revenueByCategory,
                influencedRevenueByCategory,
            );
        }

        if (type === 'channel') {
            return this.types[type].generateData(
                revenueByChannel,
                influencedRevenueByChannel,
            );
        }

        if (type === 'campaign') {
            const campaigns = get(data, 'attribution.campaigns', []);

            return this.types[type].generateData(campaigns);
        }

        if (type === 'content') {
            const pages = get(data, 'attribution.pages', []);

            return this.types[type].generateData(pages);
        }

        return [];
    };

    render() {
        const { type } = this.props;

        return (
            <OverviewTable
                columns={this.getColumns(type)}
                title={this.types[type].title}
                data={this.getData(type)}
            />
        );
    }
}

TypedOverviewTable.propTypes = {
    data: PropTypes.shape({
        attribution:  PropTypes.shape({
           channelsImpact:  PropTypes.shape({
               revenue: PropTypes.shape({}),
               influencedRevenue: PropTypes.shape({}),
           }),
            pages: PropTypes.arrayOf(PropTypes.shape({
                title: PropTypes.string,
                revenue: PropTypes.number,
                influencedRevenue: PropTypes.number,
            })),
        }),
    }),
    type: PropTypes.oneOf(['category', 'channel', 'campaign', 'content'])
        .isRequired,
};

export default enhance(TypedOverviewTable);
