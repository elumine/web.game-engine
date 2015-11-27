#-------------------------------------------------------
# defines io
#-------------------------------------------------------
class IO
	
	constructor: (@_) ->
		@sockets = {}

		@server = _socket @_.http.server
		
		@server.on 'connection', (socket) =>
			@sockets[socket.client.id] = socket
			console.log 'io.connection', socket.client.id

			socket.on 'disconnect', =>
				delete @sockets[socket.client.id]				
				console.log 'io.disconnection', socket.client.id