import { InstanceBase, InstanceStatus, runEntrypoint } from '@companion-module/base'
import Blink1 from 'node-blink1'
import { getActions } from './actions.js'
import { GetConfigFields } from './config.js'
import { upgradeScripts } from './upgrade.js'

class Blink1Instance extends InstanceBase {
	init(config) {
		this.config = config

		if (this.config.deviceType === undefined) {
			if (this.config.host) {
				this.config.deviceType = 'remote'
			} else {
				this.config.deviceType = 'local'
			}
			this.saveConfig(this.config)
		}

		this.setActionDefinitions(getActions(this))

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

		this.updateStatus(InstanceStatus.Disconnected)
	}

	reopenDevice() {
		// Close old device handle
		this.closeDevice()

		if (this.config.deviceType === 'local' && this.config.serial) {
			try {
				this.blink1 = new Blink1(this.config.serial)
				this.updateStatus(InstanceStatus.Ok)

				this.blink1.hidDevice.on('error', (err) => {
					this.log('error', `Device reported error: ${err}`)
					this.updateStatus(InstanceStatus.Disconnected)
				})
			} catch (err) {
				this.log('error', `Failed to open device: ${err}`)
				this.updateStatus(InstanceStatus.Disconnected, `Failed to open device: ${err}`)
			}
		} else if (this.config.deviceType === 'remote' && this.config.host) {
			this.updateStatus(InstanceStatus.Ok)
		} else {
			this.updateStatus(InstanceStatus.Disconnected, 'No device specified')
		}
	}

	getConfigFields() {
		return GetConfigFields()
	}

	configUpdated(config) {
		this.config = config

		this.reopenDevice()
	}

	destroy() {
		this.closeDevice()
	}
}

runEntrypoint(Blink1Instance, upgradeScripts)
