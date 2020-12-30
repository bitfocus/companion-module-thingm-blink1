exports.getActions = function () {

	const getBlinkServer = () => `http://${this.config.host}:${this.config.port}/blink1/`;

	const actions = {}

	actions['color2'] = {
		label: 'Set color to Blink1',
		options: [
			{
				type: 'colorpicker',
				id: 'color',
				label: 'Select color',
				default: this.rgb(255,0,0)
			}
		],
		callback: (action) => {
			if (this.blink1) {
				try {
					const color = this.rgbRev(action.options.color);
					this.blink1.fadeToRGB(100, color.r, color.g, color.b);
					this.status(this.STATUS_OK);
				} catch(err) {
					this.log('error', `Device returned error: ${err}`)
					this.status(this.STATUS_WARNING, `Device returned error: ${err}`);
				}
			} else if (this.config.host) {
				const colorHex = parseInt(action.options.color, 10).toString(16)
				const cmd = `${getBlinkServer}fadeToRGB?rgb=%23${colorHex}&time=0.5`;

				this.debug('Command', cmd );
				this.system.emit('rest_get', cmd, (err, result) => {
					if (err !== null) {
						this.log('error', 'HTTP GET Request failed (' + result.error.code + ')');
						this.status(this.STATUS_ERROR, result.error.code);
					}
					else {
						this.status(this.STATUS_OK);
					}
				});
			} else {
				this.log('warn', 'No device selected')
			}
		}
	}
	actions['off'] = {
		label: 'Switch off Blink1',
		callback: () => {
			this.debug('stop Blink1');
			if (this.blink1) {
				try {
					this.blink1.fadeToRGB(100, 0, 0, 0);
					this.status(this.STATUS_OK);
				} catch(err) {
					this.log('error', `Device returned error: ${err}`)
					this.status(this.STATUS_WARNING, `Device returned error: ${err}`);
				}
			} else if (this.config.host) {
				const cmd = `${getBlinkServer}fadeToRGB?rgb=%23000000&time=0.5`;

				this.debug('Command', cmd );
				this.system.emit('rest_get', cmd, (err, result) => {
					if (err !== null) {
						this.log('error', 'HTTP GET Request failed (' + result.error.code + ')');
						this.status(this.STATUS_ERROR, result.error.code);
					}
					else {
						this.status(this.STATUS_OK);
					}
				});
			} else {
				this.log('warn', 'No device selected')
			}
		}
	}

	actions['pattern'] = {
		label: 'Set pattern for Blink1 (Remote only)',
		options: [
			{
				 type: 'textinput',
				 label: 'Pattern name',
				 id: 'pattern',
				 default: 'redflash'
			}
		],
		callback: () => {
			if (this.blink1) {
				this.log('warn', 'Pattern not supported for local blink (yet)')
			} else if (this.config.host) {
				const cmd = `${getBlinkServer}pattern/play?pname=${action.options.pattern}`;

				this.debug('Command', cmd );
				this.system.emit('rest_get', cmd, (err, result) => {
					if (err !== null) {
						this.log('error', 'HTTP GET Request failed (' + result.error.code + ')');
						this.status(this.STATUS_ERROR, result.error.code);
					}
					else {
						this.status(this.STATUS_OK);
					}
				});
			} else {
				this.log('warn', 'No device selected')
			}
		}
	}

	actions['custom'] = {
		label: 'Custom command for Blink1 (Remote only)',
		options: [
			{
				 type: 'textinput',
				 label: 'http://host:port/blink1/yourcommand (Only the bit after blink1/)',
				 id: 'custom'
			}
		],
		callback: () => {
			if (this.blink1) {
				this.log('warn', 'Custom command not supported for local blink')
			} else if (this.config.host) {
				const cmd = `${getBlinkServer}${action.options.custom}`;

				this.debug('Command', cmd );
				this.system.emit('rest_get', cmd, (err, result) => {
					if (err !== null) {
						this.log('error', 'HTTP GET Request failed (' + result.error.code + ')');
						this.status(this.STATUS_ERROR, result.error.code);
					}
					else {
						this.status(this.STATUS_OK);
					}
				});
			} else {
				this.log('warn', 'No device selected')
			}
		}
	}
	return actions;
};
