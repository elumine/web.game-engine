#-------------------------------------------------------
# defines game time class
#-------------------------------------------------------
class Time
	constructor: (@_) ->
		{ @day, @hour, @minute, @flow } = @_.assets.gamedata.world.data.time

		@start()
		

	start: ->
		@interval = setInterval =>
			@tick()
		, @dt


	stop: ->
		clearInterval @interval


	tick: ->
		@minute += 1 * @flow
		@format()


	format: ->
		if @minute >= 60
			@minute = @minute - 60
			@format()
			@hour += 1
			if @hour >= 24
				@format()
				@hour = @hour - 24
				@day += 1

	serialize: ->
		return {
			day 	: @day
			hour 	: @hour
			minute 	: @minute
			flow 	: @flow
		}