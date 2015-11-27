#-------------------------------------------------------
# defines component class
#-------------------------------------------------------
class Component

	constructor: (options) ->
		@__componentID = options.componentID
		@__events = {}
		@__loading =
			enabled: if options.loading.enabled then options.loading.enabled else false
			startTask: if options.loading.startTask then options.loading.startTask else false
			endFn: if options.loading.endFn then options.loading.endFn.bind @ else false
			stack: []
			delay: options.loading.delay or 100

		@fireEvent = (eventID, e) ->
			if @__events[eventID]
				for v in @__events[eventID]
					v e


		@addEventListener = (eventID, callback) ->
			if not @__events[eventID] then @__events[eventID] = []
			@__events[eventID].push callback


		@removeEventListener = (eventID, callback) ->
			@__events[eventID].splice(@__events[eventID].indexOf(callback), 1)


		@addLoadingTask = (value) ->
			@__loading.stack.push value
			console.log @__componentID + '.addLoadingTask', value


		@removeLoadingTask = (value) ->
			@__loading.stack.splice @__loading.stack.indexOf(value), 1
			console.log @__componentID + '.removeLoadingTask', value


		@checkLoadingTask = () ->
			if @__loading.stack.length isnt 0
				delay @__loading.delay, =>
					@checkLoadingTask()
			else
				console.log getTime(), @__componentID + '.loaded'
				if @__loading.endFn then @__loading.endFn()

		console.log getTime(), @__componentID + '.constructor'

		if @__loading.enabled
			@addLoadingTask @__loading.startTask
			@checkLoadingTask()