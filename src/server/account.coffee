#-------------------------------------------------------
# defines account server
#-------------------------------------------------------
class AccountServer
	
	constructor: (@_) ->
		@_.addEventListener 'ready', =>
			@badSymbols 	= [ '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '-', '+', '=', '{', '}', '[', ']', '/', '|', ',', '.', '<', '>', ':', ';', "'", '"' ]
			@accounts 		= @_.assets.accounts

			for k, v of @accounts.data
				v.status = 'offline'
			@accounts.save()

			@_.io.server.on 'connection', (socket) =>				
				socket.on 'AccountManager.registrationRequest', (packet) =>
					@registrationRequest 		socket, packet

				socket.on 'AccountManager.loginRequest', (packet) =>
					@loginRequest 				socket, packet

				socket.on 'AccountManager.logoutRequest', (packet) =>
					@logoutRequest 				socket, packet

				socket.on 'disconnect', =>
					console.log 'account.socket.disconnect', socket.client.id
					@socketDisconnect 			socket



	registrationRequest: (socket, packet) ->
		console.log 'AccountServer.registrationRequest'
		if not packet.name
			socket.emit 'AccountServer.registrationResponse',
				result: 	false
				error: 		'error.AccountServer.registration.missingAccountName'

		else if not packet.password
			socket.emit 'AccountServer.registrationResponse',
				result: 	false
				error: 		'error.AccountServer.registration.missingAccountPassword'

		else
			name_flag = false
			for i in @badSymbols
				if packet.name.indexOf(i) + 1
					name_flag = true

			password_flag = false
			for i in @badSymbols
				if packet.password.indexOf(i) + 1
					password_flag = true			

			if name_flag
				socket.emit 'AccountServer.registrationResponse',
					result: 	false
					error: 		'error.AccountServer.registration.badAccountName'

			else if password_flag
				socket.emit 'AccountServer.registrationResponse',
					result: 	false
					error: 		'error.AccountServer.registration.badAccountPassword'

			else if @accounts.data[packet.name]
				socket.emit 'AccountServer.registrationResponse',
					result: 	false
					error: 		'error.AccountServer.registration.accountExisting'
			else
				@accounts[packet.name] = new Account
					socketID: 	socket.client.id
					name: 		packet.name
					password: 	packet.password

				@accounts.save()

				socket.emit 	'AccountServer.registrationResponse',
					result: 	true



	loginRequest: (socket, packet) ->
		console.log 'AccountServer.loginRequest'
		if not packet.name
			socket.emit 'AccountServer.loginResponse',
				result: 	false
				error: 		'error.AccountServer.login.missingAccountName'

		else if not packet.password
			socket.emit 'AccountServer.loginResponse',
				result: 	false
				error: 		'error.AccountServer.login.missingAccountPassword'

		else
			account = @accounts.data[packet.name]

			if not account
				socket.emit 'AccountServer.loginResponse',
					result: 	false
					error: 		'error.AccountServer.login.badName'

			else if account.password isnt packet.password
				socket.emit 'AccountServer.loginResponse',
					result: 	false
					error: 		'error.AccountServer.login.badPassword'

			else if account.status isnt 'offline'
				socket.emit 'AccountServer.loginResponse',
					result: 	false
					error: 		'error.AccountServer.login.accountOnline'

			else if @getAccountBySocketID socket.client.id
				socket.emit 'AccountServer.loginResponse',
					result: 	false
					error: 		'error.AccountServer.login.youAreOnline'
				
			else
				account.status 		= 	'online'
				account.socketID 	= 	socket.client.id

				@accounts.save()

				socket.emit 'AccountServer.loginResponse',
					result: 	true
					account: 	account




	logoutRequest: (socket, packet) ->
		console.log 'AccountServer.logoutRequest'	
		account = @getAccountBySocketID socket.client.id

		if not account
			socket.emit 'AccountServer.logoutResponse',
					result: 	false
					error: 		'error.AccountServer.logout.undefinedAccount'
					
		else
			if account.status is 'offline'
				socket.emit 'AccountServer.logoutResponse',
					result: 	false
					error: 		'error.AccountServer.logout.accountOffline'
			 
			else
				account.status 	= 'offline'
				socket.emit 	'AccountServer.logoutResponse',
					result 		: true



	socketDisconnect: (socket) ->
		account = @getAccountBySocketID socket.client.id

		if account
			account.status = 'offline'
			@accounts.save()


	#-------------------------------------------------------
	# return account object by socket id
	#-------------------------------------------------------
	getAccountBySocketID: (socketID) ->
		for k, v of @accounts.data
			if v.socketID is socketID
				return v









#-------------------------------------------------------
# defines account class
#-------------------------------------------------------
class Account
	constructor: (options) ->
		{@socketID, @name, @password} = options
		status = 'offline'