class lib.GL.Renderer extends THREE.WebGLRenderer

	constructor: (options) ->
		THREE.WebGLRenderer.call @, 
			antialias: false
		#@shadowMapEnabled 	= true
		#@shadowMapType 	= THREE.PCFSoftShadowMap