class lib.GL.TerrainLayer extends THREE.Object3D
	constructor: (@_) ->
		@_.graphic.scene.addLoadingTask 'Terrain'

		Component.call @, 
			componentID		: 'Terrain'
			loading:
				enabled		: true
				startTask 	: 'initialization'
				endFn 		: =>
					@fireEvent 'ready'
					@_.graphic.scene.removeLoadingTask 'Terrain'
				delay 		: 1000

		
		THREE.Object3D.call @
		@name = 'terrain'

		@heightmap = @_.game.world.heightmap

		@data =
			size:
				x 		: @_.assets.gamedata.world.constants.size.x
				y 		: @_.assets.gamedata.world.constants.size.y
				z 		: @_.assets.gamedata.world.constants.size.z
			flatsize 	: 32
			distance 	: [ 0 ]
			levels 		: 0

			material 	: @_.assets.graphic.material.terrain
		
		temp =
			flatsize 	: @data.flatsize
		while temp.flatsize/2 > 1
			temp.flatsize /= 2
			@data.levels++

		for i in [0..@data.levels] by 1
			@data.distance[i + 1] = @data.flatsize * (i + 1)

		@radius =
			initialization 	: 256
			update 			: 96
			visibility 		: 256

		@scale.y = @data.size.y

		@createCollider()
		@flats = {}
		for i in [0.. @data.size.z/@data.flatsize - 1] by 1
			for j in [0.. @data.size.x/@data.flatsize - 1] by 1
				@createFlat i, j

		@removeLoadingTask 'initialization'



	createCollider: ->
		geometry = new THREE.BoxGeometry 1, 1, 1
		material = new THREE.MeshBasicMaterial { wireframe: true }
		mesh = new THREE.Mesh geometry, material
		mesh.position.set @_.assets.gamedata.world.constants.size.x/2, 0.5, @_.assets.gamedata.world.constants.size.z/2
		mesh.scale.set @_.assets.gamedata.world.constants.size.x, 1, @_.assets.gamedata.world.constants.size.z
		#@add mesh

		###
		geometry = new THREE.Geometry
		v = 
			position 	: { x: @_.assets.gamedata.world.constants.size.x/2, y: @_.assets.gamedata.world.constants.size.y/2, z: @_.assets.gamedata.world.constants.size.z/2 }
			rotation 	: { x: 0, y: 0, z: 0 }
			scale 		: { x: @_.assets.gamedata.world.constants.size.x, y: @_.assets.gamedata.world.constants.size.y, z: @_.assets.gamedata.world.constants.size.z }
		
		for shape, i in @_.assets.physic.collider.terrain.shapes
			if shape.type is 'box'
				g = new THREE.BoxGeometry 1, 1, 1
			m = new THREE.Mesh g
			m.position.x = - v.scale.x/2 + shape.position[0] * v.scale.x
			m.position.y = - v.scale.y/2 + shape.position[1] * v.scale.y
			m.position.z = - v.scale.z/2 + shape.position[2] * v.scale.z
			m.scale.set 	shape.scale[0] * v.scale.x, shape.scale[1], shape.scale[2] * v.scale.z
			m.rotation.set 	shape.rotation[0] * Math.PI/180, shape.rotation[1] * Math.PI/180, shape.rotation[2] * Math.PI/180
			m.updateMatrix()
			geometry.merge m.geometry, m.matrix
		material = new THREE.MeshBasicMaterial 
			color 		: 0xff0000
			wireframe 	: true
		material.visible = false

		mesh = new THREE.Mesh geometry, material
		mesh.position.set v.position.x, 0.5, v.position.z
		mesh.rotation.set v.rotation.x, v.rotation.y, v.rotation.z
		@add mesh
		###



	createFlat: (i, j) ->
		imagedata = @heightmap.getImageData(i * @data.flatsize, j * @data.flatsize, @data.flatsize + 1, @data.flatsize + 1).data
		heightmap_units = []
		for index in [0..imagedata.length - 1] by 4
			y = Math.floor(index/(4*(@data.flatsize + 1)))
			if not heightmap_units[y] then heightmap_units[y] = []
			x = index/4 - (@data.flatsize + 1) * y
			
			if i is (@data.size.x/@data.flatsize) - 1 or j is (@data.size.z/@data.flatsize) - 1
				if y is @data.flatsize or x is @data.flatsize 
					imagedata[ index ] = imagedata[ index - 4 ]

			heightmap_units[y][x] = imagedata[index]
			

		summ = 0
		for y in [0..heightmap_units.length - 1] by 1
			for x in [0..heightmap_units[y].length - 1] by 1
				summ += heightmap_units[y][x]

		mid_value = summ/( (@data.flatsize + 1) * (@data.flatsize + 1) )
		for y in [0..heightmap_units.length - 1] by 1
			for x in [0..heightmap_units[y].length - 1] by 1
				heightmap_units[y][x] -= mid_value
		
		flat = new lib.GL.TerrainLayerFlat
			_ 			: @_
			i 			: i
			j 			: j
			mid_value 	: mid_value
			units 		: heightmap_units
			layer 		: @
		
		@define 'flat' + i + j, flat



	define: (k, v) ->
		@flats[k] = v
		@add v
		


	tick: (options) ->
		v.tick() for k, v of @flats














class lib.GL.TerrainLayerFlat extends THREE.LOD
	constructor: (options) ->			
		THREE.LOD.call @

		{ @_, @i, @j, @units, @mid_value, @layer } = options
		
		@level = 0

		@material = @layer.data.material.clone()
		@material.map 			= @_.assets.graphic.texture.terrain[ 'diffuse' + 0 + '' + 0 ]
		#@material.normalMap 	= @_.assets.graphic.texture.terrain[ 'normal'  + 0 + '' + 0 ]

		@position.x = ( @i + 0.5 ) * @layer.data.flatsize
		@position.y = @mid_value/255
		@position.z = ( @j + 0.5 ) * @layer.data.flatsize

		if @getDistanceToCamera() <= @layer.radius.initialization
			@initialization()


							
	getDistanceToCamera: ->
		p = new THREE.Vector3().copy( @position )
		p.y = p.y * @layer.scale.y
		return new THREE.Vector3( @_.graphic.camera.position.x - p.x, @_.graphic.camera.position.y - p.y, @_.graphic.camera.position.z - p.z ).length()


	initialization: ->
		level = @getLevel()
		@level = level
		@layer.addLoadingTask 'createFlat ' + @i + ' ' + @j
		@createGeometry ( { level: level } ), => @layer.removeLoadingTask 'createFlat ' + @i + ' ' + @j



	tick: ->

		if @getDistanceToCamera() < @layer.radius.update
			level = @getLevel()
			@level = level
			@checkGeometry { level: level }

		@update @_.graphic.camera
		
		
		#@setVisibility()



	setVisibility: ->
		if @getDistanceToCamera() <= @layer.radius.visibility
			if not @visible
				@visible = true
		else
			if @visible
				@visible = false



	getLevel: ->
		distance = @getDistanceToCamera()
		level = -1

		for i in [1..@layer.data.distance.length] by 1
			if distance < @layer.data.distance[i]
				level = i - 1
				break

		if level is -1 
			level = @layer.data.levels

		return level



	checkGeometry: (options) ->
		frustum = new THREE.Frustum
		frustum.setFromMatrix( new THREE.Matrix4().multiplyMatrices( @_.graphic.camera.projectionMatrix, @_.graphic.camera.matrixWorldInverse ) )
		if frustum.containsPoint @position
			if not @creating
				draw = true
				for object, i in @objects
					if object.distance is @layer.data.distance[options.level]
						draw = false
				if draw
					@createGeometry options
		else
			if @creating
				@_.manager.cancel @creating
				@creating = false



	createGeometry: (options, callback) ->
		@creating = new Task
			id 					: 'TerrainLayer.createTerrainFlatGeometry ' + @i + ' ' + @j
			worker 				: 'worker'
			data:
				task 			: 'TerrainLayer.createTerrainFlatGeometry'
				level 			: options.level
				units 			: @units
				flatsize 		: @layer.data.flatsize
			callback: (e) =>
				geometry = setGeometryVFData e.data.geometry

				if 			options.level is 0
					material = new THREE.MeshBasicMaterial { wireframe: true, color: 0xff0000 }
				else if 	options.level is 1
					material = new THREE.MeshBasicMaterial { wireframe: true, color: 0x00ff00 }
				else if 	options.level is 2
					material = new THREE.MeshBasicMaterial { wireframe: true, color: 0x0000ff }
				else if 	options.level is 3
					material = new THREE.MeshBasicMaterial { wireframe: true, color: 0xffff00 }
				else if 	options.level is 4
					material = new THREE.MeshBasicMaterial { wireframe: true, color: 0xff00ff }

				mesh = new THREE.Mesh geometry, @material
				mesh.rotation.x = -Math.PI/2
				mesh.receiveShadow = true

				@addLevel mesh, @layer.data.distance[ options.level ]

				if callback then callback e


		@_.manager.do @creating