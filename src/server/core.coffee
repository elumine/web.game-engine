THREE					= 		require './libs/three.server.js'
OIMO 					= 		require './libs/oimo.server.js'
_color 					= 		require 'colors'
_socket					= 		require 'socket.io'
_png					= 		require 'pngjs'
_compression 			= 		require 'compression'
_express 				= 		require 'express'
_events 				= 		require 'events'
_fs 					= 		require 'fs'
_http 					= 		require 'http'
_path 					= 		require 'path'
_util 					= 		require 'util'
_log 					= 		require('eyes').inspector( styles: { other: 'cyan', key: 'grey', special: 'blue', number: 'red', string: 'green', bool: 'magenta', label: 'grey', pretty: true } )

# @prepros-prepend 			common.coffee
# @prepros-prepend 			component.coffee
# @prepros-prepend 			account.coffee
# @prepros-prepend 			assets.coffee
# @prepros-prepend 			cmd.coffee
# @prepros-prepend 			http.coffee
# @prepros-prepend 			io.coffee
# @prepros-prepend 			gameserver/core.coffee
# @prepros-prepend			gamedata/include.coffee

###
-------------------------------------------------------
	defines basic system class
-------------------------------------------------------
###

class System extends Component
	
	constructor: (options) ->
		Component.call @, 
			componentID		: 'System'
			loading:
				enabled		: true
				startTask 	: 'initialization'
				endFn		: => @fireEvent 'ready'

		@config 			= 		JSON.parse _fs.readFileSync _path.join __dirname, 'config.json'

		@http				= 		new 	HTTPServer 		@

		@io					= 		new 	IO 				@

		@cmd 				= 		new 	CMD 			@

		@assets				= 		new 	AssetsManager	@

		@account			= 		new 	AccountServer 	@

		@game				= 		new 	GameServer 		@

		@removeLoadingTask 'initialization'



system = new System