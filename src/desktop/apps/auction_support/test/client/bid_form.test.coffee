benv = require 'benv'
Backbone = require 'backbone'
_ = require 'underscore'
sinon = require 'sinon'
CurrentUser = require '../../../../models/current_user'
Sale = require '../../../../models/sale'
SaleArtwork = require '../../../../models/sale_artwork'
BidderPositions = require '../../../../collections/bidder_positions'
rewire = require 'rewire'
Artwork = require '../../../../models/artwork'
BidForm = rewire '../../client/bid_form'
{ resolve } = require 'path'
{ fabricate } = require '@artsy/antigravity'
DateHelpers = require '../../../../components/util/date_helpers.coffee'

describe 'BidForm', ->
  before (done) ->
    benv.setup ->
      benv.expose $: benv.require('jquery'), jQuery: benv.require('jquery')
      Backbone.$ = $
      done()

  after ->
    benv.teardown()

  beforeEach ->
    sinon.stub(Backbone, 'sync')
    sinon.stub _, 'delay', (cb) -> cb()
    @sale = new Sale fabricate 'sale'
    @saleArtwork = new SaleArtwork fabricate 'sale_artwork',
      minimum_next_bid_cents: 10000
      display_minimum_next_bid_dollars: '$100'
      highest_bid: amount_cents: 500
    @artwork = new Artwork fabricate 'artwork'
    @bidderPositions = new BidderPositions([fabricate('bidder_position', suggested_next_bid_cents: 0, display_suggested_next_bid_dollars: '$0')],
      { sale: @sale, saleArtwork: @saleArtwork })

  afterEach ->
    Backbone.sync.restore()
    _.delay.restore()

  describe '#placeBid while registered', ->
    beforeEach (done) ->
      benv.render resolve(__dirname, '../../templates/bid-form.jade'), {
        sd: {}
        sale: @sale
        monthRange: DateHelpers.getMonthRange()
        yearRange: DateHelpers.getYearRange()
        artwork: @artwork
        saleArtwork: @saleArtwork
        bidderPositions: @bidderPositions
        maxBid: 50
        accounting: formatMoney: ->
        bidIncrements: []
        isRegistered: true
        asset: (->)
      }, =>
        @view = new BidForm
          el: $('#auction-registration-page')
          model: @sale
          saleArtwork: @saleArtwork
          bidderPositions: @bidderPositions
          isRegistered: true
        done()

    it 'shows a message if you are registered (instead of the checkbox)', ->
      @view.$('.artsy-checkbox').length.should.equal 0
      @view.$('.max-bid').replaceWith('<input class="max-bid" value="$50.12">')
      @view.placeBid()
      @view.$('.error').text().should.equal "Your bid must be higher than $100"

    it 'validates the form and displays errors', ->
      @view.$('.max-bid').replaceWith('<input class="max-bid" value="$50.12">')
      @view.placeBid()
      html = @view.$el.html()
      @view.$('.error').text().should.equal "Your bid must be higher than $100"

    it 'validates the form and displays errors', ->
      @view.$('.max-bid').replaceWith('<input class="max-bid" value="$50.00">')
      @view.placeBid()
      html = @view.$el.html()
      @view.$('.error').text().should.equal "Your bid must be higher than $100"

    it 'does not show errors if the bid amount is above the min next bid', ->
      @view.$('.max-bid').replaceWith('<input class="max-bid" value="$150.12">')
      @view.placeBid()
      html = @view.$el.html()
      @view.$('.error').text().should.equal ""

    it 'handles sale ended errors', ->
      @view.showError 'description', { responseText: "{ \"error\": \"Sale Closed to Bids\"}" }
      @view.$('.error').text().should.equal "Sorry, your bid wasn't received before the auction closed."

    it 'handles live sale errors', ->
      @view.showError 'description', { responseText: "{ \"error\": \"Live Bidding has Started\"}" }
      @view.$('.error').text().should.containEql "Sorry, your bid wasn't received before live bidding started."

    it 'validates against the bidder position min', ->
      @view.bidderPositions.first().set suggested_next_bid_cents: 100000, display_suggested_next_bid_dollars: '$1,000'
      @view.$('.max-bid').replaceWith('<input class="max-bid" value="$50.00">')
      @view.placeBid()
      html = @view.$el.html()
      @view.$('.error').text().should.equal "Your bid must be higher than $1,000"

    describe 'polling', ->
      beforeEach ->
        @view.$('.max-bid').replaceWith('<input class="max-bid" value="$150.12">')
        @messageSpy = sinon.spy @view, 'showSuccessfulBidMessage'
        @view.placeBid()
        Backbone.sync.args[0][2].success fabricate('bidder_position', id: 'cat') # Bid successfully placed

      afterEach ->
        @messageSpy.restore()

      it 'polls for the bidder position', ->
        Backbone.sync.args[1][1].url().should.containEql '/api/v1/me/bidder_position/cat'
        @messageSpy.called.should.be.not.ok()

      it 'shows the bidder message when processed', (done) ->
        Backbone.sync.args[1][2].success fabricate('bidder_position', processed_at: '2015-04-20T16:20:00-05:00', active: true)
        _.defer => _.defer =>
          @messageSpy.called.should.be.ok()
          done()

      it 'shows outbid', (done) ->
        sinon.stub @view, 'showError'
        Backbone.sync.args[1][2].success fabricate('bidder_position', processed_at: '2015-04-20T16:20:00-05:00', active: false)
        _.defer => _.defer =>
          @view.showError.args[0][0].should.containEql "You've been outbid"
          done()

  describe '#placeBid while not registered', ->
    beforeEach (done) ->
      @acceptConditions = => @view.$acceptConditions.prop('checked', true)
      benv.render resolve(__dirname, '../../templates/bid-form.jade'), {
        sd: {}
        sale: @sale
        monthRange: DateHelpers.getMonthRange()
        yearRange: DateHelpers.getYearRange()
        artwork: @artwork
        saleArtwork: @saleArtwork
        bidderPositions: @bidderPositions
        maxBid: 50
        accounting: formatMoney: ->
        bidIncrements: []
        isRegistered: false
        asset: (->)
      }, =>
        @view = new BidForm
          el: $('#auction-registration-page')
          model: @sale
          saleArtwork: @saleArtwork
          bidderPositions: @bidderPositions
          isRegistered: false
        done()

    it 'requires you to accept the conditions first', ->
      @view.$('.artsy-checkbox').length.should.equal 1
      @view.$('.artsy-checkbox.error').length.should.equal 0
      @view.placeBid()
      @view.$('.artsy-checkbox.error').length.should.equal 1

    it 'validates the form and displays errors', ->
      @view.$('.max-bid').replaceWith('<input class="max-bid" value="$50.12">')
      @acceptConditions()
      @view.placeBid()
      html = @view.$el.html()
      @view.$('.error').text().should.equal "Your bid must be higher than $100"

    it 'validates the form and displays errors', ->
      @view.$('.max-bid').replaceWith('<input class="max-bid" value="$50.00">')
      @acceptConditions()
      @view.placeBid()
      html = @view.$el.html()
      @view.$('.error').text().should.equal "Your bid must be higher than $100"

    it 'does not show errors if the bid amount is above the min next bid', ->
      @view.$('.max-bid').replaceWith('<input class="max-bid" value="$150.12">')
      @acceptConditions()
      @view.placeBid()
      html = @view.$el.html()
      @view.$('.error').text().should.equal ""

    it 'validates against the bidder position min', ->
      @view.bidderPositions.first().set suggested_next_bid_cents: 100000, display_suggested_next_bid_dollars: '$1,000'
      @view.$('.max-bid').replaceWith('<input class="max-bid" value="$50.00">')
      @acceptConditions()
      @view.placeBid()
      html = @view.$el.html()
      @view.$('.error').text().should.equal "Your bid must be higher than $1,000"

    describe 'polling', ->
      beforeEach ->
        @view.$('.max-bid').replaceWith('<input class="max-bid" value="$150.12">')
        @messageSpy = sinon.spy @view, 'showSuccessfulBidMessage'
        @acceptConditions()
        @view.placeBid()
        Backbone.sync.args[0][2].success fabricate('bidder_position', id: 'cat') # Bid successfully placed

      afterEach ->
        @messageSpy.restore()

      it 'polls for the bidder position', ->
        Backbone.sync.args[1][1].url().should.containEql '/api/v1/me/bidder_position/cat'
        @messageSpy.called.should.be.not.ok()

      it 'shows the bidder message when processed', (done) ->
        Backbone.sync.args[1][2].success fabricate('bidder_position', processed_at: '2015-04-20T16:20:00-05:00', active: true)
        _.defer => _.defer =>
          @messageSpy.called.should.be.ok()
          done()

      it 'shows outbid', (done) ->
        sinon.stub @view, 'showError'
        Backbone.sync.args[1][2].success fabricate('bidder_position', processed_at: '2015-04-20T16:20:00-05:00', active: false)
        _.defer => _.defer =>
          @view.showError.args[0][0].should.containEql "You've been outbid"
          done()

