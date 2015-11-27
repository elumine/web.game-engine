class lib.GL.Monitor

	constructor: (options) ->
		@fps = new Stats
		@fps.domElement.style.position = 'absolute'
		@fps.domElement.style.left = '0px'
		@fps.domElement.style.top = '0px'

		@renderer = new THREEx.RendererStats
		@renderer.domElement.style.position = 'absolute'
		@renderer.domElement.style.bottom = '0px'
		@renderer.domElement.style.left = '0px'



	tick: (renderer) ->
		@fps.update()
		@renderer.update renderer