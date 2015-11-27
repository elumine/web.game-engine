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
		@renderer.shadowMapEnabled = true
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
		@viewScene = new THREE.Scene
		count = { x: 5, y: 6 }
		@view = []
		for j in [0..count.y - 1] by 1
			@view[j] = []
			for i in [0..count.x - 1] by 1
				@view[j][i] = new THREE.Mesh new THREE.PlaneGeometry(@viewport.width()/2, @viewport.height()/2, 1, 1), new THREE.MeshBasicMaterial
				@view[j][i].position.set i * (@viewport.width()/2), j * (@viewport.height()/2), 0
				@viewScene.add @view[j][i]
		@viewCamera = new THREE.OrthographicCamera( @viewport.width() / - 2, @viewport.width() / 2, @viewport.height() / 2, @viewport.height() / - 2, 1, 1000 )
		@viewCamera.position.set @viewport.width()/2, 0, 1
		@viewCamera.scroll =
			x: 0
			y: 0
		@viewCamera.setView = =>
			@viewCamera.position.x =  @viewport.width()/4 + @viewport.width() * @viewCamera.scroll.x
			@viewCamera.position.y =  @viewport.height()/4 + @viewport.height() * @viewCamera.scroll.y
		@viewCamera.setView()
		@gui.add(@viewCamera.scroll, 'x', 0, 5).name('cam.scroll.x').onChange (value) => @viewCamera.setView()
		@gui.add(@viewCamera.scroll, 'y', 0, 5).name('cam.scroll.y').onChange (value) => @viewCamera.setView()


		@viewport.append @renderer.domElement
		@viewport.append @stats.domElement
		@viewport.append @rendererStats.domElement
		@clock = new THREE.Clock
		@scene = new THREE.Scene
		@oscene = new THREE.Scene
		
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

		@gfx = new GFx @

		@resize()
		window.addEventListener 'resize', =>
			@resize()


		@initialize()


	resize: ->
		@camera.aspect = @viewport.width() / @viewport.height()
		@camera.updateProjectionMatrix()

		@renderer.setSize @viewport.width(), @viewport.height()
		@gfx.resize()


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
		@oscene.add @sun.occlusion


		atmosphere =
			graphic: new THREE.Mesh new THREE.BoxGeometry(1000, 1000, 1000), new THREE.MeshBasicMaterial { color: 0x663300, side: THREE.BackSide }
			occlusion: new THREE.Mesh new THREE.BoxGeometry(1000, 1000, 1000), new THREE.MeshBasicMaterial { color: 0x000000, side: THREE.BackSide }

		@scene.add atmosphere.graphic
		@oscene.add atmosphere.occlusion
		

		geometry = new THREE.PlaneGeometry(500, 500, 99, 99)
		plane =
			graphic 	: new THREE.Mesh geometry, new THREE.MeshBasicMaterial { color: 0xff4466 }
			occlusion 	: new THREE.Mesh geometry, new THREE.MeshBasicMaterial { color: 0x000000 }
		plane.graphic.rotation.x = plane.occlusion.rotation.x = -Math.PI/2
		plane.graphic.receiveShadow = true
		@scene.add plane.graphic
		@oscene.add plane.occlusion



		monument =
			graphic 	: new THREE.Mesh assets.graphic.geometry.monument, assets.graphic.material.monument
			occlusion 	: new THREE.Mesh assets.graphic.geometry.monument, new THREE.MeshBasicMaterial { color: 0x000000 }
		monument.graphic.rotation.x = monument.occlusion.rotation.x = -Math.PI/2
		monument.graphic.scale.x = monument.occlusion.scale.x = 0.1
		monument.graphic.scale.y = monument.occlusion.scale.y = 0.1
		monument.graphic.scale.z = monument.occlusion.scale.z = 0.1
		monument.graphic.castShadow = true
		@scene.add monument.graphic
		@oscene.add monument.occlusion 




		boxGeo = new THREE.BoxGeometry(10, 2, 10)
		for i in [0..10] by 1
			for j in [0..10] by 1
				box = 
					graphic : new THREE.Mesh boxGeo
					occlusion: new THREE.Mesh boxGeo, new THREE.MeshBasicMaterial { color: 0x000000 }

				box.graphic.position.set 	i * 15 - 75, 1, j * 15 - 75
				box.occlusion.position.set 	i * 15 - 75, 1, j * 15 - 75

				@scene.add box.graphic
				@oscene.add box.occlusion 


		@render()




	render: ->
		#@camera.update()
		
		lightPos = THREE.ExtrasUtils_projectOnScreen @viewport.width(), @viewport.height(), @sun.light, @camera
		@gfx.godrays1GeneratePass.uniforms.fX.value = lightPos.x / @viewport.width()
		@gfx.godrays1GeneratePass.uniforms.fY.value = 1 - lightPos.y / @viewport.height()
		
		@gfx.render()
		
		@rendererStats.update @renderer
		@stats.update()

		@renderer.render @viewScene, @viewCamera

		setTimeout =>
			@render()
		, 1000
		#@interval = requestAnimationFrame @render.bind @




class GFx
	constructor: (@_) ->
		folder = 
			gfx: @_.gui.addFolder 'GFx'
		folder.gfx.open()

		@renderTarget =
			scene 	: new THREE.WebGLRenderTarget @_.viewport.width()/1, @_.viewport.height()/1, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBufer: false }
			FXAA 	: new THREE.WebGLRenderTarget @_.viewport.width()/1, @_.viewport.height()/1, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBufer: false }
			DOF 	: new THREE.WebGLRenderTarget @_.viewport.width()/1, @_.viewport.height()/1, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBufer: false }
			motionblur 	: new THREE.WebGLRenderTarget @_.viewport.width()/1, @_.viewport.height()/1, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBufer: false }
			
			HDR 	: new THREE.WebGLRenderTarget @_.viewport.width()/1, @_.viewport.height()/1, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBufer: false }
			hue_sat 	: new THREE.WebGLRenderTarget @_.viewport.width()/1, @_.viewport.height()/1, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBufer: false }
			bleach 	: new THREE.WebGLRenderTarget @_.viewport.width()/1, @_.viewport.height()/1, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBufer: false }
			luminosity 	: new THREE.WebGLRenderTarget @_.viewport.width()/1, @_.viewport.height()/1, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBufer: false }
			
			bright_cont 	: new THREE.WebGLRenderTarget @_.viewport.width()/1, @_.viewport.height()/1, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBufer: false }
			colcor 	: new THREE.WebGLRenderTarget @_.viewport.width()/1, @_.viewport.height()/1, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBufer: false }
			colorify 	: new THREE.WebGLRenderTarget @_.viewport.width()/1, @_.viewport.height()/1, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBufer: false }
			vignette 	: new THREE.WebGLRenderTarget @_.viewport.width()/1, @_.viewport.height()/1, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBufer: false }
			gamma 	: new THREE.WebGLRenderTarget @_.viewport.width()/1, @_.viewport.height()/1, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBufer: false }
			
			depth 				: new THREE.WebGLRenderTarget @_.viewport.width()/1, @_.viewport.height()/1, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBufer: false }
			SSAO0 				: new THREE.WebGLRenderTarget @_.viewport.width()/1, @_.viewport.height()/1, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBufer: false }
			SSAO1 				: new THREE.WebGLRenderTarget @_.viewport.width()/1, @_.viewport.height()/1, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBufer: false }
		
			occlusion 			: new THREE.WebGLRenderTarget @_.viewport.width()/4, @_.viewport.height()/4, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBufer: false }
			blur 				: new THREE.WebGLRenderTarget @_.viewport.width()/4, @_.viewport.height()/4, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBufer: false }
			godrays1Generate 	: new THREE.WebGLRenderTarget @_.viewport.width()/4, @_.viewport.height()/4, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBufer: false }
			godrays1Add 		: new THREE.WebGLRenderTarget @_.viewport.width()/1, @_.viewport.height()/1, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBufer: false }
			
			bloomGenerate 		: new THREE.WebGLRenderTarget @_.viewport.width()/4, @_.viewport.height()/4, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBufer: false }
			bloomAdd 			: new THREE.WebGLRenderTarget @_.viewport.width()/1, @_.viewport.height()/1, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBufer: false }
		
		@_.view[0][0].material.map = @renderTarget.scene
		@_.view[0][1].material.map = @renderTarget.DOF
		@_.view[0][2].material.map = @renderTarget.motionblur
		@_.view[0][3].material.map = @renderTarget.FXAA

		@_.view[1][0].material.map = @renderTarget.HDR
		@_.view[1][1].material.map = @renderTarget.gamma
		@_.view[1][2].material.map = @renderTarget.colcor
		@_.view[1][3].material.map = @renderTarget.colorify
		
		@_.view[2][0].material.map = @renderTarget.bright_cont
		@_.view[2][1].material.map = @renderTarget.hue_sat
		@_.view[2][2].material.map = @renderTarget.bleach
		@_.view[2][3].material.map = @renderTarget.luminosity
		@_.view[2][4].material.map = @renderTarget.vignette

		@_.view[3][0].material.map = @renderTarget.depth
		@_.view[3][1].material.map = @renderTarget.SSAO0
		@_.view[3][2].material.map = @renderTarget.SSAO1

		@_.view[4][0].material.map = @renderTarget.occlusion
		@_.view[4][1].material.map = @renderTarget.blur
		@_.view[4][2].material.map = @renderTarget.godrays1Generate
		@_.view[4][3].material.map = @renderTarget.godrays1Add

		@_.view[5][0].material.map = @renderTarget.bloomGenerate
		@_.view[5][1].material.map = @renderTarget.bloomAdd

		@composer =
			scene 		: new THREE.EffectComposer @_.renderer, @renderTarget.scene
			FXAA 		: new THREE.EffectComposer @_.renderer, @renderTarget.FXAA
			DOF 		: new THREE.EffectComposer @_.renderer, @renderTarget.DOF
			motionblur 		: new THREE.EffectComposer @_.renderer, @renderTarget.motionblur

			HDR 		: new THREE.EffectComposer @_.renderer, @renderTarget.HDR
			hue_sat 	: new THREE.EffectComposer @_.renderer, @renderTarget.hue_sat
			bleach 		: new THREE.EffectComposer @_.renderer, @renderTarget.bleach
			luminosity 	: new THREE.EffectComposer @_.renderer, @renderTarget.luminosity
			
			bright_cont : new THREE.EffectComposer @_.renderer, @renderTarget.bright_cont
			colcor 		: new THREE.EffectComposer @_.renderer, @renderTarget.colcor
			colorify	: new THREE.EffectComposer @_.renderer, @renderTarget.colorify
			vignette	: new THREE.EffectComposer @_.renderer, @renderTarget.vignette
			gamma	: new THREE.EffectComposer @_.renderer, @renderTarget.gamma

			SSAO0 		: new THREE.EffectComposer @_.renderer, @renderTarget.SSAO0
			SSAO1 		: new THREE.EffectComposer @_.renderer, @renderTarget.SSAO1

			occlusion 			: new THREE.EffectComposer @_.renderer, @renderTarget.occlusion
			blur 				: new THREE.EffectComposer @_.renderer, @renderTarget.blur
			godrays1Generate 	: new THREE.EffectComposer @_.renderer, @renderTarget.godrays1Generate
			godrays1Add 		: new THREE.EffectComposer @_.renderer, @renderTarget.godrays1Add
			
			bloomGenerate 		: new THREE.EffectComposer @_.renderer, @renderTarget.bloomGenerate
			bloomAdd 			: new THREE.EffectComposer @_.renderer, @renderTarget.bloomAdd
		


		copyPass = new THREE.ShaderPass THREE.CopyShader




		renderPass = new THREE.RenderPass @_.scene, @_.camera
		@composer.scene.addPass renderPass
		@composer.scene.addPass copyPass

		


		FXAAPass = new THREE.ShaderPass THREE.FXAAShader
		FXAAPass.uniforms['resolution'].value.set( 1/@_.viewport.width(), 1/@_.viewport.height() )
		@composer.FXAA.addPass new THREE.TexturePass @renderTarget.scene
		@composer.FXAA.addPass FXAAPass
		@composer.FXAA.addPass copyPass





		DOFPass = new THREE.ShaderPass THREE.BokehShader
		@composer.DOF.addPass new THREE.TexturePass @renderTarget.scene
		@composer.DOF.addPass DOFPass
		@composer.DOF.addPass copyPass
		DOFPass.uniforms[ 'tDepth' ].value = @renderTarget.depth
		DOFPass.uniforms[ 'aspect' ].value = @_.viewport.width()/@_.viewport.height()
		folder.DOF = folder.gfx.addFolder 'DOF'
		folder.DOF.add(DOFPass.uniforms.focus, 'value').name('focus')
		folder.DOF.add(DOFPass.uniforms.aperture, 'value').name('aperture')
		folder.DOF.add(DOFPass.uniforms.maxblur, 'value').name('maxblur')




		#motionblur
		@motionblur =
			mCurrent 	: new THREE.Matrix4()
			mPrev 		: new THREE.Matrix4()
			tmpArray 	: new THREE.Matrix4()
		@motionblur.motionblurPass = new THREE.ShaderPass THREE.MotionBlurShader
		@motionblur.motionblurPass.uniforms['tDepth'].value = @renderTarget.depth
		@composer.motionblur.addPass new THREE.TexturePass @renderTarget.scene
		@composer.motionblur.addPass @motionblur.motionblurPass
		@composer.motionblur.addPass copyPass
		folder.motionblur = folder.gfx.addFolder 'motionblur'
		folder.motionblur.add(@motionblur.motionblurPass.uniforms.velocityFactor, 'value').name('velocityFactor')

		

		#HDR
		HDR =
			p1: new THREE.ShaderPass THREE.ThresholdShader
			p2: new THREE.ShaderPass THREE.HorizontalBlurShader
			p3: new THREE.ShaderPass THREE.VerticalBlurShader
			p4: new THREE.ShaderPass THREE.GodRays2.Additive
			temp1: new THREE.WebGLRenderTarget @_.viewport.width()/2, @_.viewport.height()/2, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBufer: false }
		HDR.p2.uniforms.h.value = 2 / @_.viewport.height()
		HDR.p3.uniforms.v.value = 2 / @_.viewport.width()
		HDR.p4.uniforms.tAdd.value = HDR.temp1
		@composer.HDR.addPass new THREE.TexturePass @renderTarget.scene
		@composer.HDR.addPass HDR.p1
		@composer.HDR.addPass HDR.p2
		@composer.HDR.addPass HDR.p3
		@composer.HDR.addPass new THREE.SavePass HDR.temp1
		@composer.HDR.addPass new THREE.TexturePass @renderTarget.scene
		@composer.HDR.addPass HDR.p4
		@composer.HDR.addPass copyPass
		folder.HDR = folder.gfx.addFolder 'HDR'
		folder.HDR.add(HDR.p1.uniforms.threshold, 'value', 0, 1).name('threshold')
		folder.HDR.add(HDR.p2.uniforms.h, 'value', 0, 0.01).name('hblur')
		folder.HDR.add(HDR.p3.uniforms.v, 'value', 0, 0.01).name('vblur')
		


		#hue_sat
		hue_satPass = new THREE.ShaderPass THREE.HueSaturationShader
		hue_satPass.uniforms[ 'hue' ].value = 0.5
		hue_satPass.uniforms[ 'saturation' ].value = 0.5
		@composer.hue_sat.addPass new THREE.TexturePass @renderTarget.scene
		@composer.hue_sat.addPass hue_satPass
		@composer.hue_sat.addPass copyPass
		folder.hue_sat = folder.gfx.addFolder 'hue, saturation'
		folder.hue_sat.add(hue_satPass.uniforms.hue, 'value').name('hue')
		folder.hue_sat.add(hue_satPass.uniforms.saturation, 'value').name('saturation')
		




		#bleach
		bleachPass = new THREE.ShaderPass THREE.BleachBypassShader
		bleachPass.uniforms[ 'opacity' ].value = 0.5
		@composer.bleach.addPass new THREE.TexturePass @renderTarget.scene
		@composer.bleach.addPass bleachPass
		@composer.bleach.addPass copyPass
		folder.bleach = folder.gfx.addFolder 'bleach'
		folder.bleach.add(bleachPass.uniforms.opacity, 'value').name('opacity')
		




		#luminosity
		luminosityPass = new THREE.ShaderPass THREE.LuminosityShader
		@composer.luminosity.addPass new THREE.TexturePass @renderTarget.scene
		@composer.luminosity.addPass luminosityPass
		@composer.luminosity.addPass copyPass
		folder.luminosity = folder.gfx.addFolder 'luminosity'




		#bright_cont
		bright_contPass = new THREE.ShaderPass THREE.BrightnessContrastShader
		bright_contPass.uniforms[ 'brightness' ].value = 0.5
		bright_contPass.uniforms[ 'contrast' ].value = 0.5
		@composer.bright_cont.addPass new THREE.TexturePass @renderTarget.scene
		@composer.bright_cont.addPass bright_contPass
		@composer.bright_cont.addPass copyPass
		folder.bright_cont = folder.gfx.addFolder 'brightness, contrast'
		folder.bright_cont.add(bright_contPass.uniforms.brightness, 'value').name('brightness')
		folder.bright_cont.add(bright_contPass.uniforms.contrast, 'value').name('contrast')
		




		#colcor
		colcorPass = new THREE.ShaderPass THREE.ColorCorrectionShader
		@composer.colcor.addPass new THREE.TexturePass @renderTarget.scene
		@composer.colcor.addPass colcorPass
		@composer.colcor.addPass copyPass
		#folder.colcor = folder.gfx.addFolder 'color correction'
		#folder.colcor.add(colcorPass.uniforms.brightness, 'value').name('brightness')
		




		#colorify
		colorifyPassParams =
			color: [ 255, 255, 255 ]
		colorifyPass = new THREE.ShaderPass THREE.ColorifyShader
		@composer.colorify.addPass new THREE.TexturePass @renderTarget.scene
		@composer.colorify.addPass colorifyPass
		@composer.colorify.addPass copyPass
		folder.colorify = folder.gfx.addFolder 'colorify'
		#folder.colorify.add(colorifyPassParams, 'color').name('color')
		




		#vignette
		vignettePass = new THREE.ShaderPass THREE.VignetteShader
		@composer.vignette.addPass new THREE.TexturePass @renderTarget.scene
		@composer.vignette.addPass vignettePass
		@composer.vignette.addPass copyPass
		folder.vignette = folder.gfx.addFolder 'vignette'
		folder.vignette.add(vignettePass.uniforms.offset, 'value').name('offset')
		folder.vignette.add(vignettePass.uniforms.darkness, 'value').name('darkness')
		




		#gamma
		gammaPass = new THREE.ShaderPass THREE.GammaCorrectionShader
		@composer.gamma.addPass new THREE.TexturePass @renderTarget.scene
		@composer.gamma.addPass gammaPass
		@composer.gamma.addPass copyPass
		folder.gamma = folder.gfx.addFolder 'gamma'
		folder.gamma.add(gammaPass.uniforms.gamma, 'value').name('gamma')






		SSAO0Pass = new THREE.ShaderPass THREE.SSAOShader
		SSAO0Pass.uniforms[ 'tDepth' ].value = @renderTarget.depth
		SSAO0Pass.uniforms[ 'onlyAO' ].value = 1
		@composer.SSAO0.addPass new THREE.TexturePass @renderTarget.scene
		@composer.SSAO0.addPass SSAO0Pass
		
		SSAO1Pass = new THREE.ShaderPass THREE.SSAOShader
		SSAO1Pass.uniforms[ 'tDepth' ].value = @renderTarget.depth
		@composer.SSAO1.addPass new THREE.TexturePass @renderTarget.scene
		@composer.SSAO1.addPass SSAO1Pass
		
		folder.SSAO = folder.gfx.addFolder 'SSAO'
		folder.SSAO.add(SSAO0Pass.uniforms[ 'aoClamp' ], 'value').name('SSAO[0].aoClamp')
		folder.SSAO.add(SSAO0Pass.uniforms[ 'lumInfluence' ], 'value').name('SSAO[0].lumInfluence')
		folder.SSAO.add(SSAO1Pass.uniforms[ 'aoClamp' ], 'value').name('SSAO[1].aoClamp')
		folder.SSAO.add(SSAO1Pass.uniforms[ 'lumInfluence' ], 'value').name('SSAO[1].lumInfluence')



		
		occlusionRenderPass = new THREE.RenderPass @_.oscene, @_.camera
		@composer.occlusion.addPass occlusionRenderPass
		@composer.occlusion.addPass copyPass
	
		occlusionblur =
			params:
				h: 1
				v: 1
			hblur: new THREE.ShaderPass THREE.HorizontalBlurShader
			vblur: new THREE.ShaderPass THREE.VerticalBlurShader
		occlusionblur.hblur.uniforms.h.value = occlusionblur.params.h / @_.viewport.width()
		occlusionblur.vblur.uniforms.v.value = occlusionblur.params.v / @_.viewport.height()
		@composer.blur.addPass new THREE.TexturePass @renderTarget.occlusion
		@composer.blur.addPass occlusionblur.hblur
		@composer.blur.addPass occlusionblur.vblur
		@composer.blur.addPass copyPass
		folder.occlusionblur = folder.gfx.addFolder 'occlusionblur'
		folder.occlusionblur.add(occlusionblur.params, 'h').name('h').onChange (value) => occlusionblur.hblur.uniforms.h.value = value / @_.viewport.width()
		folder.occlusionblur.add(occlusionblur.params, 'v').name('v').onChange (value) => occlusionblur.vblur.uniforms.v.value = value / @_.viewport.height()
		
		ghblur = new THREE.ShaderPass THREE.HorizontalBlurShader
		ghblur.uniforms.h.value = 0.003
		gvblur = new THREE.ShaderPass THREE.VerticalBlurShader
		gvblur.uniforms.v.value = 0.003
		@godrays1GeneratePass = new THREE.ShaderPass THREE.GodRays2.Godrays
		@composer.godrays1Generate.addPass new THREE.TexturePass @renderTarget.blur
		@composer.godrays1Generate.addPass @godrays1GeneratePass
		@composer.godrays1Generate.addPass ghblur
		@composer.godrays1Generate.addPass gvblur
		folder.godrays1 = folder.gfx.addFolder 'godrays1'
		folder.godrays1.add(ghblur.uniforms.h, 'value').name('blur h')
		folder.godrays1.add(gvblur.uniforms.v, 'value').name('blur v')
		folder.godrays1.add(@godrays1GeneratePass.uniforms.fX, 'value').name('fX')
		folder.godrays1.add(@godrays1GeneratePass.uniforms.fY, 'value').name('fY')
		folder.godrays1.add(@godrays1GeneratePass.uniforms.fExposure, 'value').name('fExposure')
		folder.godrays1.add(@godrays1GeneratePass.uniforms.fDecay, 'value').name('fDecay')
		folder.godrays1.add(@godrays1GeneratePass.uniforms.fDensity, 'value').name('fDensity')
		folder.godrays1.add(@godrays1GeneratePass.uniforms.fWeight, 'value').name('fWeight')
		folder.godrays1.add(@godrays1GeneratePass.uniforms.fClamp, 'value').name('fClamp')

		godrays1AddPass = new THREE.ShaderPass THREE.GodRays2.Additive
		#godrays1AddPass.uniforms[ 'tDiffuse' ].value = @renderTarget.scene
		godrays1AddPass.uniforms[ 'tAdd' ].value = @renderTarget.godrays1Generate
		@composer.godrays1Add.addPass new THREE.TexturePass @renderTarget.scene
		@composer.godrays1Add.addPass godrays1AddPass







		bhblur = new THREE.ShaderPass THREE.HorizontalBlurShader
		bhblur.uniforms.h.value = 0.005
		bvblur = new THREE.ShaderPass THREE.VerticalBlurShader
		bvblur.uniforms.v.value = 0.005
		@composer.bloomGenerate.addPass new THREE.TexturePass @renderTarget.scene
		@composer.bloomGenerate.addPass bhblur
		@composer.bloomGenerate.addPass bvblur
		@composer.bloomGenerate.addPass copyPass
		folder.bloom = folder.gfx.addFolder 'bloom'
		folder.bloom.add(bhblur.uniforms.h, 'value').name('blur h')
		folder.bloom.add(bvblur.uniforms.v, 'value').name('blur v')
	
		bloomAddPass = new THREE.ShaderPass THREE.GodRays2.Additive
		#bloomAddPass.uniforms[ 'tDiffuse' ].value = @renderTarget.scene
		bloomAddPass.uniforms[ 'tAdd' ].value = @renderTarget.bloomGenerate
		@composer.bloomAdd.addPass new THREE.TexturePass @renderTarget.scene
		@composer.bloomAdd.addPass bloomAddPass



	resize: ->
		#


	render: ->
		@_.scene.overrideMaterial = new THREE.MeshDepthMaterial
		temp1 = @_.camera.far
		@_.camera.far = 100
		@_.renderer.render @_.scene, @_.camera, @renderTarget.depth
		@_.camera.far = temp1
		@_.scene.overrideMaterial = null

		@composer.scene.render()

		@composer.FXAA.render()

		@composer.DOF.render()

		
		@motionblur.tmpArray.copy( @_.camera.matrixWorldInverse )
		@motionblur.tmpArray.multiply( @_.camera.projectionMatrix )
		@motionblur.mCurrent.getInverse( @motionblur.tmpArray )
		@motionblur.motionblurPass.uniforms.viewProjectionInverseMatrix.value.copy( @motionblur.mCurrent );
		@motionblur.motionblurPass.uniforms.previousViewProjectionMatrix.value.copy( @motionblur.mPrev );
		@composer.motionblur.render()
		@motionblur.mPrev.copy( @motionblur.tmpArray );
		
		@composer.HDR.render()
		@composer.hue_sat.render()
		@composer.bleach.render()
		@composer.luminosity.render()
		
		@composer.bright_cont.render()
		@composer.colcor.render()
		@composer.colorify.render()
		@composer.vignette.render()
		@composer.gamma.render()

		@composer.SSAO0.render()
		@composer.SSAO1.render()

		@composer.occlusion.render()
		@composer.blur.render()
		@composer.godrays1Generate.render()
		@composer.godrays1Add.render()
		
		@composer.bloomGenerate.render()
		@composer.bloomAdd.render()

















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