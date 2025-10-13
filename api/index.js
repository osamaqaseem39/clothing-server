'use strict'

// Require the compiled Nest handler after build
const handler = require('../dist/main').default || require('../dist/main')

module.exports = handler


