#-------------------------------------------------------
# defines broadcast module
#-------------------------------------------------------
class Broadcast
	
	constructor: (@_) ->
		@listeners = {}


	#-------------------------------------------------------
	# add new socket to list
	#-------------------------------------------------------
	addListener: (key, socket) ->
		@listeners[key] = socket


	#-------------------------------------------------------
	# delete socket from list
	#-------------------------------------------------------
	removeListener: (key) ->
		delete @listeners[key]


	tick: ->
		#console.log getTime(), 'Broadcast.tick'.yellow

		data =
			dynamic 	: {}
			time 		: @_.game.time.serialize()

		for k, v of @_.game.world.objects.dynamic
			data.dynamic[k] = v.serialize()

		for k, socket of @listeners
			socket.emit 'GameServer.gameWorldUpdate', data