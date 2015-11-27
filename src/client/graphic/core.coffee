# @prepros-append 			camera.coffee
# @prepros-append 			gfx.coffee
# @prepros-append 			monitor.coffee
# @prepros-append 			renderer.coffee
# @prepros-append 			scene/core.coffee
# @prepros-append 			viewport.coffee

lib.GL = {}

class GraphicEngine
	
	constructor: (@_) ->
		Component.call @, 
			componentID		: 'Graphic'
			loading:
				enabled		: true
				startTask 	: 'initialization'
				endFn 		: =>
					@fireEvent 'ready'
					@start()
				delay 		: 1000

		@settings = @_.settings.gui.addFolder 'graphic'
		@settings.open()
		@postprocessing = true
		@settings.add @, 'postprocessing'

		@renderer 	= new lib.GL.Renderer
		@clock 		= new THREE.Clock
		@monitor 	= new lib.GL.Monitor
		@viewport 	= new lib.GL.Viewport
			id: 'viewport3d-wrapper'
			children: [
				@renderer.domElement
				@monitor.fps.domElement
				@monitor.renderer.domElement
			]

		@addLoadingTask 'Scene'

		@removeLoadingTask 'initialization'

		@_.assets.addEventListener 'ready', =>
			@camera 	= new lib.GL.Camera 	@_
			@scene 		= new lib.GL.Scene		@_
			@gfx 		= new lib.GL.Gfx 		@_
			
		@_.io.socket.on 'GameServer.leaveWorldResponse', (packet) =>
			#@stop()
		



	resize: ->
		@camera.aspect = @viewport.element.width() / @viewport.element.height()
		@camera.updateProjectionMatrix()
		@renderer.setSize @viewport.element.width(), @viewport.element.height()
		@gfx.onResize()
		


	start: ->
		console.log 'Graphic.start'
		$(window).bind 'resize', @resize.bind @
		@resize()
		@render()


	stop: ->
		$(window).unbind 'resize', @resize

		cancelAnimationFrame @interval



	render: ->
		dt = @clock.getDelta()

		@scene.tick 	{ dt: dt }

		@camera.tick 	{ dt: dt }
			
		THREE.AnimationHandler.update dt

		if not @postprocessing
			@renderer.render @scene, @camera
		else
			@gfx.render()
		
		@monitor.tick @renderer

		@fireEvent 'render'

		@interval = requestAnimationFrame @render.bind @