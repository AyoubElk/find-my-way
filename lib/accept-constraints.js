'use strict'

const ConstraintsStore = require('./constraints-store')

const acceptVersionStrategy = require('./strategies/accept-version')
const acceptHostStrategy = require('./strategies/accept-host')

module.exports = (customStrategies) => {
  const strategiesObject = {
    version: strategyObjectToPrototype(acceptVersionStrategy),
    host: strategyObjectToPrototype(acceptHostStrategy),
  }

  if (customStrategies) {
    var kCustomStrategies = Object.keys(customStrategies)
    var strategy
    for (var i = 0; i < kCustomStrategies.length; i++) {
      assert(typeof strategy.name === 'string' && strategy.name !== '', `strategy.name is required.`)
      assert(strategy.storage && typeof strategy.storage === 'function', `strategy.storage function is required.`)
      assert(strategy.deriveConstraint && typeof strategy.deriveConstraint === 'function', `strategy.deriveConstraint function is required.`)    
      strategy = strategyObjectToPrototype(customStrategies[kCustomStrategies[i]])
      strategy.isCustom = true
      strategiesObject[strategy.name] = strategy
    }
  }

  // Convert to array for faster processing inside deriveConstraints
  const strategies = Object.values(strategiesObject)

  return {
    storage: function () {
      const stores = {}
      for (var i = 0; i < strategies.length; i++) {
        stores[strategies[i].name] = strategies[i].storage()
      }
      return ConstraintsStore(stores)
    },
    deriveConstraints: function (req, ctx) {
      const version = req.headers['accept-version']
      const host = req.headers['host']
      const derivedConstraints = {}

      var hasConstraint = false
      if (version) {
        hasConstraint = true
        derivedConstraints.version = version
      }
      if (host) {
        hasConstraint = true
        derivedConstraints.host = host
      }
      
      if (customStrategies) {
        var value
        for (var i = 0; i < strategies.length; i++) {
          if (strategies[i].isCustom) {
            value = strategies[i].deriveConstraint(req, ctx)
            if (value) {
              hasConstraint = true
              derivedConstraints[strategies[i].name] = value
            }
          }
        }
      }

      return hasConstraint ? derivedConstraints : null
    }
  }
}

function strategyObjectToPrototype(strategy) {
  const strategyPrototype = function() {}
  strategyPrototype.prototype.name = strategy.name
  strategyPrototype.prototype.storage = strategy.storage
  strategyPrototype.prototype.deriveConstraint = strategy.deriveConstraint
  return new strategyPrototype()
}
