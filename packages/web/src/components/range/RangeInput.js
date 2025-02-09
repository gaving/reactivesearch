import React, { Component } from 'react';
import types from '@appbaseio/reactivecore/lib/utils/types';
import { isEqual, getClassName } from '@appbaseio/reactivecore/lib/utils/helper';
import hoistNonReactStatics from 'hoist-non-react-statics';
import RangeSlider from './RangeSlider';
import Input from '../../styles/Input';
import Flex from '../../styles/Flex';
import Content from '../../styles/Content';
import Container from '../../styles/Container';

import { connect } from '../../utils';

class RangeInput extends Component {
	constructor(props) {
		super(props);

		const value = props.selectedValue || props.value || props.defaultValue || props.range;
		this.state = {
			start: value.start,
			end: value.end,
			isStartValid: true,
			isEndValid: true,
		};

		this.startInputRef = React.createRef();
		this.endInputRef = React.createRef();
	}

	componentDidUpdate(prevProps) {
		if (!isEqual(this.props.value, prevProps.value)) {
			this.handleSlider(this.props.value);
		}
	}

	// for SSR
	static defaultQuery = RangeSlider.defaultQuery;
	static parseValue = RangeSlider.parseValue;

	handleInputChange = (e) => {
		const { name, value } = e.target;

		if (Number.isNaN(value)) {
			// set errors for invalid inputs
			if (name === 'start') {
				this.setState({
					isStartValid: false,
				});
			} else {
				this.setState({
					isEndValid: false,
				});
			}
		} else {
			// reset error states for valid inputs
			// eslint-disable-next-line
			if (name === 'start' && !this.state.isStartValid) {
				this.setState({
					isStartValid: true,
				});
			} else if (name === 'end' && !this.state.isEndValid) {
				this.setState({
					isEndValid: true,
				});
			}
		}

		const currentValue = {
			start: this.state.start,
			end: this.state.end,
			[name]: value,
		};

		const { value: valueProp, onChange } = this.props;
		if (valueProp === undefined) {
			this.setState({
				[name]: value,
			});
		} else if (onChange) {
			onChange(currentValue);
		}
	};

	handleSliderChange = (sliderValue) => {
		const [start, end] = sliderValue || [this.props.range.start, this.props.range.end];
		const { value, onChange } = this.props;

		if (value === undefined) {
			this.handleSlider({ start, end });
		} else if (onChange) {
			onChange({ start, end });
		}
	};

	handleSlider = ({ start, end }) => {
		if (
			document.activeElement !== this.startInputRef.current
			&& document.activeElement !== this.endInputRef.current
		) {
			this.setState({
				start,
				end,
			});
		}
		if (this.props.onValueChange) {
			this.props.onValueChange({
				start,
				end,
			});
		}
	};

	render() {
		const {
			className, style, themePreset, ...rest
		} = this.props;

		const value = {
			start: this.props.onChange ? Number(this.props.value.start) : Number(this.state.start),
			end: this.props.onChange ? Number(this.props.value.end) : Number(this.state.end),
		};

		return (
			<Container style={style} className={className}>
				<RangeSlider
					{...rest}
					value={{
						start: this.state.isStartValid ? value.start : this.props.range.start,
						end: this.state.isEndValid ? value.end : this.props.range.end,
					}}
					onChange={this.handleSliderChange}
					className={getClassName(this.props.innerClass, 'slider-container') || null}
				/>
				<Flex className={getClassName(this.props.innerClass, 'input-container') || null}>
					<Flex direction="column" flex={2}>
						<Input
							name="start"
							type="number"
							onChange={this.handleInputChange}
							value={value.start}
							step={this.props.stepValue}
							alert={!this.state.isStartValid}
							className={getClassName(this.props.innerClass, 'input') || null}
							themePreset={themePreset}
							innerRef={this.startInputRef}
							aria-label={`${this.props.componentId}-start-input`}
						/>
						{!this.state.isStartValid && (
							<Content alert>Input range is invalid</Content>
						)}
					</Flex>
					<Flex justifyContent="center" alignItems="center" flex={1}>
						-
					</Flex>
					<Flex direction="column" flex={2}>
						<Input
							name="end"
							type="number"
							onChange={this.handleInputChange}
							value={value.end}
							step={this.props.stepValue}
							alert={!this.state.isEndValid}
							className={getClassName(this.props.innerClass, 'input') || null}
							themePreset={themePreset}
							aria-label={`${this.props.componentId}-end-input`}
							innerRef={this.endInputRef}
						/>
						{!this.state.isEndValid && <Content alert>Input range is invalid</Content>}
					</Flex>
				</Flex>
			</Container>
		);
	}
}

RangeInput.propTypes = {
	className: types.string,
	defaultValue: types.range,
	value: types.range,
	selectedValue: types.selectedValue,
	innerClass: types.style,
	onValueChange: types.func,
	onChange: types.func,
	range: types.range,
	stepValue: types.number,
	style: types.style,
	themePreset: types.themePreset,
	componentId: types.stringRequired,
	includeNullValues: types.bool,
};

RangeInput.defaultProps = {
	range: {
		start: 0,
		end: 10,
	},
	stepValue: 1,
	includeNullValues: false,
};

const mapStateToProps = state => ({
	themePreset: state.config.themePreset,
});

const ConnectedComponent = connect(
	mapStateToProps,
	null,
)(props => <RangeInput ref={props.myForwardedRef} {...props} />);

// eslint-disable-next-line
const ForwardRefComponent = React.forwardRef((props, ref) => (
	<ConnectedComponent {...props} myForwardedRef={ref} />
));
hoistNonReactStatics(ForwardRefComponent, RangeInput);

ForwardRefComponent.name = 'RangeInput';
export default ForwardRefComponent;
