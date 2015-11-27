class lib.GL.GrassLayer extends THREE.Object3D
	constructor: (@_) ->
		@_.graphic.scene.addLoadingTask 'GrassLayer'

		Component.call @, 
			componentID		: 'GrassLayer'
			loading:
				enabled		: true
				startTask 	: 'initialization'
				endFn 		: =>
					@fireEvent 'ready'
					@_.graphic.scene.removeLoadingTask 'GrassLayer'
				delay 		: 1000

		
		THREE.Object3D.call @
		@name = 'grass'

		@heightmap 		= @_.game.world.heightmap
		@grassmap 		= @_.game.world.grassmap

		@data =
			size:
				x 		: @_.assets.gamedata.world.constants.size.x
				y 		: @_.assets.gamedata.world.constants.size.y
				z 		: @_.assets.gamedata.world.constants.size.z
			flatsize 	: 16
			distance 	: [ 0 ]
			levels 		: 0
			dencity:
				size 	: 0.5
			grassheight : 1

			material 	: []
		
		temp =
			flatsize 	: @data.flatsize
		while temp.flatsize/2 > 1
			temp.flatsize /= 2
			@data.levels++

		for i in [0..@data.levels] by 1
			@data.material[i] = @_.assets.graphic.material.grass.clone()
			@data.material[i].map = @_.assets.graphic.texture.grass[ 'diffuse' + i ]

		for i in [1..@data.levels] by 1
			@data.distance[i] = @data.flatsize * i

		@radius =
			initialization 	: 48
			update 			: 48
			visibility 		: 50

		@flats = {}
		for i in [0.. @data.size.z/@data.flatsize - 1] by 1
			for j in [0.. @data.size.x/@data.flatsize - 1] by 1
				@createFlat i, j

		@removeLoadingTask 'initialization'




	createFlat: (i, j) ->
		imagedata = @grassmap.getImageData(i * @data.flatsize, j * @data.flatsize, @data.flatsize, @data.flatsize).data
		grassmap_units = []
		hasgrass = false
		for index in [0..imagedata.length - 1] by 4
			y = Math.floor(index/(4*@data.flatsize))
			if not grassmap_units[y] then grassmap_units[y] = []
			x = index/4 - @data.flatsize * y
			grassmap_units[y][x] = 0
			if imagedata[index] > 0
				if not hasgrass then hasgrass = true
				grassmap_units[y][x] = imagedata[index]

		if hasgrass
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
			
			flat = new lib.GL.GrassLayerFlat
				_ 				: @_
				i 				: i
				j 				: j
				mid_value 		: mid_value
				units:
					heightmap 	: heightmap_units
					grassmap 	: grassmap_units
				layer 			: @
			
			@define 'flat' + i + j, flat



	define: (k, v) ->
		@flats[k] = v
		@add v
		


	tick: (options) ->
		v.tick(options) for k, v of @flats
			






class lib.GL.GrassLayerFlat extends THREE.LOD
	constructor: (options) ->			
		THREE.LOD.call @

		{ @_, @i, @j, @units, @mid_value, @layer } = options
		
		@level = 0

		@position.x = ( @i + 0.5 ) * @layer.data.flatsize
		@position.y = @mid_value/255 * @layer.data.size.y
		@position.z = ( @j + 0.5 ) * @layer.data.flatsize

		if @getDistanceToCamera() <= @layer.radius.initialization
			@initialization()


							
	getDistanceToCamera: ->
		p = new THREE.Vector3().copy( @position )
		return new THREE.Vector3( @_.graphic.camera.position.x - p.x, @_.graphic.camera.position.y - p.y, @_.graphic.camera.position.z - p.z ).length()


	initialization: ->
		level = @getLevel()
		@level = level
		@layer.addLoadingTask 'createFlat ' + @i + ' ' + @j
		@createGeometry ( { level: level } ), => @layer.removeLoadingTask 'createFlat ' + @i + ' ' + @j



	tick: (options) ->

		if @getDistanceToCamera() < @layer.radius.update
			level = @getLevel()
			@level = level
			@checkGeometry { level: level }

		@update @_.graphic.camera
		
		#@setVisibility()

		###
		for v in @children
			if v.material.uniforms.time.value >= 1 
				v.material.uniforms.time.value = 0 
			else
				v.material.uniforms.time.value += options.dt/5
		###


	setVisibility: ->
		if @getDistanceToCamera() <= @layer.radius.visibility
			if not @material.visible
				@material.visible = true
		else
			if @material.visible
				@material.visible = false



	getLevel: ->
		distance = @getDistanceToCamera()
		level = -1

		for i in [1..@layer.data.distance.length] by 1
			if distance < @layer.data.distance[i]
				level = i - 1
				break

		if level is -1 
			level = @layer.data.levels - 1

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
		@creating 				= new Task
			id 					: 'GrassLayer.createGrassFlatGeometry ' + @i + ' ' + @j
			worker 				: 'worker'
			data:
				task 			: 'GrassLayer.createGrassFlatGeometry'
				level 			: options.level
				mid_value 		: @mid_value
				terrain:
					size:
						y 		: @layer.data.size.y
				units 			: @units
				flatsize 		: @layer.data.flatsize
				dencity 		: @layer.data.dencity
				grassheight 	: @layer.data.grassheight
			callback: (e) =>
				geometry = setGeometryVFData e.data.geometry
				material = @layer.data.material[ options.level ]
				mesh = new THREE.Mesh geometry, material
				#for i in [0..mesh.geometry.vertices.length - 1] by 2
				#	material.attributes.displacement.value[i] = material.attributes.displacement.value[i + 1] = Math.random()
				#mesh.rotation.x = -Math.PI/2
				mesh.receiveShadow = true

				@addLevel mesh, @layer.data.distance[ options.level ]

				if callback then callback e


		@_.manager.do @creating