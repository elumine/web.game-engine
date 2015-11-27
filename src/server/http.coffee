#-------------------------------------------------------
# defines http server
#-------------------------------------------------------
class HTTPServer
	
	constructor: (@_) ->
		@app = _express()

		for k, v of @_.config.http.use
			@app.use k, _express.static _path.join __dirname, v
		
		@app.get '/', (req, res, next) =>
			res.sendFile _path.resolve _path.join __dirname, @_.config.http.index

		@server = @app.listen @_.config.http.port