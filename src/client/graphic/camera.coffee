class lib.GL.Camera extends THREE.PerspectiveCamera
	constructor: (@_) ->
		@_.game.world.addEventListener 'ready', =>
			THREE.PerspectiveCamera.call @, 75, @_.graphic.viewport.element.width() / @_.graphic.viewport.element.height(), 0.1, 100000
			@up = new THREE.Vector3 0, 1, 0
			
			@settings = @_.graphic.settings.addFolder 'camera'
			@settings.add( { set: => @setMode('float') }, 'set').name('float')
			@settings.add( { set: => @setMode('orbit') }, 'set').name('orbit')
			@settings.add( { set: => @setMode('fpc') }, 'set').name('fpc')

			#object = @_.game.world.objects.dynamic[ @_.account.account.name ]
			#@position.set object.position.x, object.position.y, object.position.z
			@position.set @_.assets.gamedata.world.constants.size.x/2, @_.assets.gamedata.world.constants.size.y + 10, @_.assets.gamedata.world.constants.size.z/2

			@data = 
				sensitivity: 0.75
				float:
					enabled: false
					fi: 90
					tetha: 60
					moving: false
					speed: 1
				orbit:
					enabled: false
					d: 5
					fi: 90
					tetha: 60
				fpc:
					enabled: false
					fi: 90
					tetha: 60
				set:
					x: (v) =>
						fi = 90 + v
						if @data.float.enabled
							@data.float.fi = fi
						else if @data.orbit.enabled
							@data.orbit.fi = fi
						else if @data.fpc.enabled
							@data.fpc.fi = fi

					y: (v) =>
						tetha = v
						if @data.float.enabled
							@data.float.tetha = tetha
						else if @data.orbit.enabled
							@data.orbit.tetha = tetha
						else if @data.fpc.enabled
							@data.fpc.tetha = tetha

			@settings.add( @data, 'sensitivity', 0.5, 1 ).name('sensitivity')
			@settings.add( @data.orbit, 'd', 2, 10 ).name('r')

			@mouse =
				previous:
					x: 0
					y: 0
				current:
					x: 0
					y: 0


			@_.graphic.viewport.element.bind 'mousedown', (e) =>
				if @data.float.enabled then @data.float.moving = true
				

			@_.graphic.viewport.element.bind 'mouseup', (e) =>
				if @data.float.enabled then @data.float.moving = false


			@_.graphic.viewport.element.bind 'mousemove', (e) =>
				@mouse.previous.x = @mouse.current.x
				@mouse.previous.y = @mouse.current.y
				@mouse.current.x = e.offsetX
				@mouse.current.y = e.offsetY
				@data.set.x @data.sensitivity * @mouse.current.x - @_.graphic.viewport.element.width()/2
				@data.set.y @data.sensitivity * @mouse.current.y - @_.graphic.viewport.element.height()/2
					
			@_.graphic.viewport.element.bind 'mousewheel', (e) =>
				@mode.orbit.d += 0.25 * e.originalEvent.wheelDelta / 120


			@setMode()



		

	setMode: (v) ->
		if not v then v = 'float'
		@data.orbit.enabled = false
		@data.float.enabled = false
		@data.fpc.enabled = false

		if v is 'float'
			@data.float.enabled = true
		else if v is 'orbit'
			@data.orbit.enabled = true
		else if v is 'fpc'
			@data.fpc.enabled = true

		@tick()




	tick: (options) ->
		if @data.float.enabled
			dx = Math.sin(@data.float.tetha * Math.PI/180) * Math.cos((@data.float.fi) * Math.PI/180)
			dz = Math.sin(@data.float.tetha * Math.PI/180) * Math.sin((@data.float.fi) * Math.PI/180)
			dy = Math.cos(@data.float.tetha * Math.PI/180)
			if @data.float.moving then @position.set @position.x + @data.float.speed * dx, @position.y + @data.float.speed * dy, @position.z + @data.float.speed * dz
			@lookAt new THREE.Vector3 @position.x + dx, @position.y + dy, @position.z + dz
			
			object = @_.game.world.objects.dynamic[ @_.account.account.name ]
			if object
				object.visible = true
				#$('#hud').hide()
			

		else if @data.orbit.enabled
			dx = Math.sin(@data.orbit.tetha * Math.PI/180) * Math.cos((@data.orbit.fi) * Math.PI/180)
			dz = Math.sin(@data.orbit.tetha * Math.PI/180) * Math.sin((@data.orbit.fi) * Math.PI/180)
			dy = Math.cos(@data.orbit.tetha * Math.PI/180)
			
			object = @_.game.world.objects.dynamic[ @_.account.account.name ]
			if object
				object.visible = true
				#$('#hud').hide()
				position = object.position
			else
				position = @position

			@lookAt new THREE.Vector3 position.x, position.y, position.z
			@position.set position.x + dx * @data.orbit.d, position.y + dy * @data.orbit.d, position.z + dz * @data.orbit.d

			if object and @position.y < object.position.y then @position.y = object.position.y + 1
	


		else if @data.fpc.enabled
			dx = Math.sin(@data.fpc.tetha * Math.PI/180) * Math.cos((@data.fpc.fi) * Math.PI/180)
			dz = Math.sin(@data.fpc.tetha * Math.PI/180) * Math.sin((@data.fpc.fi) * Math.PI/180)
			dy = Math.cos(@data.fpc.tetha * Math.PI/180)
			
			object = @_.game.world.objects.dynamic[ @_.account.account.name ]
			if object
				object.visible = false
				#$('#hud').show()
				position = object.position
			else
				position = @position

			@position.set position.x, position.y + 0.5, position.z
			@lookAt new THREE.Vector3 position.x + dx, position.y + 0.5 + dy, position.z + dz