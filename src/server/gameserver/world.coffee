#-------------------------------------------------------
# library is namespace for world objects
#-------------------------------------------------------
library = {}

# @prepros-append 		terrain.coffee
# @prepros-append		entity.coffee
# @prepros-append 		gameobject.coffee
# @prepros-append 		unit.coffee
# @prepros-append 		npc.coffee
# @prepros-append		character.coffee

#-------------------------------------------------------
# defines world class
#-------------------------------------------------------
class World
	constructor: (@_) ->
		@objects = 
			static 		: {}
			dynamic 	: {}



	initialize: ->
		@terrain = new library.Terrain @_

		@_.game.physic.addTerrain()
		
		for k, v of @_.assets.gamedata.objects.static.data
			@add
				k 			: k
				static 		: true
				v 			: v

		for k, v of @_.assets.gamedata.objects.dynamic.data
			@add
				k 			: k
				dynamic 	: true
				v 			: v



	add: (options) ->
		if options.static
			@objects.static[options.k] 		= new library[ options.v.classname ] { _: @_ , options: options }
		else if options.dynamic
			@objects.dynamic[options.k] 	= new library[ options.v.classname ] { _: @_ , options: options }



	remove: (v) ->
		@objects.dynamic[v.name].body.remove()
		delete @objects.dynamic[v.name]



	tick: (options) ->
		v.tick(options) for k, v of @objects.static
		v.tick(options) for k, v of @objects.dynamic