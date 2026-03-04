import { FixupNumericOrVariablesValueToExpressions } from "@companion-module/base"

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
					action.actionId = 'color2'
					result.updatedActions.push(action)

					try {
						// Interpret the numeric color code as a hex value
						action.options.color.value = parseInt(action.options.color.value, 16)
					} catch (e) {
						// Ignore this value, as we cant fix it
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
