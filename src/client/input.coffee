class InputManager
	
	constructor: (@_) ->
		@keys = []

		@bind = (key, event) ->
			@keys[key] = event

		@bind 		87, 	'walk.forward'
		@bind 		83, 	'walk.back'
		@bind 		32, 	'jump'
		@bind 		68, 	'rotation.left'
		@bind 		65, 	'rotation.right'
		@bind 		49, 	'hit1'
		

		#replace window to canvas
		$(window).bind 'keydown', (e) =>
			event = @keys[e.keyCode]
			if event
				@_.io.socket.emit 'input',
					event: 	event
					bool: 	true

		$(window).bind 'keyup', (e) =>
			event = @keys[e.keyCode]
			if event
				@_.io.socket.emit 'input',
					event: 	event
					bool: 	false