manager = {}
graphic = {}
assets = {}
$(document).ready ->
	assets = new AssetsManager
	graphic = new GraphicEngine
	manager = new ThreadManager
		threads: 4

class GraphicEngine
	constructor: (@_) ->
		@renderer = new THREE.WebGLRenderer
			antialias: true

		@stats = new Stats
		@stats.domElement.style.position = 'absolute'
		@stats.domElement.style.top = '0px'
		@stats.domElement.style.left = '0px'
		
		@wrapper = $('#viewport')
		@wrapper.append @renderer.domElement
		@wrapper.append @stats.domElement
		@clock = new THREE.Clock
		@scene = new THREE.Scene
		
		@camera = new THREE.PerspectiveCamera 75, @wrapper.width() / @wrapper.height(), 0.1, 10000000
		@camera.position.set 				-5, 50, -5
		@camera.up = new THREE.Vector3 		0, 1, 0
		@camera.lookAt new THREE.Vector3 	5, 0, 5
		@camera.mode = 'float'
		@camera.float =
			fi: 90
			tetha: 60
			speed: 1
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
		axisHelper = new THREE.AxisHelper 5
		@scene.add axisHelper
		gridHelper = new THREE.GridHelper( 20, 1 )
		@scene.add gridHelper

		@ambientlight = new THREE.AmbientLight 0xa0a0a0
		@scene.add @ambientlight
		
		@environment = new EnvironmentSystem
		@scene.add @environment

		@render()


	render: ->
		@camera.update()
		
		@environment.update @camera
			
		@renderer.render @scene, @camera
		@stats.update()
		@interval = requestAnimationFrame @render.bind @





class EnvironmentSystem extends THREE.Object3D
	constructor: (options) ->
		THREE.Object3D.call @
		@name = 'environment'

		#@atmosphere = new Atmosphere
		#@add @atmosphere

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

				@terrain = new Terrain { _: @ }
				@add @terrain

				#@grass = new GrassSystem { _: @ }
				#@add @grass

				$.get 'environment.json', (data) =>
					@objects = new ObjectsSystem
						_: @
						asset: JSON.parse(data).objects
					@add @objects


	update: (camera) ->
		if @grass then @grass.update camera
		if @terrain then @terrain.update camera






class Atmosphere extends THREE.Object3D
	constructor: (options) ->
		THREE.Object3D.call @
		@name = 'atmosphere'
	
		@options = 
			radius: 1000

		geometry = new THREE.SphereGeometry @options.radius, 32, 32
		material = new THREE.MeshBasicMaterial 
			color: 0x00ffff
			side: THREE.BackSide
		@sphere = new THREE.Mesh geometry, material
		@add @sphere







class ObjectsSystem extends THREE.Object3D
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
		if parent
			if object.position and parent.position
				if parent.position.x then object.position.x += parent.position.x
				if parent.position.y then object.position.y += parent.position.y
				if parent.position.z then object.position.z += parent.position.z
		else
			object.position.y = @_.terrain.getHeightValue object.position.x, object.position.z
		
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
			@add model


	creteGroupGeometry: (group, materialID) ->
		manager.do new Task
			id: 'ObjectsSystem.creteGroupGeometry' + materialID
			worker: 'worker'
			data:
				task: 'ObjectsSystem.creteGroupGeometry'
				group: group
			callback: (e) =>
				geometry = new THREE.Geometry
				for vertex in e.data.geometry.vertices
					geometry.vertices.push new THREE.Vector3 vertex.x, vertex.y, vertex.z
				for face in e.data.geometry.faces
					geometry.faces.push new THREE.Face3 face.a, face.b, face.c
				geometry.computeFaceNormals()

				material = assets.graphic.material[materialID]
				mesh = new THREE.Mesh geometry, material
				@add mesh

	update: ->
		#





class Terrain extends THREE.Object3D
	constructor: (options) ->
		{ @_ } = options
		THREE.Object3D.call @
		@name = 'terrain'

		@options =
			size: 1000
			flatsize: 100
			distance: 75
		@data = {}
		@data.distance = [ @options.distance, @options.distance*2, @options.distance*3, @options.distance*4, @options.distance*5, @options.distance*6 ]
		@data.material = []
		@data.material[0] = new THREE.MeshBasicMaterial
			color: 0xff1111
			wireframe: true
		@data.material[1] = new THREE.MeshBasicMaterial
			color: 0x11ff11
			wireframe: true
		@data.material[2] = new THREE.MeshBasicMaterial
			color: 0x1111ff
			wireframe: true
		@data.material[3] = new THREE.MeshBasicMaterial
			color: 0x1111ff
			wireframe: true
		@data.material[4] = new THREE.MeshBasicMaterial
			color: 0xff11ff
			wireframe: true

		@count = @options.size/@options.flatsize
		@created = false
		@initialized = false
		@initializing = false
		@radius =
			initialization: 1000
			update: 250

		for i in [0.. @count - 1] by 1
			for j in [0.. @count - 1] by 1
				@createFlat i, j
		@created = true


	createFlat: (i, j) ->
		imagedata = @_.heightmap.getImageData(i * @options.flatsize, j * @options.flatsize, @options.flatsize + 1, @options.flatsize + 1).data
		heightmap_units = []
		middle_value = 1000000
		for index in [0..imagedata.length - 1] by 4
			y = Math.floor(index/(4*(@options.flatsize + 1)))
			if not heightmap_units[y] then heightmap_units[y] = []
			x = index/4 - (@options.flatsize + 1) * y
			heightmap_units[y][x] = imagedata[index]
			if heightmap_units[y][x] < middle_value then middle_value = heightmap_units[y][x]
		for y in [0..heightmap_units.length - 1] by 1
			for x in [0..heightmap_units[y].length - 1] by 1
				heightmap_units[y][x] -= middle_value
		flat = new TerrainFlat
			i: i
			j: j
			middle_value: middle_value
			units: heightmap_units
			options: @options
			data: @data
		
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




class TerrainFlat extends THREE.LOD
	constructor: (options) ->			
		{ @i, @j, @options, @data, @units, @middle_value } = options
		THREE.LOD.call @
		@creating = false
		@initializing = false
		@initialized = false
		@level = false
		@step = [ 1, 2, 4, 10, 20, 25 ]


		@position.x = (@i+0.5) * @options.flatsize
		@position.z = (@j+0.5) * @options.flatsize


	checkLevel: (camera) ->
		@updateMatrixWorld()
		v1 = new THREE.Vector3
		v2 = new THREE.Vector3
		v1.setFromMatrixPosition camera.matrixWorld
		v2.setFromMatrixPosition @matrixWorld
		distance = v1.distanceTo v2

		if distance < @data.distance[0]
			level = 0
		else if distance < @data.distance[1]
			level = 1
		else if distance < @data.distance[2]
			level = 2
		else if distance < @data.distance[3]
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
					console.log 'TerrainFlat', @i, @j, 'checkGeometry', @level
					@createGeometry()
		else
			if @creating
				manager.cancel @creating
				@creating = false



	createGeometry: ->
		@creating = new Task
			id: 'TerrainSystem.createTerrainFlatGeometry' + @i + '' + @j
			worker: 'worker'
			data:
				task: 'TerrainSystem.createTerrainFlatGeometry'
				step: @step[@level]
				units: @units
				options:
					flatsize: @options.flatsize
			callback: (e) =>
				geometry = new THREE.Geometry
				for vertex in e.data.geometry.vertices
					geometry.vertices.push new THREE.Vector3 vertex.x, vertex.y, vertex.z
				for face in e.data.geometry.faces
					geometry.faces.push new THREE.Face3 face.a, face.b, face.c
					
				geometry.computeFaceNormals()
				material = @data.material[@level]

				mesh = new THREE.Mesh geometry, material
				mesh.rotation.x = -Math.PI/2
				mesh.position.y = @middle_value

				@addLevel mesh, @data.distance[@level]

				@creating = false
				if @initializing
					@initializing = false
					@initialized = true

		manager.do @creating




class GrassSystem extends THREE.Object3D
	constructor: (options) ->
		{ @_ } = options
		THREE.Object3D.call @
		@name = 'grass'
		
		@options =
			size: 1000
			flatsize: 20
			dencity: 2
			distance: 20
			grassheight: 1
			grasswidth: 0.3
		@data = {}
		@data.distance = [ @options.distance, @options.distance*2, @options.distance*3, @options.distance*4, @options.distance*5, @options.distance*6 ]
		@data.material = []
		@data.material[0] = new THREE.MeshBasicMaterial
			color: 0xff0000
			side: THREE.DoubleSide
		@data.material[1] = new THREE.MeshBasicMaterial
			color: 0x00ff00
			side: THREE.DoubleSide
		@data.material[2] = new THREE.MeshBasicMaterial
			color: 0x0000ff
			side: THREE.DoubleSide
		@data.material[3] = new THREE.MeshBasicMaterial
			color: 0x00ffff
			side: THREE.DoubleSide
		@data.material[4] = new THREE.MeshBasicMaterial
			color: 0xff00ff
			side: THREE.DoubleSide

		@count = @options.size/@options.flatsize
		@created = false
		@initializing = false
		@initialized = false
		@radius =
			initialization: 100
			update: 150

		
		for i in [0.. @count - 1] by 1
			for j in [0.. @count - 1] by 1
				@createFlat i, j
		@created = true


	createFlat: (i, j) ->
		imagedata = @_.grassmap.getImageData(i * @options.flatsize, j * @options.flatsize, @options.flatsize, @options.flatsize).data
		grassmap_units = []
		hasgrass = false

		for index in [0..imagedata.length - 1] by 4
			y = Math.floor(index/(4*@options.flatsize))
			if not grassmap_units[y] then grassmap_units[y] = []
			x = index/4 - @options.flatsize * y
			grassmap_units[y][x] = false
			if imagedata[index] > 0
				if not hasgrass then hasgrass = true
				grassmap_units[y][x] = true

		if hasgrass
			imagedata = @_.heightmap.getImageData(i * @options.flatsize, j * @options.flatsize, @options.flatsize + 1, @options.flatsize + 1).data
			heightmap_units = []
			middle_value = 1000000
			for index in [0..imagedata.length - 1] by 4
				y = Math.floor(index/(4*(@options.flatsize + 1)))
				if not heightmap_units[y] then heightmap_units[y] = []
				x = index/4 - (@options.flatsize + 1) * y
				heightmap_units[y][x] = imagedata[index]
				if heightmap_units[y][x] < middle_value then middle_value = heightmap_units[y][x]
			for y in [0..heightmap_units.length - 1] by 1
				for x in [0..heightmap_units[y].length - 1] by 1
					heightmap_units[y][x] -= middle_value

			flat = new GrassFlat
				i: i
				j: j
				units:
					heightmap: heightmap_units
					grassmap: grassmap_units
				middle_value: middle_value
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
		{ @i, @j, @options, @data, @units, @middle_value } = options
		THREE.LOD.call @
		@creating = false
		@initializing = false
		@initialized = false
		@level = false


		@position.x = (@i+0.5) * @options.flatsize
		@position.z = (@j+0.5) * @options.flatsize


	checkLevel: (camera) ->
		distance = new THREE.Vector3( camera.position.x - @position.x, camera.position.y - @position.y, camera.position.z - @position.z ).length()
		if distance < @data.distance[0]
			level = 0
		else if distance < @data.distance[1]
			level = 1
		else if distance < @data.distance[2]
			level = 2
		else if distance < @data.distance[3]
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
			id: 'GrassSystem.createGrassFlatGeometry' + @i + '' + @j
			worker: 'worker'
			data:
				task: 'GrassSystem.createGrassFlatGeometry'
				level: @level
				units: @units
				options:
					flatsize: @options.flatsize
					dencity: @options.dencity
					grasswidth: @options.grasswidth
					grassheight: @options.grassheight
			callback: (e) =>
				geometry = new THREE.Geometry
				for vertex in e.data.geometry.vertices
					geometry.vertices.push new THREE.Vector3 vertex.x, vertex.y, vertex.z
				for face in e.data.geometry.faces
					geometry.faces.push new THREE.Face3 face.a, face.b, face.c
					
				geometry.computeFaceNormals()
				material = @data.material[@level]

				mesh = new THREE.Mesh geometry, material
				mesh.position.y = @middle_value

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

		@loadModel 'stone1'
		@loadGeometry 'stone1'
		@loadMaterial 'stone1'

		@loadModel 'tree1'
		@loadGeometry 'tree1_bottom'
		@loadGeometry 'tree1_up'
		@loadMaterial 'tree1_up'
		@loadMaterial 'tree1_bottom'

		@loadModel 'building1'


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
			#if options.shader.vertex..
			if options.map.texture
				texture = THREE.ImageUtils.loadTexture 'assets/graphic/material/' + url + '/texture.png'
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