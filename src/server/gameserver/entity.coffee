# @prepros-prepend 		statemachine.coffee

#-------------------------------------------------------
# defines entity class
#-------------------------------------------------------
class library.Entity
	constructor: (constructor) ->
		@_ = constructor._
		
		@classname 	=
			Entity: true
		
		{@static, @dynamic} = constructor.options
		
		@name = constructor.options.k
		
		@states = new StateMachine
			object 	: @


	tick: (options) ->
		@states.tick options