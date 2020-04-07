import React from 'react';
import Component from 'components/Component';
import style from 'styles/onboarding/onboarding.css';
import popupStyle from 'styles/welcome/add-member-popup.css';
import navStyle from 'styles/profile/market-fit-popup.css';
import Page from 'components/Page';
import {NotSureStep} from 'components/pages/preferences/notSureComponents/NotSureStep';

export default class NotSureComponent extends Component {
	style = style;
	styles = [popupStyle, navStyle];

	render() {
		const { notSure, changeStep, timeFrame, setTimeFrame, aggressiveLevel, setAggressiveLevel, indicator, calculateObjective, amount, reset, submit } = this.props;
		if (!notSure) return null;
		return (
			<Page popup={true} width={'800px'} contentClassName={popupStyle.locals.content}
						innerClassName={popupStyle.locals.inner}>
				<div className={popupStyle.locals.title}>
					Objective Assistant
				</div>
				<div>
					<NotSureStep
						notSureStep={notSure}
						changeStep={changeStep}
						timeFrame={timeFrame}
						setTimeFrame={setTimeFrame}
						aggressiveLevel={aggressiveLevel}
						setAggressiveLevel={setAggressiveLevel}
						indicator={indicator}
						calculateObjective={calculateObjective}
						amount={amount}
						reset={reset}
						submit={submit}
						classes={this.classes} />
				</div>
			</Page>
		)
	}
}