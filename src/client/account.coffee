class AccountManager
	
	constructor: (@_) ->
		@activeCharacter = 'characterA'
		@account = false
		@badSymbols = [ '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '-', '+', '=', '{', '}', '[', ']', '/', '|', ',', '.', '<', '>', ':', ';', "'", '"' ]
		

		@_.io.socket.on 'AccountServer.registrationResponse', 	(packet) =>
			@registrationResponse 		packet

		@_.io.socket.on 'AccountServer.loginResponse', 			(packet) =>
			@loginResponse 				packet

		@_.io.socket.on 'AccountServer.logoutResponse', 			(packet) =>
			@logoutResponse 			packet

		@_.assets.addEventListener 'ready', =>
			@loginRequest
				name: 		'admin'
				password: 	'admin'



	registrationRequest: (options) ->
		if not options.name
			console.log 'AccountManager.registrationRequest false 0.0'

		else if not options.password
			console.log 'AccountManager.registrationRequest false 0.1'

		else
			name_flag = false
			for i in @badSymbols
				if options.name.indexOf(i) + 1
					name_flag = true

			password_flag = false
			for i in @badSymbols
				if options.password.indexOf(i) + 1
					password_flag = true			

			if name_flag
				console.log 'AccountManager.registrationRequest false 0.2'

			else if password_flag
				console.log 'AccountManager.registrationRequest false 0.3'

			else
				@_.io.socket.emit 'AccountManager.registrationRequest',
					name: options.name
					password: options.password



	registrationResponse: (packet) ->
		console.log 'AccountManager.registrationResponse', packet



	loginRequest: (options) ->
		if not options.name
			console.log 'AccountManager.loginRequest false 1.0'
		else if not options.password
			console.log 'AccountManager.loginRequest false 1.1'
		else
			@_.io.socket.emit 'AccountManager.loginRequest',
				name: options.name
				password: options.password



	loginResponse: (packet) ->
		console.log 'AccountManager.loginResponse', packet
		if packet.result
			@updateAccount packet.account
			#@_.ui.goto 'main'



	logoutRequest: ->
		@_.io.socket.emit 'AccountManager.logoutRequest'



	logoutResponse: (packet) ->
		console.log 'AccountManager.logoutResponse', packet
		if packet.result
			@updateAccount false
			#@_.ui.goto 'auth'



	updateAccount: (account) ->
		@account = account