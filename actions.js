exports.getActions = function () {

	let actions = {}

	// actions['loc_color'] = {
	// 	label: 'Set color to local connected Blink1',
	// 	options: [
	// 		{
	// 		 type: 'textinput',
	// 		 label: 'Red value 0-255',
	// 		 id: 'color_red',
	// 		 default: 255,
	// 		 regex: '/([0-9]|[1-8][0-9]|9[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])/'
	// 	 },
	// 	 {
	// 		type: 'textinput',
	// 		label: 'Green value 0-255',
	// 		id: 'color_green',
	// 		default: 0,
	// 		regex: '/([0-9]|[1-8][0-9]|9[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])/'
	// 		},
	// 		{
	// 		 type: 'textinput',
	// 		 label: 'Red value 0-255',
	// 		 id: 'color_blue',
	// 		 default: 0,
	// 		 regex: '/([0-9]|[1-8][0-9]|9[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])/'
	// 		}
	// 	]
	// }
	actions['loc_color'] = {
		label: 'Set color to local connected Blink1',
		options: [
			// {
			// 	type: 'number',
			// 	id: 'intensity',
			// 	label: 'intensity',
			// 	min: 0,
			// 	max: 100,
			// 	default: 80
			// },
			{
				type: 'colorpicker',
				id: 'color',
				label: 'Select color',
				default: rgb(255,0,0)
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
