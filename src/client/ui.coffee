class UI
	
	constructor: (@_) ->
		@aspect =
			x: 2.1
			y: 1
			
		@scale()		
		$(window).bind 'resize', =>
			@scale()



	scale: ->
		dw = $(window).width()
		dh = $(window).height()
		w = dw
		h = w * (@aspect.y / @aspect.x)

		if h <= dh
			l = 0
			t = (dh - h) / 2
		else
			h = dh
			w = h * (@aspect.x / @aspect.y)
			t = 0
			l = (dw - w) / 2

		$('#wrapper').animate
			width: w + 'px'
			height: h + 'px'
			left: l + 'px'
			top: t + 'px'
		, 0

		document.body.style.fontSize = $('#wrapper').height() / 45 + 'px'