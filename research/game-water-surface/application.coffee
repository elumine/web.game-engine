settings = {}
$(document).ready ->
	settings = new dat.GUI
	setTimeout =>
		graphic = new GraphicEngine
	, 2000

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
		@camera.r = 50
		settings.add(@camera, 'r', 1, 100).name('camera.distance')
		@camera.set_x = (v) ->	@fi = 90 + 1 * v
		@camera.set_y = (v) ->	@tetha = 60 + 1 * v
		@camera.update = (object) ->
			dx = Math.sin(@tetha * Math.PI/180) * Math.cos((@fi) * Math.PI/180)
			dz = Math.sin(@tetha * Math.PI/180) * Math.sin((@fi) * Math.PI/180)
			dy = Math.cos(@tetha * Math.PI/180)
			@position.set dx * @r, dy * @r, dz * @r
			@lookAt new THREE.Vector3 0, 0, 0

		@mouse =
			current: 
				x: 0
				y: 0
			previous:
				x: 0
				y: 0
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
		
		@ambientlight = new THREE.AmbientLight 0xa0a0a0
		@scene.add @ambientlight

		light = new THREE.DirectionalLight 0xffaa44
		helper = new THREE.DirectionalLightHelper light
		@scene.add helper
		@scene.add light

		@lod = new THREE.LOD
		@lod.rotation.x = -Math.PI/2
		@scene.add @lod

		@material = MeshWaterMaterial
		settings.add(@material.uniforms.waveHeight, 'value', 1, 50).name('wave.h')
		s = 100
		d = [10, 20, 30, 40, 50, 60]
		c = [100, 75, 50, 25, 15, 10]
		for i in [0..5] by 1
			geometry = new THREE.PlaneGeometry s, s, c[i], c[i]
			mesh = new THREE.Mesh geometry, @material
			@lod.addLevel mesh, d[i]


		
		@render()


	render: ->
		dt = @clock.getDelta()

		@camera.update()
		@lod.update @camera
		
		if @material.uniforms.time.value >= 1 then @material.uniforms.time.value = 0 else @material.uniforms.time.value += dt/5
		
		@renderer.render @scene, @camera
		
		@stats.update()
		
		@interval = requestAnimationFrame @render.bind @