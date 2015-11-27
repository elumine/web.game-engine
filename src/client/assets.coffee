class AssetsManager
	constructor: (@_) ->
		Component.call @, 
			componentID		: 'AssetsManager'
			loading:
				enabled		: true
				startTask 	: 'initialization'
				endFn 		: => console.log(getTime(), 'AssetsManager.ready'); @fireEvent 'ready'
				delay 		: 1000

		@assetdelay = 1000

		@loadJSON 
			url: 'list'
			callback: (data) =>
				@scanAssetsList data.client, @, ''

		@removeLoadingTask 'initialization'



	scanAssetsList: (data, scope, path) ->
		for k, v of data
			if typeof(v) is 'string'
				switch v
					when 'json'
						@loadJSON 
							url 	: path + k
							scope 	: scope
							key 	: k
					when 'js'
						@loadJS 
							url 	: path + k
							scope 	: scope
							key 	: k
					when 'script'
						@loadScript
							url 	: path + k
							scope 	: scope
							key 	: k
					when 'img'
						@loadImage 
							url 	: path + k
							scope 	: scope
							key 	: k
					when 'model'
						@getModelRequest k
					when 'material'
						@getMaterialRequest k
					when 'geometry'
						@getGeometryRequest k
					when 'texture'
						@loadTexture
							scope 	: scope
							path 	: path
							name 	: k

			else if typeof(v) is 'object'
				scope[k] = {}
				@scanAssetsList v, scope[k], path + k + '/'

	

	loadScript: (options) ->
		tag = document.createElement 'script'
		tag.src = 'assets/' + options.url + '.js'
		document.body.appendChild tag


	loadJSON: (options) ->
		@addLoadingTask options.url+'.json'
		#console.log 'loadJSON', options.url
		$.get 'assets/' + options.url + '.json', (data) =>
			if options.callback then options.callback data
			if options.scope then options.scope[options.key] = data
			@removeLoadingTask options.url+'.json'



	loadJS: (options) ->
		@addLoadingTask options.url+'.js'
		#console.log 'loadJS', url
		$.ajax
			url: 'assets/' + options.url + '.js'
			type: "GET"
			async: false
			success: (code) =>
				eval code
				if options.callback then options.callback data
				if options.scope then options.scope[options.key] = data
				@removeLoadingTask options.url+'.js'



	loadImage: (options) ->
		@addLoadingTask options.url+'.png'
		#console.log 'loadImage', url
		image = document.createElement 'img'
		image.src = 'assets/' + options.url + '.png'
		if options.scope then options.scope[options.key] = image
		delay @assetdelay, => @removeLoadingTask options.url+'.png'



	getModelRequest: (name) ->
		console.log 'getModelRequest', name
		if not @graphic.model[name]
			url = 'assets/graphic/model/' + name
			@addLoadingTask name
			$.get url + '/options.json', (data) =>
				options = data

				transforms =
					position 	: { x: 0, y: 0, z: 0 }
					rotation 	: { x: 0, y: 0, z: 0 }
					scale 		: { x: 1, y: 1, z: 1 }
				if options.position
					transforms.position.x = if options.position.x then options.position.x else 0
					transforms.position.y = if options.position.y then options.position.y else 0
					transforms.position.z = if options.position.z then options.position.z else 0
				if options.rotation
					transforms.rotation.x = if options.rotation.x then options.rotation.x else 0
					transforms.rotation.y = if options.rotation.y then options.rotation.y else 0
					transforms.rotation.z = if options.rotation.z then options.rotation.z else 0
				if options.scale
					transforms.scale.x = if options.scale.x then options.scale.x else 1
					transforms.scale.y = if options.scale.y then options.scale.y else 1
					transforms.scale.z = if options.scale.z then options.scale.z else 1

				if options.update then $.get url + '/update', (data) =>
					eval data
					loadModelFile
						url 		: url
						name 		: name
						options 	: options
						transforms 	: transforms
						update 		: update
				else
					loadModelFile
						url 		: url
						name 		: name
						options 	: options
						transforms 	: transforms


		loadModelFile = (params) =>
			if params.options.type.json
				$.get params.url + '/model.json', (data) =>
					model = data
					model.name = params.name
					model.transforms = params.transforms
					parseModelFile { model: model }

			else if params.options.type.dae
				loader = new THREE.ColladaLoader
				loader.options.convertUpAxis = true
				loader.load params.url + '/model.dae', (collada) =>
					model = collada.scene
					model.name = params.name
					model.transforms = params.transforms
					rescaleModel model
					returnModelFile model

			else if params.options.type.jsonExported
				loader = new THREE.JSONLoader().load params.url + '/model.json', ( geometry, materials ) =>
					material = materials[0]
					material.skinning = true
					model = new THREE.SkinnedMesh geometry, material
					model.name = params.name
					model.transferData = []

					if params and params.update
						model.transferData.push 'update'
						model.update = params.update

					model.transforms = params.transforms
					rescaleModel model
					returnModelFile model



		parseModelFile = (params, callback) =>
			object = new THREE.Mesh
			object.name = params.model.name
			object.transforms = params.model.transforms 
			if params.model.geometryID		
				if not @graphic.geometry[params.model.geometryID] or @graphic.geometry[params.model.geometryID] is 'initialization'
					@getGeometryRequest params.model.geometryID
					@addEventListener 'loadedGeometry ' + params.model.geometryID, (e) =>
						object.geometry = e.geometry
						rescaleModel object
						if not @graphic.material[params.model.materialID] or @graphic.material[params.model.materialID] is 'initialization'
							@getMaterialRequest params.model.materialID
							@addEventListener 'loadedMaterial ' + params.model.materialID, (e) =>
								object.material = e.material
								returnModelFile object
						else
							object.material = @graphic.material[params.model.materialID]
							returnModelFile object
				else
					object.geometry = @graphic.geometry[params.model.geometryID]
					rescaleModel object
					if not @graphic.material[params.model.materialID] or @graphic.material[params.model.materialID] is 'initialization'
						@getMaterialRequest params.model.materialID
						@addEventListener 'loadedMaterial ' + params.model.materialID, (e) =>
							object.material = e.material
							returnModelFile object
					else
						object.material = @graphic.material[params.model.materialID]
						returnModelFile object
			else
				returnModelFile object

			if params.model.children
				for k, v of params.model.children
					parseModelFile { model: v }, (child) =>
						object[k] = child
						object.add child

			if callback then callback object



		rescaleModel = (model) ->
			model.updateMatrix()
			model.traverse (child) -> if child instanceof THREE.Mesh then child.geometry.applyMatrix model.matrix
			model.position.set 0, 0, 0
			model.rotation.set 0, 0, 0
			model.scale.set 1, 1, 1
			model.updateMatrix()
			bbox = new THREE.Box3().setFromObject model
			model.scale.x = 1 / ( bbox.max.x - bbox.min.x )
			model.scale.y = 1 / ( bbox.max.y - bbox.min.y )
			model.scale.z = 1 / ( bbox.max.z - bbox.min.z )
			parseOptionsTransforms model



		parseOptionsTransforms = (model) =>
			model.position.x = model.transforms.position.x
			model.position.y = model.transforms.position.y
			model.position.z = model.transforms.position.z
			model.rotation.x = model.transforms.rotation.x
			model.rotation.y = model.transforms.rotation.y
			model.rotation.z = model.transforms.rotation.z
			model.scale.x *= model.transforms.scale.x
			model.scale.y *= model.transforms.scale.y
			model.scale.z *= model.transforms.scale.z
			


		returnModelFile = (model) =>
			console.log 'returnModelFile', model.name, model
			@graphic.model[name] = model
			@removeLoadingTask name
			@fireEvent 'loadedModel ' + name, { model: model }





	getMaterialRequest: (name) ->
		console.log 'getMaterialRequest', name
		if not @graphic.material[name]
			@graphic.material[name] = 'initialization'
			url = 'assets/graphic/material/' + name
			@addLoadingTask name
			$.get url + '/options.json', (data) =>
				options = data
				
				if options.map.diffuse
					diffuse = THREE.ImageUtils.loadTexture url + '/diffuse.png'
				else
					diffuse = false

				if options.map.specular
					specular = THREE.ImageUtils.loadTexture url + '/specular.png'
				else
					specular = false

				if options.map.light
					light = THREE.ImageUtils.loadTexture url + '/light.png'
				else
					light = false

				
				if options.map.alpha
					alpha = THREE.ImageUtils.loadTexture url + '/alpha.png'
				else
					alpha = false

				if options.map.env
					urls = [
						url + '/env.png',
						url + '/env.png',
						url + '/env.png',
						url + '/env.png',
						url + '/env.png',
						url + '/env.png'
					]
					env = THREE.ImageUtils.loadTextureCube urls
					env.format = THREE.RGBFormat
				else
					env = false

				if options.map.normal
					normal = THREE.ImageUtils.loadTexture url + '/normal.png'
				else
					normal = false

				if options.map.bump
					bump = THREE.ImageUtils.loadTexture url + '/bump.png'
				else
					bump = false


				if options.shader
					loadvertexshader url, (vert) =>
						loadfragmentshader url, (frag) =>
							loadmaterialfile url, diffuse, specular, light, alpha, env, normal, bump, vert, frag
				else
					loadmaterialfile url, diffuse, specular, light, alpha, env, normal, bump
				
		loadvertexshader = (url, callback) =>
			$.get url + '/shader.vert', (data) =>
				callback data

		loadfragmentshader = (url, callback) =>
			$.get url + '/shader.frag', (data) =>
				callback data

		loadmaterialfile = (url, diffuse, specular, light, alpha, env, normal, bump, vert, frag) =>
			$.get url + '/material', (data) =>
				eval data
				if not material then material = new THREE.MeshBasicMaterial
				@graphic.material[name] = material
				delay @assetdelay, =>
					@removeLoadingTask name
					@fireEvent 'loadedMaterial ' + name, { material: material }



	getGeometryRequest: (name) ->
		console.log 'getGeometryRequest', name
		if not @graphic.geometry[name]
			@graphic.geometry[name] = 'initialization'
			url = 'assets/graphic/geometry/' + name
			@addLoadingTask url
			$.get url + '/options.json', (data) =>
				options = data
				if options.type.js
					$.get url + '/geometry', (data) =>
						eval data
						@graphic.geometry[name] = geometry
						@fireEvent 'loadedGeometry ' + name, { geometry: geometry }
						@removeLoadingTask url
				else if options.type.dae
					loader = new THREE.ColladaLoader
					loader.options.convertUpAxis = true
					geometry = new THREE.Geometry
					loader.load  url + '/geometry.dae', (collada) =>
						collada.scene.traverse (children) =>
							if children.type is 'Mesh'
								children.updateMatrix()
								geometry.merge children.geometry, children.matrix
						@graphic.geometry[name] = geometry
						@fireEvent 'loadedGeometry ' + name, { geometry: geometry }
						@removeLoadingTask url



	loadTexture: (url) ->
		path = 'assets/graphic/texture/'
		@addLoadingTask path + url
		@graphic.texture[url] = THREE.ImageUtils.loadTexture path + url + '.png', undefined, =>
			delay @assetdelay, => @removeLoadingTask path + url

	loadTexture: (options) ->
		url = 'assets/' + options.path + options.name
		@addLoadingTask url
		options.scope[options.name] = THREE.ImageUtils.loadTexture url + '.png', undefined, => @removeLoadingTask url



###
class AssetsManager
	
	constructor: (@_) ->
		Component.call @, 
			componentID		: 'AssetsManager'
			loading:
				enabled		: true
				startTask 	: 'initialization'
				endFn 		: => console.log(getTime(), 'AssetsManager.ready'); @fireEvent 'ready'
				delay 		: 1000

		@assetdelay = 1000

		@loadJSON 
			url: 'list'
			callback: (data) =>
				@scanAssetsList data.client, @, ''

		@removeLoadingTask 'initialization'



	scanAssetsList: (data, scope, path) ->
		for k, v of data
			if typeof(v) is 'string'
				switch v
					when 'json'
						@loadJSON 
							url 	: path + k
							scope 	: scope
							key 	: k
					when 'js'
						@loadJS 
							url 	: path + k
							scope 	: scope
							key 	: k
					when 'script'
						@loadScript
							url 	: path + k
							scope 	: scope
							key 	: k
					when 'img'
						@loadImage 
							url 	: path + k
							scope 	: scope
							key 	: k
					when 'model'
						@getModelRequest k
					when 'material'
						@getMaterialRequest k
					when 'geometry'
						@getGeometryRequest k
					when 'texture'
						@loadTexture
							scope 	: scope
							path 	: path
							name 	: k
 	
			else if typeof(v) is 'object'
				scope[k] = {}
				@scanAssetsList v, scope[k], path + k + '/'

	

	loadScript: (options) ->
		tag = document.createElement 'script'
		tag.src = 'assets/' + options.url + '.js'
		document.body.appendChild tag


	loadJSON: (options) ->
		@addLoadingTask options.url+'.json'
		#console.log 'loadJSON', options.url
		$.get 'assets/' + options.url + '.json', (data) =>
			if options.callback then options.callback data
			if options.scope then options.scope[options.key] = data
			@removeLoadingTask options.url+'.json'



	loadJS: (options) ->
		@addLoadingTask options.url+'.js'
		#console.log 'loadJS', url
		$.ajax
			url: 'assets/' + options.url + '.js'
			type: "GET"
			async: false
			success: (code) =>
				eval code
				if options.callback then options.callback data
				if options.scope then options.scope[options.key] = data
				@removeLoadingTask options.url+'.js'



	loadImage: (options) ->
		@addLoadingTask options.url+'.png'
		#console.log 'loadImage', url
		image = document.createElement 'img'
		image.src = 'assets/' + options.url + '.png'
		if options.scope then options.scope[options.key] = image
		delay @assetdelay, => @removeLoadingTask options.url+'.png'




	getModelRequest: (name) ->
		console.log 'getModelRequest', name
		if not @graphic.model[name]
			@graphic.model[name] = 'initialization'
			url = 'assets/graphic/model/' + name
			@addLoadingTask url
			$.get url + '/options.json', (data) =>
				options = data

				transforms =
					position 	: { x: 0, y: 0, z: 0 }
					rotation 	: { x: 0, y: 0, z: 0 }
					scale 		: { x: 1, y: 1, z: 1 }
				if options.position
					transforms.position.x = if options.position.x then options.position.x else 0
					transforms.position.y = if options.position.y then options.position.y else 0
					transforms.position.z = if options.position.z then options.position.z else 0
				if options.rotation
					transforms.rotation.x = if options.rotation.x then options.rotation.x else 0
					transforms.rotation.y = if options.rotation.y then options.rotation.y else 0
					transforms.rotation.z = if options.rotation.z then options.rotation.z else 0
				if options.scale
					transforms.scale.x = if options.scale.x then options.scale.x else 1
					transforms.scale.y = if options.scale.y then options.scale.y else 1
					transforms.scale.z = if options.scale.z then options.scale.z else 1

				if options.update then $.get url + '/update', (data) =>
					eval data
					loadModelFile
						url 		: url
						name 		: name
						options 	: options
						transforms 	: transforms
						update 		: update
				else
					loadModelFile
						url 		: url
						name 		: name
						options 	: options
						transforms 	: transforms


		loadModelFile = (params) =>
			if params.options.type.json
				$.get params.url + '/model.json', (data) =>
					model = data
					model.name = params.name
					model.transforms = params.transforms
					parseModelFile { model: model }

			else if params.options.type.dae
				loader = new THREE.ColladaLoader
				loader.options.convertUpAxis = true
				loader.load params.url + '/model.dae', (collada) =>
					model = collada.scene
					model.name = params.name
					model.transforms = params.transforms
					rescaleModel model
					returnModelFile model

			else if params.options.type.jsonExported
				loader = new THREE.JSONLoader().load params.url + '/model.json', ( geometry, materials ) =>
					material = materials[0]
					material.skinning = true
					model = new THREE.SkinnedMesh geometry, material
					model.name = params.name

					model.animations 		= {}
					model.boneHelpers 		= []
					model.weightSchedule 	= []
					model.warpSchedule 		= []
					for animation in model.geometry.animations
						THREE.AnimationHandler.add animation
						model.animations[animation.name] = new THREE.Animation model, animation
						model[animation.name] = model.animations[animation.name]

					model.idle.weight = 1
					model.idle.play 0

					model.skeletonHelper = new THREE.SkeletonHelper model
					model.skeletonHelper.update()
					model.add model.skeletonHelper

					if params and params.update
						model.update = params.update

					model.transforms = params.transforms
					rescaleModel model
					returnModelFile model



		parseModelFile = (params, callback) =>
			if params.model.geometryID
				object = new THREE.Mesh
				object.name = params.model.name
				object.transforms = params.model.transforms 

				if not @graphic.geometry[params.model.geometryID] or @graphic.geometry[params.model.geometryID] is 'initialization'
					@getGeometryRequest params.model.geometryID
					@addEventListener 'loadedGeometry ' + params.model.geometryID, (e) =>
						object.geometry = e.geometry
						rescaleModel object
						if not @graphic.material[params.model.materialID] or @graphic.material[params.model.materialID] is 'initialization'
							@getMaterialRequest params.model.materialID
							@addEventListener 'loadedMaterial ' + params.model.materialID, (e) =>
								object.material = e.material
								returnModelFile object
						else
							object.material = @graphic.material[params.model.materialID]
							returnModelFile object
				else
					object.geometry = @graphic.geometry[params.model.geometryID]
					rescaleModel object
					if not @graphic.material[params.model.materialID] or @graphic.material[params.model.materialID] is 'initialization'
						@getMaterialRequest params.model.materialID
						@addEventListener 'loadedMaterial ' + params.model.materialID, (e) =>
							object.material = e.material
							returnModelFile object
					else
						object.material = @graphic.material[params.model.materialID]
						returnModelFile object


			else if params.model.children
				object = new THREE.Object3D
				for k, v in params.model.children
					parseModelFile { model: v }, (child) =>
						object[k] = child
						object.add child

			if callback then callback object



		rescaleModel = (model) ->
			model.updateMatrix()
			model.traverse (child) -> if child instanceof THREE.Mesh then child.geometry.applyMatrix model.matrix
			model.position.set 0, 0, 0
			model.rotation.set 0, 0, 0
			model.scale.set 1, 1, 1
			model.updateMatrix()
			bbox = new THREE.Box3().setFromObject model
			model.scale.x = 1 / ( bbox.max.x - bbox.min.x )
			model.scale.y = 1 / ( bbox.max.y - bbox.min.y )
			model.scale.z = 1 / ( bbox.max.z - bbox.min.z )
			parseOptionsTransforms model



		parseOptionsTransforms = (model) =>
			model.position.x = model.transforms.position.x
			model.position.y = model.transforms.position.y
			model.position.z = model.transforms.position.z
			model.rotation.x = model.transforms.rotation.x
			model.rotation.y = model.transforms.rotation.y
			model.rotation.z = model.transforms.rotation.z
			model.scale.x *= model.transforms.scale.x
			model.scale.y *= model.transforms.scale.y
			model.scale.z *= model.transforms.scale.z
			


		returnModelFile = (model) =>
			console.log 'returnModelFile', model.name, model
			@graphic.model[url] = model
			@removeLoadingTask url
			@fireEvent 'loadedModel ' + name, { model: model }





	getMaterialRequest: (name) ->
		console.log 'getMaterialRequest', name
		if not @graphic.material[name]
			@graphic.material[name] = 'initialization'
			url = 'assets/graphic/material/' + name
			@addLoadingTask url
			$.get url + '/options.json', (data) =>
				options = data
				
				if options.map.diffuse
					diffuse = THREE.ImageUtils.loadTexture url + '/diffuse.png'
				else
					diffuse = false

				if options.map.specular
					specular = THREE.ImageUtils.loadTexture url + '/specular.png'
				else
					specular = false

				if options.map.light
					light = THREE.ImageUtils.loadTexture url + '/light.png'
				else
					light = false

				
				if options.map.alpha
					alpha = THREE.ImageUtils.loadTexture url + '/alpha.png'
				else
					alpha = false

				if options.map.env
					urls = [
						url + '/env.png',
						url + '/env.png',
						url + '/env.png',
						url + '/env.png',
						url + '/env.png',
						url + '/env.png'
					]
					env = THREE.ImageUtils.loadTextureCube urls
					env.format = THREE.RGBFormat
				else
					env = false

				if options.map.normal
					normal = THREE.ImageUtils.loadTexture url + '/normal.png'
				else
					normal = false

				if options.map.bump
					bump = THREE.ImageUtils.loadTexture url + '/bump.png'
				else
					bump = false


				if options.shader
					loadvertexshader url, (vert) =>
						loadfragmentshader url, (frag) =>
							loadmaterialfile url, diffuse, specular, light, alpha, env, normal, bump, vert, frag
				else
					loadmaterialfile url, diffuse, specular, light, alpha, env, normal, bump
				
		loadvertexshader = (url, callback) =>
			$.get url + '/shader.vert', (data) =>
				callback data

		loadfragmentshader = (url, callback) =>
			$.get url + '/shader.frag', (data) =>
				callback data

		loadmaterialfile = (url, diffuse, specular, light, alpha, env, normal, bump, vert, frag) =>
			$.get url + '/material', (data) =>
				eval data
				@graphic.material[name] = material
				delay @assetdelay, =>
					@removeLoadingTask url
					@fireEvent 'loadedMaterial ' + name, { material: material }



	getGeometryRequest: (name) ->
		console.log 'getGeometryRequest', name
		if not @graphic.geometry[name]
			@graphic.geometry[name] = 'initialization'
			url = 'assets/graphic/geometry/' + name
			@addLoadingTask url
			$.get url + '/options.json', (data) =>
				options = data
				if options.type.js
					$.get url + '/geometry', (data) =>
						eval data
						@graphic.geometry[name] = geometry
						@fireEvent 'loadedGeometry ' + name, { geometry: geometry }
						@removeLoadingTask url
				else if options.type.dae
					loader = new THREE.ColladaLoader
					loader.options.convertUpAxis = true
					geometry = new THREE.Geometry
					loader.load  url + '/geometry.dae', (collada) =>
						collada.scene.traverse (children) =>
							if children.type is 'Mesh'
								children.updateMatrix()
								geometry.merge children.geometry, children.matrix
						@graphic.geometry[name] = geometry
						@fireEvent 'loadedGeometry ' + name, { geometry: geometry }
						@removeLoadingTask url



	loadTexture: (options) ->
		url = 'assets/' + options.path + options.name
		@addLoadingTask url
		options.scope[options.name] = THREE.ImageUtils.loadTexture url + '.png', undefined, => @removeLoadingTask url
###