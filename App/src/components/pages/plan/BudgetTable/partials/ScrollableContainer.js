import React from 'react';
import PropTypes from 'prop-types';
import throttle from 'lodash/throttle';

import { classes } from 'components/pages/plan/BudgetTable';
import Controls from 'components/pages/plan/BudgetTable/partials/Controls';

class ScrollableContainer extends React.Component {
    constructor(props) {
        super(props);

        this.scrollableRef = React.createRef();
    }

    componentDidMount() {
        const { scrollPosition } = this.props;

        if (this.scrollableRef.current) {
            this.scrollableRef.current.addEventListener(
                'scroll',
                throttle(this.handleScroll, 100),
            );
        }

        this.scrollTo(scrollPosition);
    }

    componentDidUpdate(prevProps) {
        const { scrollPosition } = this.props;

        if (prevProps.scrollPosition !== scrollPosition) {
            this.scrollTo(scrollPosition);
        }
    }

    componentWillUnmount() {
        if (this.scrollableRef.current) {
            this.scrollableRef.current.removeEventListener(
                'scroll',
                this.handleScroll,
            );
        }
    }

    handleScroll = event => {
        const { changeScrollPosition } = this.props;
        const { scrollLeft } = event.target;

        changeScrollPosition(scrollLeft);
    };

    scrollMonth = event => {
        const { cellWidth, changeScrollPosition, scrollPosition } = this.props;
        const { direction = 'next' } = event.currentTarget.dataset;
        const residual = scrollPosition % cellWidth;
        const stepBack = residual || cellWidth;
        const subtraction = scrollPosition - stepBack;

        const move = {
            next: scrollPosition + cellWidth - residual,
            back: subtraction > 0 ? subtraction : 0 ,
        };

        changeScrollPosition(move[direction]);
    };

    scrollTo(x) {
        if (this.scrollableRef.current) {
            this.scrollableRef.current.scrollLeft = x;
        }
    }

    render() {
        const { children } = this.props;

        return (
            <div className={classes.root}>
                <Controls onClick={this.scrollMonth} />
                <div
                    className={classes.scrollableContainer}
                    ref={this.scrollableRef}
                >
                    {children}
                </div>
            </div>
        );
    }
}

ScrollableContainer.defaultProps = {
    changeScrollPosition: () => {},
};

ScrollableContainer.propTypes = {
    children: PropTypes.node,
    scrollPosition: PropTypes.number,
    changeScrollPosition: PropTypes.func,
};

export default ScrollableContainer;
