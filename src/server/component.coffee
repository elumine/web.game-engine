#-------------------------------------------------------
# defines component class
#-------------------------------------------------------
class Component

	constructor: (options) ->
		@__componentID = options.componentID
		@__events = {}
		@__loading =
			enabled: false or options.loading.enabled
			startTask: false or options.loading.startTask
			endFn: false or options.loading.endFn.bind @
			stack: []
			delay: 100

		console.log getTime(), @__componentID + '.constructor'.yellow

		if @__loading.enabled
			@addLoadingTask @__loading.startTask
			@checkLoadingTask()


	fireEvent: (eventID) ->
		if @__events[eventID]
			for v in @__events[eventID]
				v()


	addEventListener: (eventID, callback) ->
		if not @__events[eventID] then @__events[eventID] = []
		@__events[eventID].push callback


	removeEventListener: (eventID, callback) ->
		@__events[eventID].splice(@__events[eventID].indexOf(callback), 1)


	addLoadingTask: (value) ->
		@__loading.stack.push value


	removeLoadingTask: (value) ->
		@__loading.stack.splice @__loading.stack.indexOf(value), 1


	checkLoadingTask: () ->
		if @__loading.stack.length isnt 0
			console.log getTime(), @__componentID + '.checkLoadingTask...'.grey
			for key in @__loading.stack
				console.log '  ' + key
			delay @__loading.delay, =>
				@checkLoadingTask()
		else
			@__loading.endFn()