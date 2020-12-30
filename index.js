const instance_skel = require('../../instance_skel');
const Blink1 = require('node-blink1');
const actions = require('./actions');
const { upgradeScripts } = require('./upgrade')

class instance extends instance_skel {

	constructor(system, id, config) {
		super(system, id, config)

		this.release_time = 200; // ms to send button release

		if (this.config.deviceType === undefined) {
			if (this.config.host) {
				this.config.deviceType = 'remote'
			} else {
				this.config.deviceType = 'local'
			}
			this.saveConfig()
		}
		
		Object.assign(this, {
			...actions,
		});

		// Hack to force upgrade scripts to run again
		this.config._configIdx = -1

		for (const script of upgradeScripts) {
			this.addUpgradeScript(script)
		}

		this.setActions(this.getActions())

		this.tallyOnListener = this.tallyOnListener.bind(this)
	}

	init() {
		this.system.on('variable_changed', this.tallyOnListener);

		this.reopenDevice()
	}

	closeDevice() {
		if (this.blink1) {
			try {
				this.blink1.close()
			} catch (e) {
				console.log(e)
			}
			delete this.blink1
		}
	}

	reopenDevice() {
		// Close old device handle
		this.closeDevice()

		if (this.config.serial) {
			try {
				this.blink1 = new Blink1(this.config.serial);
				this.status(this.STATUS_OK)

				this.blink1.hidDevice.on('error', (err) => {
					this.log('error', `Device reported error: ${err}`)
					this.status(this.STATUS_WARNING, `Device reported error: ${err}`)
				})
			} catch (err) {
				this.log('error', `Failed to open device: ${err}`)
				this.status(this.STATUS_ERROR, `Failed to open device: ${err}`)
			}
		} else {
			this.status(this.STATUS_OK)
		}
	}

	// Return config fields for web config
	config_fields () {
		const dynamicVariableChoices = [];
		this.system.emit('variable_get_definitions', (definitions) =>
			Object.entries(definitions).forEach(([instanceLabel, variables]) =>
				variables.forEach((variable) =>
					dynamicVariableChoices.push({
						id: `${instanceLabel}:${variable.name}`,
						label: `${instanceLabel}:${variable.name}`
					})
				)
			)
		);

		const deviceSerials = Blink1.devices().map(serial => ({ label: serial, id: serial }));

		return [
			{
				type: 'text',
				id: 'info',
				width: 12,
				label: 'Information',
				value: 'This module is for the Blink(1) device from ThingM, sending a HTTP GET, You can also use it localy'
			},
			{
				type: 'dropdown',
				id: 'deviceType',
				label: 'Device Type',
				width: 12,
				tooltip: 'Whether the Blink(1) is connected locally, or is remote',
				choices: [
					{ id: 'local', label: 'Local' },
					{ id: 'remote', label: 'Remote' },
				],
				default: 'local'
			},
			{
				type: 'textinput',
				id: 'host',
				label: 'Remote IP',
				width: 6,
				regex: this.REGEX_IP
			},
			{
				type: 'textinput',
				id: 'port',
				label: 'port number',
				width: 6,
				default: '8934'
			},
			{
				type: 'dropdown',
				id: 'serial',
				label: 'Serial of local control',
				width: 6,
				choices: deviceSerials
			},
			{
				type: 'text',
				id: 'tallyOnInfo',
				width: 12,
				label: 'Tally On (Basic)',
				value: 'Set tally ON when the variable from an other instance equals the value'
			},
			{
				type: 'checkbox',
				id: 'enableTally',
				width: 2,
				label: 'Enable light on for tally',
				default: false
			},
			{
				type: 'dropdown',
				id: 'tallyOnVariable',
				label: 'Tally On Variable',
				width: 5,
				tooltip: 'The instance label and variable name',
				choices: dynamicVariableChoices,
				minChoicesForSearch: 5
			},
			{
				type: 'textinput',
				id: 'tallyOnValue',
				label: 'Tally On Value (also dynamic!, Only local connected)',
				width: 5,
				tooltip: 'When the variable equals this value, the camera tally light will be turned on.  Also supports dynamic variable references.  For example, $(atem:aux1)'
			}
		]
	};

	updateConfig (config) {
		this.config = config;

		this.reopenDevice()
	};

	// When module gets deleted
	destroy() {
		this.debug("destroy");

		this.system.removeListener('variable_changed', this.tallyOnListener);

		this.closeDevice()
	};

	tallyOnListener (label, variable, value) {
		const { enableTally, tallyOnVariable, tallyOnValue } = this.config;
		if (!enableTally || `${label}:${variable}` != tallyOnVariable) {
			// Not the variable we care about
			return;
		}
		this.status(this.STATUS_OK);


		this.setVariable('tallySource', value);
		this.system.emit('variable_parse', tallyOnValue, (parsedValue) => {
			if (value == parsedValue) {
				this.setVariable('tallyOn', 'On')
				// internal action
				this.system.emit('action_run', {
					action: ('tallyOn'),
					instance: this.id
				});
			} else {
				setTimeout(() => {
					this.setVariable('tallyOn', 'Off')
					// internal action
					this.system.emit('action_run', {
						action: ('tallyOff'),
						instance: this.id
					});
				}, this.release_time);
			}
		});

	}

	action(action) {
		var cmd;
		var blinkServer = `http://${this.config.host}:${this.config.port}/blink1/`;
		switch (action.action) {

			case 'color':
				cmd = `fadeToRGB?rgb=%23${action.options.color}&time=0.5`;
				this.debug('Command', blinkServer + cmd );
				this.system.emit('rest_get', blinkServer + cmd, (err, result) => {

					if (err !== null) {
						this.log('error', 'HTTP GET Request failed (' + result.error.code + ')');
						this.status(this.STATUS_ERROR, result.error.code);
					}
					else {
						this.status(this.STATUS_OK);
					}
				});
				break;

			case 'pattern':
				cmd = 'pattern/play?pname='+ action.options.pattern;
				this.debug('Command', blinkServer + cmd );
				this.system.emit('rest_get', blinkServer + cmd, (err, result) => {
					if (err !== null) {
						this.log('error', 'HTTP GET Request failed (' + result.error.code + ')');
						this.status(this.STATUS_ERROR, result.error.code);
					}
					else {
						this.status(this.STATUS_OK);
					}
				});
				break;

			case 'custom':
				cmd = action.options.custom;
				this.debug('Command', blinkServer + cmd );
				this.system.emit('rest_get', blinkServer + cmd, (err, result) => {
					if (err !== null) {
						this.log('error', 'HTTP GET Request failed (' + result.error.code + ')');
						this.status(this.STATUS_ERROR, result.error.code);
					}
					else {
						this.status(this.STATUS_OK);
					}
				});
				break;

			case 'loc_color':
				this.debug('set local color', action.options.color);
				try {
					let color = this.rgbRev(action.options.color);
					this.blink1.fadeToRGB(100, color.r, color.g, color.b);
				} catch(err) {
					this.log('error','Did you insert the right Blink1?')
					this.status(this.STATUS_ERROR);
				}
				break;

			case 'tallyOn':
					try {
					this.blink1.fadeToRGB(100, 255, 0, 0);
				} catch(err) {
					this.log('error','Did you insert the right Blink1?')
					this.status(this.STATUS_ERROR);
				}
				break;

			case 'tallyOff':
				try {
					this.blink1.off();
				} catch(err) {
					this.log('error','Did you insert the right Blink1?')
					this.status(this.STATUS_ERROR);
				}
				break;

			case 'loc_stop':
				this.debug('stop Blink1');
				try {
					this.blink1.off();
				} catch(err) {
					this.log('error','Did you insert the right Blink1?')
					this.status(this.STATUS_ERROR);
				}
				break;
		}
	};

}
exports = module.exports = instance;
