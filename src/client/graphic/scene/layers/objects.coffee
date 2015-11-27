class lib.GL.ObjectsLayer extends THREE.Object3D
	
	constructor: (@_, name) ->
		Component.call @, 
			componentID		: 'ObjectsLayer'
			loading:
				enabled		: true
				startTask 	: 'initialization'
				endFn 		: =>
					@fireEvent 'ready'
					@_.graphic.scene.removeLoadingTask 'ObjectsLayer'+ ' ' + name
				delay 		: 1000

		@_.graphic.scene.addLoadingTask 'ObjectsLayer'+ ' ' + name

		THREE.Object3D.call @

		@name = name
		@objects = {}
		@radius =
			load 	: 200
			show 	: 210

		@removeLoadingTask 'initialization'

		@_.game.world.addEventListener 'ready', =>
			for k, v of @_.game.world.objects[@name]
				@define k, v.graphic



	define: (k, v) ->
		@objects[k] = v
		@add v



	delete: (k) ->
		@remove @objects[k]
		delete @objects[k]



	tick: (options) ->
		options.radius = @radius
		for k, v of @objects
			v.tick options











class GraphicObject extends THREE.Object3D

	constructor: (@_, @gameObject) ->
		THREE.Object3D.call @

		@name 			= @gameObject.name

		@model 			= {}
		@physic 		= {}

		@scale.set 		@gameObject.scale.x, @gameObject.scale.y, @gameObject.scale.z

		@updateDataFromGameObject()

		@flags =
			loaded 		: false
			loading 	: false


		@layerID = if @gameObject.static then 'static' else if @gameObject.environment then 'environment' else if @gameObject.dynamic then 'dynamic'

		@_.graphic.scene.addEventListener 'ready', =>
			@_.graphic.scene.layers[ @layerID ].define 		@name, @


	updateDataFromGameObject: ->
		@position.x 	= @gameObject.position.x
		@position.y 	= @gameObject.position.y
		@position.z 	= @gameObject.position.z

		@rotation.x 	= @gameObject.rotation.x
		@rotation.y 	= @gameObject.rotation.y
		@rotation.z 	= @gameObject.rotation.z




	tick: (options) ->
		d = @getDistanceToCamera()

		if not @flags.loaded and not @flags.loading
			if d < options.radius.load then @load()
		
		if @flags.loaded
			if not 	@visible and d < options.radius.show then @visible = true
			if 		@visible and d > options.radius.show then @visible = false

		if @model.update
			@model.update @model, @gameObject



	getDistanceToCamera: ->
		return new THREE.Vector3(@_.graphic.camera.position.x - @position.x, @_.graphic.camera.position.y - @position.y, @_.graphic.camera.position.z - @position.z).length()
		


	load: ->
		@flags.loading = true
		
		@define 'model', @_.assets.graphic.model[ @gameObject.graphic.model ].clone()
		
		if @_.assets.graphic.model[ @gameObject.graphic.model ].transferData
			for k in @_.assets.graphic.model[ @gameObject.graphic.model ].transferData
				@model[k] = @_.assets.graphic.model[ @gameObject.graphic.model ][k]
		
		model = @model
		if model.geometry and model.geometry.animations
			model.animations 		= {}
			model.boneHelpers 		= []
			model.weightSchedule 	= []
			model.warpSchedule 		= []
			for animation in model.geometry.animations
				model.animations[animation.name] = model[animation.name] = new THREE.Animation model, animation
			model.idle.weight = 1
			model.idle.play 0

		@flags.loaded = true
		@flags.loading = false
	
		#@createPhysic()

		



	createPhysic: ->
		material = new THREE.MeshBasicMaterial { wireframe: true }
		
		rescale = { x: 1, y: 1, z: 1 }
		switch @gameObject.physic.collider
			when 'box'
				geometry = new THREE.BoxGeometry 1, 1, 1
			when 'sphere'
				radius = if @scale.x > @scale.z then @scale.x else @scale.z
				geometry = new THREE.SphereGeometry radius
				rescale.x = 1/@scale.x
				rescale.y = 1/@scale.y
				rescale.z = 1/@scale.z
			
		mesh = new THREE.Mesh geometry, material
		mesh.scale.set rescale.x, rescale.y, rescale.z

		@define 'physic', mesh



	
	define: (k, v) ->
		@[k] = v
		@add v