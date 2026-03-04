import { Regex } from '@companion-module/base'
import Blink1 from 'node-blink1'

export function GetConfigFields() {
	const deviceSerials = Blink1.devices().map((serial) => ({ label: serial, id: serial }))

	return [
		{
			type: 'static-text',
			id: 'info',
			width: 12,
			label: 'Information',
			value: 'This module is for the Blink(1) device from ThingM, sending a HTTP GET, You can also use it localy',
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
			default: 'local',
		},
		{
			type: 'textinput',
			id: 'host',
			label: 'Remote IP',
			width: 6,
			regex: Regex.IP,
			default: '',
			isVisible: (options) => options.deviceType === 'remote',
		},
		{
			type: 'number',
			id: 'port',
			label: 'Port',
			width: 6,
			default: 8934,
			isVisible: (options) => options.deviceType === 'remote',
		},
		{
			type: 'dropdown',
			id: 'serial',
			label: 'Serial of local control',
			width: 6,
			choices: [
				{
					id: '',
					label: 'None',
				},
				...deviceSerials,
			],
			default: '',
			isVisible: (options) => options.deviceType === 'local',
		},
		{
			type: 'static-text',
			id: 'info',
			width: 12,
			label: 'Tally On (Basic)',
			value:
				'Support for Tally On is no longer possible. Instead you can set this up as a trigger, and get additional control',
		},
	]
}
