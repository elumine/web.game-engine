class CMD
	constructor: (@_) ->


	execute: (k, v) ->
		@_.io.socket.emit 'cmd.message',
			k: k
			v: v