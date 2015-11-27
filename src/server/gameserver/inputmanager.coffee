#-------------------------------------------------------
# defines inputmanager class
#-------------------------------------------------------
class InputManager
	constructor: (options) ->
		{ @object, @socket } = options
		@events = {}
		@socket.on 'input', (packet) =>
			if @events[packet.event] then @events[packet.event] packet

	on: (id, fn) ->
		@events[id] = fn