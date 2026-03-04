import { splitRgb, combineRgb, InstanceBase, InstanceStatus } from '@companion-module/base'
import got from 'got'

function toHex(color) {
	return ('00000000' + parseInt(color, 10).toString(16)).substr(-6)
}

/**
 * Get the list of actions
 * @param {InstanceBase} self
 */
export function getActions(self) {
	const runCommand = (cmd) => {
		const url = `http://${self.config.host}:${self.config.port}/blink1/${cmd}`
		console.log('Command', url)
		got.get(url).then(
			() => {
				self.updateStatus(InstanceStatus.Ok)
			},
			(err) => {
				self.log('error', `HTTP GET Request failed (${err})`)
				self.updateStatus(InstanceStatus.Disconnected)
			}
		)
	}

	const actions = {}

	actions['color2'] = {
		name: 'Set color to Blink1',
		options: [
			{
				type: 'colorpicker',
				id: 'color',
				label: 'Select color',
				default: combineRgb(255, 0, 0),
			},
		],
		callback: (action) => {
			if (self.blink1) {
				try {
					const color = splitRgb(action.options.color)
					self.blink1.fadeToRGB(100, color.r, color.g, color.b)
				} catch (err) {
					self.log('error', `Device returned error: ${err}`)
				}
			} else if (self.config.host) {
				const colorHex = toHex(action.options.color)
				runCommand(`fadeToRGB?rgb=%23${colorHex}&time=0.5`)
			} else {
				self.log('warn', 'No device selected')
				self.updateStatus(InstanceStatus.Disconnected)
			}
		},
	}

	actions['off'] = {
		name: 'Switch off Blink1',
		options: [],
		callback: () => {
			console.log('stop Blink1')
			if (self.blink1) {
				try {
					self.blink1.off()
				} catch (err) {
					self.log('error', `Device returned error: ${err}`)
				}
			} else if (self.config.host) {
				runCommand(`off`)
			} else {
				self.log('warn', 'No device selected')
				self.updateStatus(InstanceStatus.Disconnected)
			}
		},
	}

	actions['pattern'] = {
		name: 'Set pattern for Blink1 (Remote only)',
		options: [
			{
				type: 'textinput',
				label: 'Pattern name',
				id: 'pattern',
				default: 'redflash',
			},
		],
		callback: (action) => {
			if (self.blink1) {
				self.log('warn', 'Pattern not supported for local blink (yet)')
			} else if (self.config.host) {
				runCommand(`pattern/play?pname=${action.options.pattern}`)
			} else {
				self.log('warn', 'No device selected')
				self.updateStatus(InstanceStatus.Disconnected)
			}
		},
	}

	actions['custom'] = {
		name: 'Custom command for Blink1 (Remote only)',
		options: [
			{
				type: 'textinput',
				label: 'http://host:port/blink1/yourcommand (Only the bit after blink1/)',
				id: 'custom',
			},
		],
		callback: (action) => {
			if (self.blink1) {
				self.log('warn', 'Custom command not supported for local blink')
			} else if (self.config.host) {
				runCommand(`${action.options.custom}`)
			} else {
				self.log('warn', 'No device selected')
				self.updateStatus(InstanceStatus.Disconnected)
			}
		},
	}

	return actions
}
