import React from 'react';
import Component from 'components/Component';
import style from 'styles/onboarding/onboarding.css';
import popupStyle from 'styles/welcome/add-member-popup.css';
import navStyle from 'styles/profile/market-fit-popup.css';
import Label from 'components/ControlsLabel';
import Select from 'components/controls/Select';

export default class DateRangeSelectors extends Component {
	style = style;
	styles = [popupStyle, navStyle];

	componentWillReceiveProps(nextProps) {
		if ((!!nextProps.monthIndex || nextProps.monthIndex === 0) && (!!nextProps.startMonthIndex || nextProps.startMonthIndex === 0) && nextProps.startMonthIndex > nextProps.monthIndex) {
			this.props.endDateSelect({value: nextProps.startMonthIndex });
		}
	}

	render() {
		const { isRecurrent, dates, startMonthIndex, startDateSelect, monthIndex, endDateSelect } = this.props;
		if (isRecurrent) return null;

		const datesOptions = dates.map((item, index) => {
			return { label: item, value: index };
		});
		return (
			<div className={this.classes.row}>
				<div style={{display: 'flex'}}>
					<div style={{marginRight: 20}}>
						<Label>
							Start date
						</Label>
						<Select
							selected={startMonthIndex}
							select={{
								options: datesOptions
							}}
							onChange={(e) => { startDateSelect(e) }}
							style={{width: '100px'}}
						/>
					</div>
					<div>
						<Label>
							Due date
						</Label>
						<Select
							selected={monthIndex}
							select={{
								options: datesOptions.filter((dateItem) => dateItem.value >= startMonthIndex)
							}}
							onChange={(e) => { endDateSelect(e) }}
							style={{width: '100px'}}
						/>
					</div>
				</div>
			</div>
		)
	}
}