graphic = {}
assets = {}
$(document).ready ->
	assets = new AssetsManager
	setTimeout =>
		graphic = new GraphicEngine
	, 500


class GraphicEngine
	constructor: (@_) ->
		@gui = new dat.GUI

		@renderer = new THREE.WebGLRenderer
		#@renderer.shadowMapEnabled = true
		#@renderer.shadowMapType = THREE.PCFSoftShadowMap
		#@renderer.shadowMapDebug = true

		@rendererStats = new THREEx.RendererStats
		@rendererStats.domElement.style.position = 'absolute'
		@rendererStats.domElement.style.bottom = '0px'
		@rendererStats.domElement.style.left = '0px'

		@stats = new Stats
		@stats.domElement.style.position = 'absolute'
		@stats.domElement.style.top = '0px'
		@stats.domElement.style.left = '0px'
		
		@viewport = $('#viewport')
		@viewport.append @renderer.domElement
		@viewport.append @stats.domElement
		@viewport.append @rendererStats.domElement
		@clock = new THREE.Clock
		@scene = new THREE.Scene
		@sunScene = new THREE.Scene
		
		@camera = new THREE.PerspectiveCamera 75, @viewport.width() / @viewport.height(), 1, 1000
		@camera.position.set 				25, 25, 25
		@camera.up = new THREE.Vector3 		0, 1, 0
		@camera.lookAt new THREE.Vector3 	0, 25, 0
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


		@viewport.bind 'mousedown', (e) =>
			@camera.float.moving = true
			
		@viewport.bind 'mouseup', (e) =>
			@camera.float.moving = false

		@mouse =
			current: 
				x: 0
				y: 0
			previous:
				x: 0
				y: 0
		@viewport.bind 'mousemove', (e) =>
			@mouse.previous.x = @mouse.current.x
			@mouse.previous.y = @mouse.current.y
			@mouse.current.x = e.offsetX
			@mouse.current.y = e.offsetY
			dx = @mouse.current.x - @viewport.width()/2
			dy = @mouse.current.y - @viewport.height()/2
			
			@camera[@camera.mode].set_x 0.5 * dx
			@camera[@camera.mode].set_y 0.5 * dy

		@gfx = new Gfx @

		@resize()
		window.addEventListener 'resize', =>
			@resize()


		@initialize()


	resize: ->
		@camera.aspect = @viewport.width() / @viewport.height()
		@camera.updateProjectionMatrix()

		@renderer.setSize @viewport.width(), @viewport.height()
		@gfx.onResize()


	stop: ->
		cancelAnimationFrame @interval



	initialize: (options) ->
		@scene.fog = new THREE.FogExp2 0xd9b45c, 0.005
		@renderer.setClearColor 0x000000 #@scene.fog.color

		axisHelper = new THREE.AxisHelper 5
		@scene.add axisHelper
		gridHelper = new THREE.GridHelper 20, 1

		@ambientlight = new THREE.AmbientLight 0x505050
		@scene.add @ambientlight

		@sun = 
			light 		: new THREE.DirectionalLight 0xffffff, 1
			occlusion 	: new THREE.Mesh new THREE.SphereGeometry(35, 32, 32), new THREE.MeshBasicMaterial { color: 0xFFCC33 }
		@sun.light.position.x = @sun.occlusion.position.x = -100
		@sun.light.position.y = @sun.occlusion.position.y = 30
		@sun.light.position.z = @sun.occlusion.position.z = -100
		@sun.light.intensity = 0.5
		@sun.light.castShadow = true
		@sun.light.shadowMapWidth = 1024
		@sun.light.shadowMapHeight = 1024
		@sun.light.shadowDarkness = 0.75
		#@sun.light.shadowCameraVisible = true
		@sun.light.shadowCameraNear = 1
		@sun.light.shadowCameraFar = 1000
		@sun.light.shadowCameraLeft = -50
		@sun.light.shadowCameraRight = 50
		@sun.light.shadowCameraTop = 50
		@sun.light.shadowCameraBottom = -50
		@scene.add @sun.light
		@sunScene.add @sun.occlusion


		atmosphere =
			graphic: new THREE.Mesh new THREE.BoxGeometry(1000, 1000, 1000), new THREE.MeshBasicMaterial { color: 0x663300, side: THREE.BackSide }
		
		@scene.add atmosphere.graphic
		

		geometry = new THREE.PlaneGeometry(500, 500, 99, 99)
		plane =
			graphic 	: new THREE.Mesh geometry, new THREE.MeshBasicMaterial { color: 0x500050, fog: false }

		plane.graphic.rotation.x = -Math.PI/2
		plane.graphic.receiveShadow = true
		@scene.add plane.graphic


		monument =
			graphic 	: new THREE.Mesh assets.graphic.geometry.monument, assets.graphic.material.monument
		monument.graphic.rotation.x = -Math.PI/2
		monument.graphic.scale.x = 0.1
		monument.graphic.scale.y = 0.1
		monument.graphic.scale.z = 0.1
		monument.graphic.castShadow = true
		@scene.add monument.graphic


		material = MeshGrassMaterial
		@grassMaterial = material
		geometry = new THREE.Geometry
		g1 = new THREE.PlaneGeometry 2, 6, 1, 1
		for i in [0..10] by 1
			for j in [0..10] by 1
				mesh = new THREE.Mesh g1
				mesh.position.set i * 2.5 - 50, 3, j * 2.5
				mesh.rotation.y = Math.PI * Math.random()
				mesh.updateMatrix()
				geometry.merge mesh.geometry, mesh.matrix
		mesh = new THREE.Mesh geometry, material
		for i in [0..mesh.geometry.vertices.length - 1] by 2
			material.attributes.displacement.value[i] = material.attributes.displacement.value[i + 1] = Math.random()
		@scene.add mesh


		material = MeshWaterMaterial
		material.uniforms.waveMap.value = THREE.ImageUtils.loadTexture 'waveMap.png'
		@waterMaterial = material
		water = new THREE.Mesh new THREE.PlaneGeometry(512, 512, 512, 512), material
		water.position.set -256, 0, -256
		water.rotation.set -Math.PI/2, 0, 0
		@scene.add water

		@render()




	render: ->
		dt = @clock.getDelta()

		@camera.update()
		
		#lightPos = THREE.ExtrasUtils_projectOnScreen @viewport.width(), @viewport.height(), @sun.light, @camera
		#@gfx.godrays1GeneratePass.uniforms.fX.value = lightPos.x / @viewport.width()
		#@gfx.godrays1GeneratePass.uniforms.fY.value = 1 - lightPos.y / @viewport.height()
		if @waterMaterial.uniforms.time.value >= 1 then @waterMaterial.uniforms.time.value = 0 else @waterMaterial.uniforms.time.value += dt/5
		if @grassMaterial.uniforms.time.value >= 1 then @grassMaterial.uniforms.time.value = 0 else @grassMaterial.uniforms.time.value += dt/5
		
		#@gfx.render()
		
		@renderer.render @scene, @camera

		@rendererStats.update @renderer
		@stats.update()

		#setTimeout =>
		#	@render()
		#, 500
		@interval = requestAnimationFrame @render.bind @



class Gfx
	constructor: (@_) ->		
		@settings 	= @_.gui.addFolder('Gfx')
		@settings.open()
		
		@composer 	= new THREE.EffectComposer @_.renderer, undefined

		@RT 		= {}
		@effects 	= []
		
		@add new GfxRenderRT 			@
		@add new GfxDepthRT 			@
		@add new GfxGodraysRT 			@
		@add new GfxHDRRT 				@
		@add new GfxBloomRT 			@
		@add new GfxInput 				@
		#@add new GfxSSAO 				@
		#@add new GfxMotionBlur 			@
		#@add new GfxAddHDR 				@
		#@add new GfxAddBloom 			@
		#@add new GfxAddGodrays 			@
		#@add new GfxBleach 				@
		#@add new GfxHueSaturation 		@
		#@add new GfxBrightnessContrast 	@
		#@add new GfxColorCorrection 	@
		#@add new GfxColorify 			@
		#@add new GfxGammaCorrection 	@
		#@add new GfxDOF 				@
		#@add new GfxVignette 			@
		@add new GfxOutput 				@


	add: (v) ->
		@effects.push v


	onResize: ->
		for v in @effects 
			if v.onResize then v.onResize()


	render: ->
		for v in @effects 
			if v.beforeRender then v.beforeRender()
		
		@composer.render()
		
		for v in @effects 
			if v.afterRender then v.afterRender()









class GfxRenderRT
	constructor: (@_) ->
		@_.RT.render = new THREE.WebGLRenderTarget @_._.viewport.width()/1, @_._.viewport.height()/1, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBufer: false }
		@data =
			FXAA: new THREE.ShaderPass THREE.FXAAShader
		@data.FXAA.uniforms['resolution'].value.set( 1/@_._.viewport.width(), 1/@_._.viewport.height() )
		@_.composer.addPass new THREE.RenderPass @_._.scene, @_._.camera
		@_.composer.addPass @data.FXAA
		@_.composer.addPass new THREE.SavePass @_.RT.render


class GfxDepthRT
	constructor: (@_) ->
		@_.RT.depth = new THREE.WebGLRenderTarget @_._.viewport.width()/1, @_._.viewport.height()/1, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBufer: false }
		@data =
			far:
				value: 150
				temp: 0
		@_.composer.addPass new THREE.RenderPass @_._.scene, @_._.camera, new THREE.MeshDepthMaterial
		@_.composer.addPass new THREE.SavePass @_.RT.depth

	beforeRender: ->
		@data.far.temp = @_._.camera.far
		@_._.camera.far = @data.far.value

	afterRender: ->
		@_._.camera.far = @data.far.temp


class GfxGodraysRT
	constructor: (@_) ->
		@_.RT.godrays = new THREE.WebGLRenderTarget @_._.viewport.width()/8, @_._.viewport.height()/8, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBufer: false }
		@data =
			occlusion:
				RT:
					sun 		: new THREE.WebGLRenderTarget @_._.viewport.width()/8, @_._.viewport.height()/8, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBufer: false }
					occlusions 	: new THREE.WebGLRenderTarget @_._.viewport.width()/2, @_._.viewport.height()/2, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBufer: false }
				pass: 
					sun 		: new THREE.RenderPass @_._.sunScene, @_._.camera
					occlusions 	: new THREE.RenderPass @_._.scene, @_._.camera, new THREE.MeshBasicMaterial { color: 0xffffff, fog: false }
					generate 	: new THREE.ShaderPass THREE.OcclusionGenerateShader
				blur:
					hblur 		: new THREE.ShaderPass THREE.HorizontalBlurShader
					vblur 		: new THREE.ShaderPass THREE.VerticalBlurShader
			generate:
				pass 			: new THREE.ShaderPass THREE.GodRays2.Godrays
				blur:
					hblur 		: new THREE.ShaderPass THREE.HorizontalBlurShader
					vblur 		: new THREE.ShaderPass THREE.VerticalBlurShader
		@data.occlusion.blur.hblur.uniforms.h.value = 2 / @_._.viewport.width()
		@data.occlusion.blur.vblur.uniforms.v.value = 2 / @_._.viewport.height()
		@data.generate.blur.hblur.uniforms.h.value 	= 2 / @_._.viewport.width()
		@data.generate.blur.vblur.uniforms.v.value 	= 2 / @_._.viewport.height()
		@data.occlusion.pass.generate.uniforms.tDiffuse2.value = @data.occlusion.RT.occlusions
		@_.composer.addPass @data.occlusion.pass.sun
		@_.composer.addPass new THREE.SavePass @data.occlusion.RT.sun
		@_.composer.addPass @data.occlusion.pass.occlusions
		@_.composer.addPass new THREE.SavePass @data.occlusion.RT.occlusions
		@_.composer.addPass new THREE.TexturePass @data.occlusion.RT.sun
		@_.composer.addPass @data.occlusion.pass.generate
		@_.composer.addPass @data.occlusion.blur.hblur
		@_.composer.addPass @data.occlusion.blur.vblur
		@_.composer.addPass @data.generate.pass
		@_.composer.addPass @data.generate.blur.hblur
		@_.composer.addPass @data.generate.blur.vblur
		@_.composer.addPass new THREE.SavePass @_.RT.godrays
		@_.settings.godrays = @_.settings.addFolder 'godrays'
		@_.settings.godrays.add(@data.occlusion.blur.hblur.uniforms.h, 'value', 0, 0.01).name('occlusion.blur.h')
		@_.settings.godrays.add(@data.occlusion.blur.vblur.uniforms.v, 'value', 0, 0.01).name('occlusion.blur.v')
		@_.settings.godrays.add(@data.generate.blur.hblur.uniforms.h, 'value', 0, 0.01).name('rays.blur.h')
		@_.settings.godrays.add(@data.generate.blur.vblur.uniforms.v, 'value', 0, 0.01).name('rays.blur.v')


class GfxHDRRT
	constructor: (@_) ->
		@_.RT.hdr = new THREE.WebGLRenderTarget @_._.viewport.width()/4, @_._.viewport.height()/4, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBufer: false }
		@data =
			threshold: 		new THREE.ShaderPass THREE.ThresholdShader
			hblur: 			new THREE.ShaderPass THREE.HorizontalBlurShader
			vblur: 			new THREE.ShaderPass THREE.VerticalBlurShader
		@data.hblur.uniforms.h.value = 0.003
		@data.vblur.uniforms.v.value = 0.003
		@_.composer.addPass new THREE.TexturePass @_.RT.render
		@_.composer.addPass @data.threshold
		@_.composer.addPass @data.hblur
		@_.composer.addPass @data.vblur
		@_.composer.addPass new THREE.SavePass @_.RT.hdr
		@_.settings.hdr = @_.settings.addFolder 'HDR'
		@_.settings.hdr.add( @data.threshold.uniforms.threshold, 'value' ).name 'bloom.threshold'
		@_.settings.hdr.add( @data.hblur.uniforms.h, 'value' ).name 'bloom.hblur'
		@_.settings.hdr.add( @data.vblur.uniforms.v, 'value' ).name 'bloom.vblur'


class GfxBloomRT
	constructor: (@_) ->
		@_.RT.bloom = new THREE.WebGLRenderTarget @_._.viewport.width()/1, @_._.viewport.height()/1, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBufer: false }
		@data =
			blur:
				hblur: new THREE.ShaderPass THREE.HorizontalBlurShader
				vblur: new THREE.ShaderPass THREE.VerticalBlurShader
		@data.blur.hblur.uniforms.h.value = 0.005
		@data.blur.vblur.uniforms.v.value = 0.005
		@_.composer.addPass new THREE.TexturePass @_.RT.render
		@_.composer.addPass @data.blur.hblur
		@_.composer.addPass @data.blur.vblur
		@_.composer.addPass new THREE.SavePass @_.RT.bloom


class GfxInput
	constructor: (@_) ->
		@_.composer.addPass new THREE.TexturePass @_.RT.render
		


class GfxSSAO
	constructor: (@_) ->
		@data =
			pass: new THREE.ShaderPass THREE.SSAOShader
		@data.pass.uniforms[ 'tDepth' ].value = @_.RT.depth
		@data.pass.uniforms[ 'onlyAO' ].value = 1
		@data.pass.uniforms[ 'size' 		].value = new THREE.Vector2( @_._.viewport.width(), @_._.viewport.height() )
		@data.pass.uniforms[ 'cameraFar' 	].value = 150
		@data.pass.uniforms[ 'aoClamp' 		].value = 0.5
		@data.pass.uniforms[ 'lumInfluence' ].value = 0.5
		@_.composer.addPass @data.pass
		@_.settings.SSAO = @_.settings.addFolder 'SSAO'
		@_.settings.SSAO.add( @data.pass.uniforms.cameraFar, 'value' ).name 'cameraFar'
		@_.settings.SSAO.add( @data.pass.uniforms.aoClamp, 'value' ).name 'aoClamp'
		@_.settings.SSAO.add( @data.pass.uniforms.lumInfluence, 'value' ).name 'lumInfluence'
		

class GfxAddGodrays
	constructor: (@_) ->
		@data =
			pass: new THREE.ShaderPass THREE.GodRays2.Additive
		@data.pass.uniforms[ 'tAdd' ].value = @_.RT.godrays
		@data.pass.uniforms[ 'fCoeff' ].value = 1
		@_.settings.godrays.add(@data.pass.uniforms.fCoeff, 'value', 0, 10).name('add')
		@_.settings.godrays.add(@data.pass, 'enabled')
		@_.composer.addPass @data.pass
		
		
class GfxAddHDR
	constructor: (@_) ->
		@data =
			pass: new THREE.ShaderPass THREE.HDRBloomAddShader
			pass2: new THREE.ShaderPass THREE.GodRays2.Additive
		@data.pass.uniforms[ 'tAdd' ].value = @_.RT.hdr
		@data.pass.uniforms[ 'fCoeff' ].value = 1
		@data.pass2.uniforms[ 'tAdd' ].value = @_.RT.hdr
		@data.pass2.uniforms[ 'fCoeff' ].value = 1
		@_.composer.addPass @data.pass
		@_.composer.addPass @data.pass2
		@_.settings.hdr.add( @data.pass.uniforms.fCoeff, 'value' ).name 'HDRAdd.Coeff'
		@_.settings.hdr.add( @data.pass.uniforms.fCoeff, 'value' ).name 'Additive.Coeff'


class GfxAddBloom
	constructor: (@_) ->
		@data =
			pass: new THREE.ShaderPass THREE.GodRays2.Additive		
		@data.pass.uniforms[ 'tAdd' ].value = @_.RT.bloom
		@data.pass.uniforms[ 'fCoeff' ].value = 1.5
		@_.composer.addPass @data.pass


		
class GfxBleach
	constructor: (@_) ->
		@data =
			pass: new THREE.ShaderPass THREE.BleachBypassShader
		@data.pass.uniforms[ 'opacity' ].value = 0
		@_.composer.addPass @data.pass


class GfxHueSaturation
	constructor: (@_) ->
		@data =
			pass: new THREE.ShaderPass THREE.HueSaturationShader
		@data.pass.uniforms[ 'hue' ].value = 0.5
		@data.pass.uniforms[ 'saturation' ].value = 0.5
		@_.composer.addPass @data.pass
		

class GfxBrightnessContrast
	constructor: (@_) ->
		@data =
			pass: new THREE.ShaderPass THREE.BrightnessContrastShader
		@data.pass.uniforms[ 'brightness' ].value = 0
		@data.pass.uniforms[ 'contrast' ].value = 0
		@_.composer.addPass @data.pass
		

class GfxColorCorrection
	constructor: (@_) ->
		@data =
			pass: new THREE.ShaderPass THREE.ColorCorrectionShader
		@data.pass.uniforms['powRGB'].value.set 1, 1, 1
		@data.pass.uniforms['mulRGB'].value.set 1, 1, 1
		@_.composer.addPass @data.pass


class GfxColorify
	constructor: (@_) ->
		@data =
			pass: new THREE.ShaderPass THREE.ColorifyShader
		@data.pass.uniforms['color'].value = new THREE.Color( 0xff0000 )
		@data.pass.enabled = false
		@_.composer.addPass @data.pass


class GfxGammaCorrection
	constructor: (@_) ->
		@data =
			pass: new THREE.ShaderPass THREE.GammaCorrectionShader
		@data.pass.uniforms['gamma'].value = 1.5
		@_.composer.addPass @data.pass


class GfxVignette
	constructor: (@_) ->
		@data =
			pass: new THREE.ShaderPass THREE.VignetteShader
		@data.pass.uniforms['offset'].value = 1.0
		@data.pass.uniforms['darkness'].value = 1.0
		@_.composer.addPass @data.pass


class GfxDOF
	constructor: (@_) ->
		@data =
			pass: new THREE.ShaderPass THREE.BokehShader
		@data.pass.uniforms[ 'tDepth' ].value = @_.RT.depth
		@data.pass.uniforms[ 'aspect' ].value = @_._.viewport.width()/@_._.viewport.height()
		@data.pass.uniforms[ 'focus'	].value = 1.0
		@data.pass.uniforms[ 'aperture'	].value = 0.025
		@data.pass.uniforms[ 'maxblur'	].value = 1.0
		@_.composer.addPass @data.pass
		

class GfxMotionBlur
	constructor: (@_) ->
		@data =
			mCurrent 	: new THREE.Matrix4
			mPrev 		: new THREE.Matrix4
			tmpArray 	: new THREE.Matrix4
			pass 		: new THREE.ShaderPass THREE.MotionBlurShader
		@data.pass.uniforms['tDepth'].value = @_.RT.depth
		@_.composer.addPass @data.pass

	beforeRender: ->
		@data.tmpArray.copy @_._.camera.matrixWorldInverse
		@data.tmpArray.multiply @_._.camera.projectionMatrix
		@data.mCurrent.getInverse @data.tmpArray
		@data.pass.uniforms.viewProjectionInverseMatrix.value.copy 	@data.mCurrent
		@data.pass.uniforms.previousViewProjectionMatrix.value.copy @data.mPrev
		@data.mPrev.copy @data.tmpArray


class GfxOutput
	constructor: (@_) ->
		@data =
			pass : new THREE.ShaderPass THREE.CopyShader
		@data.pass.renderToScreen = true
		@_.composer.addPass @data.pass









class AssetsManager
	constructor: (options) ->
		@graphic =
			model: 		{}
			material: 	{}
			geometry: 	{}
			textures:	{}
			images:		{}

		@loadModel 'monument'
		@loadGeometry 'monument'
		@loadMaterial 'monument'


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
			else if options.type.bin
				loader = new THREE.BinaryLoader true
				loader.load  'assets/graphic/geometry/'+url+'/geometry.js', (geometry, materials) =>
					@graphic.geometry[url] = geometry

	loadTexture: (url) ->
		@graphic.textures[url] = THREE.ImageUtils.loadTexture 'assets/graphic/textures/' + url + '.png'





THREE.ExtrasUtils_projectOnScreen = (width, height, object, camera) ->
	widthHalf = width / 2
	heightHalf = height / 2

	vector = new THREE.Vector3
	vector.setFromMatrixPosition( object.matrixWorld ).project(camera)

	vector.x = ( vector.x * widthHalf ) + widthHalf
	vector.y = - ( vector.y * heightHalf ) + heightHalf

	return vector