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
		@camera.position.set 				15, 15, 15
		@camera.up = new THREE.Vector3 		0, 1, 0
		@camera.lookAt new THREE.Vector3 	0, 0, 0
		@camera.fi = 90
		@camera.tetha = 60
		@camera.r = 25
		settings.add(@camera, 'r', 1, 100).name('camera.r')
		@camera.set_x = (v) ->	@fi = 90 + 1 * v
		@camera.set_y = (v) ->	@tetha = 60 + 1 * v
		@camera.update = (object) ->
			dx = Math.sin(@tetha * Math.PI/180) * Math.cos((@fi) * Math.PI/180)
			dz = Math.sin(@tetha * Math.PI/180) * Math.sin((@fi) * Math.PI/180)
			dy = Math.cos(@tetha * Math.PI/180)
			if character
				@position.set character.position.x + dx * @r, character.position.y + dy * @r, character.position.z + dz * @r
				@lookAt new THREE.Vector3 character.position.x, character.position.y, character.position.z
			else
				@position.set dx * @r, dy * @r, dz * @r
				@lookAt new THREE.Vector3 0, 0, 0
		
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
			
			@camera.set_x 0.5 * dx
			@camera.set_y 0.5 * dy

		
		@resize()
		window.addEventListener 'resize', =>
			@resize()


		@start()


	resize: ->
		@camera.aspect = @wrapper.width() / @wrapper.height()
		@camera.updateProjectionMatrix()
		@renderer.setSize @wrapper.width(), @wrapper.height()



	stop: ->
		cancelAnimationFrame @interval



	start: (options) ->
		axisHelper = new THREE.AxisHelper 5
		@scene.add axisHelper

		@scene.add new THREE.GridHelper 100, 10

		@ambientlight = new THREE.AmbientLight 0x555555
		@scene.add @ambientlight

		light = new THREE.DirectionalLight 0xaaaaaa
		light.position.set 0, 50, 0
		@scene.add light

		
		@render()



	render: ->
		@camera.update()
			
		@renderer.render @scene, @camera

		@stats.update()

		@interval = requestAnimationFrame @render.bind @
