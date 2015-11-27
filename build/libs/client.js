var GameEngine, lib;

lib = {};

GameEngine = (function() {
  function GameEngine(options) {
    this.settings = new Settings(this);
    this.manager = new ThreadManager({
      threads: 4
    });
    this.io = new IO(this);
    this.assets = new AssetsManager(this);
    this.graphic = new GraphicEngine(this);
    this.ui = new UI(this);
    this.input = new InputManager(this);
    this.account = new AccountManager(this);
    this.game = new GameManager(this);
    this.cmd = new CMD(this);
  }

  return GameEngine;

})();

var AccountManager;

AccountManager = (function() {
  function AccountManager(_) {
    this._ = _;
    this.activeCharacter = 'characterA';
    this.account = false;
    this.badSymbols = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '-', '+', '=', '{', '}', '[', ']', '/', '|', ',', '.', '<', '>', ':', ';', "'", '"'];
    this._.io.socket.on('AccountServer.registrationResponse', (function(_this) {
      return function(packet) {
        return _this.registrationResponse(packet);
      };
    })(this));
    this._.io.socket.on('AccountServer.loginResponse', (function(_this) {
      return function(packet) {
        return _this.loginResponse(packet);
      };
    })(this));
    this._.io.socket.on('AccountServer.logoutResponse', (function(_this) {
      return function(packet) {
        return _this.logoutResponse(packet);
      };
    })(this));
    this._.assets.addEventListener('ready', (function(_this) {
      return function() {
        return _this.loginRequest({
          name: 'admin',
          password: 'admin'
        });
      };
    })(this));
  }

  AccountManager.prototype.registrationRequest = function(options) {
    var i, name_flag, password_flag, _i, _j, _len, _len1, _ref, _ref1;
    if (!options.name) {
      return console.log('AccountManager.registrationRequest false 0.0');
    } else if (!options.password) {
      return console.log('AccountManager.registrationRequest false 0.1');
    } else {
      name_flag = false;
      _ref = this.badSymbols;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        i = _ref[_i];
        if (options.name.indexOf(i) + 1) {
          name_flag = true;
        }
      }
      password_flag = false;
      _ref1 = this.badSymbols;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        i = _ref1[_j];
        if (options.password.indexOf(i) + 1) {
          password_flag = true;
        }
      }
      if (name_flag) {
        return console.log('AccountManager.registrationRequest false 0.2');
      } else if (password_flag) {
        return console.log('AccountManager.registrationRequest false 0.3');
      } else {
        return this._.io.socket.emit('AccountManager.registrationRequest', {
          name: options.name,
          password: options.password
        });
      }
    }
  };

  AccountManager.prototype.registrationResponse = function(packet) {
    return console.log('AccountManager.registrationResponse', packet);
  };

  AccountManager.prototype.loginRequest = function(options) {
    if (!options.name) {
      return console.log('AccountManager.loginRequest false 1.0');
    } else if (!options.password) {
      return console.log('AccountManager.loginRequest false 1.1');
    } else {
      return this._.io.socket.emit('AccountManager.loginRequest', {
        name: options.name,
        password: options.password
      });
    }
  };

  AccountManager.prototype.loginResponse = function(packet) {
    console.log('AccountManager.loginResponse', packet);
    if (packet.result) {
      return this.updateAccount(packet.account);
    }
  };

  AccountManager.prototype.logoutRequest = function() {
    return this._.io.socket.emit('AccountManager.logoutRequest');
  };

  AccountManager.prototype.logoutResponse = function(packet) {
    console.log('AccountManager.logoutResponse', packet);
    if (packet.result) {
      return this.updateAccount(false);
    }
  };

  AccountManager.prototype.updateAccount = function(account) {
    return this.account = account;
  };

  return AccountManager;

})();

var AssetsManager;

AssetsManager = (function() {
  function AssetsManager(_) {
    this._ = _;
    Component.call(this, {
      componentID: 'AssetsManager',
      loading: {
        enabled: true,
        startTask: 'initialization',
        endFn: (function(_this) {
          return function() {
            console.log(getTime(), 'AssetsManager.ready');
            return _this.fireEvent('ready');
          };
        })(this),
        delay: 1000
      }
    });
    this.assetdelay = 1000;
    this.loadJSON({
      url: 'list',
      callback: (function(_this) {
        return function(data) {
          return _this.scanAssetsList(data.client, _this, '');
        };
      })(this)
    });
    this.removeLoadingTask('initialization');
  }

  AssetsManager.prototype.scanAssetsList = function(data, scope, path) {
    var k, v, _results;
    _results = [];
    for (k in data) {
      v = data[k];
      if (typeof v === 'string') {
        switch (v) {
          case 'json':
            _results.push(this.loadJSON({
              url: path + k,
              scope: scope,
              key: k
            }));
            break;
          case 'js':
            _results.push(this.loadJS({
              url: path + k,
              scope: scope,
              key: k
            }));
            break;
          case 'script':
            _results.push(this.loadScript({
              url: path + k,
              scope: scope,
              key: k
            }));
            break;
          case 'img':
            _results.push(this.loadImage({
              url: path + k,
              scope: scope,
              key: k
            }));
            break;
          case 'model':
            _results.push(this.getModelRequest(k));
            break;
          case 'material':
            _results.push(this.getMaterialRequest(k));
            break;
          case 'geometry':
            _results.push(this.getGeometryRequest(k));
            break;
          case 'texture':
            _results.push(this.loadTexture({
              scope: scope,
              path: path,
              name: k
            }));
            break;
          default:
            _results.push(void 0);
        }
      } else if (typeof v === 'object') {
        scope[k] = {};
        _results.push(this.scanAssetsList(v, scope[k], path + k + '/'));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  AssetsManager.prototype.loadScript = function(options) {
    var tag;
    tag = document.createElement('script');
    tag.src = 'assets/' + options.url + '.js';
    return document.body.appendChild(tag);
  };

  AssetsManager.prototype.loadJSON = function(options) {
    this.addLoadingTask(options.url + '.json');
    return $.get('assets/' + options.url + '.json', (function(_this) {
      return function(data) {
        if (options.callback) {
          options.callback(data);
        }
        if (options.scope) {
          options.scope[options.key] = data;
        }
        return _this.removeLoadingTask(options.url + '.json');
      };
    })(this));
  };

  AssetsManager.prototype.loadJS = function(options) {
    this.addLoadingTask(options.url + '.js');
    return $.ajax({
      url: 'assets/' + options.url + '.js',
      type: "GET",
      async: false,
      success: (function(_this) {
        return function(code) {
          eval(code);
          if (options.callback) {
            options.callback(data);
          }
          if (options.scope) {
            options.scope[options.key] = data;
          }
          return _this.removeLoadingTask(options.url + '.js');
        };
      })(this)
    });
  };

  AssetsManager.prototype.loadImage = function(options) {
    var image;
    this.addLoadingTask(options.url + '.png');
    image = document.createElement('img');
    image.src = 'assets/' + options.url + '.png';
    if (options.scope) {
      options.scope[options.key] = image;
    }
    return delay(this.assetdelay, (function(_this) {
      return function() {
        return _this.removeLoadingTask(options.url + '.png');
      };
    })(this));
  };

  AssetsManager.prototype.getModelRequest = function(name) {
    var loadModelFile, parseModelFile, parseOptionsTransforms, rescaleModel, returnModelFile, url;
    console.log('getModelRequest', name);
    if (!this.graphic.model[name]) {
      url = 'assets/graphic/model/' + name;
      this.addLoadingTask(name);
      $.get(url + '/options.json', (function(_this) {
        return function(data) {
          var options, transforms;
          options = data;
          transforms = {
            position: {
              x: 0,
              y: 0,
              z: 0
            },
            rotation: {
              x: 0,
              y: 0,
              z: 0
            },
            scale: {
              x: 1,
              y: 1,
              z: 1
            }
          };
          if (options.position) {
            transforms.position.x = options.position.x ? options.position.x : 0;
            transforms.position.y = options.position.y ? options.position.y : 0;
            transforms.position.z = options.position.z ? options.position.z : 0;
          }
          if (options.rotation) {
            transforms.rotation.x = options.rotation.x ? options.rotation.x : 0;
            transforms.rotation.y = options.rotation.y ? options.rotation.y : 0;
            transforms.rotation.z = options.rotation.z ? options.rotation.z : 0;
          }
          if (options.scale) {
            transforms.scale.x = options.scale.x ? options.scale.x : 1;
            transforms.scale.y = options.scale.y ? options.scale.y : 1;
            transforms.scale.z = options.scale.z ? options.scale.z : 1;
          }
          if (options.update) {
            return $.get(url + '/update', function(data) {
              eval(data);
              return loadModelFile({
                url: url,
                name: name,
                options: options,
                transforms: transforms,
                update: update
              });
            });
          } else {
            return loadModelFile({
              url: url,
              name: name,
              options: options,
              transforms: transforms
            });
          }
        };
      })(this));
    }
    loadModelFile = (function(_this) {
      return function(params) {
        var loader;
        if (params.options.type.json) {
          return $.get(params.url + '/model.json', function(data) {
            var model;
            model = data;
            model.name = params.name;
            model.transforms = params.transforms;
            return parseModelFile({
              model: model
            });
          });
        } else if (params.options.type.dae) {
          loader = new THREE.ColladaLoader;
          loader.options.convertUpAxis = true;
          return loader.load(params.url + '/model.dae', function(collada) {
            var model;
            model = collada.scene;
            model.name = params.name;
            model.transforms = params.transforms;
            rescaleModel(model);
            return returnModelFile(model);
          });
        } else if (params.options.type.jsonExported) {
          return loader = new THREE.JSONLoader().load(params.url + '/model.json', function(geometry, materials) {
            var material, model;
            material = materials[0];
            material.skinning = true;
            model = new THREE.SkinnedMesh(geometry, material);
            model.name = params.name;
            model.transferData = [];
            if (params && params.update) {
              model.transferData.push('update');
              model.update = params.update;
            }
            model.transforms = params.transforms;
            rescaleModel(model);
            return returnModelFile(model);
          });
        }
      };
    })(this);
    parseModelFile = (function(_this) {
      return function(params, callback) {
        var k, object, v, _ref;
        object = new THREE.Mesh;
        object.name = params.model.name;
        object.transforms = params.model.transforms;
        if (params.model.geometryID) {
          if (!_this.graphic.geometry[params.model.geometryID] || _this.graphic.geometry[params.model.geometryID] === 'initialization') {
            _this.getGeometryRequest(params.model.geometryID);
            _this.addEventListener('loadedGeometry ' + params.model.geometryID, function(e) {
              object.geometry = e.geometry;
              rescaleModel(object);
              if (!_this.graphic.material[params.model.materialID] || _this.graphic.material[params.model.materialID] === 'initialization') {
                _this.getMaterialRequest(params.model.materialID);
                return _this.addEventListener('loadedMaterial ' + params.model.materialID, function(e) {
                  object.material = e.material;
                  return returnModelFile(object);
                });
              } else {
                object.material = _this.graphic.material[params.model.materialID];
                return returnModelFile(object);
              }
            });
          } else {
            object.geometry = _this.graphic.geometry[params.model.geometryID];
            rescaleModel(object);
            if (!_this.graphic.material[params.model.materialID] || _this.graphic.material[params.model.materialID] === 'initialization') {
              _this.getMaterialRequest(params.model.materialID);
              _this.addEventListener('loadedMaterial ' + params.model.materialID, function(e) {
                object.material = e.material;
                return returnModelFile(object);
              });
            } else {
              object.material = _this.graphic.material[params.model.materialID];
              returnModelFile(object);
            }
          }
        } else {
          returnModelFile(object);
        }
        if (params.model.children) {
          _ref = params.model.children;
          for (k in _ref) {
            v = _ref[k];
            parseModelFile({
              model: v
            }, function(child) {
              object[k] = child;
              return object.add(child);
            });
          }
        }
        if (callback) {
          return callback(object);
        }
      };
    })(this);
    rescaleModel = function(model) {
      var bbox;
      model.updateMatrix();
      model.traverse(function(child) {
        if (child instanceof THREE.Mesh) {
          return child.geometry.applyMatrix(model.matrix);
        }
      });
      model.position.set(0, 0, 0);
      model.rotation.set(0, 0, 0);
      model.scale.set(1, 1, 1);
      model.updateMatrix();
      bbox = new THREE.Box3().setFromObject(model);
      model.scale.x = 1 / (bbox.max.x - bbox.min.x);
      model.scale.y = 1 / (bbox.max.y - bbox.min.y);
      model.scale.z = 1 / (bbox.max.z - bbox.min.z);
      return parseOptionsTransforms(model);
    };
    parseOptionsTransforms = (function(_this) {
      return function(model) {
        model.position.x = model.transforms.position.x;
        model.position.y = model.transforms.position.y;
        model.position.z = model.transforms.position.z;
        model.rotation.x = model.transforms.rotation.x;
        model.rotation.y = model.transforms.rotation.y;
        model.rotation.z = model.transforms.rotation.z;
        model.scale.x *= model.transforms.scale.x;
        model.scale.y *= model.transforms.scale.y;
        return model.scale.z *= model.transforms.scale.z;
      };
    })(this);
    return returnModelFile = (function(_this) {
      return function(model) {
        console.log('returnModelFile', model.name, model);
        _this.graphic.model[name] = model;
        _this.removeLoadingTask(name);
        return _this.fireEvent('loadedModel ' + name, {
          model: model
        });
      };
    })(this);
  };

  AssetsManager.prototype.getMaterialRequest = function(name) {
    var loadfragmentshader, loadmaterialfile, loadvertexshader, url;
    console.log('getMaterialRequest', name);
    if (!this.graphic.material[name]) {
      this.graphic.material[name] = 'initialization';
      url = 'assets/graphic/material/' + name;
      this.addLoadingTask(name);
      $.get(url + '/options.json', (function(_this) {
        return function(data) {
          var alpha, bump, diffuse, env, light, normal, options, specular, urls;
          options = data;
          if (options.map.diffuse) {
            diffuse = THREE.ImageUtils.loadTexture(url + '/diffuse.png');
          } else {
            diffuse = false;
          }
          if (options.map.specular) {
            specular = THREE.ImageUtils.loadTexture(url + '/specular.png');
          } else {
            specular = false;
          }
          if (options.map.light) {
            light = THREE.ImageUtils.loadTexture(url + '/light.png');
          } else {
            light = false;
          }
          if (options.map.alpha) {
            alpha = THREE.ImageUtils.loadTexture(url + '/alpha.png');
          } else {
            alpha = false;
          }
          if (options.map.env) {
            urls = [url + '/env.png', url + '/env.png', url + '/env.png', url + '/env.png', url + '/env.png', url + '/env.png'];
            env = THREE.ImageUtils.loadTextureCube(urls);
            env.format = THREE.RGBFormat;
          } else {
            env = false;
          }
          if (options.map.normal) {
            normal = THREE.ImageUtils.loadTexture(url + '/normal.png');
          } else {
            normal = false;
          }
          if (options.map.bump) {
            bump = THREE.ImageUtils.loadTexture(url + '/bump.png');
          } else {
            bump = false;
          }
          if (options.shader) {
            return loadvertexshader(url, function(vert) {
              return loadfragmentshader(url, function(frag) {
                return loadmaterialfile(url, diffuse, specular, light, alpha, env, normal, bump, vert, frag);
              });
            });
          } else {
            return loadmaterialfile(url, diffuse, specular, light, alpha, env, normal, bump);
          }
        };
      })(this));
    }
    loadvertexshader = (function(_this) {
      return function(url, callback) {
        return $.get(url + '/shader.vert', function(data) {
          return callback(data);
        });
      };
    })(this);
    loadfragmentshader = (function(_this) {
      return function(url, callback) {
        return $.get(url + '/shader.frag', function(data) {
          return callback(data);
        });
      };
    })(this);
    return loadmaterialfile = (function(_this) {
      return function(url, diffuse, specular, light, alpha, env, normal, bump, vert, frag) {
        return $.get(url + '/material', function(data) {
          var material;
          eval(data);
          if (!material) {
            material = new THREE.MeshBasicMaterial;
          }
          _this.graphic.material[name] = material;
          return delay(_this.assetdelay, function() {
            _this.removeLoadingTask(name);
            return _this.fireEvent('loadedMaterial ' + name, {
              material: material
            });
          });
        });
      };
    })(this);
  };

  AssetsManager.prototype.getGeometryRequest = function(name) {
    var url;
    console.log('getGeometryRequest', name);
    if (!this.graphic.geometry[name]) {
      this.graphic.geometry[name] = 'initialization';
      url = 'assets/graphic/geometry/' + name;
      this.addLoadingTask(url);
      return $.get(url + '/options.json', (function(_this) {
        return function(data) {
          var geometry, loader, options;
          options = data;
          if (options.type.js) {
            return $.get(url + '/geometry', function(data) {
              eval(data);
              _this.graphic.geometry[name] = geometry;
              _this.fireEvent('loadedGeometry ' + name, {
                geometry: geometry
              });
              return _this.removeLoadingTask(url);
            });
          } else if (options.type.dae) {
            loader = new THREE.ColladaLoader;
            loader.options.convertUpAxis = true;
            geometry = new THREE.Geometry;
            return loader.load(url + '/geometry.dae', function(collada) {
              collada.scene.traverse(function(children) {
                if (children.type === 'Mesh') {
                  children.updateMatrix();
                  return geometry.merge(children.geometry, children.matrix);
                }
              });
              _this.graphic.geometry[name] = geometry;
              _this.fireEvent('loadedGeometry ' + name, {
                geometry: geometry
              });
              return _this.removeLoadingTask(url);
            });
          }
        };
      })(this));
    }
  };

  AssetsManager.prototype.loadTexture = function(url) {
    var path;
    path = 'assets/graphic/texture/';
    this.addLoadingTask(path + url);
    return this.graphic.texture[url] = THREE.ImageUtils.loadTexture(path + url + '.png', void 0, (function(_this) {
      return function() {
        return delay(_this.assetdelay, function() {
          return _this.removeLoadingTask(path + url);
        });
      };
    })(this));
  };

  AssetsManager.prototype.loadTexture = function(options) {
    var url;
    url = 'assets/' + options.path + options.name;
    this.addLoadingTask(url);
    return options.scope[options.name] = THREE.ImageUtils.loadTexture(url + '.png', void 0, (function(_this) {
      return function() {
        return _this.removeLoadingTask(url);
      };
    })(this));
  };

  return AssetsManager;

})();


/*
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
		 *console.log 'loadJSON', options.url
		$.get 'assets/' + options.url + '.json', (data) =>
			if options.callback then options.callback data
			if options.scope then options.scope[options.key] = data
			@removeLoadingTask options.url+'.json'



	loadJS: (options) ->
		@addLoadingTask options.url+'.js'
		 *console.log 'loadJS', url
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
		 *console.log 'loadImage', url
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
 */

var AudioEngine;

lib.AL = {};

AudioEngine = (function() {
  function AudioEngine(_) {
    this._ = _;
    this.scene = new lib.AL.Scene(this._);
    this._.graphic.addEventListener('ready', (function(_this) {
      return function() {

        /*for k, v of @_.assets.gamedata.objects.static
        				if v.sound then @scene.add k, new lib.AL.Object
        					static: true
        					id: k
        					sound: v.sound
        					position: @_.graphic.scene.objectsLayer.objects[k].position
        
        			for k, v of @_.assets.gamedata.objects.environment
        				if v.sound then @scene.add k, new lib.AL.Object
        					static: true
        					id: k
        					sound: v.sound
        					position: @_.graphic.scene.objectsLayer.objects[k].position
         */
      };
    })(this));
    this._.graphic.addEventListener('render', (function(_this) {
      return function() {
        return _this.scene.renderUpdate(_this._.graphic.camera.position);
      };
    })(this));
  }

  return AudioEngine;

})();

lib.AL.Scene = (function() {
  function Scene(_) {
    this._ = _;
    this.children = {};
  }

  Scene.prototype.add = function(k, object) {
    return this.children[k] = object;
  };

  Scene.prototype.remove = function(k) {
    return delete this.children[k];
  };

  Scene.prototype.renderUpdate = function(cameraPosition) {
    var k, v, _ref, _results;
    _ref = this.children;
    _results = [];
    for (k in _ref) {
      v = _ref[k];
      _results.push(v.setVolume(cameraPosition));
    }
    return _results;
  };

  Scene.prototype.worldUpdate = function(data) {
    var k, object, v, _i, _len, _ref, _ref1, _ref2, _results;
    _ref = this.children;
    for (k in _ref) {
      object = _ref[k];
      if (object.dynamic) {
        object.inWorld = false;
      }
    }
    _ref1 = data.dynamic;
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      object = _ref1[_i];
      if (object.sound) {
        if (!this.children[object.id]) {
          v = new lib.AL.Object({
            dynamic: true,
            id: object.id,
            sound: object.sound,
            position: this._.graphic.scene.dynamicLayer.objects[object.id].position
          });
          v.inWorld = true;
          this.add(object.id, v);
        } else {
          this.children[object.id].inWorld = true;
          this.children[object.id].worldUpdate(object);
        }
      }
    }
    _ref2 = this.children;
    _results = [];
    for (k in _ref2) {
      object = _ref2[k];
      if (object.dynamic) {
        if (!object.inWorld) {
          _results.push(this.remove(k));
        } else {
          _results.push(void 0);
        }
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  return Scene;

})();

lib.AL.Object = (function() {
  function Object(options) {
    this._ = options._, this.id = options.id, this.sound = options.sound, this.position = options.position, this["static"] = options["static"], this.dynamic = options.dynamic;
    this.element = document.createElement('audio');
    this.element.src = 'assets/audio/' + this.sound.id + '.mp3';
    this.element.autoplay = true;
    this.element.loop = true;
    this.element.preload = true;
    this.element.volume = 1;
    this.element.play();
    this.maxDistance = this.sound.distance;
  }

  Object.prototype.setVolume = function(point) {
    var distance, value;
    distance = new THREE.Vector3(point.x - this.position.x, point.y - this.position.y, point.z - this.position.z).length();
    if (distance <= this.maxDistance) {
      value = (this.maxDistance - distance) / this.maxDistance;
    } else {
      value = 0;
    }
    return this.element.volume = value;
  };

  Object.prototype.worldUpdate = function(data) {
    return this.position.set(data.position.x, data.position.y, data.position.z);
  };

  return Object;

})();

var CMD;

CMD = (function() {
  function CMD(_) {
    this._ = _;
  }

  CMD.prototype.execute = function(k, v) {
    return this._.io.socket.emit('cmd.message', {
      k: k,
      v: v
    });
  };

  return CMD;

})();

var delay, getTime;

getTime = function() {
  return new Date().getHours() + ':' + new Date().getMinutes() + ':' + new Date().getSeconds() + ':' + new Date().getMilliseconds();
};

delay = function(time, fn) {
  return setTimeout((function(_this) {
    return function() {
      return fn();
    };
  })(this), time);
};

var Component;

Component = (function() {
  function Component(options) {
    this.__componentID = options.componentID;
    this.__events = {};
    this.__loading = {
      enabled: options.loading.enabled ? options.loading.enabled : false,
      startTask: options.loading.startTask ? options.loading.startTask : false,
      endFn: options.loading.endFn ? options.loading.endFn.bind(this) : false,
      stack: [],
      delay: options.loading.delay || 100
    };
    this.fireEvent = function(eventID, e) {
      var v, _i, _len, _ref, _results;
      if (this.__events[eventID]) {
        _ref = this.__events[eventID];
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          v = _ref[_i];
          _results.push(v(e));
        }
        return _results;
      }
    };
    this.addEventListener = function(eventID, callback) {
      if (!this.__events[eventID]) {
        this.__events[eventID] = [];
      }
      return this.__events[eventID].push(callback);
    };
    this.removeEventListener = function(eventID, callback) {
      return this.__events[eventID].splice(this.__events[eventID].indexOf(callback), 1);
    };
    this.addLoadingTask = function(value) {
      this.__loading.stack.push(value);
      return console.log(this.__componentID + '.addLoadingTask', value);
    };
    this.removeLoadingTask = function(value) {
      this.__loading.stack.splice(this.__loading.stack.indexOf(value), 1);
      return console.log(this.__componentID + '.removeLoadingTask', value);
    };
    this.checkLoadingTask = function() {
      if (this.__loading.stack.length !== 0) {
        return delay(this.__loading.delay, (function(_this) {
          return function() {
            return _this.checkLoadingTask();
          };
        })(this));
      } else {
        console.log(getTime(), this.__componentID + '.loaded');
        if (this.__loading.endFn) {
          return this.__loading.endFn();
        }
      }
    };
    console.log(getTime(), this.__componentID + '.constructor');
    if (this.__loading.enabled) {
      this.addLoadingTask(this.__loading.startTask);
      this.checkLoadingTask();
    }
  }

  return Component;

})();

var GameManager, GameObject, World;

GameManager = (function() {
  function GameManager(_) {
    this._ = _;
    this.world = new World(this._);
  }

  return GameManager;

})();

World = (function() {
  function World(_) {
    this._ = _;
    Component.call(this, {
      componentID: 'World',
      loading: {
        enabled: true,
        startTask: 'initialization',
        endFn: (function(_this) {
          return function() {
            return _this.fireEvent('ready');
          };
        })(this),
        delay: 1000
      }
    });
    this.objects = {
      environment: {},
      "static": {},
      dynamic: {}
    };
    this._.assets.addEventListener('ready', (function(_this) {
      return function() {
        return _this._.io.socket.on('GameServer.loginResponce', function(packet) {
          var canvas, k, v, _ref, _ref1;
          canvas = document.createElement('canvas');
          canvas.width = _this._.assets.gamedata.world.constants.size.x;
          canvas.height = _this._.assets.gamedata.world.constants.size.z;
          _this.heightmap = canvas.getContext('2d');
          _this.heightmap.drawImage(_this._.assets.gamedata.terrain.heightmap, 0, 0, canvas.width, canvas.height);
          canvas = document.createElement('canvas');
          canvas.width = _this._.assets.gamedata.world.constants.size.x;
          canvas.height = _this._.assets.gamedata.world.constants.size.z;
          _this.grassmap = canvas.getContext('2d');
          _this.grassmap.drawImage(_this._.assets.gamedata.grass.grassmap, 0, 0, canvas.width, canvas.height);
          _ref = _this._.assets.gamedata.objects["static"];
          for (k in _ref) {
            v = _ref[k];
            _this.objects["static"][k] = new GameObject({
              _: _this._,
              "static": true,
              k: k,
              options: v
            });
          }
          _ref1 = _this._.assets.gamedata.objects.environment;
          for (k in _ref1) {
            v = _ref1[k];
            _this.objects.environment[k] = new GameObject({
              _: _this._,
              environment: true,
              k: k,
              options: v
            });
          }
          _this._.io.socket.on('GameServer.gameWorldUpdate', function(packet) {
            return _this.gameWorldUpdate(packet);
          });
          return _this.removeLoadingTask('initialization');
        });
      };
    })(this));
  }

  World.prototype.gameWorldUpdate = function(packet) {
    var k, v, _ref, _ref1, _ref2, _results;
    _ref = this.objects.dynamic;
    for (k in _ref) {
      v = _ref[k];
      v.removeTask = true;
    }
    _ref1 = packet.dynamic;
    for (k in _ref1) {
      v = _ref1[k];
      if (this.objects.dynamic[k]) {
        this.objects.dynamic[k].removeTask = false;
        this.objects.dynamic[k].gameWorldUpdate(v);
      } else {
        this.add(k, v);
      }
    }
    _ref2 = this.objects.dynamic;
    _results = [];
    for (k in _ref2) {
      v = _ref2[k];
      if (v.removeTask) {
        _results.push(this.remove(k));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  World.prototype.add = function(k, v) {
    return this.objects.dynamic[k] = new GameObject({
      _: this._,
      dynamic: true,
      k: k,
      options: v
    });
  };

  World.prototype.remove = function(k) {
    delete this.objects.dynamic[k];
    return this._.graphic.scene.layers.dynamic["delete"](k);
  };

  World.prototype.getTerrainYValue = function(x, z) {
    var i, j;
    i = Math.floor(x);
    j = Math.floor(z);
    if (i >= 0 && j >= 0) {
      return this._.assets.gamedata.world.constants.size.y * (1 / 255) * billinearInterpolation({
        A: this.heightmap.getImageData(i, j, 1, 1).data[0],
        B: this.heightmap.getImageData(i + 1, j, 1, 1).data[0],
        C: this.heightmap.getImageData(i + 1, j + 1, 1, 1).data[0],
        D: this.heightmap.getImageData(i, j + 1, 1, 1).data[0],
        px: x - i,
        py: z - j
      });
    } else {
      return 0;
    }
  };

  return World;

})();

GameObject = (function() {
  function GameObject(constructor) {
    var v;
    this._ = constructor._, this["static"] = constructor["static"], this.dynamic = constructor.dynamic, this.environment = constructor.environment;
    v = constructor.options;
    this.name = constructor.k;
    this.states = {};
    this.physic = {
      collider: v.physic && v.physic.collider ? v.physic.collider : 'box'
    };
    this.graphic = v.graphic ? v.graphic : {
      model: 'default'
    };
    this.position = new THREE.Vector3;
    this.rotation = new THREE.Vector3;
    this.scale = new THREE.Vector3;
    this.quaternion = new THREE.Quaternion;
    this.position.x = v.position && v.position.x ? v.position.x : 0;
    this.position.z = v.position && v.position.z ? v.position.z : 0;
    this.rotation.x = v.rotation && v.rotation.x ? v.rotation.x : 0;
    this.rotation.y = v.rotation && v.rotation.y ? v.rotation.y : 0;
    this.rotation.z = v.rotation && v.rotation.z ? v.rotation.z : 0;
    this.scale.x = v.scale && v.scale.x ? v.scale.x : 1;
    this.scale.y = v.scale && v.scale.y ? v.scale.y : 1;
    this.scale.z = v.scale && v.scale.z ? v.scale.z : 1;
    if (this["static"] || this.environment) {
      this.position.y = this._.game.world.getTerrainYValue(this.position.x, this.position.z) + this.scale.y / 2;
    }
    this.graphicObject = new GraphicObject(this._, this);
  }

  GameObject.prototype.gameWorldUpdate = function(v) {
    this.states = v.states;
    this.physic.velocity = v.physic.velocity;
    this.position.set(v.position.x, v.position.y, v.position.z);
    if (v.classname.Unit) {
      this.quaternion.set(0, 0, 0, 1);
      this.rotation.set(0, -v.vY * Math.PI / 180, 0);
    } else {
      this.quaternion.set(v.quaternion.x, v.quaternion.y, v.quaternion.z, v.quaternion.w);
    }
    return this.graphicObject.updateDataFromGameObject();
  };

  GameObject.prototype.tick = function(options) {
    this.position.set(options.position.x, options.position.y, options.position.z);
    this.position.set(options.quaternion.x, options.quaternion.y, options.quaternion.z, options.quaternion.w);
    this.graphicObject.position.set(this.position.x, this.position.y, this.position.z);
    return this.graphicObject.quaternion.set(this.quaternion.x, this.quaternion.y, this.quaternion.z, this.quaternion.w);
  };

  return GameObject;

})();

var GraphicEngine;

lib.GL = {};

GraphicEngine = (function() {
  function GraphicEngine(_) {
    this._ = _;
    Component.call(this, {
      componentID: 'Graphic',
      loading: {
        enabled: true,
        startTask: 'initialization',
        endFn: (function(_this) {
          return function() {
            _this.fireEvent('ready');
            return _this.start();
          };
        })(this),
        delay: 1000
      }
    });
    this.settings = this._.settings.gui.addFolder('graphic');
    this.settings.open();
    this.postprocessing = true;
    this.settings.add(this, 'postprocessing');
    this.renderer = new lib.GL.Renderer;
    this.clock = new THREE.Clock;
    this.monitor = new lib.GL.Monitor;
    this.viewport = new lib.GL.Viewport({
      id: 'viewport3d-wrapper',
      children: [this.renderer.domElement, this.monitor.fps.domElement, this.monitor.renderer.domElement]
    });
    this.addLoadingTask('Scene');
    this.removeLoadingTask('initialization');
    this._.assets.addEventListener('ready', (function(_this) {
      return function() {
        _this.camera = new lib.GL.Camera(_this._);
        _this.scene = new lib.GL.Scene(_this._);
        return _this.gfx = new lib.GL.Gfx(_this._);
      };
    })(this));
    this._.io.socket.on('GameServer.leaveWorldResponse', (function(_this) {
      return function(packet) {};
    })(this));
  }

  GraphicEngine.prototype.resize = function() {
    this.camera.aspect = this.viewport.element.width() / this.viewport.element.height();
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.viewport.element.width(), this.viewport.element.height());
    return this.gfx.onResize();
  };

  GraphicEngine.prototype.start = function() {
    console.log('Graphic.start');
    $(window).bind('resize', this.resize.bind(this));
    this.resize();
    return this.render();
  };

  GraphicEngine.prototype.stop = function() {
    $(window).unbind('resize', this.resize);
    return cancelAnimationFrame(this.interval);
  };

  GraphicEngine.prototype.render = function() {
    var dt;
    dt = this.clock.getDelta();
    this.scene.tick({
      dt: dt
    });
    this.camera.tick({
      dt: dt
    });
    THREE.AnimationHandler.update(dt);
    if (!this.postprocessing) {
      this.renderer.render(this.scene, this.camera);
    } else {
      this.gfx.render();
    }
    this.monitor.tick(this.renderer);
    this.fireEvent('render');
    return this.interval = requestAnimationFrame(this.render.bind(this));
  };

  return GraphicEngine;

})();

var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

lib.GL.Camera = (function(_super) {
  __extends(Camera, _super);

  function Camera(_) {
    this._ = _;
    this._.game.world.addEventListener('ready', (function(_this) {
      return function() {
        THREE.PerspectiveCamera.call(_this, 75, _this._.graphic.viewport.element.width() / _this._.graphic.viewport.element.height(), 0.1, 100000);
        _this.up = new THREE.Vector3(0, 1, 0);
        _this.settings = _this._.graphic.settings.addFolder('camera');
        _this.settings.add({
          set: function() {
            return _this.setMode('float');
          }
        }, 'set').name('float');
        _this.settings.add({
          set: function() {
            return _this.setMode('orbit');
          }
        }, 'set').name('orbit');
        _this.settings.add({
          set: function() {
            return _this.setMode('fpc');
          }
        }, 'set').name('fpc');
        _this.position.set(_this._.assets.gamedata.world.constants.size.x / 2, _this._.assets.gamedata.world.constants.size.y + 10, _this._.assets.gamedata.world.constants.size.z / 2);
        _this.data = {
          sensitivity: 0.75,
          float: {
            enabled: false,
            fi: 90,
            tetha: 60,
            moving: false,
            speed: 1
          },
          orbit: {
            enabled: false,
            d: 5,
            fi: 90,
            tetha: 60
          },
          fpc: {
            enabled: false,
            fi: 90,
            tetha: 60
          },
          set: {
            x: function(v) {
              var fi;
              fi = 90 + v;
              if (_this.data.float.enabled) {
                return _this.data.float.fi = fi;
              } else if (_this.data.orbit.enabled) {
                return _this.data.orbit.fi = fi;
              } else if (_this.data.fpc.enabled) {
                return _this.data.fpc.fi = fi;
              }
            },
            y: function(v) {
              var tetha;
              tetha = v;
              if (_this.data.float.enabled) {
                return _this.data.float.tetha = tetha;
              } else if (_this.data.orbit.enabled) {
                return _this.data.orbit.tetha = tetha;
              } else if (_this.data.fpc.enabled) {
                return _this.data.fpc.tetha = tetha;
              }
            }
          }
        };
        _this.settings.add(_this.data, 'sensitivity', 0.5, 1).name('sensitivity');
        _this.settings.add(_this.data.orbit, 'd', 2, 10).name('r');
        _this.mouse = {
          previous: {
            x: 0,
            y: 0
          },
          current: {
            x: 0,
            y: 0
          }
        };
        _this._.graphic.viewport.element.bind('mousedown', function(e) {
          if (_this.data.float.enabled) {
            return _this.data.float.moving = true;
          }
        });
        _this._.graphic.viewport.element.bind('mouseup', function(e) {
          if (_this.data.float.enabled) {
            return _this.data.float.moving = false;
          }
        });
        _this._.graphic.viewport.element.bind('mousemove', function(e) {
          _this.mouse.previous.x = _this.mouse.current.x;
          _this.mouse.previous.y = _this.mouse.current.y;
          _this.mouse.current.x = e.offsetX;
          _this.mouse.current.y = e.offsetY;
          _this.data.set.x(_this.data.sensitivity * _this.mouse.current.x - _this._.graphic.viewport.element.width() / 2);
          return _this.data.set.y(_this.data.sensitivity * _this.mouse.current.y - _this._.graphic.viewport.element.height() / 2);
        });
        _this._.graphic.viewport.element.bind('mousewheel', function(e) {
          return _this.mode.orbit.d += 0.25 * e.originalEvent.wheelDelta / 120;
        });
        return _this.setMode();
      };
    })(this));
  }

  Camera.prototype.setMode = function(v) {
    if (!v) {
      v = 'float';
    }
    this.data.orbit.enabled = false;
    this.data.float.enabled = false;
    this.data.fpc.enabled = false;
    if (v === 'float') {
      this.data.float.enabled = true;
    } else if (v === 'orbit') {
      this.data.orbit.enabled = true;
    } else if (v === 'fpc') {
      this.data.fpc.enabled = true;
    }
    return this.tick();
  };

  Camera.prototype.tick = function(options) {
    var dx, dy, dz, object, position;
    if (this.data.float.enabled) {
      dx = Math.sin(this.data.float.tetha * Math.PI / 180) * Math.cos(this.data.float.fi * Math.PI / 180);
      dz = Math.sin(this.data.float.tetha * Math.PI / 180) * Math.sin(this.data.float.fi * Math.PI / 180);
      dy = Math.cos(this.data.float.tetha * Math.PI / 180);
      if (this.data.float.moving) {
        this.position.set(this.position.x + this.data.float.speed * dx, this.position.y + this.data.float.speed * dy, this.position.z + this.data.float.speed * dz);
      }
      this.lookAt(new THREE.Vector3(this.position.x + dx, this.position.y + dy, this.position.z + dz));
      object = this._.game.world.objects.dynamic[this._.account.account.name];
      if (object) {
        return object.visible = true;
      }
    } else if (this.data.orbit.enabled) {
      dx = Math.sin(this.data.orbit.tetha * Math.PI / 180) * Math.cos(this.data.orbit.fi * Math.PI / 180);
      dz = Math.sin(this.data.orbit.tetha * Math.PI / 180) * Math.sin(this.data.orbit.fi * Math.PI / 180);
      dy = Math.cos(this.data.orbit.tetha * Math.PI / 180);
      object = this._.game.world.objects.dynamic[this._.account.account.name];
      if (object) {
        object.visible = true;
        position = object.position;
      } else {
        position = this.position;
      }
      this.lookAt(new THREE.Vector3(position.x, position.y, position.z));
      this.position.set(position.x + dx * this.data.orbit.d, position.y + dy * this.data.orbit.d, position.z + dz * this.data.orbit.d);
      if (object && this.position.y < object.position.y) {
        return this.position.y = object.position.y + 1;
      }
    } else if (this.data.fpc.enabled) {
      dx = Math.sin(this.data.fpc.tetha * Math.PI / 180) * Math.cos(this.data.fpc.fi * Math.PI / 180);
      dz = Math.sin(this.data.fpc.tetha * Math.PI / 180) * Math.sin(this.data.fpc.fi * Math.PI / 180);
      dy = Math.cos(this.data.fpc.tetha * Math.PI / 180);
      object = this._.game.world.objects.dynamic[this._.account.account.name];
      if (object) {
        object.visible = false;
        position = object.position;
      } else {
        position = this.position;
      }
      this.position.set(position.x, position.y + 0.5, position.z);
      return this.lookAt(new THREE.Vector3(position.x + dx, position.y + 0.5 + dy, position.z + dz));
    }
  };

  return Camera;

})(THREE.PerspectiveCamera);

var GfxAddBloom, GfxAddGodrays, GfxAddHDR, GfxBleach, GfxBloomRT, GfxBrightnessContrast, GfxColorCorrection, GfxColorify, GfxDOF, GfxDepthRT, GfxGammaCorrection, GfxGodraysRT, GfxHDRRT, GfxHueSaturation, GfxInput, GfxMotionBlur, GfxOutput, GfxRenderRT, GfxSSAO, GfxVignette;

lib.GL.Gfx = (function() {
  function Gfx(_) {
    this._ = _;
    this._.game.world.addEventListener('ready', (function(_this) {
      return function() {
        _this._.graphic.addLoadingTask('Gfx');
        return _this._.graphic.scene.addEventListener('ready', function() {
          _this.settings = _this._.graphic.settings.addFolder('gfx');
          _this.composer = new THREE.EffectComposer(_this._.graphic.renderer, void 0);
          _this.viewport = _this._.graphic.viewport;
          _this.scene = _this._.graphic.scene;
          _this.camera = _this._.graphic.camera;
          _this.RT = {};
          _this.effects = [];
          _this.add(new GfxRenderRT(_this));
          _this.add(new GfxHDRRT(_this));
          _this.add(new GfxBloomRT(_this));
          _this.add(new GfxInput(_this));
          _this.add(new GfxMotionBlur(_this));
          _this.add(new GfxAddHDR(_this));
          _this.add(new GfxAddBloom(_this));
          _this.add(new GfxHueSaturation(_this));
          _this.add(new GfxBrightnessContrast(_this));
          _this.add(new GfxColorify(_this));
          _this.add(new GfxGammaCorrection(_this));
          _this.add(new GfxDOF(_this));
          _this.add(new GfxVignette(_this));
          _this.add(new GfxOutput(_this));
          return _this._.graphic.removeLoadingTask('Gfx');
        });
      };
    })(this));
  }

  Gfx.prototype.add = function(v) {
    return this.effects.push(v);
  };

  Gfx.prototype.onResize = function() {
    var v, _i, _len, _ref, _results;
    _ref = this.effects;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      v = _ref[_i];
      if (v.onResize) {
        _results.push(v.onResize());
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  Gfx.prototype.render = function() {
    var v, _i, _j, _len, _len1, _ref, _ref1, _results;
    _ref = this.effects;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      v = _ref[_i];
      if (v.beforeRender) {
        v.beforeRender();
      }
    }
    this.composer.render();
    _ref1 = this.effects;
    _results = [];
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      v = _ref1[_j];
      if (v.afterRender) {
        _results.push(v.afterRender());
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  return Gfx;

})();

GfxRenderRT = (function() {
  function GfxRenderRT(_) {
    this._ = _;
    this.scale = 1;
    this._.RT.render = new THREE.WebGLRenderTarget(this._.viewport.element.width() * this.scale, this._.viewport.element.height() * this.scale, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      stencilBufer: false
    });
    this._.RT.render.scale = this.scale;
    this.data = {
      pass: new THREE.RenderPass(this._.scene, this._.camera),
      FXAA: new THREE.ShaderPass(THREE.FXAAShader)
    };
    this.data.FXAA.uniforms['resolution'].value.set(1 / this._.viewport.element.width(), 1 / this._.viewport.element.height());
    this._.composer.addPass(this.data.pass);
    this._.composer.addPass(this.data.FXAA);
    this._.composer.addPass(new THREE.SavePass(this._.RT.render));
  }

  return GfxRenderRT;

})();

GfxDepthRT = (function() {
  function GfxDepthRT(_) {
    this._ = _;
    this.scale = 1;
    this._.RT.depth = new THREE.WebGLRenderTarget(this._.viewport.element.width() * this.scale, this._.viewport.element.height() * this.scale, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      stencilBufer: false
    });
    this._.RT.depth.scale = this.scale;
    this.data = {
      far: {
        value: 150,
        temp: 0
      }
    };
    this._.composer.addPass(new THREE.RenderPass(this._.scene, this._.camera, new THREE.MeshDepthMaterial));
    this._.composer.addPass(new THREE.SavePass(this._.RT.depth));
  }

  GfxDepthRT.prototype.beforeRender = function() {
    this.data.far.temp = this._.camera.far;
    return this._.camera.far = this.data.far.value;
  };

  GfxDepthRT.prototype.afterRender = function() {
    return this._.camera.far = this.data.far.temp;
  };

  return GfxDepthRT;

})();

GfxGodraysRT = (function() {
  function GfxGodraysRT(_) {
    this._ = _;
    this.scale = 1 / 8;
    this._.RT.godrays = new THREE.WebGLRenderTarget(this._.viewport.element.width() * this.scale, this._.viewport.element.height() * this.scale, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      stencilBufer: false
    });
    this._.RT.godrays.scale = this.scale;
    this.data = {
      occlusion: {
        RT: {
          sun: new THREE.WebGLRenderTarget(this._.viewport.element.width() * this.scale, this._.viewport.element.height() * this.scale, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
            stencilBufer: false
          }),
          occlusions: new THREE.WebGLRenderTarget(this._.viewport.element.width() / 2, this._.viewport.element.height() / 2, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
            stencilBufer: false
          })
        },
        pass: {
          sun: new THREE.RenderPass(this._.scene.sunScene, this._.camera),
          occlusions: new THREE.RenderPass(this._.scene, this._.camera, new THREE.MeshBasicMaterial({
            color: 0xffffff,
            fog: false
          })),
          generate: new THREE.ShaderPass(THREE.OcclusionGenerateShader)
        },
        blur: {
          hblur: new THREE.ShaderPass(THREE.HorizontalBlurShader),
          vblur: new THREE.ShaderPass(THREE.VerticalBlurShader)
        }
      },
      generate: {
        pass: new THREE.ShaderPass(THREE.GodRays2.Godrays),
        blur: {
          hblur: new THREE.ShaderPass(THREE.HorizontalBlurShader),
          vblur: new THREE.ShaderPass(THREE.VerticalBlurShader)
        }
      }
    };
    this.data.occlusion.blur.hblur.uniforms.h.value = 2 / this._.viewport.element.width();
    this.data.occlusion.blur.vblur.uniforms.v.value = 2 / this._.viewport.element.height();
    this.data.generate.blur.hblur.uniforms.h.value = 2 / this._.viewport.element.width();
    this.data.generate.blur.vblur.uniforms.v.value = 2 / this._.viewport.element.height();
    this.data.occlusion.pass.generate.uniforms.tDiffuse2.value = this.data.occlusion.RT.occlusions;
    this._.composer.addPass(this.data.occlusion.pass.sun);
    this._.composer.addPass(new THREE.SavePass(this.data.occlusion.RT.sun));
    this._.composer.addPass(this.data.occlusion.pass.occlusions);
    this._.composer.addPass(new THREE.SavePass(this.data.occlusion.RT.occlusion));
    this._.composer.addPass(new THREE.TexturePass(this.data.occlusion.RT.sun));
    this._.composer.addPass(this.data.occlusion.pass.generate);
    this._.composer.addPass(this.data.occlusion.blur.hblur);
    this._.composer.addPass(this.data.occlusion.blur.vblur);
    this._.composer.addPass(this.data.generate.pass);
    this._.composer.addPass(this.data.generate.blur.hblur);
    this._.composer.addPass(this.data.generate.blur.vblur);
    this._.composer.addPass(new THREE.SavePass(this._.RT.godrays));
    this._.settings.godrays = this._.settings.addFolder('godrays');
    this._.settings.godrays.add(this.data.occlusion.blur.hblur.uniforms.h, 'value', 0, 0.01).name('occlusion.blur.h');
    this._.settings.godrays.add(this.data.occlusion.blur.vblur.uniforms.v, 'value', 0, 0.01).name('occlusion.blur.v');
    this._.settings.godrays.add(this.data.generate.blur.hblur.uniforms.h, 'value', 0, 0.01).name('rays.blur.h');
    this._.settings.godrays.add(this.data.generate.blur.vblur.uniforms.v, 'value', 0, 0.01).name('rays.blur.v');
  }

  GfxGodraysRT.prototype.onResize = function() {
    return this.data.occlusion.RT.occlusions.setSize(this._.viewport.element.width() / 2, this._.viewport.element.height() / 2);
  };

  return GfxGodraysRT;

})();

GfxHDRRT = (function() {
  function GfxHDRRT(_) {
    this._ = _;
    this.scale = 1 / 4;
    this._.RT.hdr = new THREE.WebGLRenderTarget(this._.viewport.element.width() * this.scale, this._.viewport.element.height() * this.scale, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      stencilBufer: false
    });
    this._.RT.hdr.scale = this.scale;
    this.data = {
      threshold: new THREE.ShaderPass(THREE.ThresholdShader),
      hblur: new THREE.ShaderPass(THREE.HorizontalBlurShader),
      vblur: new THREE.ShaderPass(THREE.VerticalBlurShader)
    };
    this.data.hblur.uniforms.h.value = 0.003;
    this.data.vblur.uniforms.v.value = 0.003;
    this._.composer.addPass(new THREE.TexturePass(this._.RT.render));
    this._.composer.addPass(this.data.threshold);
    this._.composer.addPass(this.data.hblur);
    this._.composer.addPass(this.data.vblur);
    this._.composer.addPass(new THREE.SavePass(this._.RT.hdr));
    this.data.threshold.uniforms.threshold.value = 0.9;
    this._.settings.hdr = this._.settings.addFolder('HDR');
    this._.settings.hdr.add(this.data.threshold.uniforms.threshold, 'value').name('HDRRT.threshold');
    this._.settings.hdr.add(this.data.hblur.uniforms.h, 'value').name('HDRRT.hblur');
    this._.settings.hdr.add(this.data.vblur.uniforms.v, 'value').name('HDRRT.vblur');
    this._.composer.addPass(new THREE.TexturePass(this._.RT.hrd));
  }

  return GfxHDRRT;

})();

GfxBloomRT = (function() {
  function GfxBloomRT(_) {
    this._ = _;
    this.scale = 1 / 4;
    this._.RT.bloom = new THREE.WebGLRenderTarget(this._.viewport.element.width() * this.scale, this._.viewport.element.height() * this.scale, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      stencilBufer: false
    });
    this._.RT.bloom.scale = this.scale;
    this.data = {
      blur: {
        hblur: new THREE.ShaderPass(THREE.HorizontalBlurShader),
        vblur: new THREE.ShaderPass(THREE.VerticalBlurShader)
      }
    };
    this.data.blur.hblur.uniforms.h.value = 0.005;
    this.data.blur.vblur.uniforms.v.value = 0.005;
    this._.composer.addPass(new THREE.TexturePass(this._.RT.render));
    this._.composer.addPass(this.data.blur.hblur);
    this._.composer.addPass(this.data.blur.vblur);
    this._.composer.addPass(new THREE.SavePass(this._.RT.bloom));
    this._.settings.bloom = this._.settings.addFolder('Bloom');
  }

  return GfxBloomRT;

})();

GfxInput = (function() {
  function GfxInput(_) {
    var pass;
    this._ = _;
    pass = new THREE.TexturePass(this._.RT.render);
    this._.composer.addPass(pass);
  }

  return GfxInput;

})();

GfxSSAO = (function() {
  function GfxSSAO(_) {
    this._ = _;
    this.data = {
      pass: new THREE.ShaderPass(THREE.SSAOShader)
    };
    this.data.pass.uniforms['tDepth'].value = this._.RT.depth;
    this.data.pass.uniforms['onlyAO'].value = 1;
    this.data.pass.uniforms['size'].value = new THREE.Vector2(this._.viewport.element.width(), this._.viewport.element.height());
    this.data.pass.uniforms['cameraFar'].value = 150;
    this.data.pass.uniforms['aoClamp'].value = 0.5;
    this.data.pass.uniforms['lumInfluence'].value = 0.5;
    this._.composer.addPass(this.data.pass);
    this._.settings.SSAO = this._.settings.addFolder('SSAO');
    this._.settings.SSAO.add(this.data.pass.uniforms.cameraFar, 'value').name('cameraFar');
    this._.settings.SSAO.add(this.data.pass.uniforms.aoClamp, 'value').name('aoClamp');
    this._.settings.SSAO.add(this.data.pass.uniforms.lumInfluence, 'value').name('lumInfluence');
  }

  GfxSSAO.prototype.onResize = function() {
    return this.data.pass.uniforms['size'].value = new THREE.Vector2(this._.viewport.element.width(), this._.viewport.element.height());
  };

  return GfxSSAO;

})();

GfxAddGodrays = (function() {
  function GfxAddGodrays(_) {
    this._ = _;
    this.data = {
      pass: new THREE.ShaderPass(THREE.GodRays2.Additive)
    };
    this.data.pass.uniforms['tAdd'].value = this._.RT.godrays;
    this.data.pass.uniforms['fCoeff'].value = 1;
    this._.settings.godrays.add(this.data.pass.uniforms.fCoeff, 'value', 0, 10).name('add');
    this._.settings.godrays.add(this.data.pass, 'enabled');
    this._.composer.addPass(this.data.pass);
  }

  return GfxAddGodrays;

})();

GfxAddHDR = (function() {
  function GfxAddHDR(_) {
    this._ = _;
    this.data = {
      pass: new THREE.ShaderPass(THREE.HDRBloomAddShader),
      pass2: new THREE.ShaderPass(THREE.GodRays2.Additive)
    };
    this.data.pass.uniforms['tAdd'].value = this._.RT.hdr;
    this.data.pass.uniforms['fCoeff'].value = 0.5;
    this.data.pass2.uniforms['tAdd'].value = this._.RT.hdr;
    this.data.pass2.uniforms['fCoeff'].value = 1;
    this._.composer.addPass(this.data.pass);
    this._.composer.addPass(this.data.pass2);
    this._.settings.hdr.add(this.data.pass2, 'enabled').name('enabled');
    this._.settings.hdr.add(this.data.pass.uniforms.fCoeff, 'value').name('AddHDR.Coeff');
    this._.settings.hdr.add(this.data.pass2.uniforms.fCoeff, 'value').name('AddHDR.Coeff2');
  }

  return GfxAddHDR;

})();

GfxAddBloom = (function() {
  function GfxAddBloom(_) {
    this._ = _;
    this.data = {
      pass: new THREE.ShaderPass(THREE.GodRays2.Additive)
    };
    this.data.pass.uniforms['tAdd'].value = this._.RT.bloom;
    this.data.pass.uniforms['fCoeff'].value = 0.5;
    this._.composer.addPass(this.data.pass);
    this._.settings.bloom.add(this.data.pass, 'enabled').name('enabled');
    this._.settings.bloom.add(this.data.pass.uniforms.fCoeff, 'value').name('AddBloom.Coeff');
  }

  return GfxAddBloom;

})();

GfxBleach = (function() {
  function GfxBleach(_) {
    this._ = _;
    this.data = {
      pass: new THREE.ShaderPass(THREE.BleachBypassShader)
    };
    this.data.pass.uniforms['opacity'].value = 0;
    this._.composer.addPass(this.data.pass);
  }

  return GfxBleach;

})();

GfxHueSaturation = (function() {
  function GfxHueSaturation(_) {
    this._ = _;
    this.data = {
      pass: new THREE.ShaderPass(THREE.HueSaturationShader)
    };
    this.data.pass.uniforms['hue'].value = 0;
    this.data.pass.uniforms['saturation'].value = 0;
    this._.composer.addPass(this.data.pass);
    this._.settings.HueSaturation = this._.settings.addFolder('HueSaturation');
    this._.settings.HueSaturation.add(this.data.pass.uniforms.hue, 'value', -1, 1).name('hue');
    this._.settings.HueSaturation.add(this.data.pass.uniforms.saturation, 'value', -1, 1).name('saturation');
  }

  return GfxHueSaturation;

})();

GfxBrightnessContrast = (function() {
  function GfxBrightnessContrast(_) {
    this._ = _;
    this.data = {
      pass: new THREE.ShaderPass(THREE.BrightnessContrastShader)
    };
    this.data.pass.uniforms['brightness'].value = 0;
    this.data.pass.uniforms['contrast'].value = 0;
    this._.composer.addPass(this.data.pass);
    this._.settings.BrightnessContrast = this._.settings.addFolder('BrightnessContrast');
    this._.settings.BrightnessContrast.add(this.data.pass.uniforms.brightness, 'value', -1, 1).name('brightness');
    this._.settings.BrightnessContrast.add(this.data.pass.uniforms.contrast, 'value', -1, 1).name('contrast');
  }

  return GfxBrightnessContrast;

})();

GfxColorCorrection = (function() {
  function GfxColorCorrection(_) {
    this._ = _;
    this.data = {
      pass: new THREE.ShaderPass(THREE.ColorCorrectionShader)
    };
    this.data.pass.uniforms['powRGB'].value.set(1, 1, 1);
    this.data.pass.uniforms['mulRGB'].value.set(1, 1, 1);
    this._.composer.addPass(this.data.pass);
  }

  return GfxColorCorrection;

})();

GfxColorify = (function() {
  function GfxColorify(_) {
    this._ = _;
    this.data = {
      pass: new THREE.ShaderPass(THREE.ColorifyShader)
    };
    this.data.pass.uniforms['color'].value = new THREE.Color(0xff0000);
    this.data.pass.enabled = false;
    this._.composer.addPass(this.data.pass);
    this._.settings.Colorify = this._.settings.addFolder('Colorify');
    this._.settings.Colorify.add(this.data.pass, 'enabled').name('enabled');
  }

  return GfxColorify;

})();

GfxGammaCorrection = (function() {
  function GfxGammaCorrection(_) {
    this._ = _;
    this.data = {
      pass: new THREE.ShaderPass(THREE.GammaCorrectionShader)
    };
    this.data.pass.uniforms['gamma'].value = 1;
    this._.composer.addPass(this.data.pass);
    this._.settings.GammaCorrection = this._.settings.addFolder('GammaCorrection');
    this._.settings.GammaCorrection.add(this.data.pass.uniforms.gamma, 'value', 0, 2).name('gamma');
  }

  return GfxGammaCorrection;

})();

GfxVignette = (function() {
  function GfxVignette(_) {
    this._ = _;
    this.data = {
      pass: new THREE.ShaderPass(THREE.VignetteShader)
    };
    this.data.pass.uniforms['offset'].value = 1.0;
    this.data.pass.uniforms['darkness'].value = 1.0;
    this._.composer.addPass(this.data.pass);
    this._.settings.Vignette = this._.settings.addFolder('Vignette');
    this._.settings.Vignette.add(this.data.pass, 'enabled').name('enabled');
    this._.settings.Vignette.add(this.data.pass.uniforms.offset, 'value', 0, 2).name('offset');
    this._.settings.Vignette.add(this.data.pass.uniforms.darkness, 'value', 0, 2).name('darkness');
  }

  return GfxVignette;

})();

GfxDOF = (function() {
  function GfxDOF(_) {
    this._ = _;
    this.data = {
      pass: new THREE.ShaderPass(THREE.BokehShader)
    };
    this.data.pass.uniforms['tDepth'].value = this._.RT.depth;
    this.data.pass.uniforms['aspect'].value = this._.viewport.element.width() / this._.viewport.element.height();
    this.data.pass.uniforms['focus'].value = 0.15;
    this.data.pass.uniforms['aperture'].value = 0.005;
    this.data.pass.uniforms['maxblur'].value = 1.0;
    this._.composer.addPass(this.data.pass);
    this._.settings.DOF = this._.settings.addFolder('DOF');
    this._.settings.DOF.add(this.data.pass, 'enabled').name('enabled');
    this._.settings.DOF.add(this.data.pass.uniforms.focus, 'value', 0, 1).name('focus');
    this._.settings.DOF.add(this.data.pass.uniforms.aperture, 'value', 0, 0.1).name('aperture');
    this._.settings.DOF.add(this.data.pass.uniforms.maxblur, 'value', 0, 1).name('maxblur');
  }

  return GfxDOF;

})();

GfxMotionBlur = (function() {
  function GfxMotionBlur(_) {
    this._ = _;
    this.data = {
      mCurrent: new THREE.Matrix4,
      mPrev: new THREE.Matrix4,
      tmpArray: new THREE.Matrix4,
      pass: new THREE.ShaderPass(THREE.MotionBlurShader)
    };
    this.data.pass.uniforms['tDepth'].value = this._.RT.depth;
    this.data.pass.enabled = false;
    this._.composer.addPass(this.data.pass);
    this._.settings.MotionBlur = this._.settings.addFolder('MotionBlur');
    this._.settings.MotionBlur.add(this.data.pass, 'enabled').name('enabled');
  }

  GfxMotionBlur.prototype.beforeRender = function() {
    this.data.tmpArray.copy(this._.camera.matrixWorldInverse);
    this.data.tmpArray.multiply(this._.camera.projectionMatrix);
    this.data.mCurrent.getInverse(this.data.tmpArray);
    this.data.pass.uniforms.viewProjectionInverseMatrix.value.copy(this.data.mCurrent);
    this.data.pass.uniforms.previousViewProjectionMatrix.value.copy(this.data.mPrev);
    return this.data.mPrev.copy(this.data.tmpArray);
  };

  return GfxMotionBlur;

})();

GfxOutput = (function() {
  function GfxOutput(_) {
    this._ = _;
    this.data = {
      pass: new THREE.ShaderPass(THREE.CopyShader)
    };
    this.data.pass.renderToScreen = true;
    this._.composer.addPass(this.data.pass);
  }

  return GfxOutput;

})();

lib.GL.Monitor = (function() {
  function Monitor(options) {
    this.fps = new Stats;
    this.fps.domElement.style.position = 'absolute';
    this.fps.domElement.style.left = '0px';
    this.fps.domElement.style.top = '0px';
    this.renderer = new THREEx.RendererStats;
    this.renderer.domElement.style.position = 'absolute';
    this.renderer.domElement.style.bottom = '0px';
    this.renderer.domElement.style.left = '0px';
  }

  Monitor.prototype.tick = function(renderer) {
    this.fps.update();
    return this.renderer.update(renderer);
  };

  return Monitor;

})();

var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

lib.GL.Renderer = (function(_super) {
  __extends(Renderer, _super);

  function Renderer(options) {
    THREE.WebGLRenderer.call(this, {
      antialias: false
    });
  }

  return Renderer;

})(THREE.WebGLRenderer);

var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

lib.GL.Scene = (function(_super) {
  __extends(Scene, _super);

  function Scene(_) {
    this._ = _;
    Component.call(this, {
      componentID: 'Scene',
      loading: {
        enabled: true,
        startTask: 'initialization',
        endFn: (function(_this) {
          return function() {
            _this.fireEvent('ready');
            return _this._.graphic.removeLoadingTask('Scene');
          };
        })(this),
        delay: 1000
      }
    });
    THREE.Scene.call(this);
    this.layers = {};
    this.sunScene = new THREE.Scene;
    this._.game.world.addEventListener('ready', (function(_this) {
      return function() {
        _this.settings = _this._.graphic.settings.addFolder('scene');
        return _this.initialize();
      };
    })(this));
  }

  Scene.prototype.initialize = function(options) {
    console.log(getTime(), 'scene.initialize');
    this.fog = new THREE.FogExp2(0xc69d4b, 0.0015);
    this.settings.add(this.fog, 'density', 0, 0.1).name('fog');
    this._.graphic.renderer.setClearColor(this.fog.color);
    this.define('axisHelper', new THREE.AxisHelper(10));
    this.define('ambientlight', new THREE.AmbientLight(0xffffff));
    this.define('atmosphere', new lib.GL.AtmosphereLayer(this._));
    this.define('infinity', new lib.GL.InfinityLayer(this._));
    this.define('terrain', new lib.GL.TerrainLayer(this._));
    this.define('grass', new lib.GL.GrassLayer(this._));
    this.define('environment', new lib.GL.ObjectsLayer(this._, 'environment'));
    this.define('static', new lib.GL.ObjectsLayer(this._, 'static'));
    this.define('dynamic', new lib.GL.ObjectsLayer(this._, 'dynamic'));
    this.sun = {
      light: new THREE.DirectionalLight(0xffffff, 1),
      occlusion: new THREE.Mesh(new THREE.SphereGeometry(35, 32, 32), new THREE.MeshBasicMaterial({
        color: 0xFFCC33
      }))
    };
    this.sun.light.position.set(-150, 50, 150);
    this.sun.occlusion.position.set(-150, 50, 150);
    this.sun.light.intensity = 0.5;
    this.sun.light.castShadow = true;
    this.sun.light.shadowMapWidth = 1024;
    this.sun.light.shadowMapHeight = 1024;
    this.sun.light.shadowDarkness = 0.75;
    this.sun.light.shadowCameraNear = 1;
    this.sun.light.shadowCameraFar = 1000;
    this.sun.light.shadowCameraLeft = -50;
    this.sun.light.shadowCameraRight = 50;
    this.sun.light.shadowCameraTop = 50;
    this.sun.light.shadowCameraBottom = -50;
    this.add(this.sun.light);
    this.sunScene.add(this.sun.occlusion);
    return this.removeLoadingTask('initialization');
  };

  Scene.prototype.tick = function(options) {
    var k, v, _ref, _results;
    _ref = this.layers;
    _results = [];
    for (k in _ref) {
      v = _ref[k];
      if (v.tick) {
        _results.push(v.tick(options));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  Scene.prototype.define = function(k, v) {
    this.layers[k] = v;
    return this.add(v);
  };

  return Scene;

})(THREE.Scene);

var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

lib.GL.AtmosphereLayer = (function(_super) {
  __extends(AtmosphereLayer, _super);

  function AtmosphereLayer(_) {
    var geometry, material;
    this._ = _;
    THREE.Object3D.call(this);
    this.name = 'atmosphere';
    this.radius = 10000;
    geometry = new THREE.SphereGeometry(this.radius);
    material = this._.assets.graphic.material.atmosphere;
    this.define('sky', new THREE.Mesh(geometry, material));
    this.sky.position.y = -100;
    this.rotation.y = 4;
    this.position.x = this._.assets.gamedata.world.constants.size.x / 2;
    this.position.z = this._.assets.gamedata.world.constants.size.z / 2;
  }

  AtmosphereLayer.prototype.define = function(k, v) {
    this[k] = v;
    return this.add(v);
  };

  AtmosphereLayer.prototype.tick = function(options) {
    return this.position.set(this._.graphic.camera.position.x, this._.graphic.camera.position.y, this._.graphic.camera.position.z);
  };

  return AtmosphereLayer;

})(THREE.Object3D);

var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

lib.GL.GrassLayer = (function(_super) {
  __extends(GrassLayer, _super);

  function GrassLayer(_) {
    var i, j, temp, _i, _j, _k, _l, _ref, _ref1, _ref2, _ref3;
    this._ = _;
    this._.graphic.scene.addLoadingTask('GrassLayer');
    Component.call(this, {
      componentID: 'GrassLayer',
      loading: {
        enabled: true,
        startTask: 'initialization',
        endFn: (function(_this) {
          return function() {
            _this.fireEvent('ready');
            return _this._.graphic.scene.removeLoadingTask('GrassLayer');
          };
        })(this),
        delay: 1000
      }
    });
    THREE.Object3D.call(this);
    this.name = 'grass';
    this.heightmap = this._.game.world.heightmap;
    this.grassmap = this._.game.world.grassmap;
    this.data = {
      size: {
        x: this._.assets.gamedata.world.constants.size.x,
        y: this._.assets.gamedata.world.constants.size.y,
        z: this._.assets.gamedata.world.constants.size.z
      },
      flatsize: 16,
      distance: [0],
      levels: 0,
      dencity: {
        size: 0.5
      },
      grassheight: 1,
      material: []
    };
    temp = {
      flatsize: this.data.flatsize
    };
    while (temp.flatsize / 2 > 1) {
      temp.flatsize /= 2;
      this.data.levels++;
    }
    for (i = _i = 0, _ref = this.data.levels; _i <= _ref; i = _i += 1) {
      this.data.material[i] = this._.assets.graphic.material.grass.clone();
      this.data.material[i].map = this._.assets.graphic.texture.grass['diffuse' + i];
    }
    for (i = _j = 1, _ref1 = this.data.levels; _j <= _ref1; i = _j += 1) {
      this.data.distance[i] = this.data.flatsize * i;
    }
    this.radius = {
      initialization: 48,
      update: 48,
      visibility: 50
    };
    this.flats = {};
    for (i = _k = 0, _ref2 = this.data.size.z / this.data.flatsize - 1; _k <= _ref2; i = _k += 1) {
      for (j = _l = 0, _ref3 = this.data.size.x / this.data.flatsize - 1; _l <= _ref3; j = _l += 1) {
        this.createFlat(i, j);
      }
    }
    this.removeLoadingTask('initialization');
  }

  GrassLayer.prototype.createFlat = function(i, j) {
    var flat, grassmap_units, hasgrass, heightmap_units, imagedata, index, mid_value, summ, x, y, _i, _j, _k, _l, _ref, _ref1, _ref2, _ref3;
    imagedata = this.grassmap.getImageData(i * this.data.flatsize, j * this.data.flatsize, this.data.flatsize, this.data.flatsize).data;
    grassmap_units = [];
    hasgrass = false;
    for (index = _i = 0, _ref = imagedata.length - 1; _i <= _ref; index = _i += 4) {
      y = Math.floor(index / (4 * this.data.flatsize));
      if (!grassmap_units[y]) {
        grassmap_units[y] = [];
      }
      x = index / 4 - this.data.flatsize * y;
      grassmap_units[y][x] = 0;
      if (imagedata[index] > 0) {
        if (!hasgrass) {
          hasgrass = true;
        }
        grassmap_units[y][x] = imagedata[index];
      }
    }
    if (hasgrass) {
      imagedata = this.heightmap.getImageData(i * this.data.flatsize, j * this.data.flatsize, this.data.flatsize + 1, this.data.flatsize + 1).data;
      heightmap_units = [];
      for (index = _j = 0, _ref1 = imagedata.length - 1; _j <= _ref1; index = _j += 4) {
        y = Math.floor(index / (4 * (this.data.flatsize + 1)));
        if (!heightmap_units[y]) {
          heightmap_units[y] = [];
        }
        x = index / 4 - (this.data.flatsize + 1) * y;
        if (i === (this.data.size.x / this.data.flatsize) - 1 || j === (this.data.size.z / this.data.flatsize) - 1) {
          if (y === this.data.flatsize || x === this.data.flatsize) {
            imagedata[index] = imagedata[index - 4];
          }
        }
        heightmap_units[y][x] = imagedata[index];
      }
      summ = 0;
      for (y = _k = 0, _ref2 = heightmap_units.length - 1; _k <= _ref2; y = _k += 1) {
        for (x = _l = 0, _ref3 = heightmap_units[y].length - 1; _l <= _ref3; x = _l += 1) {
          summ += heightmap_units[y][x];
        }
      }
      mid_value = summ / ((this.data.flatsize + 1) * (this.data.flatsize + 1));
      flat = new lib.GL.GrassLayerFlat({
        _: this._,
        i: i,
        j: j,
        mid_value: mid_value,
        units: {
          heightmap: heightmap_units,
          grassmap: grassmap_units
        },
        layer: this
      });
      return this.define('flat' + i + j, flat);
    }
  };

  GrassLayer.prototype.define = function(k, v) {
    this.flats[k] = v;
    return this.add(v);
  };

  GrassLayer.prototype.tick = function(options) {
    var k, v, _ref, _results;
    _ref = this.flats;
    _results = [];
    for (k in _ref) {
      v = _ref[k];
      _results.push(v.tick(options));
    }
    return _results;
  };

  return GrassLayer;

})(THREE.Object3D);

lib.GL.GrassLayerFlat = (function(_super) {
  __extends(GrassLayerFlat, _super);

  function GrassLayerFlat(options) {
    THREE.LOD.call(this);
    this._ = options._, this.i = options.i, this.j = options.j, this.units = options.units, this.mid_value = options.mid_value, this.layer = options.layer;
    this.level = 0;
    this.position.x = (this.i + 0.5) * this.layer.data.flatsize;
    this.position.y = this.mid_value / 255 * this.layer.data.size.y;
    this.position.z = (this.j + 0.5) * this.layer.data.flatsize;
    if (this.getDistanceToCamera() <= this.layer.radius.initialization) {
      this.initialization();
    }
  }

  GrassLayerFlat.prototype.getDistanceToCamera = function() {
    var p;
    p = new THREE.Vector3().copy(this.position);
    return new THREE.Vector3(this._.graphic.camera.position.x - p.x, this._.graphic.camera.position.y - p.y, this._.graphic.camera.position.z - p.z).length();
  };

  GrassLayerFlat.prototype.initialization = function() {
    var level;
    level = this.getLevel();
    this.level = level;
    this.layer.addLoadingTask('createFlat ' + this.i + ' ' + this.j);
    return this.createGeometry({
      level: level
    }, (function(_this) {
      return function() {
        return _this.layer.removeLoadingTask('createFlat ' + _this.i + ' ' + _this.j);
      };
    })(this));
  };

  GrassLayerFlat.prototype.tick = function(options) {
    var level;
    if (this.getDistanceToCamera() < this.layer.radius.update) {
      level = this.getLevel();
      this.level = level;
      this.checkGeometry({
        level: level
      });
    }
    return this.update(this._.graphic.camera);

    /*
    		for v in @children
    			if v.material.uniforms.time.value >= 1 
    				v.material.uniforms.time.value = 0 
    			else
    				v.material.uniforms.time.value += options.dt/5
     */
  };

  GrassLayerFlat.prototype.setVisibility = function() {
    if (this.getDistanceToCamera() <= this.layer.radius.visibility) {
      if (!this.material.visible) {
        return this.material.visible = true;
      }
    } else {
      if (this.material.visible) {
        return this.material.visible = false;
      }
    }
  };

  GrassLayerFlat.prototype.getLevel = function() {
    var distance, i, level, _i, _ref;
    distance = this.getDistanceToCamera();
    level = -1;
    for (i = _i = 1, _ref = this.layer.data.distance.length; _i <= _ref; i = _i += 1) {
      if (distance < this.layer.data.distance[i]) {
        level = i - 1;
        break;
      }
    }
    if (level === -1) {
      level = this.layer.data.levels - 1;
    }
    return level;
  };

  GrassLayerFlat.prototype.checkGeometry = function(options) {
    var draw, frustum, i, object, _i, _len, _ref;
    frustum = new THREE.Frustum;
    frustum.setFromMatrix(new THREE.Matrix4().multiplyMatrices(this._.graphic.camera.projectionMatrix, this._.graphic.camera.matrixWorldInverse));
    if (frustum.containsPoint(this.position)) {
      if (!this.creating) {
        draw = true;
        _ref = this.objects;
        for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
          object = _ref[i];
          if (object.distance === this.layer.data.distance[options.level]) {
            draw = false;
          }
        }
        if (draw) {
          return this.createGeometry(options);
        }
      }
    } else {
      if (this.creating) {
        this._.manager.cancel(this.creating);
        return this.creating = false;
      }
    }
  };

  GrassLayerFlat.prototype.createGeometry = function(options, callback) {
    this.creating = new Task({
      id: 'GrassLayer.createGrassFlatGeometry ' + this.i + ' ' + this.j,
      worker: 'worker',
      data: {
        task: 'GrassLayer.createGrassFlatGeometry',
        level: options.level,
        mid_value: this.mid_value,
        terrain: {
          size: {
            y: this.layer.data.size.y
          }
        },
        units: this.units,
        flatsize: this.layer.data.flatsize,
        dencity: this.layer.data.dencity,
        grassheight: this.layer.data.grassheight
      },
      callback: (function(_this) {
        return function(e) {
          var geometry, material, mesh;
          geometry = setGeometryVFData(e.data.geometry);
          material = _this.layer.data.material[options.level];
          mesh = new THREE.Mesh(geometry, material);
          mesh.receiveShadow = true;
          _this.addLevel(mesh, _this.layer.data.distance[options.level]);
          if (callback) {
            return callback(e);
          }
        };
      })(this)
    });
    return this._.manager["do"](this.creating);
  };

  return GrassLayerFlat;

})(THREE.LOD);

var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

lib.GL.InfinityLayer = (function(_super) {
  __extends(InfinityLayer, _super);

  function InfinityLayer(_) {
    var geometry, mesh;
    this._ = _;
    THREE.Object3D.call(this);
    this.name = 'infinity';
    this.offset = 10000;
    geometry = new THREE.PlaneGeometry(this._.assets.gamedata.world.constants.size.x + this.offset * 2, this._.assets.gamedata.world.constants.size.z + this.offset * 2, 1, 1);
    this.material = this._.assets.graphic.material.water2;
    mesh = new THREE.Mesh(geometry, this.material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(this._.assets.gamedata.world.constants.size.x / 2, 1, this._.assets.gamedata.world.constants.size.z / 2);
    this.add(mesh);
  }

  InfinityLayer.prototype.tick = function(options) {};

  return InfinityLayer;

})(THREE.Object3D);

var GraphicObject,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

lib.GL.ObjectsLayer = (function(_super) {
  __extends(ObjectsLayer, _super);

  function ObjectsLayer(_, name) {
    this._ = _;
    Component.call(this, {
      componentID: 'ObjectsLayer',
      loading: {
        enabled: true,
        startTask: 'initialization',
        endFn: (function(_this) {
          return function() {
            _this.fireEvent('ready');
            return _this._.graphic.scene.removeLoadingTask('ObjectsLayer' + ' ' + name);
          };
        })(this),
        delay: 1000
      }
    });
    this._.graphic.scene.addLoadingTask('ObjectsLayer' + ' ' + name);
    THREE.Object3D.call(this);
    this.name = name;
    this.objects = {};
    this.radius = {
      load: 200,
      show: 210
    };
    this.removeLoadingTask('initialization');
    this._.game.world.addEventListener('ready', (function(_this) {
      return function() {
        var k, v, _ref, _results;
        _ref = _this._.game.world.objects[_this.name];
        _results = [];
        for (k in _ref) {
          v = _ref[k];
          _results.push(_this.define(k, v.graphic));
        }
        return _results;
      };
    })(this));
  }

  ObjectsLayer.prototype.define = function(k, v) {
    this.objects[k] = v;
    return this.add(v);
  };

  ObjectsLayer.prototype["delete"] = function(k) {
    this.remove(this.objects[k]);
    return delete this.objects[k];
  };

  ObjectsLayer.prototype.tick = function(options) {
    var k, v, _ref, _results;
    options.radius = this.radius;
    _ref = this.objects;
    _results = [];
    for (k in _ref) {
      v = _ref[k];
      _results.push(v.tick(options));
    }
    return _results;
  };

  return ObjectsLayer;

})(THREE.Object3D);

GraphicObject = (function(_super) {
  __extends(GraphicObject, _super);

  function GraphicObject(_, gameObject) {
    this._ = _;
    this.gameObject = gameObject;
    THREE.Object3D.call(this);
    this.name = this.gameObject.name;
    this.model = {};
    this.physic = {};
    this.scale.set(this.gameObject.scale.x, this.gameObject.scale.y, this.gameObject.scale.z);
    this.updateDataFromGameObject();
    this.flags = {
      loaded: false,
      loading: false
    };
    this.layerID = this.gameObject["static"] ? 'static' : this.gameObject.environment ? 'environment' : this.gameObject.dynamic ? 'dynamic' : void 0;
    this._.graphic.scene.addEventListener('ready', (function(_this) {
      return function() {
        return _this._.graphic.scene.layers[_this.layerID].define(_this.name, _this);
      };
    })(this));
  }

  GraphicObject.prototype.updateDataFromGameObject = function() {
    this.position.x = this.gameObject.position.x;
    this.position.y = this.gameObject.position.y;
    this.position.z = this.gameObject.position.z;
    this.rotation.x = this.gameObject.rotation.x;
    this.rotation.y = this.gameObject.rotation.y;
    return this.rotation.z = this.gameObject.rotation.z;
  };

  GraphicObject.prototype.tick = function(options) {
    var d;
    d = this.getDistanceToCamera();
    if (!this.flags.loaded && !this.flags.loading) {
      if (d < options.radius.load) {
        this.load();
      }
    }
    if (this.flags.loaded) {
      if (!this.visible && d < options.radius.show) {
        this.visible = true;
      }
      if (this.visible && d > options.radius.show) {
        this.visible = false;
      }
    }
    if (this.model.update) {
      return this.model.update(this.model, this.gameObject);
    }
  };

  GraphicObject.prototype.getDistanceToCamera = function() {
    return new THREE.Vector3(this._.graphic.camera.position.x - this.position.x, this._.graphic.camera.position.y - this.position.y, this._.graphic.camera.position.z - this.position.z).length();
  };

  GraphicObject.prototype.load = function() {
    var animation, k, model, _i, _j, _len, _len1, _ref, _ref1;
    this.flags.loading = true;
    this.define('model', this._.assets.graphic.model[this.gameObject.graphic.model].clone());
    if (this._.assets.graphic.model[this.gameObject.graphic.model].transferData) {
      _ref = this._.assets.graphic.model[this.gameObject.graphic.model].transferData;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        k = _ref[_i];
        this.model[k] = this._.assets.graphic.model[this.gameObject.graphic.model][k];
      }
    }
    model = this.model;
    if (model.geometry && model.geometry.animations) {
      model.animations = {};
      model.boneHelpers = [];
      model.weightSchedule = [];
      model.warpSchedule = [];
      _ref1 = model.geometry.animations;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        animation = _ref1[_j];
        model.animations[animation.name] = model[animation.name] = new THREE.Animation(model, animation);
      }
      model.idle.weight = 1;
      model.idle.play(0);
    }
    this.flags.loaded = true;
    return this.flags.loading = false;
  };

  GraphicObject.prototype.createPhysic = function() {
    var geometry, material, mesh, radius, rescale;
    material = new THREE.MeshBasicMaterial({
      wireframe: true
    });
    rescale = {
      x: 1,
      y: 1,
      z: 1
    };
    switch (this.gameObject.physic.collider) {
      case 'box':
        geometry = new THREE.BoxGeometry(1, 1, 1);
        break;
      case 'sphere':
        radius = this.scale.x > this.scale.z ? this.scale.x : this.scale.z;
        geometry = new THREE.SphereGeometry(radius);
        rescale.x = 1 / this.scale.x;
        rescale.y = 1 / this.scale.y;
        rescale.z = 1 / this.scale.z;
    }
    mesh = new THREE.Mesh(geometry, material);
    mesh.scale.set(rescale.x, rescale.y, rescale.z);
    return this.define('physic', mesh);
  };

  GraphicObject.prototype.define = function(k, v) {
    this[k] = v;
    return this.add(v);
  };

  return GraphicObject;

})(THREE.Object3D);

var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

lib.GL.TerrainLayer = (function(_super) {
  __extends(TerrainLayer, _super);

  function TerrainLayer(_) {
    var i, j, temp, _i, _j, _k, _ref, _ref1, _ref2;
    this._ = _;
    this._.graphic.scene.addLoadingTask('Terrain');
    Component.call(this, {
      componentID: 'Terrain',
      loading: {
        enabled: true,
        startTask: 'initialization',
        endFn: (function(_this) {
          return function() {
            _this.fireEvent('ready');
            return _this._.graphic.scene.removeLoadingTask('Terrain');
          };
        })(this),
        delay: 1000
      }
    });
    THREE.Object3D.call(this);
    this.name = 'terrain';
    this.heightmap = this._.game.world.heightmap;
    this.data = {
      size: {
        x: this._.assets.gamedata.world.constants.size.x,
        y: this._.assets.gamedata.world.constants.size.y,
        z: this._.assets.gamedata.world.constants.size.z
      },
      flatsize: 32,
      distance: [0],
      levels: 0,
      material: this._.assets.graphic.material.terrain
    };
    temp = {
      flatsize: this.data.flatsize
    };
    while (temp.flatsize / 2 > 1) {
      temp.flatsize /= 2;
      this.data.levels++;
    }
    for (i = _i = 0, _ref = this.data.levels; _i <= _ref; i = _i += 1) {
      this.data.distance[i + 1] = this.data.flatsize * (i + 1);
    }
    this.radius = {
      initialization: 256,
      update: 96,
      visibility: 256
    };
    this.scale.y = this.data.size.y;
    this.createCollider();
    this.flats = {};
    for (i = _j = 0, _ref1 = this.data.size.z / this.data.flatsize - 1; _j <= _ref1; i = _j += 1) {
      for (j = _k = 0, _ref2 = this.data.size.x / this.data.flatsize - 1; _k <= _ref2; j = _k += 1) {
        this.createFlat(i, j);
      }
    }
    this.removeLoadingTask('initialization');
  }

  TerrainLayer.prototype.createCollider = function() {
    var geometry, material, mesh;
    geometry = new THREE.BoxGeometry(1, 1, 1);
    material = new THREE.MeshBasicMaterial({
      wireframe: true
    });
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(this._.assets.gamedata.world.constants.size.x / 2, 0.5, this._.assets.gamedata.world.constants.size.z / 2);
    return mesh.scale.set(this._.assets.gamedata.world.constants.size.x, 1, this._.assets.gamedata.world.constants.size.z);

    /*
    		geometry = new THREE.Geometry
    		v = 
    			position 	: { x: @_.assets.gamedata.world.constants.size.x/2, y: @_.assets.gamedata.world.constants.size.y/2, z: @_.assets.gamedata.world.constants.size.z/2 }
    			rotation 	: { x: 0, y: 0, z: 0 }
    			scale 		: { x: @_.assets.gamedata.world.constants.size.x, y: @_.assets.gamedata.world.constants.size.y, z: @_.assets.gamedata.world.constants.size.z }
    		
    		for shape, i in @_.assets.physic.collider.terrain.shapes
    			if shape.type is 'box'
    				g = new THREE.BoxGeometry 1, 1, 1
    			m = new THREE.Mesh g
    			m.position.x = - v.scale.x/2 + shape.position[0] * v.scale.x
    			m.position.y = - v.scale.y/2 + shape.position[1] * v.scale.y
    			m.position.z = - v.scale.z/2 + shape.position[2] * v.scale.z
    			m.scale.set 	shape.scale[0] * v.scale.x, shape.scale[1], shape.scale[2] * v.scale.z
    			m.rotation.set 	shape.rotation[0] * Math.PI/180, shape.rotation[1] * Math.PI/180, shape.rotation[2] * Math.PI/180
    			m.updateMatrix()
    			geometry.merge m.geometry, m.matrix
    		material = new THREE.MeshBasicMaterial 
    			color 		: 0xff0000
    			wireframe 	: true
    		material.visible = false
    
    		mesh = new THREE.Mesh geometry, material
    		mesh.position.set v.position.x, 0.5, v.position.z
    		mesh.rotation.set v.rotation.x, v.rotation.y, v.rotation.z
    		@add mesh
     */
  };

  TerrainLayer.prototype.createFlat = function(i, j) {
    var flat, heightmap_units, imagedata, index, mid_value, summ, x, y, _i, _j, _k, _l, _m, _ref, _ref1, _ref2, _ref3, _ref4;
    imagedata = this.heightmap.getImageData(i * this.data.flatsize, j * this.data.flatsize, this.data.flatsize + 1, this.data.flatsize + 1).data;
    heightmap_units = [];
    for (index = _i = 0, _ref = imagedata.length - 1; _i <= _ref; index = _i += 4) {
      y = Math.floor(index / (4 * (this.data.flatsize + 1)));
      if (!heightmap_units[y]) {
        heightmap_units[y] = [];
      }
      x = index / 4 - (this.data.flatsize + 1) * y;
      if (i === (this.data.size.x / this.data.flatsize) - 1 || j === (this.data.size.z / this.data.flatsize) - 1) {
        if (y === this.data.flatsize || x === this.data.flatsize) {
          imagedata[index] = imagedata[index - 4];
        }
      }
      heightmap_units[y][x] = imagedata[index];
    }
    summ = 0;
    for (y = _j = 0, _ref1 = heightmap_units.length - 1; _j <= _ref1; y = _j += 1) {
      for (x = _k = 0, _ref2 = heightmap_units[y].length - 1; _k <= _ref2; x = _k += 1) {
        summ += heightmap_units[y][x];
      }
    }
    mid_value = summ / ((this.data.flatsize + 1) * (this.data.flatsize + 1));
    for (y = _l = 0, _ref3 = heightmap_units.length - 1; _l <= _ref3; y = _l += 1) {
      for (x = _m = 0, _ref4 = heightmap_units[y].length - 1; _m <= _ref4; x = _m += 1) {
        heightmap_units[y][x] -= mid_value;
      }
    }
    flat = new lib.GL.TerrainLayerFlat({
      _: this._,
      i: i,
      j: j,
      mid_value: mid_value,
      units: heightmap_units,
      layer: this
    });
    return this.define('flat' + i + j, flat);
  };

  TerrainLayer.prototype.define = function(k, v) {
    this.flats[k] = v;
    return this.add(v);
  };

  TerrainLayer.prototype.tick = function(options) {
    var k, v, _ref, _results;
    _ref = this.flats;
    _results = [];
    for (k in _ref) {
      v = _ref[k];
      _results.push(v.tick());
    }
    return _results;
  };

  return TerrainLayer;

})(THREE.Object3D);

lib.GL.TerrainLayerFlat = (function(_super) {
  __extends(TerrainLayerFlat, _super);

  function TerrainLayerFlat(options) {
    THREE.LOD.call(this);
    this._ = options._, this.i = options.i, this.j = options.j, this.units = options.units, this.mid_value = options.mid_value, this.layer = options.layer;
    this.level = 0;
    this.material = this.layer.data.material.clone();
    this.material.map = this._.assets.graphic.texture.terrain['diffuse' + 0 + '' + 0];
    this.position.x = (this.i + 0.5) * this.layer.data.flatsize;
    this.position.y = this.mid_value / 255;
    this.position.z = (this.j + 0.5) * this.layer.data.flatsize;
    if (this.getDistanceToCamera() <= this.layer.radius.initialization) {
      this.initialization();
    }
  }

  TerrainLayerFlat.prototype.getDistanceToCamera = function() {
    var p;
    p = new THREE.Vector3().copy(this.position);
    p.y = p.y * this.layer.scale.y;
    return new THREE.Vector3(this._.graphic.camera.position.x - p.x, this._.graphic.camera.position.y - p.y, this._.graphic.camera.position.z - p.z).length();
  };

  TerrainLayerFlat.prototype.initialization = function() {
    var level;
    level = this.getLevel();
    this.level = level;
    this.layer.addLoadingTask('createFlat ' + this.i + ' ' + this.j);
    return this.createGeometry({
      level: level
    }, (function(_this) {
      return function() {
        return _this.layer.removeLoadingTask('createFlat ' + _this.i + ' ' + _this.j);
      };
    })(this));
  };

  TerrainLayerFlat.prototype.tick = function() {
    var level;
    if (this.getDistanceToCamera() < this.layer.radius.update) {
      level = this.getLevel();
      this.level = level;
      this.checkGeometry({
        level: level
      });
    }
    return this.update(this._.graphic.camera);
  };

  TerrainLayerFlat.prototype.setVisibility = function() {
    if (this.getDistanceToCamera() <= this.layer.radius.visibility) {
      if (!this.visible) {
        return this.visible = true;
      }
    } else {
      if (this.visible) {
        return this.visible = false;
      }
    }
  };

  TerrainLayerFlat.prototype.getLevel = function() {
    var distance, i, level, _i, _ref;
    distance = this.getDistanceToCamera();
    level = -1;
    for (i = _i = 1, _ref = this.layer.data.distance.length; _i <= _ref; i = _i += 1) {
      if (distance < this.layer.data.distance[i]) {
        level = i - 1;
        break;
      }
    }
    if (level === -1) {
      level = this.layer.data.levels;
    }
    return level;
  };

  TerrainLayerFlat.prototype.checkGeometry = function(options) {
    var draw, frustum, i, object, _i, _len, _ref;
    frustum = new THREE.Frustum;
    frustum.setFromMatrix(new THREE.Matrix4().multiplyMatrices(this._.graphic.camera.projectionMatrix, this._.graphic.camera.matrixWorldInverse));
    if (frustum.containsPoint(this.position)) {
      if (!this.creating) {
        draw = true;
        _ref = this.objects;
        for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
          object = _ref[i];
          if (object.distance === this.layer.data.distance[options.level]) {
            draw = false;
          }
        }
        if (draw) {
          return this.createGeometry(options);
        }
      }
    } else {
      if (this.creating) {
        this._.manager.cancel(this.creating);
        return this.creating = false;
      }
    }
  };

  TerrainLayerFlat.prototype.createGeometry = function(options, callback) {
    this.creating = new Task({
      id: 'TerrainLayer.createTerrainFlatGeometry ' + this.i + ' ' + this.j,
      worker: 'worker',
      data: {
        task: 'TerrainLayer.createTerrainFlatGeometry',
        level: options.level,
        units: this.units,
        flatsize: this.layer.data.flatsize
      },
      callback: (function(_this) {
        return function(e) {
          var geometry, material, mesh;
          geometry = setGeometryVFData(e.data.geometry);
          if (options.level === 0) {
            material = new THREE.MeshBasicMaterial({
              wireframe: true,
              color: 0xff0000
            });
          } else if (options.level === 1) {
            material = new THREE.MeshBasicMaterial({
              wireframe: true,
              color: 0x00ff00
            });
          } else if (options.level === 2) {
            material = new THREE.MeshBasicMaterial({
              wireframe: true,
              color: 0x0000ff
            });
          } else if (options.level === 3) {
            material = new THREE.MeshBasicMaterial({
              wireframe: true,
              color: 0xffff00
            });
          } else if (options.level === 4) {
            material = new THREE.MeshBasicMaterial({
              wireframe: true,
              color: 0xff00ff
            });
          }
          mesh = new THREE.Mesh(geometry, _this.material);
          mesh.rotation.x = -Math.PI / 2;
          mesh.receiveShadow = true;
          _this.addLevel(mesh, _this.layer.data.distance[options.level]);
          if (callback) {
            return callback(e);
          }
        };
      })(this)
    });
    return this._.manager["do"](this.creating);
  };

  return TerrainLayerFlat;

})(THREE.LOD);

lib.GL.Viewport = (function() {
  function Viewport(options) {
    var v, _i, _len, _ref;
    this.element = $('#' + options.id);
    this.width = this.element.width();
    this.height = this.element.height();
    _ref = options.children;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      v = _ref[_i];
      this.element.append(v);
    }
  }

  return Viewport;

})();

var InputManager;

InputManager = (function() {
  function InputManager(_) {
    this._ = _;
    this.keys = [];
    this.bind = function(key, event) {
      return this.keys[key] = event;
    };
    this.bind(87, 'walk.forward');
    this.bind(83, 'walk.back');
    this.bind(32, 'jump');
    this.bind(68, 'rotation.left');
    this.bind(65, 'rotation.right');
    this.bind(49, 'hit1');
    $(window).bind('keydown', (function(_this) {
      return function(e) {
        var event;
        event = _this.keys[e.keyCode];
        if (event) {
          return _this._.io.socket.emit('input', {
            event: event,
            bool: true
          });
        }
      };
    })(this));
    $(window).bind('keyup', (function(_this) {
      return function(e) {
        var event;
        event = _this.keys[e.keyCode];
        if (event) {
          return _this._.io.socket.emit('input', {
            event: event,
            bool: false
          });
        }
      };
    })(this));
  }

  return InputManager;

})();

var IO;

IO = (function() {
  function IO(_) {
    this._ = _;
    this.ping = {
      now: 0,
      before: 0,
      value: 0
    };
    this.connection = false;
    this.socket = io.connect('http://' + window.location.hostname + ':3000', {
      reconnection: false
    });
    this.socket.on('connect', (function(_this) {
      return function(event) {
        _this.connection = true;
        return console.log('io.connect', event);
      };
    })(this));
    this.socket.on('disconnect', (function(_this) {
      return function(event) {
        return console.log('io.disconnect', event);
      };
    })(this));
    this.socket.on('reconnecting', (function(_this) {
      return function(event) {
        return console.log('io.reconnecting', event);
      };
    })(this));
    this.socket.on('connect_error', (function(_this) {
      return function(event) {
        if (_this.connection) {
          _this.connection = false;
          return console.log('io.connect fail', event);
        } else {
          return console.log('io.reconnecting fail', event);
        }
      };
    })(this));
    this.socket.on('GameServer.gameWorldUpdate', (function(_this) {
      return function(packet) {
        return _this.setping();
      };
    })(this));
  }

  IO.prototype.setping = function() {
    this.ping.now = 1000 * new Date().getSeconds() + new Date().getMilliseconds();
    this.ping.value = this.ping.now - this.ping.before;
    this.ping.before = this.ping.now;
    return $('#ping').html('ping ' + this.ping.value + 'ms');
  };

  return IO;

})();

var Settings;

Settings = (function() {
  function Settings(options) {
    this._ = options._;
    this.gui = new dat.GUI;
  }

  return Settings;

})();

var Task, Thread, ThreadManager;

ThreadManager = (function() {
  function ThreadManager(options) {
    var i, _i, _ref;
    this.threads = [];
    this.tasks = [];
    for (i = _i = 0, _ref = options.threads - 1; _i <= _ref; i = _i += 1) {
      this.threads[i] = new Thread({
        id: i
      });
    }
    this.interval = setInterval((function(_this) {
      return function() {
        var thread, _j, _len, _ref1, _results;
        if (_this.tasks[0]) {
          _ref1 = _this.threads;
          _results = [];
          for (_j = 0, _len = _ref1.length; _j < _len; _j++) {
            thread = _ref1[_j];
            if (thread.idle) {
              if (_this.tasks[0]) {
                thread.process(_this.tasks[0]);
                _results.push(_this.tasks.splice(0, 1));
              } else {
                _results.push(void 0);
              }
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        }
      };
    })(this), 1);
  }

  ThreadManager.prototype["do"] = function(task) {
    return this.tasks.push(task);
  };

  ThreadManager.prototype.cancel = function(task) {
    var i, v, _i, _len, _ref, _results;
    _ref = this.tasks;
    _results = [];
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      v = _ref[i];
      if (v) {
        if (v.id === task.id) {
          if (this.tasks[i]) {
            _results.push(this.tasks.splice(i, 1));
          } else {
            _results.push(void 0);
          }
        } else {
          _results.push(void 0);
        }
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  return ThreadManager;

})();

Thread = (function() {
  function Thread(options) {
    this.id = options.id;
    this.idle = true;
    this.worker = {};
  }

  Thread.prototype.process = function(task) {
    var time;
    this.idle = false;
    time = new Date;
    this.worker = new Worker('libs/' + task.worker + '.js');
    this.worker.postMessage(task.data);
    return this.worker.addEventListener('message', (function(_this) {
      return function(e) {
        task.callback(e);
        _this.worker.terminate();
        return _this.idle = true;
      };
    })(this));
  };

  return Thread;

})();

Task = (function() {
  function Task(options) {
    this.id = options.id, this.worker = options.worker, this.callback = options.callback, this.data = options.data;
  }

  return Task;

})();

var UI;

UI = (function() {
  function UI(_) {
    this._ = _;
    this.aspect = {
      x: 2.1,
      y: 1
    };
    this.scale();
    $(window).bind('resize', (function(_this) {
      return function() {
        return _this.scale();
      };
    })(this));
  }

  UI.prototype.scale = function() {
    var dh, dw, h, l, t, w;
    dw = $(window).width();
    dh = $(window).height();
    w = dw;
    h = w * (this.aspect.y / this.aspect.x);
    if (h <= dh) {
      l = 0;
      t = (dh - h) / 2;
    } else {
      h = dh;
      w = h * (this.aspect.x / this.aspect.y);
      t = 0;
      l = (dw - w) / 2;
    }
    $('#wrapper').animate({
      width: w + 'px',
      height: h + 'px',
      left: l + 'px',
      top: t + 'px'
    }, 0);
    return document.body.style.fontSize = $('#wrapper').height() / 45 + 'px';
  };

  return UI;

})();
