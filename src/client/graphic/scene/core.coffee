# @prepros-append 			layers/atmosphere.coffee
# @prepros-append 			layers/grass.coffee
# @prepros-append 			layers/infinity.coffee
# @prepros-append 			layers/objects.coffee
# @prepros-append 			layers/terrain.coffee


class lib.GL.Scene extends THREE.Scene
	constructor: (@_) ->
		Component.call @, 
			componentID		: 'Scene'
			loading:
				enabled		: true
				startTask 	: 'initialization'
				endFn 		: => 
					@fireEvent 'ready'
					@_.graphic.removeLoadingTask 'Scene'
				delay 		: 1000


		THREE.Scene.call @

		@layers 	= {}
		@sunScene 	= new THREE.Scene
		
		@_.game.world.addEventListener 'ready', =>
			@settings = @_.graphic.settings.addFolder 'scene'		
			@initialize()
		


	initialize: (options) ->
		console.log getTime(), 'scene.initialize'
		@fog = new THREE.FogExp2 0xc69d4b, 0.0015
		@settings.add( @fog, 'density', 0, 0.1 ).name('fog')
		@_.graphic.renderer.setClearColor @fog.color
		
		@define 'axisHelper' 	, new THREE.AxisHelper 			10
		@define 'ambientlight' 	, new THREE.AmbientLight 		0xffffff
		@define 'atmosphere' 	, new lib.GL.AtmosphereLayer 	@_
		@define 'infinity' 		, new lib.GL.InfinityLayer 		@_
		@define 'terrain' 		, new lib.GL.TerrainLayer 		@_
		@define 'grass' 		, new lib.GL.GrassLayer 		@_
		@define 'environment' 	, new lib.GL.ObjectsLayer 		@_, 'environment'
		@define 'static' 		, new lib.GL.ObjectsLayer 		@_, 'static'
		@define 'dynamic' 		, new lib.GL.ObjectsLayer 		@_, 'dynamic'


		@sun = 
			light 		: new THREE.DirectionalLight 0xffffff, 1
			occlusion 	: new THREE.Mesh new THREE.SphereGeometry(35, 32, 32), new THREE.MeshBasicMaterial { color: 0xFFCC33 }
		@sun.light.position.set -150, 50, 150
		@sun.occlusion.position.set -150, 50, 150
		@sun.light.intensity = 0.5
		@sun.light.castShadow = true
		@sun.light.shadowMapWidth = 1024
		@sun.light.shadowMapHeight = 1024
		@sun.light.shadowDarkness = 0.75
		#@sun.light.shadowCameraVisible = true
		@sun.light.shadowCameraNear = 1
		@sun.light.shadowCameraFar = 1000
		@sun.light.shadowCameraLeft = -50
		@sun.light.shadowCameraRight = 50
		@sun.light.shadowCameraTop = 50
		@sun.light.shadowCameraBottom = -50
		@add @sun.light
		@sunScene.add @sun.occlusion

		@removeLoadingTask 'initialization'

		

	tick: (options) ->
		for k, v of @layers
			if v.tick then v.tick options



	define: (k, v) ->
		@layers[k] = v
		@add v