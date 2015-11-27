class lib.GL.InfinityLayer extends THREE.Object3D
	constructor: (@_) ->
		THREE.Object3D.call @
		@name = 'infinity'
		@offset = 10000

		geometry = new THREE.PlaneGeometry @_.assets.gamedata.world.constants.size.x + @offset * 2, @_.assets.gamedata.world.constants.size.z + @offset * 2, 1, 1
		@material = @_.assets.graphic.material.water2
		mesh = new THREE.Mesh geometry, @material
		mesh.rotation.x = -Math.PI/2
		mesh.position.set @_.assets.gamedata.world.constants.size.x/2, 1, @_.assets.gamedata.world.constants.size.z/2
		@add mesh



	tick: (options) ->
		#