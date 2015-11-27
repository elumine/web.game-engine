#-------------------------------------------------------
# defines game sound class
#-------------------------------------------------------
class Sound

	constructor: (options) ->
		@id = options.id
		@position = 
			x: options.position.x or 0
			y: options.position.y or 0
			z: options.position.z or 0