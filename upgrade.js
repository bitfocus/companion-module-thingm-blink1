exports.upgradeScripts = [
	function combineLocalAndRemote(context, config, actions, feedbacks) {
		for (const action of actions) {
			switch (action.action) {
				case 'loc_color':
					action.action = 'color2'
					break
				case 'color':
					try {
						action.options.color = parseInt(action.options.color, 16)
						action.action = 'color2'
					} catch (e) {
						// Ignore this action, as we cant fix it
					}
					break
				case 'loc_stop':
					action.action = 'off'
					break
			}
		}
	},
]
