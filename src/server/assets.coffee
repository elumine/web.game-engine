#-------------------------------------------------------
# class defines assets manager
#-------------------------------------------------------
class AssetsManager extends Component

	constructor: (@_) ->
		Component.call @, 
			componentID		: 'AssetsManager'
			loading:
				enabled		: true
				startTask 	: 'initialization'
				endFn		: =>
					@_.removeLoadingTask 'AssetsManager.initialization'

		@_.addLoadingTask 'AssetsManager.initialization'

		list = new JSONData { _: @, url: 'assets/list' }

		@scanAssetsList list.data.server, @, ''

		@removeLoadingTask 'initialization'
		


	scanAssetsList: (data, scope, path) ->
		for k, v of data
			if typeof(v) is 'string'
				switch v
					when 'json'
						scope[k] = new JSONData { _: @, url: 'assets/' + path + k }
					when 'js'
						scope[k] = new JSData 	{ _: @, url: 'assets/' + path + k }
					when 'img'
						scope[k] = new IMGData 	{ _: @, url: 'assets/' + path + k }
			else if typeof(v) is 'object'
				scope[k] = {}
				@scanAssetsList v, scope[k], path + k + '/'



#-------------------------------------------------------
# class defines js database
#-------------------------------------------------------
class JSData
	constructor: (options) ->
		code = _fs.readFileSync options.url+'.js', "utf8"
		eval code
		@data = data



#-------------------------------------------------------
# class defines image database
#-------------------------------------------------------
class IMGData
	constructor: (options) ->
		options._.addLoadingTask options.url
		width = 0
		height = 0
		data = []
		@width = width
		@height = height
		@data = data
		_fs.createReadStream(options.url+'.png').pipe(new _png.PNG({filterType: 4})).on 'parsed', ->
			height = @height
			width = @width
			for y in [0..height-1] by 1
				data[y] = []
				for x in [0..width-1] by 1
					idx = (width * y + x) << 2
					data[y][x] = @data[idx]
			options._.removeLoadingTask options.url
		


#-------------------------------------------------------
# class defines json database
#-------------------------------------------------------
class JSONData
	constructor: (options) ->
		{ @url } = options
		@load()

	#-------------------------------------------------------
	# loads json file for db, log it
	#-------------------------------------------------------
	load: ->
		@data = JSON.parse _fs.readFileSync _path.join __dirname, @url+'.json'
		console.log getTime(), 'db.load '.grey + @url


	#-------------------------------------------------------
	# save @data to json file, log it
	#-------------------------------------------------------
	save: ->
		_fs.writeFileSync @url+'.json', JSON.stringify @data, null, '\t'
		console.log getTime(), 'db.save '.grey + @url