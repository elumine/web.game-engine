class CMD
	constructor: (@_) ->
		@_.io.server.on 'connection', (socket) =>
			socket.on 'cmd.message', (packet) =>
				@execute packet



	execute: (packet) ->
			
		switch packet.k
		 	when 'togglePhysic'
		 		console.log 'togglePhysic'