class GameManager

	constructor: (@_) ->		
		@world = new World @_
		















class World

	constructor: (@_) ->
		Component.call @, 
			componentID		: 'World'
			loading:
				enabled		: true
				startTask 	: 'initialization'
				endFn 		: =>
					@fireEvent 'ready'
				delay 		: 1000

		@objects =
			environment 	: {}
			static 			: {}
			dynamic 		: {}



		
		@_.assets.addEventListener 'ready', => 
			@_.io.socket.on 'GameServer.loginResponce', (packet) =>
				canvas = document.createElement 'canvas'
				canvas.width = @_.assets.gamedata.world.constants.size.x
				canvas.height = @_.assets.gamedata.world.constants.size.z
				@heightmap = canvas.getContext '2d'
				@heightmap.drawImage @_.assets.gamedata.terrain.heightmap, 0, 0, canvas.width, canvas.height

				canvas = document.createElement 'canvas'
				canvas.width = @_.assets.gamedata.world.constants.size.x
				canvas.height = @_.assets.gamedata.world.constants.size.z
				@grassmap = canvas.getContext '2d'
				@grassmap.drawImage @_.assets.gamedata.grass.grassmap, 0, 0, canvas.width, canvas.height

				#init static
				@objects.static[k] = new GameObject { _: @_, static: true, k: k, options: v } for k, v of @_.assets.gamedata.objects.static

				#init environment
				@objects.environment[k] = new GameObject { _: @_, environment: true, k: k, options: v } for k, v of @_.assets.gamedata.objects.environment

				@_.io.socket.on 'GameServer.gameWorldUpdate', (packet) => @gameWorldUpdate packet

				@removeLoadingTask 'initialization'



	gameWorldUpdate: (packet) ->
		#v.tick() for k, v of @objects.static

		for k, v of @objects.dynamic
			v.removeTask = true

		for k, v of packet.dynamic
			if @objects.dynamic[k]
				@objects.dynamic[k].removeTask = false
				@objects.dynamic[k].gameWorldUpdate v
			else
				@add k, v

		for k, v of @objects.dynamic
			if v.removeTask
				@remove k


	add: (k, v) ->
		@objects.dynamic[k] = new GameObject { _: @_, dynamic: true, k: k, options: v }


	remove: (k) ->
		delete @objects.dynamic[k]
		@_.graphic.scene.layers.dynamic.delete k


	getTerrainYValue: (x, z) ->
			i = Math.floor x
			j = Math.floor z
			if i >= 0 and j >= 0
				return @_.assets.gamedata.world.constants.size.y * (1/255) * billinearInterpolation
					A: @heightmap.getImageData(i,   j,   1, 1).data[0] 
					B: @heightmap.getImageData(i+1, j,   1, 1).data[0]
					C: @heightmap.getImageData(i+1, j+1, 1, 1).data[0]
					D: @heightmap.getImageData(i,   j+1, 1, 1).data[0]
					px: x - i
					py: z - j
			else
				return 0















class GameObject

	constructor: (constructor) ->
		{ @_, @static, @dynamic, @environment } = constructor

		v = constructor.options

		@name = constructor.k

		@states = {}

		@physic =
			collider 	: if v.physic and v.physic.collider then v.physic.collider else 'box'

		@graphic 		= if v.graphic then v.graphic else { model: 'default' }

		@position 		= new THREE.Vector3

		@rotation 		= new THREE.Vector3

		@scale 			= new THREE.Vector3

		@quaternion 	= new THREE.Quaternion

		@position.x 	= if v.position and v.position.x then v.position.x else 0
		@position.z 	= if v.position and v.position.z then v.position.z else 0

		@rotation.x 	= if v.rotation and v.rotation.x then v.rotation.x else 0
		@rotation.y 	= if v.rotation and v.rotation.y then v.rotation.y else 0
		@rotation.z 	= if v.rotation and v.rotation.z then v.rotation.z else 0

		@scale.x 		= if v.scale and v.scale.x then v.scale.x else 1
		@scale.y 		= if v.scale and v.scale.y then v.scale.y else 1
		@scale.z 		= if v.scale and v.scale.z then v.scale.z else 1

		if @static or @environment
			@position.y = @_.game.world.getTerrainYValue(@position.x, @position.z) + @scale.y/2

		@graphicObject 		= new GraphicObject @_, @



	gameWorldUpdate: (v) -> #must be tick
		@states = v.states
		@physic.velocity = v.physic.velocity
		
		@position.set v.position.x, v.position.y, v.position.z
		
		if v.classname.Unit
			@quaternion.set 0, 0, 0, 1
			@rotation.set 0, -v.vY * Math.PI/180, 0
		else
			@quaternion.set v.quaternion.x, v.quaternion.y, v.quaternion.z, v.quaternion.w

		@graphicObject.updateDataFromGameObject()
		


	tick: (options) ->
		@position.set options.position.x, options.position.y, options.position.z
		@position.set options.quaternion.x, options.quaternion.y, options.quaternion.z, options.quaternion.w

		@graphicObject.position.set 	@position.x, @position.y, @position.z
		@graphicObject.quaternion.set @quaternion.x, @quaternion.y, @quaternion.z, @quaternion.w
