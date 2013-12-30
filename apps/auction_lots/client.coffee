ZoomView            = require '../../components/modal/zoom.coffee'
mediator            = require '../../lib/mediator.coffee'
ShareView           = require '../../components/share/view.coffee'
{ isTouchDevice }   = require '../../components/util/device.coffee'

module.exports.init = ->
  $ ->
    new ShareView el: $('.artist-share')

    $('.auction-lot-image-zoom').on 'click', (e) ->
      e.preventDefault()
      new ZoomView imgSrc: $(this).attr 'href'

    $('.auction-lot-sale-signup').on 'click', (e) ->
      e.preventDefault()
      mediator.trigger 'open:auth', { mode: 'signup' }

    if isTouchDevice()
      $('.bordered-pulldown').on 'click', -> $(this).trigger 'hover'
