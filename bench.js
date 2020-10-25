'use strict'

const Benchmark = require('benchmark')
// The default number of samples for Benchmark seems to be low enough that it
// can generate results with significant variance (~2%) for this benchmark
// suite. This makes it sometimes a bit confusing to actually evaluate impact of
// changes on performance. Setting the minimum of samples to 500 results in
// significantly lower variance on my local setup for this tests suite, and
// gives me higher confidence in benchmark results.
Benchmark.options.minSamples = 500

const suite = Benchmark.Suite()

const FindMyWay = require('./')

const findMyWay = new FindMyWay()
findMyWay.on('GET', '/', () => true)
findMyWay.on('GET', '/user/:id', () => true)
findMyWay.on('GET', '/user/:id/static', () => true)
findMyWay.on('GET', '/customer/:name-:surname', () => true)
findMyWay.on('GET', '/at/:hour(^\\d+)h:minute(^\\d+)m', () => true)
findMyWay.on('GET', '/abc/def/ghi/lmn/opq/rst/uvz', () => true)
findMyWay.on('GET', '/', { constraints: { version: '1.2.0' } }, () => true)

console.log(findMyWay.routes)
console.log('Routes registered successfully...')

suite
  .add('lookup static route', function () {
    findMyWay.lookup({ method: 'GET', url: '/', headers: { host: 'fastify.io' } }, null)
  })
  .add('lookup dynamic route', function () {
    findMyWay.lookup({ method: 'GET', url: '/user/tomas', headers: { host: 'fastify.io' } }, null)
  })
  .add('lookup dynamic multi-parametric route', function () {
    findMyWay.lookup({ method: 'GET', url: '/customer/john-doe', headers: { host: 'fastify.io' } }, null)
  })
  .add('lookup dynamic multi-parametric route with regex', function () {
    findMyWay.lookup({ method: 'GET', url: '/at/12h00m', headers: { host: 'fastify.io' } }, null)
  })
  .add('lookup long static route', function () {
    findMyWay.lookup({ method: 'GET', url: '/abc/def/ghi/lmn/opq/rst/uvz', headers: { host: 'fastify.io' } }, null)
  })
  .add('lookup long dynamic route', function () {
    findMyWay.lookup({ method: 'GET', url: '/user/qwertyuiopasdfghjklzxcvbnm/static', headers: { host: 'fastify.io' } }, null)
  })
  .add('lookup static versioned route', function () {
    findMyWay.lookup({ method: 'GET', url: '/', headers: { 'accept-version': '1.x', host: 'fastify.io' } }, null)
  })
  .add('lookup static constrained (version & host) route', function () {
    findMyWay.lookup({ method: 'GET', url: '/', headers: { 'accept-version': '1.x', host: 'google.com' } }, null)
  })
  .add('find static route', function () {
    findMyWay.find('GET', '/', { host: 'fastify.io' })
  })
  .add('find dynamic route', function () {
    findMyWay.find('GET', '/user/tomas', { host: 'fastify.io' })
  })
  .add('find dynamic multi-parametric route', function () {
    findMyWay.find('GET', '/customer/john-doe', { host: 'fastify.io' })
  })
  .add('find dynamic multi-parametric route with regex', function () {
    findMyWay.find('GET', '/at/12h00m', { host: 'fastify.io' })
  })
  .add('find long static route', function () {
    findMyWay.find('GET', '/abc/def/ghi/lmn/opq/rst/uvz', { host: 'fastify.io' })
  })
  .add('find long dynamic route', function () {
    findMyWay.find('GET', '/user/qwertyuiopasdfghjklzxcvbnm/static', { host: 'fastify.io' })
  })
  .add('find static versioned route', function () {
    findMyWay.find('GET', '/', { version: '1.x' })
  })
  .add('find static constrained (version & host) route', function () {
    findMyWay.find('GET', '/', { version: '1.x', host: 'google.com' })
  })
  .on('cycle', function (event) {
    console.log(String(event.target))
  })
  .on('complete', function () {})
  .run()
