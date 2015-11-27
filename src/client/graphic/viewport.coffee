class lib.GL.Viewport
	constructor: (options) ->
		@element = $('#'+options.id)
		@width = @element.width()
		@height = @element.height()
		for v in options.children
			@element.append v