import React from 'react';
import Component from 'components/Component';
import style from 'styles/onboarding/onboarding.css';
import popupStyle from 'styles/welcome/add-member-popup.css';
import navStyle from 'styles/profile/market-fit-popup.css';
import Label from 'components/ControlsLabel';
import Textfield from 'components/controls/Textfield';


export default class CustomObjectives extends Component {
	style = style;
	styles = [popupStyle, navStyle];

	render() {
		const { isRecurrent, isCustom, predictedValues, customYearsValues, recurrentType, customYear, updateCustomValue } = this.props;
		if (!isRecurrent || !isCustom) return null;

		return (
			<div style={{display: 'flex', flexDirection: 'column', zIndex: 1, paddingTop: 20}}>
				{
					customYearsValues[recurrentType].map((field, index) => field.year !== customYear ? null :
						<div className={this.classes.cell} key={field.label}>
							<Label style={{width: '70px', marginTop: '12px'}}>{field.label}</Label>
							<Textfield
								value={field.value}
								onChange={e => updateCustomValue(e.target.value, index)}
								style={{width: '98px'}}
							/>
							{
								predictedValues[index] &&
								<div className={this.classes.text} style={{marginLeft: 10}}>
									Expected Target: {predictedValues[index]}
								</div>
							}
						</div>
					)
				}
			</div>

		)
	}
}