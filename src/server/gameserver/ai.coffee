ai = {}

class ai.Manager
	constructor: (options) ->
		{ @reference } = options

		@tasks = new ai.TaskList

	add: (v) ->
		#

	tick: (world) ->
		@tasks.tick world



class ai.TaskList
	constructor: (options) ->
		@stack = []


	add: (v) ->
		@stack.push v


	remove: () ->
		#


	tick: (world) ->
		for v in @stack
			v.tick world



class ai.Task
	constructor: (options) ->
		{ @priority, @data, @tick } = options