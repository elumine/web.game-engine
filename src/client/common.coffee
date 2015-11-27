#-------------------------------------------------------
# return string contents hours, minutes, seconds, mili
#-------------------------------------------------------
getTime = ->
	return new Date().getHours() + ':' + new Date().getMinutes() + ':' + new Date().getSeconds() + ':' + new Date().getMilliseconds()

#-------------------------------------------------------
# timeout fx
#-------------------------------------------------------
delay = (time, fn) ->
	setTimeout =>
		fn()
	, time