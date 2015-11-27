# @prepros-prepend 		common.coffee
# @prepros-prepend 		broadcast.coffee
# @prepros-prepend 		physic.coffee
# @prepros-prepend 		world.coffee
# @prepros-prepend 		time.coffee


#-------------------------------------------------------
# defines game server class
#-------------------------------------------------------
class GameServer

	constructor: (@_) ->
		@temp 	= {}
		@loop 	= 0
		@dt 	= 20#00
		@ticks 	= 0

		@broadcast 	= new Broadcast 	@_

		@world 		= new World 		@_
		
		@time  		= new Time 			@_
		
		@physic 	= new Physic 		@_


		@_.addEventListener 'ready', =>
			console.log getTime(), 'GameServer' + '.start'.yellow

			@world.initialize()			

			@loop = setInterval =>
				@tick()
			, @dt
			

		@_.io.server.on 'connection', (socket) =>				
			socket.on 'AccountManager.registrationRequest', (packet) =>
				@registrationRequest 		socket, packet

			socket.on 'AccountManager.loginRequest', (packet) =>
				@loginRequest 				socket, packet

			socket.on 'AccountManager.logoutRequest', (packet) =>
				@logoutRequest 				socket, packet

			socket.on 'disconnect', =>
				@socketDisconnect 			socket


	tick: ->
		@world.tick { dt: @dt }
		@physic.tick()
		@broadcast.tick()



	registrationRequest: (socket, packet) ->
		characterID = @_.account.getAccountBySocketID(socket.client.id).name
		if @_.assets.gamedata.objects.characters.data[characterID]
			socket.emit 	'GameServer.registrationResponce',
				result: 	false
				error:		'error.GameServer.registrationResponce.characterExisting'
		else
			@_.assets.gamedata.objects.characters.data[characterID] = new library.Character

			@_.assets.gamedata.objects.characters.save()

			socket.emit 	'GameServer.registrationResponce',
				result: 	true




	loginRequest: (socket, packet) ->
		@broadcast.addListener socket.client.id, socket

		@world.add
			k 		: packet.name
			v 		: @_.assets.gamedata.objects.characters.data[ packet.name ]
			dynamic : true
			socket 	: socket
		
		socket.emit 	'GameServer.loginResponce',
			result: 	true



	leaveWorldRequest: (socket, packet) ->
		account = @_.AccountServer.getAccountBySocketID socket.client.id

		if not account
			socket.emit 	'GameServer.leaveWorld',
				result: 	false
				error: 		'error.GameServer.leaveWorld.undefinedAccount'
		else
			@broadcast.removeListener socket.client.id
			for k, v of  @world.objects.dynamic
				if v.name is account.name
					@world.remove v

			socket.emit 	'GameServer.leaveWorldResponse',
				result: 	true



	socketDisconnect: (socket) ->
		account = @_.account.getAccountBySocketID socket.client.id

		if account
			@broadcast.removeListener socket.client.id
			for k, v of  @world.objects.dynamic
				if v.name is account.name
					@world.remove v