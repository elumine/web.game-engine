lib.AL = {}

class AudioEngine

	constructor: (@_) ->
		@scene = new lib.AL.Scene @_

		@_.graphic.addEventListener 'ready', =>
			###for k, v of @_.assets.gamedata.objects.static
				if v.sound then @scene.add k, new lib.AL.Object
					static: true
					id: k
					sound: v.sound
					position: @_.graphic.scene.objectsLayer.objects[k].position

			for k, v of @_.assets.gamedata.objects.environment
				if v.sound then @scene.add k, new lib.AL.Object
					static: true
					id: k
					sound: v.sound
					position: @_.graphic.scene.objectsLayer.objects[k].position
			###

		@_.graphic.addEventListener 'render', =>
			@scene.renderUpdate @_.graphic.camera.position






class lib.AL.Scene
	constructor: (@_) ->
		@children = {}


	add: (k, object) ->
		@children[k] = object


	remove: (k) ->
		delete @children[k]


	renderUpdate: (cameraPosition) ->
		for k, v of @children
			v.setVolume cameraPosition

	worldUpdate: (data) ->
		for k, object of @children
			if object.dynamic
				object.inWorld = false
		for object in data.dynamic
			if object.sound
				if not @children[object.id]
					v = new lib.AL.Object
						dynamic: true
						id: object.id
						sound: object.sound
						position: @_.graphic.scene.dynamicLayer.objects[object.id].position
					v.inWorld = true
					@add object.id, v
				else
					@children[object.id].inWorld = true
					@children[object.id].worldUpdate object
		for k, object of @children
			if object.dynamic
				if not object.inWorld
					@remove k



class lib.AL.Object
	constructor: (options) ->
		{ @_, @id, @sound, @position, @static, @dynamic } = options
		#console.log 'new lib.AL.Object', @id, @sound, @position
		@element = document.createElement 'audio'
		@element.src = 'assets/audio/'+@sound.id+'.mp3'
		@element.autoplay = true
		@element.loop = true
		@element.preload = true
		@element.volume = 1
		@element.play()

		@maxDistance = @sound.distance


	setVolume: (point) ->
		distance = new THREE.Vector3( point.x - @position.x, point.y - @position.y, point.z - @position.z ).length()
		
		if distance <= @maxDistance
			value = (@maxDistance - distance)/@maxDistance
		else
			value = 0

		@element.volume = value



	worldUpdate: (data) ->
		@position.set data.position.x, data.position.y, data.position.z