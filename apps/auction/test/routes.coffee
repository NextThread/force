
_ = require 'underscore'
sinon = require 'sinon'
rewire = require 'rewire'
Backbone = require 'backbone'
{ fabricate } = require 'antigravity'
CurrentUser = require '../../../models/current_user'
routes = rewire '../routes'

describe '/auction routes', ->
  beforeEach ->
    sinon.stub Backbone, 'sync'
    @req = params: id: 'foobar'
    @res = render: sinon.stub(), locals: sd: {}
    @next = sinon.stub()

  afterEach ->
    Backbone.sync.restore()

  it 'fetches the auction data and renders the index template', (done) ->
    routes.index @req, @res, @next

    Backbone.sync.callCount.should.equal 2

    Backbone.sync.args[0][1].url().should.containEql '/api/v1/sale/foobar'
    Backbone.sync.args[1][1].url().should.containEql '/api/v1/sale/foobar/sale_artworks'
    Backbone.sync.args[1][2].data.should.equal 'total_count=1&size=10'

    Backbone.sync.args[0][2].success fabricate 'sale', is_auction: true
    Backbone.sync.args[1][2].success {}

    _.defer =>
      # A minor note to my future self:
      # Because there is no promise being returned by the stubbed out sync
      # this article fetch falls through and we don't have to explicitly invoke the
      # success to move on with the spec. If it were wrapped in an `Q.all` that would
      # be a different story.
      _.last(Backbone.sync.args)[1].url.should.containEql '/api/articles'

      @next.called.should.be.false
      @res.render.args[0][0].should.equal 'index'
      _.keys(@res.render.args[0][1]).should.eql [
        'auction'
        'artworks'
        'saleArtworks'
        'articles'
        'user'
        'state'
        'displayBlurbs'
        'maxBlurbHeight'
      ]
      done()

  it 'fetches the auction data and nexts to the sale if it is a sale', (done) ->
    routes.index @req, @res, @next
    Backbone.sync.args[0][2].success fabricate 'sale', is_auction: false
    Backbone.sync.args[1][2].success {}
    _.defer =>
      @next.called.should.be.true
      @res.render.called.should.be.false
      done()

  describe 'with logged in user', ->
    beforeEach (done) ->
      @req = user: new CurrentUser(id: 'foobar'), params: id: 'foobar'
      routes.index @req, @res, @next
      _.defer =>
        @userReq = _.last Backbone.sync.args
        done()

    it 'fetches the bidder positions', ->
      @userReq[2].url.should.containEql '/api/v1/me/bidders'
      @userReq[2].data.sale_id.should.equal 'foobar'

    it 'sets the `registered_to_bid` attr', ->
      @userReq[2].success ['existy']
      @req.user.get('registered_to_bid').should.be.true
