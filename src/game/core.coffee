class System

	constructor: (options) ->

		@engine 	= 		new 	GameEngine 			@


client = {}

$(document).ready ->

	client = new System
