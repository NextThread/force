_              = require 'underscore'
Backbone       = require 'backbone'
sd             = require('sharify').data
Clock          = require '../../../components/auction_clock/view.coffee'
FeedItems      = require '../../../components/feed/collections/feed_items.coffee'
FeedView       = require '../../../components/feed/client/feed.coffee'
Artists        = require '../../../collections/artists.coffee'
mediator       = require '../../../lib/mediator.coffee'
analytics      = require '../../../lib/analytics.coffee'
ForYouView     = require './for_you.coffee'
forYouTemplate = -> require('../templates/for_you_logged_in.jade') arguments...

module.exports = class Overview extends Backbone.View

  events:
    'click .container-left .large-section' : 'clickForYou'

  initialize: (options) ->
    @fair = options.fair
    @renderClock()
    if sd.CURRENT_USER?
      if analytics.abTest 'forYouAtFair'
        analytics.track.click "Viewed fair overview with ForYou module"
        @$('.for-you-container').html forYouTemplate()
        new ForYouView
          model: @model
          fair : @fair
          el   : @el
          onFetchFollowingArtists: @onFetchFollowingArtists
      else
        analytics.track.click "Viewed fair overview without ForYou module"
        @renderFollowedArtistList()

    else if @fair.get('id') == 'the-armory-show-2014'
      mediator.trigger 'open:auth', { mode: 'register', copy: "Sign up to view your VIP Preview of The Armory Show", redirectTo: location.pathname }
      mediator.on 'modal:closed', =>
        analytics.track.click "Closed Armory VIP preview popup"

  clickForYou: =>
    analytics.track.click "Clicked for-you from fair overview"
    unless sd.CURRENT_USER?
      mediator.trigger 'open:auth', { mode: 'register', copy: 'Sign up to follow artists and exhibitors', redirectTo: location.pathname }
      false

  renderClock: ->
    @clock = new Clock
      modelName: "Fair"
      model: @fair
      el: @$('.auction-clock')
    @clock.start()

  renderFollowedArtistList: ->
    url = "#{sd.ARTSY_URL}/api/v1/me/follow/artists"
    data = fair_id: @fair.get('id')
    followingArtists = new Artists()
    followingArtists.fetchUntilEnd
      url: url
      data: data
      success: =>
        @onFetchFollowingArtists followingArtists

  onFetchFollowingArtists: (followingArtists) =>
    artistNames = @formatArtists followingArtists, 2
    if artistNames
      @$('.container-left .large-section-subheading').text "Works by #{artistNames}"

  formatArtists: (followArtists, max=Infinity) ->
    return unless followArtists?.length
    artists = followArtists.map (followArtist) ->
      artist = followArtist.get('artist')
      return artist.name

    if artists?.length < 2
      "#{artists.join(', ')}"
    else if artists?.length <= max
      "#{artists[0..(artists.length - 2)].join(', ')} and #{artists[artists?.length - 1]}"
    else
      "#{artists[0..(max-1)].join(', ')} and #{artists[(max-1)..].length - 1} more"
