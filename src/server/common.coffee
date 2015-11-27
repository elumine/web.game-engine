#-------------------------------------------------------
# return string contents hours, minutes, seconds, mili
#-------------------------------------------------------
getTime = ->
	return (new Date().getHours() + ':' + new Date().getMinutes() + ':' + new Date().getSeconds() + ':' + new Date().getMilliseconds()).magenta

#-------------------------------------------------------
# timeout fx
#-------------------------------------------------------
delay = (time, fn) ->
	setTimeout =>
		fn()
	, time


billinearInterpolation = (options) ->
	v1 = options.D + ( options.C - options.D ) * options.px 	#v in px
	v2 = options.A + ( options.B - options.A ) * options.px 	#v in px
	return v1 + (v2 - v1) * options.py 	#v in pz