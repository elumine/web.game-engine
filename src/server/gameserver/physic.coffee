class Physic

	constructor: (@_) ->
		@world   = new OIMO.World
		@world.timeStep /= 10

		###
		@terrain = new OIMO.Body
			type 	: 'box'
			pos 	: [ @_.assets.gamedata.world.data.constants.size.x/2, @_.assets.gamedata.world.data.constants.size.y/2, @_.assets.gamedata.world.data.constants.size.z/2 ]
			size 	: [ @_.assets.gamedata.world.data.constants.size.x, @_.assets.gamedata.world.data.constants.size.y, @_.assets.gamedata.world.data.constants.size.z ]
			rot 	: [ 0, 0, 0 ]
			world 	: @world
			move 	: false
		###


	addTerrain: ->
		filter = 4
		count = @_.assets.gamedata.world.data.constants.size.x/filter
		r = filter * 2

		for i in [0..count - 1] by 1
			for j in [0..count - 1] by 1
				x = i * filter
				z = j * filter
				y = @_.game.world.terrain.getHeightValue x, z
				b = new OIMO.Body
					type 	: 'sphere'
					size 	: [ r ]
					pos 	: [ x, y - r, z ]
					world 	:  @world



	createBody: (object) ->
		if object.static
			object.position.y = @_.game.world.terrain.getHeightValue(object.position.x, object.position.z) + object.scale.y/2
		else if object.dynamic
			console.log 'dynamic', @_.game.world.terrain.getHeightValue(object.position.x, object.position.z)
			object.position.y = @_.game.world.terrain.getHeightValue(object.position.x, object.position.z) + object.scale.y + object.position.y
		
		config = [ 1, 0.2, 0.4 ]

		switch object.physic.collider
			when 'box'
				body = new OIMO.Body
					type 	: 'box'
					pos 	: [ object.position.x, 	object.position.y, 	object.position.z 	]
					size 	: [ object.scale.x, 	object.scale.y, 	object.scale.z 		]
					rot 	: [ object.rotation.x, 	object.rotation.y, 	object.rotation.z 	]
					world 	: @world
					move 	: if object.dynamic then true else false
					#config 	: config
			when 'sphere'
				radius = if object.scale.x > object.scale.z then object.scale.x else object.scale.z
				body = new OIMO.Body
					type 	: 'sphere'
					pos 	: [ object.position.x, object.position.y, object.position.z ]
					size 	: [ radius ]
					rot 	: [ object.rotation.x, object.rotation.y, object.rotation.z ]
					world 	: @world
					move 	: if object.dynamic then true else false
					#config 	: config

		return body



	tick: ->
		@world.step()