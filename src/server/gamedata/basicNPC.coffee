#-------------------------------------------------------
# defines class
#-------------------------------------------------------
class library.BasicNPC extends library.NPC
	constructor: (options) ->
		library.NPC.call @, options
		@classname.BasicNPC = true

		@ai.add new ai.Task
			priority: 0
			data:
				k: 'v'
			tick: (world) ->
				console.log 'NPC.ai.tick'