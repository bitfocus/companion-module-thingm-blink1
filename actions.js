exports.getActions = function () {

	let actions = {}

	actions['loc_color'] = {
		label: 'Set color to local connected Blink1',
		options: [
			{
				type: 'colorpicker',
				id: 'color',
				label: 'Select color',
				default: this.rgb(255,0,0)
			}
		]
	}
	actions['loc_stop'] = {
		label: 'Switch off local connected Blink1',
	}
	actions['color'] = {
		label: 'Set color for remote Blink1',
		options: [
			{
				 type: 'textinput',
				 label: 'Fixed color in HEX',
				 id: 'color',
				 default: 'FF0000'
			}
		]
	}
	actions['pattern'] = {
		label: 'Set pattern for remote Blink1',
		options: [
			{
				 type: 'textinput',
				 label: 'Pattern name',
				 id: 'pattern',
				 default: 'redflash'
			}
		]
	}
	actions['custom'] = {
		label: 'Custom command for remote Blink1',
		options: [
			{
				 type: 'textinput',
				 label: 'http:/host:port/blink1/yourcommand',
				 id: 'custom'
			}
		]
	}
	return actions;
};
