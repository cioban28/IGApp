import React from 'react';
import Label from 'components/ControlsLabel';
import Calendar from 'components/controls/Calendar';
import navStyle from 'styles/profile/market-fit-popup.css';
import Button from 'components/controls/Button';
import ButtonsSet from 'components/pages/profile/ButtonsSet';
import {getNickname} from 'components/utils/indicators';
import {formatNumber} from 'components/utils/budget';
import moment from 'moment';

export const NotSureStep = ({notSureStep, changeStep, timeFrame, setTimeFrame, aggressiveLevel, setAggressiveLevel, indicator, amount, calculateObjective, reset, submit, classes}) => {
	switch (notSureStep) {
		case 1:
			return (
				<div>
					<div className={classes.row}>
						<Label style={{justifyContent: 'center', textTransform: 'capitalize', fontSize: '15px'}}>
							Add a Due date
						</Label>
						<div style={{width: '200px', margin: 'auto', paddingLeft: '35px'}}>
							<Calendar value={timeFrame} onChange={setTimeFrame}/>
						</div>
					</div>
					<div className={navStyle.locals.nav}>
						<Button type="secondary" style={{
							width: '100px',
							marginRight: '20px'
						}} onClick={() => {
							changeStep(0)
						}}>
							<div className={navStyle.locals.backIcon}/>
							BACK
						</Button>
						<Button
							type="primary"
							style={{
								width: '100px'
							}}
							onClick={() => {
								changeStep(2);
							}}
							disabled={!timeFrame}
						>
							NEXT
							<div className={navStyle.locals.nextIcon}/>
						</Button>
					</div>
				</div>
			);
		case 2:
			return (
				<div>
					<div className={classes.row}>
						<Label style={{justifyContent: 'center', textTransform: 'capitalize', fontSize: '15px'}}>How
							aggressive you’re willing to be with the objective?</Label>
						<div style={{justifyContent: 'center', display: 'flex'}}>
							<ButtonsSet
								buttons={[
									{key: 0.5, text: 'Light', icon: 'buttons:light'},
									{key: 0.75, text: 'Caution', icon: 'buttons:caution'},
									{key: 1, text: 'Moderate', icon: 'buttons:moderate'},
									{key: 1.25, text: 'Aggressive', icon: 'buttons:aggressive'},
									{key: 1.5, text: 'Optimistic', icon: 'buttons:optimistic'}
								]}
								selectedKey={aggressiveLevel}
								onChange={setAggressiveLevel}
							/>
						</div>
					</div>
					<div className={navStyle.locals.nav}>
						<Button
							type="secondary"
							style={{
								width: '100px',
								marginRight: '20px'
							}}
							onClick={() => {
								changeStep(1);
							}}
						>
							<div className={navStyle.locals.backIcon}/>
							BACK
						</Button>
						<Button
							type="primary"
							style={{
								width: '100px'
							}}
							onClick={() => {
								calculateObjective();
								changeStep(3);
							}}
							disabled={!aggressiveLevel}
						>
							NEXT
							<div className={navStyle.locals.nextIcon}/>
						</Button>
					</div>
				</div>
			);
		case 3: {
			const nickname = getNickname(indicator);
			const formattedAmount = formatNumber(amount);
			const formattedData = moment(timeFrame).format('MMMM Do YYYY');
			return (
				<div>
					<div className={classes.row}>
						<Label
							style={{
								justifyContent: 'center',
								textTransform: 'none',
								fontSize: '15px',
								fontWeight: '500',
								whiteSpace: 'pre'
							}}>
							{'I want to reach a target of '}
							<span style={{fontWeight: '700'}}>{formattedAmount}</span>
							{` ${nickname} by ${formattedData}`}
						</Label>
					</div>
					<div className={navStyle.locals.nav}>
						<Button
							type="secondary"
							style={{
								width: '100px',
								marginRight: '20px'
							}}
							onClick={reset}>
							<div className={navStyle.locals.backIcon}/>
							Don't use
						</Button>
						<Button
							type="primary"
							style={{
								width: '100px'
							}}
							onClick={submit}
						>
							Use
							<div className={navStyle.locals.nextIcon}/>
						</Button>
					</div>
				</div>

			);
		}
		default:
			return null;
	}
};