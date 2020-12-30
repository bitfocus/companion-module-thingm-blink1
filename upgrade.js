exports.upgradeScripts = [
    function combineLocalAndRemote(config, actions, release_actions, feedbacks) {
        const allActions = [...actions, ...release_actions]
        for (const action of allActions) {
            switch(action.action) {
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
    }
]