#-------------------------------------------------------
# defines unit class
#-------------------------------------------------------
class library.Unit extends library.GameObject
	constructor: (constructor) ->
		library.GameObject.call @, constructor

		@classname.Unit = true

		@vY = 0 				#y axis rotation in deg

		@physic.velocity =
			move: 		0
			jump: 		0
			rotation:
				x: 		0
				y: 		0
				z: 		0
			
	
		@states['walk.forward'] = new State
			id 		: 'walk.forward'
			data 	:
				velocity 	: 2
				limit 		: 2
			tick 	: (options) =>
				dv = @states['walk.forward'].data.velocity * options.dt / 1000
				if @states['walk.forward'].enabled
					if @physic.velocity.move < @states['walk.forward'].data.limit
						@physic.velocity.move += dv
				else
					if @physic.velocity.move > 0
						@physic.velocity.move -= dv
						if @physic.velocity.move <= dv
							@physic.velocity.move = 0

		@states['walk.back'] = new State
			id 		: 'walk.back'
			data 	:
				velocity 	: 4
				limit 		: 4
			tick 	: (options) =>
				dv = @states['walk.back'].data.velocity * options.dt / 1000
				if @states['walk.back'].enabled
					if @physic.velocity.move > -@states['walk.back'].data.limit
						@physic.velocity.move -= dv
				else
					if @physic.velocity.move < 0
						@physic.velocity.move += dv
						if @physic.velocity.move >= -dv
							@physic.velocity.move = 0

		@states['jump'] = new State
			id 		: 'jump'
			data 	:
				velocity 	: 2
				duration 	: 1000
			tick 	: (options) =>
				dv = @states['jump'].data.velocity * options.dt / 1000
				if @states['jump'].enabled
					if not @states['jump'].data.phase
						@physic.velocity['jump'] += dv
					else
						@physic.velocity['jump'] -= dv
					delay @states['jump'].data.duration/2, =>
						@states['jump'].data.phase = true
					delay @states['jump'].data.duration, =>
						@states['jump'].enabled = false
						@states['jump'].data.phase = false
						@physic.velocity.jump = 0

		@states['rotation.left'] = new State
			id 	: 'rotation.left'
			data:
				velocity 	: 180 	#deg/sec
				limit 		: 120
			tick: (options) =>
				dv = @states['rotation.right'].data.velocity * options.dt / 1000
				if @states['rotation.right'].enabled
					if @physic.velocity.rotation.y > -@states['rotation.right'].data.limit
						@physic.velocity.rotation.y -= dv
				else
					if @physic.velocity.rotation.y < 0
						@physic.velocity.rotation.y += dv

		@states['rotation.right'] = new State
			id 	:	'rotation.right'
			data:
				velocity 	: 180 	#deg/sec
				limit 		: 120
			tick: (options) =>
				dv = @states['rotation.left'].data.velocity * options.dt / 1000
				if @states['rotation.left'].enabled
					if @physic.velocity.rotation.y < @states['rotation.left'].data.limit
						@physic.velocity.rotation.y += dv
				else
					if @physic.velocity.rotation.y > 0
						@physic.velocity.rotation.y -= dv



	tick: (options) ->
		library.GameObject::tick.call @, options
		
		@vY += @physic.velocity.rotation.y * options.dt / 1000

		x = Math.cos( @vY * Math.PI/180 ) * @physic.velocity.move * 0.25
		y = Math.sin( @vY * Math.PI/180 ) * @physic.velocity.move * 0.25

		@body.body.linearVelocity.set x, @body.body.linearVelocity.y, y
		

	serialize: ->
		return {
			classname 	: @classname
			name 		: @name
			physic 		: @physic
			graphic 	: @graphic
			sound 		: @sound
			position 	: @position
			vY 			: @vY + 90
			scale 		: @scale
			states 		: @states.serialize()
		}


	setHit: (c) ->
		p0 = @body.getPosition()
		for k, v of @_.game.world.objects.dynamic
			if v.name isnt @name
				switch c
					when 1
						p1 = v.body.getPosition()
						d = new THREE.Vector3 p1.x - p0.x, p1.y - p0.y, p1.z - p0.z
						if d.length() < 10 
							v.getHit
								f 			: 1
								vDirection 	: d
								source 		: @