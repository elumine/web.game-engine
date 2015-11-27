# @prepros-append 			account.coffee
# @prepros-append 			assets.coffee
# @prepros-append 			audio.coffee
# @prepros-append 			cmd.coffee
# @prepros-append 			common.coffee
# @prepros-append 			component.coffee
# @prepros-append 			game.coffee
# @prepros-append 			graphic/core.coffee
# @prepros-append 			input.coffee
# @prepros-append 			io.coffee
# @prepros-append 			settings.coffee
# @prepros-append 			threads.coffee
# @prepros-append 			ui.coffee

lib = {}

class GameEngine

	constructor: (options) ->

		@settings 		= 		new 	Settings 			@

		@manager 		= 		new 	ThreadManager		{ threads: 4 }

		@io 			=		new 	IO					@

		@assets 		=		new 	AssetsManager 		@

		@graphic		=		new 	GraphicEngine		@

		#@audio 			= 		new 	AudioEngine			@

		@ui 			=		new 	UI					@

		@input			=		new 	InputManager		@

		@account 		= 		new 	AccountManager 		@

		@game 			=		new 	GameManager			@

		@cmd 			= 		new 	CMD 				@