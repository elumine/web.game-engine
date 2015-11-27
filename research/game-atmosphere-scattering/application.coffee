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
		
		@clock = new THREE.Clock()
		
		@scene 		=		new 	THREE.Scene
		
		@camera = new THREE.PerspectiveCamera 75, @wrapper.width() / @wrapper.height(), 0.1, 10000000
		@camera.position.set 				0, 0, 0
		@camera.up = new THREE.Vector3 		0, 1, 0
		@camera.lookAt new THREE.Vector3 	5, 0, 5
		@camera.mode = 'float'
		@camera.float =
			fi: 90
			tetha: 60
			speed: 5
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



		@atmosphere =
			v3LightPos 		: new THREE.Vector3 0, 0, 1
			Kr				: 0.0025
			Km				: 0.0015
			ESun			: 20.0
			g				: -0.95
			innerRadius 	: 1000
			outerRadius		: 1010
			wavelength		: [0.650, 0.570, 0.475]
			scaleDepth		: 0.25
			fExposure 		: 1
			uniforms:
				atmosphere: 0
				space: 0
			ground:
				mesh: 0
				geometry: 0
				material:
					atmosphere: 0
					space: 0
			sky:
				mesh: 0
				geometry: 0
				material:
					atmosphere: 0
					space: 0
	
		@camera_atmosphere = new THREE.Object3D
		@camera_atmosphere.position.set 0, @atmosphere.innerRadius + ( @atmosphere.outerRadius - @atmosphere.innerRadius )/2, 0
		@camera_atmosphere.height = @camera_atmosphere.position.length()

		@shader =
			GroundFromAtmosphereVert: 0
			GroundFromAtmosphereFrag: 0
			SkyFromAtmosphereVert: 0
			SkyFromAtmosphereFrag: 0
			GroundFromSpaceVert: 0
			GroundFromSpaceFrag: 0
			SkyFromSpaceVert: 0
			SkyFromSpaceFrag: 0


		$.get 'GroundFromAtmosphere.vert', (data) =>
			@shader.GroundFromAtmosphereVert = data
		$.get 'GroundFromAtmosphere.frag', (data) =>
			@shader.GroundFromAtmosphereFrag = data
		$.get 'SkyFromAtmosphere.vert', (data) =>
			@shader.SkyFromAtmosphereVert 	= data
		$.get 'SkyFromAtmosphere.frag', (data) =>
			@shader.SkyFromAtmosphereFrag 	= data
		$.get 'GroundFromSpace.vert', (data) =>
			@shader.GroundFromSpaceVert = data
		$.get 'GroundFromSpace.frag', (data) =>
			@shader.GroundFromSpaceFrag = data
		$.get 'SkyFromSpace.vert', (data) =>
			@shader.SkyFromSpaceVert 	= data
		$.get 'SkyFromSpace.frag', (data) =>
			@shader.SkyFromSpaceFrag 	= data

		@gui = new dat.GUI
		@gui.atmosphere = @gui.addFolder 'atmosphere'
		@gui.atmosphere.add @camera_atmosphere.position, 'x', -@atmosphere.innerRadius, @atmosphere.innerRadius
		@gui.atmosphere.add @camera_atmosphere.position, 'y', @atmosphere.innerRadius, @atmosphere.outerRadius
		@gui.atmosphere.add @camera_atmosphere.position, 'z', -@atmosphere.innerRadius, @atmosphere.innerRadius
		@gui.atmosphere.add @camera_atmosphere, 'height', 0, @atmosphere.outerRadius
		@gui.v3LightPos = @gui.atmosphere.addFolder 'v3LightPos'
		@gui.v3LightPos.add @atmosphere.v3LightPos, 'x', -1, 1
		@gui.v3LightPos.add @atmosphere.v3LightPos, 'y', -1, 1
		@gui.v3LightPos.add @atmosphere.v3LightPos, 'z', -1, 1
		@gui.atmosphere.add @atmosphere, 'Kr', 0, 0.2
		@gui.atmosphere.add @atmosphere, 'Km', 0, 0.5
		@gui.atmosphere.add @atmosphere, 'ESun', 0, 500
		@gui.atmosphere.add @atmosphere, 'g', -0.99, 0
		@gui.atmosphere.add @atmosphere, 'innerRadius'
		@gui.atmosphere.add @atmosphere, 'outerRadius'
		#@gui.atmosphere.addColor @atmosphere, 'wavelength'
		@gui.atmosphere.add @atmosphere, 'scaleDepth', 0, 0.5
		@gui.atmosphere.add @atmosphere, 'fExposure', 0, 3



	resize: ->
		@camera.aspect = @wrapper.width() / @wrapper.height()
		@camera.updateProjectionMatrix()
		@renderer.setSize @wrapper.width(), @wrapper.height()



	stop: ->
		console.log 'GraphicEngine3D.stop'
		cancelAnimationFrame @interval



	initialize: (options) ->
		@renderer.setClearColor 0x000000 #@scene.fog.color, 1
		

		#add helpers
		axisHelper 	= 		new 	THREE.AxisHelper 5
		@scene.add axisHelper


		#sun
		@sun = new THREE.Mesh new THREE.Geometry, new THREE.MeshBasicMaterial
		@sun.position.set 10, 10, 10
		@sun.update = (time) ->
			#
		@scene.add @sun

		geometry = new THREE.SphereGeometry 10, 32, 32
		material = new THREE.MeshBasicMaterial
			color: 0xffff00
		mesh = new THREE.Mesh geometry, material
		@sun.add mesh




		diffuse = THREE.ImageUtils.loadTexture('texture.jpg')
		diffuseNight = THREE.ImageUtils.loadTexture('grayscale.jpg')

		maxAnisotropy = @renderer.getMaxAnisotropy();
		diffuse.anisotropy = maxAnisotropy;
		diffuseNight.anisotropy = maxAnisotropy;

		@atmosphere.uniforms.atmosphere =
			v3CameraPos:
				type: 'v3'
				value: @camera_atmosphere.position
			v3LightPos:
				type:	"v3"
				value:	@atmosphere.v3LightPos
			v3InvWavelength:
				type:	"v3"
				value:	new THREE.Vector3(1 / Math.pow(@atmosphere.wavelength[0], 4), 1 / Math.pow(@atmosphere.wavelength[1], 4), 1 / Math.pow(@atmosphere.wavelength[2], 4))
			fCameraHeight:
				type:	"f"
				value:	@camera_atmosphere.height
			fCameraHeight2:
				type:	"f"
				value:	@camera_atmosphere.height * @camera_atmosphere.height
			fInnerRadius:
				type:	"f"
				value:	@atmosphere.innerRadius
			fInnerRadius2:
				type:	"f"
				value:	@atmosphere.innerRadius * @atmosphere.innerRadius
			fOuterRadius:
				type:	"f"
				value:	@atmosphere.outerRadius
			fOuterRadius2:
				type:	"f"
				value:	@atmosphere.outerRadius * @atmosphere.outerRadius
			fKrESun:
				type:	"f"
				value:	@atmosphere.Kr * @atmosphere.ESun
			fKmESun:
				type:	"f"
				value:	@atmosphere.Km * @atmosphere.ESun
			fKr4PI:
				type:	"f"
				value:	@atmosphere.Kr * 4.0 * Math.PI
			fKm4PI:
				type:	"f"
				value:	@atmosphere.Km * 4.0 * Math.PI
			fScale:
				type:	"f"
				value:	1 / (@atmosphere.outerRadius - @atmosphere.innerRadius)
			fScaleDepth:
				type:	"f"
				value:	@atmosphere.scaleDepth
			fScaleOverScaleDepth:
				type:	"f"
				value:	1 / (@atmosphere.outerRadius - @atmosphere.innerRadius) / @atmosphere.scaleDepth
			fg:
				type:	"f"
				value:	@atmosphere.g
			fg2:
				type:	"f"
				value:	@atmosphere.g * @atmosphere.g
			fExposure:
				type: 'f'
				value: @atmosphere.fExposure

			nSamples:
				type:	"i"
				value:	3
			fSamples:
				type:	"f"
				value:	3.0
			tGround:
				type:	"t"
				value:	diffuse
			tNight:
				type:	"t"
				value:	diffuseNight
			tBump:
				type:	"t"
				value:	0
			tSkyboxDiffuse:
				type:	"t"
				value:	0
			fNightScale:
				type:	"f"
				value:	1


		@atmosphere.uniforms.space =
			v3CameraPos:
				type: 'v3'
				value: @camera.position
			v3LightPos:
				type:	"v3"
				value:	@atmosphere.v3LightPos
			v3InvWavelength:
				type:	"v3"
				value:	new THREE.Vector3(1 / Math.pow(@atmosphere.wavelength[0], 4), 1 / Math.pow(@atmosphere.wavelength[1], 4), 1 / Math.pow(@atmosphere.wavelength[2], 4))
			fCameraHeight:
				type:	"f"
				value:	@camera.position.length()
			fCameraHeight2:
				type:	"f"
				value:	@camera.position.length() * @camera.position.length()
			fInnerRadius:
				type:	"f"
				value:	@atmosphere.innerRadius
			fInnerRadius2:
				type:	"f"
				value:	@atmosphere.innerRadius * @atmosphere.innerRadius
			fOuterRadius:
				type:	"f"
				value:	@atmosphere.outerRadius
			fOuterRadius2:
				type:	"f"
				value:	@atmosphere.outerRadius * @atmosphere.outerRadius
			fKrESun:
				type:	"f"
				value:	@atmosphere.Kr * @atmosphere.ESun
			fKmESun:
				type:	"f"
				value:	@atmosphere.Km * @atmosphere.ESun
			fKr4PI:
				type:	"f"
				value:	@atmosphere.Kr * 4.0 * Math.PI
			fKm4PI:
				type:	"f"
				value:	@atmosphere.Km * 4.0 * Math.PI
			fScale:
				type:	"f"
				value:	1 / (@atmosphere.outerRadius - @atmosphere.innerRadius)
			fScaleDepth:
				type:	"f"
				value:	@atmosphere.scaleDepth
			fScaleOverScaleDepth:
				type:	"f"
				value:	1 / (@atmosphere.outerRadius - @atmosphere.innerRadius) / @atmosphere.scaleDepth
			fg:
				type:	"f"
				value:	@atmosphere.g
			fg2:
				type:	"f"
				value:	@atmosphere.g * @atmosphere.g
			fExposure:
				type: 'f'
				value: @atmosphere.fExposure

			nSamples:
				type:	"i"
				value:	3
			fSamples:
				type:	"f"
				value:	3.0
			tGround:
				type:	"t"
				value:	diffuse
			tNight:
				type:	"t"
				value:	diffuseNight
			tBump:
				type:	"t"
				value:	0
			tSkyboxDiffuse:
				type:	"t"
				value:	0
			fNightScale:
				type:	"f"
				value:	1


		@atmosphere.ground.material.space = new THREE.ShaderMaterial
			uniforms:		@atmosphere.uniforms.space
			vertexShader:	@shader.GroundFromSpaceVert
			fragmentShader:	@shader.GroundFromSpaceFrag
		@atmosphere.ground.material.atmosphere = new THREE.ShaderMaterial
			uniforms:		@atmosphere.uniforms.atmosphere
			vertexShader:	@shader.GroundFromAtmosphereVert
			fragmentShader:	@shader.GroundFromAtmosphereFrag

		@atmosphere.ground.geometry = new THREE.SphereGeometry @atmosphere.innerRadius, 100, 100
		@atmosphere.ground.mesh = new THREE.Mesh @atmosphere.ground.geometry, @atmosphere.ground.material.atmosphere
		@atmosphere.ground.mesh.state = 'atmosphere'

		@atmosphere.sky.material.space = new THREE.ShaderMaterial
			uniforms:		@atmosphere.uniforms.space
			vertexShader:	@shader.SkyFromSpaceVert
			fragmentShader:	@shader.SkyFromSpaceFrag
			side: THREE.BackSide
			transparent: true
		@atmosphere.sky.material.atmosphere = new THREE.ShaderMaterial
			uniforms:		@atmosphere.uniforms.atmosphere
			vertexShader:	@shader.SkyFromAtmosphereVert
			fragmentShader:	@shader.SkyFromAtmosphereFrag
			side: THREE.BackSide
			transparent: true

		@atmosphere.sky.geometry = new THREE.SphereGeometry @atmosphere.outerRadius, 100, 100
		@atmosphere.sky.mesh = new THREE.Mesh @atmosphere.sky.geometry, @atmosphere.sky.material.atmosphere
		@atmosphere.sky.mesh.state = 'atmosphere'
		
		@atmosphere.setMaterial = (camera, atmosphere) ->
			if camera.position.length() < atmosphere.outerRadius
				@ground.mesh.state = 'atmosphere'
				@ground.mesh.material = @ground.material.atmosphere
				@sky.mesh.state = 'atmosphere'
				@sky.mesh.material = @sky.material.atmosphere
			else
				@ground.mesh.state = 'space'
				@ground.mesh.material = @ground.material.space
				@sky.mesh.state = 'space'
				@sky.mesh.material = @sky.material.space
		
		#@scene.add @atmosphere.ground.mesh
		@scene.add @atmosphere.sky.mesh

		geometry = new THREE.PlaneGeometry @atmosphere.outerRadius * 2, @atmosphere.outerRadius * 2, 1, 1
		material = new THREE.MeshBasicMaterial
			color: 0xffff00
		mesh = new THREE.Mesh geometry, material
		mesh.rotation.x = - Math.PI/2
		mesh.position.y = @atmosphere.innerRadius
		@scene.add mesh

		@camera.position.y = mesh.position.y + 1



	render: ->
		#console.log 'GraphicEngine3D.render'
		dt = @clock.getDelta()

		if @sun then @sun.update dt
		@camera.update()
		@atmosphere.setMaterial @camera, @atmosphere

		@atmosphere.uniforms.atmosphere.fCameraHeight.value = @camera_atmosphere.height
		@atmosphere.uniforms.atmosphere.fCameraHeight2.value = @camera_atmosphere.height * @camera_atmosphere.height
		@atmosphere.uniforms.atmosphere.v3LightPos.value = @atmosphere.v3LightPos.normalize()
		@atmosphere.uniforms.atmosphere.fInnerRadius.value =	@atmosphere.innerRadius
		@atmosphere.uniforms.atmosphere.fInnerRadius2.value =	@atmosphere.innerRadius * @atmosphere.innerRadius
		@atmosphere.uniforms.atmosphere.fOuterRadius.value =	@atmosphere.outerRadius
		@atmosphere.uniforms.atmosphere.fOuterRadius2.value =	@atmosphere.outerRadius * @atmosphere.outerRadius
		@atmosphere.uniforms.atmosphere.fKrESun.value =	@atmosphere.Kr * @atmosphere.ESun
		@atmosphere.uniforms.atmosphere.fKmESun.value =	@atmosphere.Km * @atmosphere.ESun
		@atmosphere.uniforms.atmosphere.fKr4PI.value =	@atmosphere.Kr * 4.0 * Math.PI
		@atmosphere.uniforms.atmosphere.fKm4PI.value =	@atmosphere.Km * 4.0 * Math.PI
		@atmosphere.uniforms.atmosphere.fScale.value =	1 / (@atmosphere.outerRadius - @atmosphere.innerRadius)
		@atmosphere.uniforms.atmosphere.fScaleDepth.value =	@atmosphere.scaleDepth
		@atmosphere.uniforms.atmosphere.fScaleOverScaleDepth.value =	1 / (@atmosphere.outerRadius - @atmosphere.innerRadius) / @atmosphere.scaleDepth
		@atmosphere.uniforms.atmosphere.fg.value = @atmosphere.g
		@atmosphere.uniforms.atmosphere.fg2.value =	@atmosphere.g * @atmosphere.g
		@atmosphere.uniforms.atmosphere.fExposure.value = @atmosphere.fExposure

		fCameraHeight= @camera.position.length()
		@atmosphere.uniforms.space.fCameraHeight.value = fCameraHeight
		@atmosphere.uniforms.space.fCameraHeight2.value = fCameraHeight * fCameraHeight	
		@atmosphere.uniforms.space.v3LightPos.value = @atmosphere.v3LightPos.normalize()
		@atmosphere.uniforms.space.fInnerRadius.value =	@atmosphere.innerRadius
		@atmosphere.uniforms.space.fInnerRadius2.value =	@atmosphere.innerRadius * @atmosphere.innerRadius
		@atmosphere.uniforms.space.fOuterRadius.value =	@atmosphere.outerRadius
		@atmosphere.uniforms.space.fOuterRadius2.value =	@atmosphere.outerRadius * @atmosphere.outerRadius
		@atmosphere.uniforms.space.fKrESun.value =	@atmosphere.Kr * @atmosphere.ESun
		@atmosphere.uniforms.space.fKmESun.value =	@atmosphere.Km * @atmosphere.ESun
		@atmosphere.uniforms.space.fKr4PI.value =	@atmosphere.Kr * 4.0 * Math.PI
		@atmosphere.uniforms.space.fKm4PI.value =	@atmosphere.Km * 4.0 * Math.PI
		@atmosphere.uniforms.space.fScale.value =	1 / (@atmosphere.outerRadius - @atmosphere.innerRadius)
		@atmosphere.uniforms.space.fScaleDepth.value =	@atmosphere.scaleDepth
		@atmosphere.uniforms.space.fScaleOverScaleDepth.value =	1 / (@atmosphere.outerRadius - @atmosphere.innerRadius) / @atmosphere.scaleDepth
		@atmosphere.uniforms.space.fg.value = @atmosphere.g
		@atmosphere.uniforms.space.fg2.value =	@atmosphere.g * @atmosphere.g
		@atmosphere.uniforms.space.fExposure.value = @atmosphere.fExposure
		
		@renderer.render @scene, @camera
		@stats.update()
		@interval = requestAnimationFrame @render.bind @



graphic = 0
$(document).ready ->
	graphic = new GraphicEngine
	setTimeout ->
		graphic.initialize()
		graphic.render()
	, 1000