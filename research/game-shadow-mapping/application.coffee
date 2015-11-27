manager = {}
graphic = {}
assets = {}
$(document).ready ->
	manager = new ThreadManager
		threads: 4
	assets = new AssetsManager
	setTimeout =>
		graphic = new GraphicEngine


class GraphicEngine
	constructor: (@_) ->
		@renderer = new THREE.WebGLRenderer
			antialias: true
		@renderer.shadowMapEnabled = true
		@renderer.shadowMapType = THREE.PCFSoftShadowMap
		#@renderer.shadowMapDebug = true

		@rendererStats = new THREEx.RendererStats
		@rendererStats.domElement.style.position = 'absolute'
		@rendererStats.domElement.style.bottom = '0px'
		@rendererStats.domElement.style.left = '0px'

		@stats = new Stats
		@stats.domElement.style.position = 'absolute'
		@stats.domElement.style.top = '0px'
		@stats.domElement.style.left = '0px'
		
		@wrapper = $('#viewport')
		@wrapper.append @renderer.domElement
		@wrapper.append @stats.domElement
		@wrapper.append @rendererStats.domElement
		@clock = new THREE.Clock
		@scene = new THREE.Scene
		
		@camera = new THREE.PerspectiveCamera 75, @wrapper.width() / @wrapper.height(), 0.1, 10000000
		@camera.position.set 				0, 3, 0
		@camera.up = new THREE.Vector3 		0, 1, 0
		@camera.lookAt new THREE.Vector3 	5, 0, 5
		@camera.mode = 'float'
		@camera.float =
			fi: 90
			tetha: 60
			speed: 0.5
			moving: false
			set_x: (v) ->	@fi = 90 + 1 * v
			set_y: (v) ->	@tetha = 60 + 1 * v
		@camera.update = (object) ->
			switch @mode
				when 'float'
					dx = Math.sin(@float.tetha * Math.PI/180) * Math.cos((@float.fi) * Math.PI/180)
					dz = Math.sin(@float.tetha * Math.PI/180) * Math.sin((@float.fi) * Math.PI/180)
					dy = Math.cos(@float.tetha * Math.PI/180)
					if @float.moving
						@position.set @position.x + @float.speed * dx, @position.y + @float.speed * dy, @position.z + @float.speed * dz
					@lookAt new THREE.Vector3 @position.x + dx, @position.y + dy, @position.z + dz


		@wrapper.bind 'mousedown', (e) =>
			@camera.float.moving = true
			
		@wrapper.bind 'mouseup', (e) =>
			@camera.float.moving = false

		@mouse =
			current: 
				x: 0
				y: 0
			previous:
				x: 0
				y: 0
		@wrapper.bind 'mousemove', (e) =>
			@mouse.previous.x = @mouse.current.x
			@mouse.previous.y = @mouse.current.y
			@mouse.current.x = e.offsetX
			@mouse.current.y = e.offsetY
			dx = @mouse.current.x - @wrapper.width()/2
			dy = @mouse.current.y - @wrapper.height()/2
			
			@camera[@camera.mode].set_x 0.5 * dx
			@camera[@camera.mode].set_y 0.5 * dy

		@resize()
		window.addEventListener 'resize', =>
			@resize()


		setTimeout =>
			@initialize()
		, 1000


	resize: ->
		@camera.aspect = @wrapper.width() / @wrapper.height()
		@camera.updateProjectionMatrix()
		@renderer.setSize @wrapper.width(), @wrapper.height()



	stop: ->
		cancelAnimationFrame @interval



	initialize: (options) ->
		@scene.fog = new THREE.FogExp2 0xcce0ff, 0.005
		@renderer.setClearColor @scene.fog.color

		axisHelper = new THREE.AxisHelper 5
		@scene.add axisHelper
		gridHelper = new THREE.GridHelper 20, 1
		#@scene.add gridHelper

		@ambientlight = new THREE.AmbientLight 0xffffff
		@scene.add @ambientlight

		@sun = new THREE.Object3D
		@sun.radius = 50
		@scene.add @sun
		@sun.light = new THREE.DirectionalLight 0xffffff, 1
		@sun.light.target = @camera
		@sun.light.position.x = -50
		@sun.light.position.y = 50
		@sun.light.position.z = -50
		@sun.light.intensity = 0.5
		@sun.light.castShadow = true
		@sun.light.shadowMapWidth = 4096
		@sun.light.shadowMapHeight = 4096
		@sun.light.shadowDarkness = 0.75
		@sun.light.shadowCameraVisible = true
		@sun.light.shadowCameraNear = 1
		@sun.light.shadowCameraFar = 1000
		@sun.light.shadowCameraLeft = -@sun.radius
		@sun.light.shadowCameraRight = @sun.radius
		@sun.light.shadowCameraTop = @sun.radius
		@sun.light.shadowCameraBottom = -@sun.radius
		@sun.add @sun.light
		helper = new THREE.DirectionalLightHelper @sun.light
		@scene.add helper
		

		@define 'environmentLayer', new EnvironmentLayer

		@render()




	define: (name, object) ->
		@[name] = object
		@scene.add @[name]



	render: ->
		@camera.update()

		@environmentLayer.cloudLayer.rotation.y += 0.01
		@sun.rotation.y += 0.01
		@sun.position.x = @camera.position.x
		@sun.position.y = @camera.position.y + 50
		@sun.position.z = @camera.position.z
		
		@environmentLayer.update @camera
			
		@renderer.render @scene, @camera
		@rendererStats.update @renderer
		@stats.update()
		@interval = requestAnimationFrame @render.bind @





class EnvironmentLayer extends THREE.Object3D
	constructor: (options) ->
		THREE.Object3D.call @
		@name = 'environmentLayer'

		@define 'atmosphereLayer', new AtmosphereLayer
		@define 'cloudLayer', new CloudLayer
		@define 'infinityLayer', new InfinityLayer

		map = document.createElement 'img'
		map.src = 'heightmap.png'
		map.addEventListener 'load', =>
			canvas = document.createElement 'canvas'
			canvas.width = map.width
			canvas.height = map.height
			@heightmap = canvas.getContext '2d'
			@heightmap.drawImage map, 0, 0, canvas.width, canvas.height

			map = document.createElement 'img'
			map.src = 'grassmap.png'
			map.addEventListener 'load', =>
				canvas = document.createElement 'canvas'
				canvas.width = map.width
				canvas.height = map.height
				@grassmap = canvas.getContext '2d'
				@grassmap.drawImage map, 0, 0, canvas.width, canvas.height

				$.get 'terrain.json', (data) =>
					@define 'terrainLayer', new TerrainLayer 
						_: @
						asset: JSON.parse(data)

					$.get 'environment.json', (data) =>
						@define 'objectsLayer', new ObjectsLayer
							_: @
							asset: JSON.parse(data).objects

						@define 'grassLayer', new GrassLayer { _: @ }


				
	update: (camera) ->
		if @grassLayer then @grassLayer.update camera
		if @terrainLayer then @terrainLayer.update camera






class AtmosphereLayer extends THREE.Object3D
	constructor: (options) ->
		THREE.Object3D.call @
		@name = 'atmosphereLayer'
	
		@options = 
			radius: 1000

		geometry = new THREE.SphereGeometry @options.radius, 32, 32
		material = assets.graphic.material.atmosphere
		material.fog = false
		@sphere = new THREE.Mesh geometry, material
		@add @sphere



class CloudLayer extends THREE.Object3D
	constructor: (options) ->
		THREE.Object3D.call @
		@name = 'CloudLayer'

		@options =
			radius: 500
			position:
				y: 150
			count: 4
			scale:
				x: 400
				y: 200

		for i in [0..@options.count - 1] by 1
			wrapper = new THREE.Object3D
			wrapper.rotation.y = 2*Math.PI * ( i/@options.count )
			@add wrapper
			sprite = new THREE.Sprite assets.graphic.material.cloud1
			sprite.position.x = @options.radius
			sprite.position.y = @options.position.y
			sprite.scale.set @options.scale.x, @options.scale.y, 1
			wrapper.add sprite



class InfinityLayer extends THREE.Object3D
	constructor: (options) ->
		THREE.Object3D.call @
		@name = 'infinityLayer'
		@worldsize = 100
		@offset = 1000

		geometry = new THREE.Geometry
		geometry1 = new THREE.PlaneGeometry @worldsize + 2 * @offset, @offset, 1, 1
		geometry2 = new THREE.PlaneGeometry @offset, @worldsize, 1, 1
		mesh1 = new THREE.Mesh geometry1
		mesh1.position.x = @worldsize/2
		mesh1.position.y = 0
		mesh1.position.z = -0.5 * @offset
		mesh1.rotation.x = -Math.PI/2
		mesh1.updateMatrix()
		geometry.merge mesh1.geometry, mesh1.matrix
		mesh2 = new THREE.Mesh geometry1
		mesh2.position.x = @worldsize/2
		mesh2.position.y = 0
		mesh2.position.z = 0.5 * @offset + @worldsize
		mesh2.rotation.x = -Math.PI/2
		mesh2.updateMatrix()
		geometry.merge mesh2.geometry, mesh2.matrix
		mesh3 = new THREE.Mesh geometry2
		mesh3.position.x = -0.5 * @offset
		mesh3.position.y = 0
		mesh3.position.z = @worldsize/2
		mesh3.rotation.x = -Math.PI/2
		mesh3.updateMatrix()
		geometry.merge mesh3.geometry, mesh3.matrix
		mesh4 = new THREE.Mesh geometry2
		mesh4.position.x = 0.5 * @offset + @worldsize
		mesh4.position.y = 0
		mesh4.position.z = @worldsize/2
		mesh4.rotation.x = -Math.PI/2
		mesh4.updateMatrix()
		geometry.merge mesh4.geometry, mesh4.matrix
		material = assets.graphic.material.water2
		#material.map.repeat.set @worldsize/10, @worldsize/10
		material.normalMap.repeat.set @worldsize/10, @worldsize/10
		mesh = new THREE.Mesh geometry, material
		@add mesh
		


class ObjectsLayer extends THREE.Object3D
	constructor: (options) ->
		{ @_, @asset } = options
		THREE.Object3D.call @
		@name = 'stones'

		@groups = []

		for object, i in @asset
			@handleObject object
		for k, v of @groups
			@creteGroupGeometry v, k


	handleObject: (object, parent) ->
		if not object.position then object.position = { x:0, y:0, z:0 }
		if not object.rotation then object.rotation = { x:0, y:0, z:0 }
		if not object.scale then object.scale = { x: 0, y:0, z:0 }
		if parent
			if parent.position
				if parent.position.x then object.position.x += parent.position.x
				if parent.position.y then object.position.y += parent.position.y
				if parent.position.z then object.position.z += parent.position.z
			if parent.rotation
				if parent.rotation.x then object.rotation.x += parent.rotation.x
				if parent.rotation.y then object.rotation.y += parent.rotation.y
				if parent.rotation.z then object.rotation.z += parent.rotation.z
			if parent.scale
				if parent.scale.x then object.scale.x += parent.scale.x
				if parent.scale.y then object.scale.y += parent.scale.y
				if parent.scale.z then object.scale.z += parent.scale.z
		else
			if not object.position.y
				object.position.y = @_.terrainLayer.getHeightValue object.position.x, object.position.z
		
		if object.model
			model = assets.graphic.model[object.model]
		else
			model = object
		
		if model.type.json
			if model.geometryID
				object.geometry = assets.graphic.geometry[model.geometryID]
				if not object.geometry.task
					object.geometry = getGeometryVFData object.geometry

			if model.materialID
				if not @groups[model.materialID] then @groups[model.materialID] = []
				new_object =
					geometry: object.geometry
					position: object.position
					rotation: object.rotation
					scale: object.scale
					data: object.data					
				@groups[model.materialID].push new_object

			object.children = {}
			for k, v of model.children
				object.children[k] = JSON.parse(JSON.stringify(v))
			for k, v of object.children
				@handleObject v, object
		else
			model.position.x = object.position.x or 0
			model.position.y = object.position.y or 0
			model.position.z = object.position.z or 0
			model.rotation.x = object.rotation.x or 0
			model.rotation.y = object.rotation.y or 0
			model.rotation.z = object.rotation.z or 0
			model.scale.x = object.scale.x or 1
			model.scale.y = object.scale.y or 1
			model.scale.z = object.scale.z or 1
			#model.castShadow = true
			#model.receiveShadow = true
			@add model


	creteGroupGeometry: (group, materialID) ->
		manager.do new Task
			id: 'ObjectsLayer.creteGroupGeometry' + materialID
			worker: 'worker'
			data:
				task: 'ObjectsLayer.creteGroupGeometry'
				group: group
			callback: (e) =>
				geometry = setGeometryVFData e.data.geometry
				material = assets.graphic.material[materialID]
				mesh = new THREE.Mesh geometry, material
				mesh.castShadow = true
				mesh.receiveShadow = true
				@add mesh

	update: ->
		#





class TerrainLayer extends THREE.Object3D
	constructor: (options) ->
		{ @_, @asset } = options
		THREE.Object3D.call @
		@name = 'terrainLayer'

		@options =
			size: 1000
			flatsize: 100
		@data = {}
		@data.distance = [ 0, 150, 300, 450, 600 , 750 ]
		@data.material = assets.graphic.material.terrain

		@count = 1#@options.size/@options.flatsize
		@created = false
		@initialized = false
		@initializing = false
		@radius =
			initialization: 1000
			update: 250


		@createTexure()
		for i in [0.. @count - 1] by 1
			for j in [0.. @count - 1] by 1
				@createFlat i, j
		@created = true



	createTexure: ->
		canvas = document.createElement 'canvas'
		###
		canvas.style.position = 'absolute'
		canvas.style.left = '100px'
		canvas.style.top = '100px'
		canvas.style.zIndex = 10
		canvas.style.backgroundColor = '#000'
		$('#viewport').append canvas
		###
		canvas.width = @options.size/5
		canvas.height = @options.size/5
		@texture = canvas.getContext '2d'

		for object in @asset.objects			
			if object.type.polygon
				@drawPolygon @texture, object
			else if object.type.path
				@drawPath @texture, object



	drawPolygon: (c, object) ->
		c.beginPath()
		c.moveTo object.vertices[0].x, object.vertices[0].y
		for i in [1..object.vertices.length - 1] by 1
			c.lineTo object.vertices[i].x, object.vertices[i].y
		c.lineTo object.vertices[0].x, object.vertices[0].y
		c.closePath()
		c.fillStyle = 'rgba('+object.tileID[0]+','+object.tileID[1]+','+object.tileID[2]+', 255)'
		c.fill()



	drawPath: (c, object) ->
		c.beginPath()
		c.moveTo object.vertices[0].x, object.vertices[0].y
		for i in [1..object.vertices.length - 1] by 1
			c.lineTo object.vertices[i].x, object.vertices[i].y
		c.strokeStyle = 'rgba('+object.tileID[0]+','+object.tileID[1]+','+object.tileID[2]+', 255)'
		c.strokeWidth = 1
		c.stroke()



	createFlat: (i, j) ->
		imagedata = @_.heightmap.getImageData(i * @options.flatsize, j * @options.flatsize, @options.flatsize + 1, @options.flatsize + 1).data
		heightmap_units = []
		min_value = 1000
		max_value = 0
		for index in [0..imagedata.length - 1] by 4
			y = Math.floor(index/(4*(@options.flatsize + 1)))
			if not heightmap_units[y] then heightmap_units[y] = []
			x = index/4 - (@options.flatsize + 1) * y
			heightmap_units[y][x] = imagedata[index]
			if heightmap_units[y][x] < min_value then min_value = heightmap_units[y][x]
			if heightmap_units[y][x] > max_value then max_value = heightmap_units[y][x]
		mid_value = min_value + (max_value - min_value)/2
		for y in [0..heightmap_units.length - 1] by 1
			for x in [0..heightmap_units[y].length - 1] by 1
				heightmap_units[y][x] -= mid_value
		flat = new TerrainLayerFlat
			i: i
			j: j
			mid_value: mid_value
			units: heightmap_units
			options: @options
			data: @data
			globaltexure: @texture
		
		@add flat




	getHeightValue: (x, z) ->
		i = Math.floor x
		j = Math.floor z
		if i >= 0 and j >= 0
			return billinearInterpolation
				A: @_.heightmap.getImageData(i,   j,   1, 1).data[0] 
				B: @_.heightmap.getImageData(i+1, j,   1, 1).data[0]
				C: @_.heightmap.getImageData(i+1, j+1, 1, 1).data[0]
				D: @_.heightmap.getImageData(i,   j+1, 1, 1).data[0]
				px: x - i
				py: z - j
		else
			return 0
		


	update: (camera) ->
		if @created
			if not @initialized
				if not @initializing
					@initializing = true
					for flat in @children
						distance = new THREE.Vector3( camera.position.x - flat.position.x, camera.position.y - flat.position.y, camera.position.z - flat.position.z ).length()
						if distance <= @radius.initialization
							flat.initializing = true
							flat.checkLevel camera
							flat.createGeometry()
				else
					initialized = true
					for flat in @children
						if flat.initializing
							if not flat.initialized
								initialized = false
					if initialized
						@initializing = false
						@initialized = true
			else
				for flat in @children
					distance = new THREE.Vector3( camera.position.x - flat.position.x, camera.position.y - flat.position.y, camera.position.z - flat.position.z ).length()
					if distance <= @radius.update
						flat.checkLevel camera
						flat.checkGeometry camera




class TerrainLayerFlat extends THREE.LOD
	constructor: (options) ->			
		{ @i, @j, @options, @data, @units, @mid_value, @globaltexure } = options
		THREE.LOD.call @
		@creating = false
		@initializing = false
		@initialized = false
		@level = false
		@step = [ 1, 2, 4, 10, 20, 25 ]
		@tilesize = 10

		@material = @data.material.clone()
		@material.map = @createTexure()

		@position.x = (@i+0.5) * @options.flatsize
		@position.y = @mid_value
		@position.z = (@j+0.5) * @options.flatsize



	createTexure: ->
		canvas = document.createElement 'canvas'
		canvas.width = @options.flatsize * @tilesize
		canvas.height = @options.flatsize * @tilesize
		###
		canvas.style.position = 'absolute'
		canvas.style.left = '650px'
		canvas.style.top = '100px'
		canvas.style.zIndex = 10
		canvas.style.backgroundColor = '#000'
		###
		ctx = canvas.getContext '2d'
		imagedata = @globaltexure.getImageData(@i * @options.flatsize, @j * @options.flatsize, @options.flatsize, @options.flatsize).data
		for index in [0..imagedata.length - 1] by 4
			y = Math.floor(index/(4*@options.flatsize))
			x = index/4 - @options.flatsize * y
			r = imagedata[index]
			g = imagedata[index+1]
			b = imagedata[index+2]
			tile = assets.graphic.images[ 'terrainLayer_tile'+r+''+g+''+ b ]
			if not tile then tile = assets.graphic.images['terrainLayer_tile000']
			ctx.drawImage tile, x * @tilesize, y * @tilesize, @tilesize, @tilesize

		diffuse = new THREE.Texture canvas
		diffuse.needsUpdate = true
		return diffuse


	checkLevel: (camera) ->
		@updateMatrixWorld()
		v1 = new THREE.Vector3
		v2 = new THREE.Vector3
		v1.setFromMatrixPosition camera.matrixWorld
		v2.setFromMatrixPosition @matrixWorld
		distance = v1.distanceTo v2

		if distance < @data.distance[1]
			level = 0
		else if distance < @data.distance[2]
			level = 1
		else if distance < @data.distance[3]
			level = 2
		else if distance < @data.distance[4]
			level = 3
		else
			level = 4
		@level = level

		if @initialized
			@update camera


	checkGeometry: (camera) ->
		frustum = new THREE.Frustum
		frustum.setFromMatrix( new THREE.Matrix4().multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse ) )
		if frustum.containsPoint @position
			if not @creating
				draw = true
				for object, i in @objects
					if object.distance is @data.distance[@level]
						draw = false
				if draw
					@createGeometry()
		else
			if @creating
				manager.cancel @creating
				@creating = false



	createGeometry: ->
		@creating = new Task
			id: 'TerrainLayer.createTerrainFlatGeometry' + @i + '' + @j
			worker: 'worker'
			data:
				task: 'TerrainLayer.createTerrainFlatGeometry'
				step: @step[@level]
				units: @units
				options:
					flatsize: @options.flatsize
			callback: (e) =>
				geometry = setGeometryVFData e.data.geometry
				material = @material

				mesh = new THREE.Mesh geometry, material
				mesh.rotation.x = -Math.PI/2
				mesh.receiveShadow = true

				@addLevel mesh, @data.distance[@level]

				@creating = false
				if @initializing
					@initializing = false
					@initialized = true

		manager.do @creating



class GrassLayer extends THREE.Object3D
	constructor: (options) ->
		{ @_ } = options
		THREE.Object3D.call @
		@name = 'grassLayer'
		
		@options =
			size: 1000
			flatsize: 5
			grassheight: 1

		@data = {}
		@data.distance = [ 0, 5, 15, 25, 35, 45 ]
		@data.material =
			hight: []
			low: []
		@data.material.low[0] = assets.graphic.material.grass0_low
		@data.material.low[1] = assets.graphic.material.grass1_low
		@data.material.low[2] = assets.graphic.material.grass2_low
		@data.material.low[3] = assets.graphic.material.grass3_low
		@data.material.low[4] = assets.graphic.material.grass4_low
		@data.material.hight[0] = assets.graphic.material.grass0_hight
		@data.material.hight[1] = assets.graphic.material.grass1_hight
		@data.material.hight[2] = assets.graphic.material.grass2_hight
		@data.material.hight[3] = assets.graphic.material.grass3_hight
		@data.material.hight[4] = assets.graphic.material.grass4_hight

		@count = 2#@options.size/@options.flatsize
		@created = false
		@initializing = false
		@initialized = false
		@radius =
			initialization: 1000
			update: 250
		
		for i in [0.. @count - 1] by 1
			for j in [0.. @count - 1] by 1
				@createFlat i, j
		@created = true


	createFlat: (i, j) ->
		imagedata = @_.grassmap.getImageData(i * @options.flatsize, j * @options.flatsize, @options.flatsize, @options.flatsize).data
		grassmap_units = []
		hasgrass = false
		min_value = 1000
		max_value = 0
		for index in [0..imagedata.length - 1] by 4
			y = Math.floor(index/(4*@options.flatsize))
			if not grassmap_units[y] then grassmap_units[y] = []
			x = index/4 - @options.flatsize * y
			grassmap_units[y][x] = false
			if imagedata[index] > 0
				if not hasgrass then hasgrass = true
				grassmap_units[y][x] = imagedata[index]
			if grassmap_units[y][x] < min_value then min_value = grassmap_units[y][x]
			if grassmap_units[y][x] > max_value then max_value = grassmap_units[y][x]
		grassmap_mid_value = min_value + (max_value - min_value)/2

		if hasgrass
			imagedata = @_.heightmap.getImageData(i * @options.flatsize, j * @options.flatsize, @options.flatsize + 1, @options.flatsize + 1).data
			heightmap_units = []
			min_value = 1000
			max_value = 0
			for index in [0..imagedata.length - 1] by 4
				y = Math.floor(index/(4*(@options.flatsize + 1)))
				if not heightmap_units[y] then heightmap_units[y] = []
				x = index/4 - (@options.flatsize + 1) * y
				heightmap_units[y][x] = imagedata[index]
				if heightmap_units[y][x] < min_value then min_value = heightmap_units[y][x]
				if heightmap_units[y][x] > max_value then max_value = heightmap_units[y][x]
			heightmap_mid_value = min_value + (max_value - min_value)/2
			for y in [0..heightmap_units.length - 1] by 1
				for x in [0..heightmap_units[y].length - 1] by 1
					heightmap_units[y][x] -= heightmap_mid_value

			flat = new GrassFlat
				i: i
				j: j
				units:
					heightmap: heightmap_units
					grassmap: grassmap_units
				mid_value: 
					grassmap: grassmap_mid_value
					heightmap: heightmap_mid_value
				options: @options
				data: @data
				
			@add flat


	update: (camera) ->
		if @created
			if not @initialized
				if not @initializing
					@initializing = true
					for flat in @children
						distance = new THREE.Vector3( camera.position.x - flat.position.x, camera.position.y - flat.position.y, camera.position.z - flat.position.z ).length()
						if distance <= @radius.initialization
							flat.initializing = true
							flat.checkLevel camera
							flat.createGeometry()
				else
					initialized = true
					for flat in @children
						if flat.initializing
							if not flat.initialized
								initialized = false
					if initialized
						@initializing = false
						@initialized = true
			else
				for flat in @children
					flat.update camera
					distance = new THREE.Vector3( camera.position.x - flat.position.x, camera.position.y - flat.position.y, camera.position.z - flat.position.z ).length()
					if distance <= @radius.update
						flat.checkLevel camera
						flat.checkGeometry camera
			




class GrassFlat extends THREE.LOD
	constructor: (options) ->
		{ @i, @j, @options, @data, @units, @mid_value } = options
		THREE.LOD.call @
		@creating = false
		@initializing = false
		@initialized = false
		@level = false
		@hightgrassLayer = if @mid_value.grassmap < 128 then false else true


		@position.x = (@i+0.5) * @options.flatsize
		@position.y = @mid_value.heightmap
		@position.z = (@j+0.5) * @options.flatsize


	checkLevel: (camera) ->
		distance = new THREE.Vector3( camera.position.x - @position.x, camera.position.y - @position.y, camera.position.z - @position.z ).length()
		
		if distance < @data.distance[1]
			level = 0
		else if distance < @data.distance[2]
			level = 1
		else if distance < @data.distance[3]
			level = 2
		else if distance < @data.distance[4]
			level = 3
		else
			level = 4

		if @level isnt level
			@level = level


	checkGeometry: (camera) ->
		frustum = new THREE.Frustum
		frustum.setFromMatrix( new THREE.Matrix4().multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse ) )
		if frustum.containsPoint @position
			if not @creating
				draw = true
				for object in @objects
					if object.distance is @data.distance[@level]
						draw = false
				if draw
					@createGeometry()
		else
			if @creating
				manager.cancel @creating
				@creating = false



	createGeometry: ->
		@creating = new Task
			id: 'GrassLayer.createGrassFlatGeometry' + @i + '' + @j
			worker: 'worker'
			data:
				task: 'GrassLayer.createGrassFlatGeometry'
				level: @level
				units: @units
				options:
					flatsize: @options.flatsize
					dencity: @options.dencity
					grasswidth: @options.grasswidth
					grassheight: @options.grassheight
			callback: (e) =>
				geometry = setGeometryVFData e.data.geometry
				if @hightgrassLayer
					material = @data.material.hight[@level]
				else
					material = @data.material.low[@level]

				mesh = new THREE.Mesh geometry, material
				#mesh.castShadow = true
				mesh.receiveShadow = true
				@addLevel mesh, @data.distance[@level]

				@creating = false
				if @initializing
					@initialized = true

		manager.do @creating










class AssetsManager
	constructor: (options) ->
		@graphic =
			model: 		{}
			material: 	{}
			geometry: 	{}
			textures:	{}
			images:		{}

		@loadImage 'terrainLayer_tile000'
		@loadImage 'terrainLayer_tile25500'
		@loadImage 'terrainLayer_tile02550'

		@loadMaterial 'atmosphere'
		@loadMaterial 'terrain'

		@loadMaterial 'water1'
		@loadMaterial 'water2'

		@loadMaterial 'grass0_low'
		@loadMaterial 'grass1_low'
		@loadMaterial 'grass2_low'
		@loadMaterial 'grass3_low'
		@loadMaterial 'grass4_low'
		@loadMaterial 'grass0_hight'
		@loadMaterial 'grass1_hight'
		@loadMaterial 'grass2_hight'
		@loadMaterial 'grass3_hight'
		@loadMaterial 'grass4_hight'

		@loadMaterial 'cloud1'

		@loadModel 'tree1'
		@loadGeometry 'tree1_bottom'
		@loadMaterial 'tree1_bottom'
		@loadGeometry 'tree1_up'
		@loadMaterial 'tree1_up'

		@loadModel 'tree2'
		@loadGeometry 'tree2_bottom'
		@loadGeometry 'tree2_up'

		@loadModel 'tree3'
		@loadGeometry 'tree3_bottom'
		@loadMaterial 'tree3_bottom'
		@loadGeometry 'tree3_up'
		@loadMaterial 'tree3_up'

		@loadModel 'stone1'
		@loadGeometry 'stone1'
		@loadMaterial 'stone1'
		
		@loadModel 'boush1'
		@loadGeometry 'boush1'
		@loadMaterial 'boush1'

		@loadModel 'boush2'
		@loadGeometry 'boush2'
		@loadMaterial 'boush2'
		@loadModel 'cannabis'
		@loadGeometry 'cannabis'
		@loadMaterial 'cannabis'

		@loadModel 'plant_palm'
		@loadGeometry 'plant_palm'
		@loadMaterial 'plant_palm'

		@loadModel 'plant_tropical'
		@loadGeometry 'plant_tropical'
		@loadMaterial 'plant_tropical'

		@loadModel 'plant_tropical2'
		@loadGeometry 'plant_tropical2'
		@loadMaterial 'plant_tropical2'

		@loadModel 'tree_palm'
		@loadGeometry 'tree_palm'
		@loadMaterial 'tree_palm'
		
		@loadModel 'weed1'
		@loadGeometry 'weed1'
		@loadMaterial 'weed1'

		@loadModel 'weed2'
		@loadGeometry 'weed2'
		@loadMaterial 'weed2'

		@loadModel 'weed3'
		@loadGeometry 'weed3'
		@loadMaterial 'weed3'

		@loadModel 'weed4'
		@loadGeometry 'weed4'
		@loadMaterial 'weed4'

		@loadModel 'weed5'
		@loadGeometry 'weed5'

		@loadModel 'weed6'
		@loadGeometry 'weed6'
		@loadMaterial 'weed6'

		@loadModel 'weed7'
		@loadGeometry 'weed7'

		@loadModel 'weed8'
		@loadGeometry 'weed8'
		@loadMaterial 'weed8'


	loadImage: (url) ->
		img = document.createElement 'img'
		img.src = 'assets/graphic/textures/' + url + '.png'
		@graphic.images[url] = img


	loadModel: (url) ->
		$.get 'assets/graphic/model/' + url + '/options.json', (data) =>
			options = JSON.parse data
			if options.type.json
				$.get 'assets/graphic/model/' + url + '/model.json', (data) =>
					@graphic.model[url] = JSON.parse data
					@graphic.model[url].type = { json: true }
			else if options.type.dae
				loader = new THREE.ColladaLoader
				loader.options.convertUpAxis = true
				loader.load  'assets/graphic/model/'+url+'/model.dae', (collada) =>
					@graphic.model[url] = collada.scene
					@graphic.model[url].type = { dae: true }



	loadMaterial: (url) ->
		$.get 'assets/graphic/material/' + url + '/options.json', (data) =>
			options = JSON.parse data
			
			if options.map.diffuse
				diffuse = THREE.ImageUtils.loadTexture 'assets/graphic/material/' + url + '/diffuse.png'
			else
				diffuse = false

			if options.map.specular
				specular = THREE.ImageUtils.loadTexture 'assets/graphic/material/' + url + '/specular.png'
			else
				specular = false

			if options.map.light
				light = THREE.ImageUtils.loadTexture 'assets/graphic/material/' + url + '/light.png'
			else
				light = false

			
			if options.map.alpha
				alpha = THREE.ImageUtils.loadTexture 'assets/graphic/material/' + url + '/alpha.png'
			else
				alpha = false

			if options.map.env
				urls = [
					'assets/graphic/material/' + url + '/env.png',
					'assets/graphic/material/' + url + '/env.png',
					'assets/graphic/material/' + url + '/env.png',
					'assets/graphic/material/' + url + '/env.png',
					'assets/graphic/material/' + url + '/env.png',
					'assets/graphic/material/' + url + '/env.png'
				]
				env = THREE.ImageUtils.loadTextureCube(urls)
				env.format = THREE.RGBFormat;
			else
				env = false

			if options.map.normal
				normal = THREE.ImageUtils.loadTexture 'assets/graphic/material/' + url + '/normal.png'
			else
				normal = false

			if options.map.bump
				bump = THREE.ImageUtils.loadTexture 'assets/graphic/material/' + url + '/bump.png'
			else
				bump = false


			if options.shader
				loadvertexshader url, (vert) =>
					loadfragmentshader url, (frag) =>
						loadmaterialfile url, diffuse, specular, light, alpha, env, normal, bump, vert, frag
			else
				loadmaterialfile url, diffuse, specular, light, alpha, env, normal, bump
				
		loadvertexshader = (url, callback) =>
			$.get 'assets/graphic/material/' + url + '/shader.vert', (data) =>
				callback data

		loadfragmentshader = (url, callback) =>
			$.get 'assets/graphic/material/' + url + '/shader.frag', (data) =>
				callback data

		loadmaterialfile = (url, diffuse, specular, light, alpha, env, normal, bump, vert, frag) =>
			$.get 'assets/graphic/material/' + url + '/material.js', (data) =>
				eval data
				@graphic.material[url] = material


	loadGeometry: (url) ->
		$.get 'assets/graphic/geometry/' + url + '/options.json', (data) =>
			options = JSON.parse data
			#if options.animate
			if options.type.task
				$.get 'assets/graphic/geometry/' + url + '/geometry.js', (data) =>
					eval data
					@graphic.geometry[url] = geometry
			else if options.type.js
				$.get 'assets/graphic/geometry/' + url + '/geometry.js', (data) =>
					eval data
					@graphic.geometry[url] = geometry
			else if options.type.dae
				loader = new THREE.ColladaLoader
				loader.options.convertUpAxis = true
				geometry = new THREE.Geometry
				loader.load  'assets/graphic/geometry/'+url+'/geometry.dae', (collada) =>
					collada.scene.traverse (children) =>
						if children.type is 'Mesh'
							children.updateMatrix()
							geometry.merge children.geometry, children.matrix
				@graphic.geometry[url] = geometry

	loadTexture: (url) ->
		@graphic.textures[url] = THREE.ImageUtils.loadTexture 'assets/graphic/textures/' + url + '.png'






class ThreadManager
	constructor: (options) ->
		@threads = []
		@tasks = []
		for i in [0..options.threads - 1] by 1
			@threads[i] = new Thread
				id: i

		@interval = setInterval =>
			if @tasks[0]
				for thread in @threads
					if thread.idle
						if @tasks[0] 	#coud be cancelled
							thread.process @tasks[0]
							@tasks.splice 0, 1
		, 1


	do: (task) ->
		@tasks.push task


	cancel: (task) ->
		for v, i in @tasks
			if v
				if v.id is task.id
					if @tasks[i] then @tasks.splice i, 1



class Thread
	constructor: (options) ->
		{ @id } = options
		@idle = true
		@worker = {}

	process: (task) ->
		@idle = false
		time = new Date
		#console.log 'Thread', @id, 'process', task
		@worker = new Worker task.worker + '.js'

		@worker.postMessage task.data
		@worker.addEventListener 'message', (e) =>
			task.callback e
		
			@worker.terminate()
			@idle = true
			#console.log 'Thread', @id, 'finished, total time', (new Date - time)/1000, 'data', e.data
			



class Task
	constructor: (options) ->
		{ @id, @worker, @callback, @data } = options











THREE.Object3D.prototype.define = (name, object) ->
	@[name] = object
	@add object