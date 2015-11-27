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
		@camera.position.set 				-3, 5, -3
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



	resize: ->
		@camera.aspect = @wrapper.width() / @wrapper.height()
		@camera.updateProjectionMatrix()
		@renderer.setSize @wrapper.width(), @wrapper.height()



	stop: ->
		console.log 'GraphicEngine3D.stop'
		cancelAnimationFrame @interval



	initialize: (options) ->
		axisHelper = new THREE.AxisHelper 5
		@scene.add axisHelper
		gridHelper = new THREE.GridHelper( 20, 1 )
		@scene.add gridHelper

		geometry = new THREE.PlaneGeometry 1000, 1000, 1, 1
		material = new THREE.MeshBasicMaterial
			map: THREE.ImageUtils.loadTexture 'grassmap.png'
			#color: 0x308030
		terrain = new THREE.Mesh geometry, material
		terrain.rotation.x = -Math.PI/2
		terrain.position.x = 500
		terrain.position.z = 500
		@scene.add terrain


		@grassmap = document.createElement 'img'
		@grassmap.src = 'grassmap.png'
			
		@gui = new dat.GUI
		@options =
			size: 1000
			flatsize: 20
			dencity: 1
			distance: 20
			grassheight: 1
			grasswidth: 0.3
			draw: @draw.bind @

		@gui.add @options, 'size', 0, 1000
		@gui.add @options, 'flatsize', 1, 100
		@gui.add @options, 'dencity', 1, 5
		@gui.add @options, 'distance', 0, 25
		@gui.add @options, 'grassheight', 0, 2
		@gui.add @options, 'grasswidth', 0, 1
		@gui.add @options, 'draw'

		@data = {}
		@data.distance = [ @options.distance, @options.distance*2, @options.distance*4, @options.distance*6, @options.distance*8, @options.distance*12 ]
		@data.material = []
		@data.material[0] = new THREE.MeshBasicMaterial
			color: 0xff0000
			side: THREE.DoubleSide
			#map: THREE.ImageUtils.loadTexture 'texture0.png'
			#transparent: true
			#alphaTest: 0.5
		@data.material[1] = new THREE.MeshBasicMaterial
			color: 0x00ff00
			side: THREE.DoubleSide
			#map: THREE.ImageUtils.loadTexture 'texture1.png'
			#transparent: true
			#alphaTest: 0.5
		@data.material[2] = new THREE.MeshBasicMaterial
			color: 0x0000ff
			side: THREE.DoubleSide
		@data.material[3] = new THREE.MeshBasicMaterial
			color: 0xff3333
			side: THREE.DoubleSide
		@data.material[4] = new THREE.MeshBasicMaterial
			color: 0x33ff33
			side: THREE.DoubleSide
		@data.material[5] = new THREE.MeshBasicMaterial
			color: 0x3333ff
			side: THREE.DoubleSide

		@grassmap.addEventListener 'load', =>
			@grassmapcanvas = document.createElement 'canvas'
			@grassmapcanvas.width = @grassmap.width
			@grassmapcanvas.height = @grassmap.height
			@grassmapctx = @grassmapcanvas.getContext '2d'
			@grassmapctx.drawImage @grassmap, 0, 0, @grassmapcanvas.width, @grassmapcanvas.height
			
			@draw()



	render: ->
		@camera.update()
		
		if @grass then @grass.update @camera
			
		@renderer.render @scene, @camera
		@stats.update()
		@interval = requestAnimationFrame @render.bind @


	draw: ->		
		obj = @scene.getObjectByName 'global'
		if obj then @scene.remove obj
		global = new THREE.Object3D
		global.name = 'global'
		
		@grass = new Grass
			count: @options.size/@options.flatsize
			grassmapctx: @grassmapctx
			options: @options
			data: @data

		global.add @grass

		@scene.add global



manager = {}
graphic = {}
$(document).ready ->
	graphic = new GraphicEngine
	setTimeout ->
		graphic.initialize()
		graphic.render()
	, 1000
	manager = new ThreadManager
		threads: 4





class Grass extends THREE.Object3D
	constructor: (options) ->
		THREE.Object3D.call @
		@name = 'grass'
		{ @count, @grassmapctx, @options, @data } = options
		@initialized = false
		@radius =
			initialization: 20
			update: 10
		
		for i in [0.. @count - 1] by 1
			for j in [0.. @count - 1] by 1
				@createFlat i, j


	createFlat: (flat_i, flat_j) ->
		imagedata = @grassmapctx.getImageData(flat_i * @options.flatsize, flat_j * @options.flatsize, @options.flatsize, @options.flatsize).data
		units = []
		hasgrass = false
		for i in [0..imagedata.length] by 4
			y = Math.floor(i/80)
			if not units[y] then units[y] = []
			x = i/4 - 20 * y
			units[y][x] = false
			if imagedata[i] > 0
				if not hasgrass then hasgrass = true
				units[y][x] = true

		if hasgrass
			flat = new Flat
				flat_i: flat_i
				flat_j: flat_j
				units: units
				options: @options
				data: @data
				
			flat.position.x = (flat_i+0.5) * @options.flatsize
			flat.position.z = (flat_j+0.5) * @options.flatsize
			
			@add flat


	update: (camera) ->
		if not @initialized
			@initialized = true
			for flat, i in @children
				distance = new THREE.Vector3( camera.position.x - flat.position.x, camera.position.y - flat.position.y, camera.position.z - flat.position.z ).length()
				if distance <= @radius.initialization
					flat.checkLevel camera
					flat.createGeometry()
		else
			for flat in @children
				flat.update camera
				distance = new THREE.Vector3( camera.position.x - flat.position.x, camera.position.y - flat.position.y, camera.position.z - flat.position.z ).length()
				if distance <= @radius.update
					flat.checkLevel camera
					flat.checkGeometry camera
			




class Flat extends THREE.LOD
	constructor: (options) ->			
		{ @flat_i, @flat_j, @options, @data, @units } = options
		THREE.LOD.call @
		@creating = false
		@level = false


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
			id: 'createGeometry' + @flat_i + '' + @flat_j
			worker: 'worker'
			data:
				task: 'createGeometry'
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

				@addLevel mesh, @data.distance[@level]

				@creating = false

		manager.do @creating




















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
					console.log 'cancel', i
					if @tasks[i] then @tasks.splice i, 1



class Thread
	constructor: (options) ->
		{ @id } = options
		@idle = true
		@worker = {}

	process: (task) ->
		console.log 'Thread.process.start'
		@idle = false
		time = new Date
		console.log 'Thread', @id, 'process', task
		@worker = new Worker task.worker + '.js'

		@worker.postMessage task.data
		@worker.addEventListener 'message', (e) =>
			task.callback e
		
			@worker.terminate()
			@idle = true
			console.log 'Thread', @id, 'finished, total time', (new Date - time)/1000, 'data', e.data
			



class Task
	constructor: (options) ->
		{ @id, @worker, @callback, @data } = options