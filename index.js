const defaultConfig = require('./lib/defaultConfig')
const getConfig = require('probot-config')

const renameProp = (
  oldProp,
  newProp,
  { [oldProp]: old, ...others }
) => {
  return {
    [newProp]: old,
    ...others
  }
}

module.exports = app => {
  app.log('App is loaded')

  function approvePr (context) {
    try {
      return context.github.pullRequests.createReview(renameProp('number', 'pull_number', context.issue({ event: 'APPROVE' })))
    } catch (err) {
      app.log(err)
    }
  }

  app.on(['pull_request.opened', 'pull_request_review.dismissed'], async context => {
    const config = await getConfig(context, 'auto-approve.yml', defaultConfig)

    if (!config.autoApproveDependabot && !config.autoApproveRenovatebot) {
      return
    }

    if ((config.autoApproveDependabot && config.dependabotLogin && context.payload.pull_request.user.login === config.dependabotLogin) ||
        (config.autoApproveRenovatebot && config.renovatebotLogin && context.payload.pull_request.user.login === config.renovatebotLogin)) {
      return approvePr(context)
    }
  })
}
