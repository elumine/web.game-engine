class IO
	
	constructor: (@_) ->
		@ping = 
			now: 	0
			before: 0
			value: 	0

		@connection = false


		@socket = io.connect 'http://'+window.location.hostname+':3000',
			reconnection: false


		@socket.on 'connect', (event) =>
			@connection = true
			console.log 'io.connect', event


		@socket.on 'disconnect', (event) =>
			console.log 'io.disconnect', event


		@socket.on 'reconnecting', (event) =>
			console.log 'io.reconnecting', event


		@socket.on 'connect_error', (event) =>
			if @connection
				@connection = false
				console.log 'io.connect fail', event
			else
				console.log 'io.reconnecting fail', event


		@socket.on 'GameServer.gameWorldUpdate', (packet) =>
			@setping()



	setping: ->
		@ping.now = 1000 * new Date().getSeconds() + new Date().getMilliseconds()
		@ping.value =  @ping.now - @ping.before
		@ping.before = @ping.now
		$('#ping').html 'ping ' + @ping.value + 'ms'