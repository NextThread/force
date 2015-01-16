#
# Main app file that runs setup code and starts the server process.
# This code should be kept to a minimum. Any setup code that gets large should
# be abstracted into modules under /lib.
#

require 'newrelic'

{ PORT, NODE_ENV, HEAPDUMP } = require "./config"

express = require "express"
setup = require "./lib/setup"
cache = require './lib/cache'

app = module.exports = express()
app.set 'view engine', 'jade'

# Write heapdumps to /public every 15mins so they can be downloaded
if HEAPDUMP
  heapdump = require 'heapdump'
  i = 0
  write = ->
    heapdump.writeSnapshot "#{__dirname}/public/heapdumps/#{i+=1}.heapsnapshot"
  setInterval write, 1000 * 60 * 15
  write()

# Attempt to connect to Redis. If it fails, no worries, the app will move on
# without caching.
cache.setup ->
  setup app

  # Start the server and send a message to IPC for the integration test helper
  # to hook into.
  app.listen PORT, ->
    console.log "Listening on port " + PORT
    process.send? "listening"
