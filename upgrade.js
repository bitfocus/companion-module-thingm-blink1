export const upgradeScripts = [
	function combineLocalAndRemote(context, props) {
		const result = {
			updatedConfig: null,
			updatedActions: [],
			updatedFeedbacks: [],
		}

		for (const action of props.actions) {
			switch (action.actionId) {
				case 'loc_color':
					action.actionId = 'color2'
					result.updatedActions.push(action)
					break
				case 'color':
					try {
						action.options.color = parseInt(action.options.color, 16)
						action.actionId = 'color2'
						result.updatedActions.push(action)
					} catch (e) {
						// Ignore this action, as we cant fix it
					}
					break
				case 'loc_stop':
					action.actionId = 'off'
					result.updatedActions.push(action)
					break
			}
		}

		return result
	},
]
