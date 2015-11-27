#-------------------------------------------------------
# defines statemachine class
#-------------------------------------------------------
class StateMachine
	
	constructor: (options) ->
		{ @object } = options
		


	tick: (options) ->
		for k, v of @
			if v instanceof State and v.tick
				v.tick options


	serialize: ->
		result = {}
		for k, v of @
			if v instanceof State and v.tick
				result[k] = v
		return result




#-------------------------------------------------------
# defines state class
#-------------------------------------------------------
class State

	constructor: (options) ->
		{ @id, @data, @tick } = options
		@enabled = false

	enable: ->
		@enabled = true
		#console.log 'enable', @id

	disable: ->
		@enabled = false
		#console.log 'disable', @id