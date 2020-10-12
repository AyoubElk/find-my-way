'use strict'

const SemVerStore = require('semver-store')

module.exports = {
  name: 'version',
  storage: SemVerStore,
  deriveConstraint: function (req, ctx) {
    return req.headers['accept-version']
  }
}
