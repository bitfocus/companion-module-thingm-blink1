var instance_skel = require('../../instance_skel');
var debug;
var log;

function instance(system, id, config) {
	var self = this;

	// super-constructor
	instance_skel.apply(this, arguments);

	self.actions(); // export actions

	return self;
}

instance.prototype.updateConfig = function(config) {
	var self = this;

	self.config = config;
};
instance.prototype.init = function() {
	var self = this;

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
			value: '<strong>PLEASE READ THIS!</strong> Generic modules is only for use with custom applications. If you use this module to control a device or software on the market that more than you are using, <strong>PLEASE let us know</strong> about this software, so we can make a proper module for it. If we already support this and you use this to trigger a feature our module doesnt support, please let us know. We want companion to be as easy as possible to use for anyone.'
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
		}
	]
};

instance.prototype.updateConfig = function (config) {
		var self = this;
		self.config = config;
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
		'color': {
			label: 'Set color',
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
			label: 'Set pattern',
			options: [
				{
					 type: 'textinput',
					 label: 'Pattern name',
					 id: 'pattern',
					 default: 'redflash'
				}
			]
		},
		,
		'custom': {
			label: 'Custom command',
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
	}
};

instance_skel.extendedBy(instance);
exports = module.exports = instance;
