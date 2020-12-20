var instance_skel = require('../../instance_skel');
var Blink1 = require('node-blink1');
var actions = require('./actions');
var debug;
var log;

class instance extends instance_skel {

	constructor(system, id, config) {
		super(system, id, config)
		this.release_time = 200; // ms to send button release
		
		Object.assign(this, {
			...actions,
		});

		this.actions()
	}

	actions(system) {
		this.setActions(this.getActions());
	}

	init() {
		debug = this.debug;
		log = this.log;

		this.CHOICES_SERIALS = [];
		try {
			var devices = Blink1.devices();
			for (var n in devices) {
				var serial = devices[n];
				console.log('serial', serial);
				this.CHOICES_SERIALS.push({ label: serial, id: serial });
			}
			if (this.config.serial) {
				this.blink1 = new Blink1(this.config.serial);
			}
		} catch(err) {
			console.log(err)
		}
		this.setupEventListeners();
		this.status(this.STATE_OK);

	};

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

		return [
			{
				type: 'text',
				id: 'info',
				width: 12,
				label: 'Information',
				value: 'This module is for the Blink(1) device from ThingM, sending a HTTP GET, You can also use it localy'
			},
			{
				type: 'textinput',
				id: 'host',
				label: 'Target IP',
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
				choices: this.CHOICES_SERIALS
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
		var devices = Blink1.devices();
		this.CHOICES_SERIALS = [];
		for (var n in devices) {
			var serial = devices[n];
			console.log('serial', serial);
			this.CHOICES_SERIALS.push({ label: serial, id: serial });
		}
		if (this.config.serial) {
			this.blink1 = new Blink1(this.config.serial);
			debug('serial after config update', this.config.serial);
		}
	};

	// When module gets deleted
	destroy() {
		debug("destroy");
	};

	tallyOnListener (label, variable, value) {
		const { enableTally, tallyOnVariable, tallyOnValue } = this.config;
		this.status(this.STATUS_OK);

		if (!enableTally || `${label}:${variable}` != tallyOnVariable) {
			return;
		}
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

	c_to_rgb(c) {
		let b = c % 256,
			g_0 = (c % 65536 - b),
			r_0 = c - g_0 - b,
			g = g_0 / 256,
			r = r_0 / 65536;

		return [r, g, b];
	}

	setupEventListeners() {
		if (this.activeTallyOnListener) {
			this.system.removeListener('variable_changed', this.activeTallyOnListener);
			delete this.activeTallyOnListener;
		}
		if (this.config.tallyOnVariable) {
				this.activeTallyOnListener = this.tallyOnListener.bind(this);
				this.system.on('variable_changed', this.activeTallyOnListener);
		}
	}

	action(action) {
		var cmd;
		var blinkServer = `http://${this.config.host}:${this.config.port}/blink1/`;
		switch (action.action) {

			case 'color':
				cmd = `fadeToRGB?rgb=%23${action.options.color}&time=0.5`;
				debug('Command', blinkServer + cmd );
				this.system.emit('rest_get', blinkServer + cmd, function (err, result) {

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
				debug('Command', blinkServer + cmd );
				this.system.emit('rest_get', blinkServer + cmd, function (err, result) {
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
				debug('Command', blinkServer + cmd );
				this.system.emit('rest_get', blinkServer + cmd, function (err, result) {
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
				debug('set local color', action.options.color);
				try {
					let color = this.c_to_rgb(action.options.color);
					this.blink1.fadeToRGB(100, parseInt(color[0]), parseInt(color[1]), parseInt(color[2]));
				} catch(err) {
					log('error','Did you insert the right Blink1?')
					this.status(this.STATUS_ERROR);
				}
				break;

			case 'tallyOn':
					try {
					this.blink1.fadeToRGB(100, 255, 0, 0);
				} catch(err) {
					log('error','Did you insert the right Blink1?')
					this.status(this.STATUS_ERROR);
				}
				break;

			case 'tallyOff':
				try {
					this.blink1.off();
				} catch(err) {
					log('error','Did you insert the right Blink1?')
					this.status(this.STATUS_ERROR);
				}
				break;

			case 'loc_stop':
				debug('stop Blink1');
				try {
					this.blink1.off();
				} catch(err) {
					log('error','Did you insert the right Blink1?')
					this.status(this.STATUS_ERROR);
				}
				break;
		}
	};

}
exports = module.exports = instance;
