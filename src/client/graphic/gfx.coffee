class lib.GL.Gfx

	constructor: (@_) ->
		@_.game.world.addEventListener 'ready', =>
			@_.graphic.addLoadingTask 'Gfx'
			@_.graphic.scene.addEventListener 'ready', =>
					
				@settings = @_.graphic.settings.addFolder 'gfx'
				
				@composer 	= new THREE.EffectComposer @_.graphic.renderer, undefined

				@viewport 	= @_.graphic.viewport
				@scene 		= @_.graphic.scene
				@camera 	= @_.graphic.camera

				@RT 		= {}
				@effects 	= []

				@add new GfxRenderRT 			@
				#@add new GfxDepthRT 			@
				#@add new GfxGodraysRT 			@
				@add new GfxHDRRT 				@
				@add new GfxBloomRT 			@
				@add new GfxInput 				@
				#@add new GfxSSAO 				@
				@add new GfxMotionBlur 			@
				@add new GfxAddHDR 				@
				@add new GfxAddBloom 			@
				#@add new GfxAddGodrays 			@
				#@add new GfxBleach 				@
				@add new GfxHueSaturation 		@
				@add new GfxBrightnessContrast 	@
				#@add new GfxColorCorrection 	@
				@add new GfxColorify 			@
				@add new GfxGammaCorrection 	@
				@add new GfxDOF 				@
				@add new GfxVignette 			@
				@add new GfxOutput 				@
				
				@_.graphic.removeLoadingTask 'Gfx'


	add: (v) ->
		@effects.push v


	onResize: ->
		#for k, v of @RT
		#	v.setSize @viewport.element.width() * v.scale, @viewport.element.height() * v.scale 
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
		@scale = 1
		@_.RT.render = new THREE.WebGLRenderTarget @_.viewport.element.width() * @scale, @_.viewport.element.height() * @scale, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBufer: false }
		@_.RT.render.scale = @scale
		@data =
			pass 	: new THREE.RenderPass @_.scene, @_.camera
			FXAA 	: new THREE.ShaderPass THREE.FXAAShader
		@data.FXAA.uniforms['resolution'].value.set( 1/@_.viewport.element.width(), 1/@_.viewport.element.height() )
		@_.composer.addPass @data.pass
		@_.composer.addPass @data.FXAA
		@_.composer.addPass new THREE.SavePass @_.RT.render


class GfxDepthRT
	constructor: (@_) ->
		@scale = 1
		@_.RT.depth = new THREE.WebGLRenderTarget @_.viewport.element.width() * @scale, @_.viewport.element.height() * @scale, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBufer: false }
		@_.RT.depth.scale = @scale
		@data =
			far:
				value: 150
				temp: 0
		@_.composer.addPass new THREE.RenderPass @_.scene, @_.camera, new THREE.MeshDepthMaterial
		@_.composer.addPass new THREE.SavePass @_.RT.depth

	beforeRender: ->
		@data.far.temp = @_.camera.far
		@_.camera.far = @data.far.value

	afterRender: ->
		@_.camera.far = @data.far.temp


class GfxGodraysRT
	constructor: (@_) ->
		@scale = 1/8
		@_.RT.godrays = new THREE.WebGLRenderTarget @_.viewport.element.width() * @scale, @_.viewport.element.height() * @scale, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBufer: false }
		@_.RT.godrays.scale = @scale
		@data =
			occlusion:
				RT:
					sun 		: new THREE.WebGLRenderTarget @_.viewport.element.width() * @scale, @_.viewport.element.height() * @scale, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBufer: false }
					occlusions 	: new THREE.WebGLRenderTarget @_.viewport.element.width()/2, @_.viewport.element.height()/2, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBufer: false }
				pass: 
					sun 		: new THREE.RenderPass @_.scene.sunScene, @_.camera
					occlusions 	: new THREE.RenderPass @_.scene, @_.camera, new THREE.MeshBasicMaterial { color: 0xffffff, fog: false }
					generate 	: new THREE.ShaderPass THREE.OcclusionGenerateShader
				blur:
					hblur 		: new THREE.ShaderPass THREE.HorizontalBlurShader
					vblur 		: new THREE.ShaderPass THREE.VerticalBlurShader
			generate:
				pass 			: new THREE.ShaderPass THREE.GodRays2.Godrays
				blur:
					hblur 		: new THREE.ShaderPass THREE.HorizontalBlurShader
					vblur 		: new THREE.ShaderPass THREE.VerticalBlurShader
		@data.occlusion.blur.hblur.uniforms.h.value = 2 / @_.viewport.element.width()
		@data.occlusion.blur.vblur.uniforms.v.value = 2 / @_.viewport.element.height()
		@data.generate.blur.hblur.uniforms.h.value 	= 2 / @_.viewport.element.width()
		@data.generate.blur.vblur.uniforms.v.value 	= 2 / @_.viewport.element.height()
		@data.occlusion.pass.generate.uniforms.tDiffuse2.value = @data.occlusion.RT.occlusions
		@_.composer.addPass @data.occlusion.pass.sun
		@_.composer.addPass new THREE.SavePass @data.occlusion.RT.sun
		@_.composer.addPass @data.occlusion.pass.occlusions
		@_.composer.addPass new THREE.SavePass @data.occlusion.RT.occlusion
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

	onResize: ->
		@data.occlusion.RT.occlusions.setSize @_.viewport.element.width()/2, @_.viewport.element.height()/2


class GfxHDRRT
	constructor: (@_) ->
		@scale = 1/4
		@_.RT.hdr = new THREE.WebGLRenderTarget @_.viewport.element.width() * @scale, @_.viewport.element.height() * @scale, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBufer: false }
		@_.RT.hdr.scale = @scale
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
		@data.threshold.uniforms.threshold.value = 0.9
		@_.settings.hdr = @_.settings.addFolder 'HDR'
		@_.settings.hdr.add( @data.threshold.uniforms.threshold, 'value' ).name 'HDRRT.threshold'
		@_.settings.hdr.add( @data.hblur.uniforms.h, 'value' ).name 'HDRRT.hblur'
		@_.settings.hdr.add( @data.vblur.uniforms.v, 'value' ).name 'HDRRT.vblur'
		@_.composer.addPass new THREE.TexturePass @_.RT.hrd

class GfxBloomRT
	constructor: (@_) ->
		@scale = 1/4
		@_.RT.bloom = new THREE.WebGLRenderTarget @_.viewport.element.width() * @scale, @_.viewport.element.height() * @scale, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBufer: false }
		@_.RT.bloom.scale = @scale
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
		@_.settings.bloom = @_.settings.addFolder 'Bloom'


class GfxInput
	constructor: (@_) ->
		pass = new THREE.TexturePass @_.RT.render
		@_.composer.addPass pass
		


class GfxSSAO
	constructor: (@_) ->
		@data =
			pass: new THREE.ShaderPass THREE.SSAOShader
		@data.pass.uniforms[ 'tDepth' ].value = @_.RT.depth
		@data.pass.uniforms[ 'onlyAO' ].value = 1
		@data.pass.uniforms[ 'size' 		].value = new THREE.Vector2( @_.viewport.element.width(), @_.viewport.element.height() )
		@data.pass.uniforms[ 'cameraFar' 	].value = 150
		@data.pass.uniforms[ 'aoClamp' 		].value = 0.5
		@data.pass.uniforms[ 'lumInfluence' ].value = 0.5
		@_.composer.addPass @data.pass
		@_.settings.SSAO = @_.settings.addFolder 'SSAO'
		@_.settings.SSAO.add( @data.pass.uniforms.cameraFar, 'value' ).name 'cameraFar'
		@_.settings.SSAO.add( @data.pass.uniforms.aoClamp, 'value' ).name 'aoClamp'
		@_.settings.SSAO.add( @data.pass.uniforms.lumInfluence, 'value' ).name 'lumInfluence'

	onResize: ->
		@data.pass.uniforms[ 'size' ].value = new THREE.Vector2( @_.viewport.element.width(), @_.viewport.element.height() )
		

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
		@data.pass.uniforms[ 'fCoeff' ].value = 0.5
		@data.pass2.uniforms[ 'tAdd' ].value = @_.RT.hdr
		@data.pass2.uniforms[ 'fCoeff' ].value = 1
		@_.composer.addPass @data.pass
		@_.composer.addPass @data.pass2
		@_.settings.hdr.add( @data.pass2, 'enabled' ).name 'enabled'
		@_.settings.hdr.add( @data.pass.uniforms.fCoeff, 'value' ).name 'AddHDR.Coeff'
		@_.settings.hdr.add( @data.pass2.uniforms.fCoeff, 'value' ).name 'AddHDR.Coeff2'


class GfxAddBloom
	constructor: (@_) ->
		@data =
			pass: new THREE.ShaderPass THREE.GodRays2.Additive		
		@data.pass.uniforms[ 'tAdd' ].value = @_.RT.bloom
		@data.pass.uniforms[ 'fCoeff' ].value = 0.5
		@_.composer.addPass @data.pass
		@_.settings.bloom.add( @data.pass, 'enabled' ).name 'enabled'
		@_.settings.bloom.add( @data.pass.uniforms.fCoeff, 'value' ).name 'AddBloom.Coeff'
		#@data.pass.renderToScreen = true


		
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
		@data.pass.uniforms[ 'hue' ].value = 0
		@data.pass.uniforms[ 'saturation' ].value = 0
		@_.composer.addPass @data.pass
		@_.settings.HueSaturation = @_.settings.addFolder 'HueSaturation'
		@_.settings.HueSaturation.add( @data.pass.uniforms.hue, 'value', -1, 1 ).name 'hue'
		@_.settings.HueSaturation.add( @data.pass.uniforms.saturation, 'value', -1, 1).name 'saturation'
		

class GfxBrightnessContrast
	constructor: (@_) ->
		@data =
			pass: new THREE.ShaderPass THREE.BrightnessContrastShader
		@data.pass.uniforms[ 'brightness' ].value = 0
		@data.pass.uniforms[ 'contrast' ].value = 0
		@_.composer.addPass @data.pass
		@_.settings.BrightnessContrast = @_.settings.addFolder 'BrightnessContrast'
		@_.settings.BrightnessContrast.add( @data.pass.uniforms.brightness, 'value', -1, 1 ).name 'brightness'
		@_.settings.BrightnessContrast.add( @data.pass.uniforms.contrast, 'value', -1, 1).name 'contrast'
		

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
		@_.settings.Colorify = @_.settings.addFolder 'Colorify'
		@_.settings.Colorify.add( @data.pass, 'enabled' ).name 'enabled'


class GfxGammaCorrection
	constructor: (@_) ->
		@data =
			pass: new THREE.ShaderPass THREE.GammaCorrectionShader
		@data.pass.uniforms['gamma'].value = 1
		@_.composer.addPass @data.pass
		@_.settings.GammaCorrection = @_.settings.addFolder 'GammaCorrection'
		@_.settings.GammaCorrection.add( @data.pass.uniforms.gamma, 'value', 0, 2 ).name 'gamma'


class GfxVignette
	constructor: (@_) ->
		@data =
			pass: new THREE.ShaderPass THREE.VignetteShader
		@data.pass.uniforms['offset'].value = 1.0
		@data.pass.uniforms['darkness'].value = 1.0
		@_.composer.addPass @data.pass
		@_.settings.Vignette = @_.settings.addFolder 'Vignette'
		@_.settings.Vignette.add( @data.pass, 'enabled' ).name 'enabled'
		@_.settings.Vignette.add( @data.pass.uniforms.offset, 'value', 0, 2 ).name 'offset'
		@_.settings.Vignette.add( @data.pass.uniforms.darkness, 'value', 0, 2 ).name 'darkness'


class GfxDOF
	constructor: (@_) ->
		@data =
			pass: new THREE.ShaderPass THREE.BokehShader
		@data.pass.uniforms[ 'tDepth' ].value = @_.RT.depth
		@data.pass.uniforms[ 'aspect' ].value = @_.viewport.element.width()/@_.viewport.element.height()
		@data.pass.uniforms[ 'focus'	].value = 0.15
		@data.pass.uniforms[ 'aperture'	].value = 0.005
		@data.pass.uniforms[ 'maxblur'	].value = 1.0
		@_.composer.addPass @data.pass
		@_.settings.DOF = @_.settings.addFolder 'DOF'
		@_.settings.DOF.add( @data.pass, 'enabled' ).name 'enabled'
		@_.settings.DOF.add( @data.pass.uniforms.focus, 'value', 0, 1 ).name 'focus'
		@_.settings.DOF.add( @data.pass.uniforms.aperture, 'value', 0, 0.1 ).name 'aperture'
		@_.settings.DOF.add( @data.pass.uniforms.maxblur, 'value', 0, 1 ).name 'maxblur'
		

class GfxMotionBlur
	constructor: (@_) ->
		@data =
			mCurrent 	: new THREE.Matrix4
			mPrev 		: new THREE.Matrix4
			tmpArray 	: new THREE.Matrix4
			pass 		: new THREE.ShaderPass THREE.MotionBlurShader
		@data.pass.uniforms['tDepth'].value = @_.RT.depth
		@data.pass.enabled = false
		@_.composer.addPass @data.pass
		@_.settings.MotionBlur = @_.settings.addFolder 'MotionBlur'
		@_.settings.MotionBlur.add( @data.pass, 'enabled' ).name 'enabled'

	beforeRender: ->
		@data.tmpArray.copy @_.camera.matrixWorldInverse
		@data.tmpArray.multiply @_.camera.projectionMatrix
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