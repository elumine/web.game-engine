#-------------------------------------------------------
# defines game object class
#-------------------------------------------------------
class library.GameObject
	constructor: (constructor) ->
		library.Entity.call @, constructor
		@classname.GameObject = true

		v = constructor.options.v

		@physic =
			collider 	: if v.physic then v.physic.collider else 'box'
		
		@graphic =
			model 		: if v.graphic then v.graphic.model else 'default'
		
		@sound  		= if v.sound then v.sound else false
		
		@position  		= new THREE.Vector3
		@scale  		= new THREE.Vector3
		@rotation 		= new THREE.Vector3
		@quaternion 	= new THREE.Quaternion

		@position.x  	= if v.position.x then v.position.x else 0
		@position.y  	= if v.position.y then v.position.y else 0
		@position.z  	= if v.position.z then v.position.z else 0

		@rotation.x  	= if v.rotation.x then v.rotation.x else 0
		@rotation.y  	= if v.rotation.y then v.rotation.y else 0
		@rotation.z  	= if v.rotation.z then v.rotation.z else 0

		@scale.x  		= if v.scale.x then v.scale.x else 1
		@scale.y  		= if v.scale.y then v.scale.y else 1
		@scale.z  		= if v.scale.z then v.scale.z else 1

		#@quaternion.x  	= if v.quaternion.x then v.quaternion.x else 0
		#@quaternion.y  	= if v.quaternion.y then v.quaternion.y else 0
		#@quaternion.z  	= if v.quaternion.z then v.quaternion.z else 0
		#@quaternion.w  	= if v.quaternion.w then v.quaternion.w else 0
		
		@body = @_.game.physic.createBody @
		

	tick: (options) ->
		library.Entity::tick.call @, options
		
		if @dynamic
			@position.copy 		@body.getPosition()
			@quaternion.copy 	@body.getQuaternion()



	serialize: ->
		return {
			classname 	: @classname
			name 		: @name
			physic 		: @physic
			graphic 	: @graphic
			sound 		: @sound
			position 	: { x: @position.x, y: @position.y, z: @position.z }
			quaternion 	: { x: @quaternion.x, y: @quaternion.y, z: @quaternion.z, w: @quaternion.w }
			scale 		: { x: @scale.x, y: @scale.y, z: @scale.z }
			states 		: @states.serialize()
		}



	getHit: (options) ->
		f = options.vDirection.normalize().multiplyScalar options.f * @body.body.mass
		p = options.source.body.getPosition()
		f = new OIMO.Vec3 f.x, f.y, f.z
		@body.body.applyImpulse p, f