var instance_skel = require('../../instance_skel');
var Blink1 = require('node-blink1');
var debug;
var log;

function instance(system, id, config) {
	var self = this;

	// super-constructor
	instance_skel.apply(this, arguments);

	self.actions(); // export actions

	return self;
}

instance.prototype.init = function() {
	var self = this;
	self.CHOICES_SERIALS = [];
	try {
		var devices = Blink1.devices();
		for (var n in devices) {
			var serial = devices[n];
			console.log('serial', serial);
			self.CHOICES_SERIALS.push({ label: serial, id: serial });
		}
		if (self.config.serial) {
			self.blink1 = new Blink1(self.config.serial);
		}
	} catch(err) {
		console.log(err)
	}

	self.status(self.STATE_OK);

	debug = self.debug;
	log = self.log;
};

// Return config fields for web config
instance.prototype.config_fields = function () {

	var self = this;
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
			regex: self.REGEX_IP
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
			choices: self.CHOICES_SERIALS
		}
	]
};

instance.prototype.updateConfig = function (config) {
	var self = this;
	self.config = config;
	var devices = Blink1.devices();
	self.CHOICES_SERIALS = [];
	for (var n in devices) {
		var serial = devices[n];
		console.log('serial', serial);
		self.CHOICES_SERIALS.push({ label: serial, id: serial });
	}
	if (self.config.serial) {
		self.blink1 = new Blink1(self.config.serial);
		debug('serial after config update', self.config.serial);
	}
};

// When module gets deleted
instance.prototype.destroy = function() {
	var self = this;
	debug("destroy");
};
// for later use
instance.prototype.CHOICES_COLORS = [
	{ label: 'red', id: 'FF0000' },
	{ label: 'green', id: '00FF00' },
	{ label: 'white', id: 'FFFFFF' },
	{ label: 'blue', id: '0000FF' }
];

instance.prototype.actions = function(system) {
	var self = this;

	var actions = {
		'loc_color': {
			label: 'Set color to local connected Blink1',
			options: [
				{
				 type: 'textinput',
				 label: 'Red value 0-255',
				 id: 'color_red',
				 default: 255,
				 regex: '/([0-9]|[1-8][0-9]|9[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])/'
			 },
			 {
				type: 'textinput',
				label: 'Green value 0-255',
				id: 'color_green',
				default: 0,
				regex: '/([0-9]|[1-8][0-9]|9[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])/'
				},
				{
				 type: 'textinput',
				 label: 'Red value 0-255',
				 id: 'color_blue',
				 default: 0,
				 regex: '/([0-9]|[1-8][0-9]|9[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])/'
				}
			]
		},
		'loc_stop': {
			label: 'Switch off local connected Blink1',
		},
		'color': {
			label: 'Set color for remote Blink1',
			options: [
				{
					 type: 'textinput',
					 label: 'Fixed color in HEX',
					 id: 'color',
					 default: 'FF0000'
				}
			]
		},
		'pattern': {
			label: 'Set pattern for remote Blink1',
			options: [
				{
					 type: 'textinput',
					 label: 'Pattern name',
					 id: 'pattern',
					 default: 'redflash'
				}
			]
		},
		'custom': {
			label: 'Custom command for remote Blink1',
			options: [
				{
					 type: 'textinput',
					 label: 'http:/host:port/blink1/yourcommand',
					 id: 'custom'
				}
			]
		}
	};
	self.setActions(actions);
}

instance.prototype.action = function(action) {
	var self = this;
	var cmd;
	var blinkServer = `http://${self.config.host}:${self.config.port}/blink1/`;

	switch (action.action) {

		case 'color':
			cmd = `fadeToRGB?rgb=%23${action.options.color}&time=0.5`;
			debug('Command', blinkServer + cmd );
			self.system.emit('rest_get', blinkServer + cmd, function (err, result) {

				if (err !== null) {
					self.log('error', 'HTTP GET Request failed (' + result.error.code + ')');
					self.status(self.STATUS_ERROR, result.error.code);
				}
				else {
					self.status(self.STATUS_OK);
				}
			});
			break
		case 'pattern':
			cmd = 'pattern/play?pname='+ action.options.pattern;
			debug('Command', blinkServer + cmd );
			self.system.emit('rest_get', blinkServer + cmd, function (err, result) {
				if (err !== null) {
					self.log('error', 'HTTP GET Request failed (' + result.error.code + ')');
					self.status(self.STATUS_ERROR, result.error.code);
				}
				else {
					self.status(self.STATUS_OK);
				}
			});
			break
		case 'custom':
			cmd = action.options.custom;
			debug('Command', blinkServer + cmd );
			self.system.emit('rest_get', blinkServer + cmd, function (err, result) {
				if (err !== null) {
					self.log('error', 'HTTP GET Request failed (' + result.error.code + ')');
					self.status(self.STATUS_ERROR, result.error.code);
				}
				else {
					self.status(self.STATUS_OK);
				}
			});
			break
		case 'loc_color':
			debug('set local color', action.options.color);
			try {
				self.blink1.fadeToRGB(100, parseInt(action.options.color_red), parseInt(action.options.color_green), parseInt(action.options.color_blue));
			} catch(err) {
				log('error','Did you insert the right Blink1?')
			}
			break
		case 'loc_stop':
			debug('stop Blink1');
			try {
				self.blink1.off();
			} catch(err) {
				log('error','Did you insert the right Blink1?')
			}
			break
	}
};

instance_skel.extendedBy(instance);
exports = module.exports = instance;
