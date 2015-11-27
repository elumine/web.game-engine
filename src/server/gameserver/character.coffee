# @prepros-prepend		inputmanager.coffee

#-------------------------------------------------------
# defines character
#-------------------------------------------------------
class library.Character extends library.Unit
	constructor: (constructor) ->
		library.Unit.call @, constructor

		@classname.Character = true

		@inputmanager = new InputManager
			object 	: @
			socket 	: constructor.options.socket