class WorldSystem

	constructor: (gamedata) ->
		@objects = {}

		@add { classname: 'GameObject', k: k, v: v } for k, v of gamedata.static
		@add { classname: 'GameObject', k: k, v: v, dynamic: true } for k, v of gamedata.dynamic
		@add { classname: 'Character',  k: 'character', v: gamedata.character, dynamic: true }

		@dt = 1000/60
		setInterval =>
			@tick @dt
		, @dt


	add: (options) ->
		@objects[options.k] = new lib[options.classname]
			k 			: options.k
			gamedata 	: options.v
			dynamic 	: options.dynamic


	tick: (dt) ->
		for k, v of @objects
			v.tick() #get body data and set it to mesh data








lib = {}


class lib.GameObject

	constructor: (options) ->
		@name = options.k
		@mesh = @createMesh options.gamedata
		@body = @createBody options.gamedata, options.dynamic



	createMesh: (gamedata) ->
		switch gamedata.collider
			when 'box'
				geometry = new THREE.BoxGeometry 		gamedata.scale.x, gamedata.scale.y, gamedata.scale.z
			when 'sphere'
				geometry = new THREE.SphereGeometry 	( gamedata.scale.x + gamedata.scale.y + gamedata.scale.z )/3

		mesh = new THREE.Mesh geometry, new THREE.MeshPhongMaterial { ambient: 0x0000ff }
		mesh.position.set gamedata.position.x, gamedata.position.y, gamedata.position.z
		mesh.rotation.set gamedata.rotation.x * Math.PI/180, gamedata.rotation.y * Math.PI/180, gamedata.rotation.z * Math.PI/180

		graphic.scene.add mesh
		return mesh
			



	createBody: (gamedata, dynamic) ->
		if dynamic
			config = [ 1, 0.4, 0.2 ]
		else
			config = [ 1, 0.4, 0.2 ]

		switch gamedata.collider
			when 'box'
				body = new OIMO.Body
					type 	: 'box'
					pos 	: [ gamedata.position.x, gamedata.position.y, gamedata.position.z ]
					size 	: [ gamedata.scale.x, gamedata.scale.y, gamedata.scale.z ]
					rot 	: [ gamedata.rotation.x, gamedata.rotation.y, gamedata.rotation.z ]
					world 	: physic.world
					move 	: if dynamic then true else false
					config : config
			when 'sphere'
				body = new OIMO.Body
					type 	: 'sphere'
					pos 	: [ gamedata.position.x, gamedata.position.y, gamedata.position.z ]
					size 	: [ ( gamedata.scale.x + gamedata.scale.y + gamedata.scale.z )/3 ]
					rot 	: [ gamedata.rotation.x, gamedata.rotation.y, gamedata.rotation.z ]
					world 	: physic.world
					move 	: if dynamic then true else false
					config : config

		return body


	tick: (dt) ->
		@mesh.position.copy @body.getPosition()
		@mesh.quaternion.copy @body.getQuaternion()





	getHit: (options) ->
		f = options.vDirection.normalize().multiplyScalar options.f * @body.body.mass
		p = options.source.body.getPosition()
		f = new OIMO.Vec3 f.x, f.y, f.z
		@body.body.applyImpulse p, f





class lib.Character extends lib.GameObject
	constructor: (options) ->
		lib.GameObject.call @, options

		@vY = 0
		@movespeed = 0
		@rotationLeft = false
		@rotationRight = false
		keyHandler = (e) =>
			switch e.keyCode
				when 49
					if e.type is 'keydown'
						@setHit 49
				when 50
					if e.type is 'keydown'
						@setHit 50
				when 87
					if e.type is 'keydown'
						@movespeed = 1
					else if e.type is 'keyup'
						@movespeed = 0
				when 83
					if e.type is 'keydown'
						@movespeed = -1
					else if e.type is 'keyup'
						@movespeed = 0
				when 65
					if e.type is 'keydown'
						@rotationLeft = true
					else if e.type is 'keyup'
						@rotationLeft = false
				when 68
					if e.type is 'keydown'
						@rotationRight = true
					else if e.type is 'keyup'
						@rotationRight = false
		$(window).bind 'keydown', 	(e) => keyHandler e
		$(window).bind 'keyup', 	(e) => keyHandler e

		character = @



	tick: ->
		lib.GameObject::tick.call @

		if @rotationLeft then @vY -= 2
		if @rotationRight then @vY += 2

		x = Math.cos( @vY * Math.PI/180 ) * @movespeed * 0.25
		y = Math.sin( @vY * Math.PI/180 ) * @movespeed * 0.25

		@body.body.linearVelocity.set x, 0, y
		@mesh.quaternion.set 0, 0, 0, 1
		@mesh.rotation.set 0, -@vY * Math.PI/180, 0



	setHit: (c) ->
		p0 = @body.getPosition()
		for k, v of world.objects
			if v.name isnt @name
				switch c
					when 49
						p1 = v.body.getPosition()
						d = new THREE.Vector3 p1.x - p0.x, p1.y - p0.y, p1.z - p0.z
						if d.length() < 10 
							v.getHit
								f 			: 2
								vDirection 	: d
								source 		: @
					when 50
						p1 = v.body.getPosition()
						a = new THREE.Vector3(p0.x, p0.y, p0.z).angleTo( new THREE.Vector3(p1.x, p1.y, p1.z) ) * 180 / Math.PI
						d = new THREE.Vector3 p1.x - p0.x, p1.y - p0.y, p1.z - p0.z
						if a > 85
							v.getHit
								f 			: 1
								vDirection 	: d
								source 		: @