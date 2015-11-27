#-------------------------------------------------------
# defines class
#-------------------------------------------------------
class library.BasicCharacter extends library.Character
	constructor: (options) ->
		library.Character.call @, options

		@classname.BasicCharacter = true

		
		@inputmanager.on 'walk.forward', (e) =>
			if e.bool
				@states['walk.forward'].enable()
			else
				@states['walk.forward'].disable()


		@inputmanager.on 'walk.back', (e) =>
			if e.bool
				@states['walk.back'].enable()
			else
				@states['walk.back'].disable()


		@inputmanager.on 'jump', (e) =>
			if e.bool
				@states['jump'].enable()
			else
				@states['jump'].disable()


		@inputmanager.on 'rotation.left', (e) =>
			if e.bool
				@states['rotation.left'].enable()
			else
				@states['rotation.left'].disable()


		@inputmanager.on 'rotation.right', (e) =>
			if e.bool
				@states['rotation.right'].enable()
			else
				@states['rotation.right'].disable()


		@inputmanager.on 'hit1', (e) =>
			@setHit 1