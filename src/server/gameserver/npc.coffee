# @prepros-prepend 		ai.coffee

class library.NPC extends library.Unit
	constructor: (options) ->
		library.Unit.call @, options
		@classname.NPC = true

		@ai = new ai.Manager
			reference: @