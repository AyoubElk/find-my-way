'use strict'

const ConstraintsStore = require('./constraints-store')

const acceptVersionStrategy = require('./strategies/accept-version')
const acceptHostStrategy = require('./strategies/accept-host')

// const DEFAULT_STRATEGIES_NAMES = ['version', 'host']

module.exports = (customStrategies) => {
  const strategies = {
    version: new acceptVersionStrategy(),
    host: new acceptHostStrategy()
  }
  const kStrategies = Object.keys(strategies)
  // if (customStrategies) {
  //   for (let i = 0; i < customStrategies.length; i++) {
  //     const strategy = new customStrategies[i]()
  //     if (DEFAULT_STRATEGIES_NAMES.indexOf(strategy.name) !== -1) {
  //       strategies[i] = strategy
  //     } else {
  //       strategies.push(strategy)
  //     }
  //   }
  // }

  return {
    storage: function () {
      const stores = {}
      for (var i = 0; i < kStrategies.length; i++) {
        stores[kStrategies[i]] = strategies[kStrategies[i]].storage()
      }
      return ConstraintsStore(stores)
    },
    deriveConstraints: function (req, ctx) {
      const derivedConstraints = {}
      let value, hasConstraint = false
      for (var i = 0; i < kStrategies.length; i++) {
        value = strategies[kStrategies[i]].deriveConstraint(req, ctx)
        if (value) {
          hasConstraint = true
          derivedConstraints[kStrategies[i]] = value
        }
      }

      return hasConstraint ? derivedConstraints : null
    }
  }
}
