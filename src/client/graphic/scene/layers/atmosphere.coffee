class lib.GL.AtmosphereLayer extends THREE.Object3D
	constructor: (@_) ->
		THREE.Object3D.call @
		@name = 'atmosphere'
		@radius = 10000
		
		geometry = new THREE.SphereGeometry @radius
		material = @_.assets.graphic.material.atmosphere
		@define 'sky', new THREE.Mesh geometry, material
		@sky.position.y = -100
		@rotation.y = 4
		@position.x = @_.assets.gamedata.world.constants.size.x/2
		@position.z = @_.assets.gamedata.world.constants.size.z/2


	define: (k, v) ->
		@[k] = v
		@add v

	tick: (options) ->
		@position.set @_.graphic.camera.position.x, @_.graphic.camera.position.y, @_.graphic.camera.position.z