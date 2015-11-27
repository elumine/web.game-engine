var billinearInterpolation, delay, getTime;

getTime = function() {
  return (new Date().getHours() + ':' + new Date().getMinutes() + ':' + new Date().getSeconds() + ':' + new Date().getMilliseconds()).magenta;
};

delay = function(time, fn) {
  return setTimeout((function(_this) {
    return function() {
      return fn();
    };
  })(this), time);
};

billinearInterpolation = function(options) {
  var v1, v2;
  v1 = options.D + (options.C - options.D) * options.px;
  v2 = options.A + (options.B - options.A) * options.px;
  return v1 + (v2 - v1) * options.py;
};

var Component;

Component = (function() {
  function Component(options) {
    this.__componentID = options.componentID;
    this.__events = {};
    this.__loading = {
      enabled: false || options.loading.enabled,
      startTask: false || options.loading.startTask,
      endFn: false || options.loading.endFn.bind(this),
      stack: [],
      delay: 100
    };
    console.log(getTime(), this.__componentID + '.constructor'.yellow);
    if (this.__loading.enabled) {
      this.addLoadingTask(this.__loading.startTask);
      this.checkLoadingTask();
    }
  }

  Component.prototype.fireEvent = function(eventID) {
    var v, _i, _len, _ref, _results;
    if (this.__events[eventID]) {
      _ref = this.__events[eventID];
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        v = _ref[_i];
        _results.push(v());
      }
      return _results;
    }
  };

  Component.prototype.addEventListener = function(eventID, callback) {
    if (!this.__events[eventID]) {
      this.__events[eventID] = [];
    }
    return this.__events[eventID].push(callback);
  };

  Component.prototype.removeEventListener = function(eventID, callback) {
    return this.__events[eventID].splice(this.__events[eventID].indexOf(callback), 1);
  };

  Component.prototype.addLoadingTask = function(value) {
    return this.__loading.stack.push(value);
  };

  Component.prototype.removeLoadingTask = function(value) {
    return this.__loading.stack.splice(this.__loading.stack.indexOf(value), 1);
  };

  Component.prototype.checkLoadingTask = function() {
    var key, _i, _len, _ref;
    if (this.__loading.stack.length !== 0) {
      console.log(getTime(), this.__componentID + '.checkLoadingTask...'.grey);
      _ref = this.__loading.stack;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        key = _ref[_i];
        console.log('  ' + key);
      }
      return delay(this.__loading.delay, (function(_this) {
        return function() {
          return _this.checkLoadingTask();
        };
      })(this));
    } else {
      return this.__loading.endFn();
    }
  };

  return Component;

})();

var Account, AccountServer;

AccountServer = (function() {
  function AccountServer(_) {
    this._ = _;
    this._.addEventListener('ready', (function(_this) {
      return function() {
        var k, v, _ref;
        _this.badSymbols = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '-', '+', '=', '{', '}', '[', ']', '/', '|', ',', '.', '<', '>', ':', ';', "'", '"'];
        _this.accounts = _this._.assets.accounts;
        _ref = _this.accounts.data;
        for (k in _ref) {
          v = _ref[k];
          v.status = 'offline';
        }
        _this.accounts.save();
        return _this._.io.server.on('connection', function(socket) {
          socket.on('AccountManager.registrationRequest', function(packet) {
            return _this.registrationRequest(socket, packet);
          });
          socket.on('AccountManager.loginRequest', function(packet) {
            return _this.loginRequest(socket, packet);
          });
          socket.on('AccountManager.logoutRequest', function(packet) {
            return _this.logoutRequest(socket, packet);
          });
          return socket.on('disconnect', function() {
            console.log('account.socket.disconnect', socket.client.id);
            return _this.socketDisconnect(socket);
          });
        });
      };
    })(this));
  }

  AccountServer.prototype.registrationRequest = function(socket, packet) {
    var i, name_flag, password_flag, _i, _j, _len, _len1, _ref, _ref1;
    console.log('AccountServer.registrationRequest');
    if (!packet.name) {
      return socket.emit('AccountServer.registrationResponse', {
        result: false,
        error: 'error.AccountServer.registration.missingAccountName'
      });
    } else if (!packet.password) {
      return socket.emit('AccountServer.registrationResponse', {
        result: false,
        error: 'error.AccountServer.registration.missingAccountPassword'
      });
    } else {
      name_flag = false;
      _ref = this.badSymbols;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        i = _ref[_i];
        if (packet.name.indexOf(i) + 1) {
          name_flag = true;
        }
      }
      password_flag = false;
      _ref1 = this.badSymbols;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        i = _ref1[_j];
        if (packet.password.indexOf(i) + 1) {
          password_flag = true;
        }
      }
      if (name_flag) {
        return socket.emit('AccountServer.registrationResponse', {
          result: false,
          error: 'error.AccountServer.registration.badAccountName'
        });
      } else if (password_flag) {
        return socket.emit('AccountServer.registrationResponse', {
          result: false,
          error: 'error.AccountServer.registration.badAccountPassword'
        });
      } else if (this.accounts.data[packet.name]) {
        return socket.emit('AccountServer.registrationResponse', {
          result: false,
          error: 'error.AccountServer.registration.accountExisting'
        });
      } else {
        this.accounts[packet.name] = new Account({
          socketID: socket.client.id,
          name: packet.name,
          password: packet.password
        });
        this.accounts.save();
        return socket.emit('AccountServer.registrationResponse', {
          result: true
        });
      }
    }
  };

  AccountServer.prototype.loginRequest = function(socket, packet) {
    var account;
    console.log('AccountServer.loginRequest');
    if (!packet.name) {
      return socket.emit('AccountServer.loginResponse', {
        result: false,
        error: 'error.AccountServer.login.missingAccountName'
      });
    } else if (!packet.password) {
      return socket.emit('AccountServer.loginResponse', {
        result: false,
        error: 'error.AccountServer.login.missingAccountPassword'
      });
    } else {
      account = this.accounts.data[packet.name];
      if (!account) {
        return socket.emit('AccountServer.loginResponse', {
          result: false,
          error: 'error.AccountServer.login.badName'
        });
      } else if (account.password !== packet.password) {
        return socket.emit('AccountServer.loginResponse', {
          result: false,
          error: 'error.AccountServer.login.badPassword'
        });
      } else if (account.status !== 'offline') {
        return socket.emit('AccountServer.loginResponse', {
          result: false,
          error: 'error.AccountServer.login.accountOnline'
        });
      } else if (this.getAccountBySocketID(socket.client.id)) {
        return socket.emit('AccountServer.loginResponse', {
          result: false,
          error: 'error.AccountServer.login.youAreOnline'
        });
      } else {
        account.status = 'online';
        account.socketID = socket.client.id;
        this.accounts.save();
        return socket.emit('AccountServer.loginResponse', {
          result: true,
          account: account
        });
      }
    }
  };

  AccountServer.prototype.logoutRequest = function(socket, packet) {
    var account;
    console.log('AccountServer.logoutRequest');
    account = this.getAccountBySocketID(socket.client.id);
    if (!account) {
      return socket.emit('AccountServer.logoutResponse', {
        result: false,
        error: 'error.AccountServer.logout.undefinedAccount'
      });
    } else {
      if (account.status === 'offline') {
        return socket.emit('AccountServer.logoutResponse', {
          result: false,
          error: 'error.AccountServer.logout.accountOffline'
        });
      } else {
        account.status = 'offline';
        return socket.emit('AccountServer.logoutResponse', {
          result: true
        });
      }
    }
  };

  AccountServer.prototype.socketDisconnect = function(socket) {
    var account;
    account = this.getAccountBySocketID(socket.client.id);
    if (account) {
      account.status = 'offline';
      return this.accounts.save();
    }
  };

  AccountServer.prototype.getAccountBySocketID = function(socketID) {
    var k, v, _ref;
    _ref = this.accounts.data;
    for (k in _ref) {
      v = _ref[k];
      if (v.socketID === socketID) {
        return v;
      }
    }
  };

  return AccountServer;

})();

Account = (function() {
  function Account(options) {
    var status;
    this.socketID = options.socketID, this.name = options.name, this.password = options.password;
    status = 'offline';
  }

  return Account;

})();

var AssetsManager, IMGData, JSData, JSONData,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

AssetsManager = (function(_super) {
  __extends(AssetsManager, _super);

  function AssetsManager(_) {
    var list;
    this._ = _;
    Component.call(this, {
      componentID: 'AssetsManager',
      loading: {
        enabled: true,
        startTask: 'initialization',
        endFn: (function(_this) {
          return function() {
            return _this._.removeLoadingTask('AssetsManager.initialization');
          };
        })(this)
      }
    });
    this._.addLoadingTask('AssetsManager.initialization');
    list = new JSONData({
      _: this,
      url: 'assets/list'
    });
    this.scanAssetsList(list.data.server, this, '');
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
            _results.push(scope[k] = new JSONData({
              _: this,
              url: 'assets/' + path + k
            }));
            break;
          case 'js':
            _results.push(scope[k] = new JSData({
              _: this,
              url: 'assets/' + path + k
            }));
            break;
          case 'img':
            _results.push(scope[k] = new IMGData({
              _: this,
              url: 'assets/' + path + k
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

  return AssetsManager;

})(Component);

JSData = (function() {
  function JSData(options) {
    var code;
    code = _fs.readFileSync(options.url + '.js', "utf8");
    eval(code);
    this.data = data;
  }

  return JSData;

})();

IMGData = (function() {
  function IMGData(options) {
    var data, height, width;
    options._.addLoadingTask(options.url);
    width = 0;
    height = 0;
    data = [];
    this.width = width;
    this.height = height;
    this.data = data;
    _fs.createReadStream(options.url + '.png').pipe(new _png.PNG({
      filterType: 4
    })).on('parsed', function() {
      var idx, x, y, _i, _j, _ref, _ref1;
      height = this.height;
      width = this.width;
      for (y = _i = 0, _ref = height - 1; _i <= _ref; y = _i += 1) {
        data[y] = [];
        for (x = _j = 0, _ref1 = width - 1; _j <= _ref1; x = _j += 1) {
          idx = (width * y + x) << 2;
          data[y][x] = this.data[idx];
        }
      }
      return options._.removeLoadingTask(options.url);
    });
  }

  return IMGData;

})();

JSONData = (function() {
  function JSONData(options) {
    this.url = options.url;
    this.load();
  }

  JSONData.prototype.load = function() {
    this.data = JSON.parse(_fs.readFileSync(_path.join(__dirname, this.url + '.json')));
    return console.log(getTime(), 'db.load '.grey + this.url);
  };

  JSONData.prototype.save = function() {
    _fs.writeFileSync(this.url + '.json', JSON.stringify(this.data, null, '\t'));
    return console.log(getTime(), 'db.save '.grey + this.url);
  };

  return JSONData;

})();

var CMD;

CMD = (function() {
  function CMD(_) {
    this._ = _;
    this._.io.server.on('connection', (function(_this) {
      return function(socket) {
        return socket.on('cmd.message', function(packet) {
          return _this.execute(packet);
        });
      };
    })(this));
  }

  CMD.prototype.execute = function(packet) {
    switch (packet.k) {
      case 'togglePhysic':
        return console.log('togglePhysic');
    }
  };

  return CMD;

})();

var HTTPServer;

HTTPServer = (function() {
  function HTTPServer(_) {
    var k, v, _ref;
    this._ = _;
    this.app = _express();
    _ref = this._.config.http.use;
    for (k in _ref) {
      v = _ref[k];
      this.app.use(k, _express["static"](_path.join(__dirname, v)));
    }
    this.app.get('/', (function(_this) {
      return function(req, res, next) {
        return res.sendFile(_path.resolve(_path.join(__dirname, _this._.config.http.index)));
      };
    })(this));
    this.server = this.app.listen(this._.config.http.port);
  }

  return HTTPServer;

})();

var IO;

IO = (function() {
  function IO(_) {
    this._ = _;
    this.sockets = {};
    this.server = _socket(this._.http.server);
    this.server.on('connection', (function(_this) {
      return function(socket) {
        _this.sockets[socket.client.id] = socket;
        console.log('io.connection', socket.client.id);
        return socket.on('disconnect', function() {
          delete _this.sockets[socket.client.id];
          return console.log('io.disconnection', socket.client.id);
        });
      };
    })(this));
  }

  return IO;

})();



var Broadcast;

Broadcast = (function() {
  function Broadcast(_) {
    this._ = _;
    this.listeners = {};
  }

  Broadcast.prototype.addListener = function(key, socket) {
    return this.listeners[key] = socket;
  };

  Broadcast.prototype.removeListener = function(key) {
    return delete this.listeners[key];
  };

  Broadcast.prototype.tick = function() {
    var data, k, socket, v, _ref, _ref1, _results;
    data = {
      dynamic: {},
      time: this._.game.time.serialize()
    };
    _ref = this._.game.world.objects.dynamic;
    for (k in _ref) {
      v = _ref[k];
      data.dynamic[k] = v.serialize();
    }
    _ref1 = this.listeners;
    _results = [];
    for (k in _ref1) {
      socket = _ref1[k];
      _results.push(socket.emit('GameServer.gameWorldUpdate', data));
    }
    return _results;
  };

  return Broadcast;

})();

var Physic;

Physic = (function() {
  function Physic(_) {
    this._ = _;
    this.world = new OIMO.World;
    this.world.timeStep /= 10;

    /*
    		@terrain = new OIMO.Body
    			type 	: 'box'
    			pos 	: [ @_.assets.gamedata.world.data.constants.size.x/2, @_.assets.gamedata.world.data.constants.size.y/2, @_.assets.gamedata.world.data.constants.size.z/2 ]
    			size 	: [ @_.assets.gamedata.world.data.constants.size.x, @_.assets.gamedata.world.data.constants.size.y, @_.assets.gamedata.world.data.constants.size.z ]
    			rot 	: [ 0, 0, 0 ]
    			world 	: @world
    			move 	: false
     */
  }

  Physic.prototype.addTerrain = function() {
    var b, count, filter, i, j, r, x, y, z, _i, _ref, _results;
    filter = 4;
    count = this._.assets.gamedata.world.data.constants.size.x / filter;
    r = filter * 2;
    _results = [];
    for (i = _i = 0, _ref = count - 1; _i <= _ref; i = _i += 1) {
      _results.push((function() {
        var _j, _ref1, _results1;
        _results1 = [];
        for (j = _j = 0, _ref1 = count - 1; _j <= _ref1; j = _j += 1) {
          x = i * filter;
          z = j * filter;
          y = this._.game.world.terrain.getHeightValue(x, z);
          _results1.push(b = new OIMO.Body({
            type: 'sphere',
            size: [r],
            pos: [x, y - r, z],
            world: this.world
          }));
        }
        return _results1;
      }).call(this));
    }
    return _results;
  };

  Physic.prototype.createBody = function(object) {
    var body, config, radius;
    if (object["static"]) {
      object.position.y = this._.game.world.terrain.getHeightValue(object.position.x, object.position.z) + object.scale.y / 2;
    } else if (object.dynamic) {
      console.log('dynamic', this._.game.world.terrain.getHeightValue(object.position.x, object.position.z));
      object.position.y = this._.game.world.terrain.getHeightValue(object.position.x, object.position.z) + object.scale.y + object.position.y;
    }
    config = [1, 0.2, 0.4];
    switch (object.physic.collider) {
      case 'box':
        body = new OIMO.Body({
          type: 'box',
          pos: [object.position.x, object.position.y, object.position.z],
          size: [object.scale.x, object.scale.y, object.scale.z],
          rot: [object.rotation.x, object.rotation.y, object.rotation.z],
          world: this.world,
          move: object.dynamic ? true : false
        });
        break;
      case 'sphere':
        radius = object.scale.x > object.scale.z ? object.scale.x : object.scale.z;
        body = new OIMO.Body({
          type: 'sphere',
          pos: [object.position.x, object.position.y, object.position.z],
          size: [radius],
          rot: [object.rotation.x, object.rotation.y, object.rotation.z],
          world: this.world,
          move: object.dynamic ? true : false
        });
    }
    return body;
  };

  Physic.prototype.tick = function() {
    return this.world.step();
  };

  return Physic;

})();

var World, library;

library = {};

World = (function() {
  function World(_) {
    this._ = _;
    this.objects = {
      "static": {},
      dynamic: {}
    };
  }

  World.prototype.initialize = function() {
    var k, v, _ref, _ref1, _results;
    this.terrain = new library.Terrain(this._);
    this._.game.physic.addTerrain();
    _ref = this._.assets.gamedata.objects["static"].data;
    for (k in _ref) {
      v = _ref[k];
      this.add({
        k: k,
        "static": true,
        v: v
      });
    }
    _ref1 = this._.assets.gamedata.objects.dynamic.data;
    _results = [];
    for (k in _ref1) {
      v = _ref1[k];
      _results.push(this.add({
        k: k,
        dynamic: true,
        v: v
      }));
    }
    return _results;
  };

  World.prototype.add = function(options) {
    if (options["static"]) {
      return this.objects["static"][options.k] = new library[options.v.classname]({
        _: this._,
        options: options
      });
    } else if (options.dynamic) {
      return this.objects.dynamic[options.k] = new library[options.v.classname]({
        _: this._,
        options: options
      });
    }
  };

  World.prototype.remove = function(v) {
    this.objects.dynamic[v.name].body.remove();
    return delete this.objects.dynamic[v.name];
  };

  World.prototype.tick = function(options) {
    var k, v, _ref, _ref1, _results;
    _ref = this.objects["static"];
    for (k in _ref) {
      v = _ref[k];
      v.tick(options);
    }
    _ref1 = this.objects.dynamic;
    _results = [];
    for (k in _ref1) {
      v = _ref1[k];
      _results.push(v.tick(options));
    }
    return _results;
  };

  return World;

})();

library.Terrain = (function() {
  function Terrain(_) {
    this._ = _;
    this.classname = {
      Terrain: true
    };
    this.heightmap = this._.assets.gamedata.terrain.heightmap.data;
  }

  Terrain.prototype.getHeightValue = function(x, z) {
    var i, j;
    i = Math.floor(x);
    j = Math.floor(z);
    if (i >= 0 && j >= 0) {
      return this._.assets.gamedata.world.data.constants.size.y * (1 / 255) * billinearInterpolation({
        A: this.heightmap[j][i],
        B: this.heightmap[j][i + 1],
        C: this.heightmap[j + 1][i],
        D: this.heightmap[j + 1][i + 1],
        px: x - i,
        py: z - j
      });
    } else {
      return 0;
    }
  };

  return Terrain;

})();

var State, StateMachine;

StateMachine = (function() {
  function StateMachine(options) {
    this.object = options.object;
  }

  StateMachine.prototype.tick = function(options) {
    var k, v, _results;
    _results = [];
    for (k in this) {
      v = this[k];
      if (v instanceof State && v.tick) {
        _results.push(v.tick(options));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  StateMachine.prototype.serialize = function() {
    var k, result, v;
    result = {};
    for (k in this) {
      v = this[k];
      if (v instanceof State && v.tick) {
        result[k] = v;
      }
    }
    return result;
  };

  return StateMachine;

})();

State = (function() {
  function State(options) {
    this.id = options.id, this.data = options.data, this.tick = options.tick;
    this.enabled = false;
  }

  State.prototype.enable = function() {
    return this.enabled = true;
  };

  State.prototype.disable = function() {
    return this.enabled = false;
  };

  return State;

})();

library.Entity = (function() {
  function Entity(constructor) {
    var _ref;
    this._ = constructor._;
    this.classname = {
      Entity: true
    };
    _ref = constructor.options, this["static"] = _ref["static"], this.dynamic = _ref.dynamic;
    this.name = constructor.options.k;
    this.states = new StateMachine({
      object: this
    });
  }

  Entity.prototype.tick = function(options) {
    return this.states.tick(options);
  };

  return Entity;

})();

library.GameObject = (function() {
  function GameObject(constructor) {
    var v;
    library.Entity.call(this, constructor);
    this.classname.GameObject = true;
    v = constructor.options.v;
    this.physic = {
      collider: v.physic ? v.physic.collider : 'box'
    };
    this.graphic = {
      model: v.graphic ? v.graphic.model : 'default'
    };
    this.sound = v.sound ? v.sound : false;
    this.position = new THREE.Vector3;
    this.scale = new THREE.Vector3;
    this.rotation = new THREE.Vector3;
    this.quaternion = new THREE.Quaternion;
    this.position.x = v.position.x ? v.position.x : 0;
    this.position.y = v.position.y ? v.position.y : 0;
    this.position.z = v.position.z ? v.position.z : 0;
    this.rotation.x = v.rotation.x ? v.rotation.x : 0;
    this.rotation.y = v.rotation.y ? v.rotation.y : 0;
    this.rotation.z = v.rotation.z ? v.rotation.z : 0;
    this.scale.x = v.scale.x ? v.scale.x : 1;
    this.scale.y = v.scale.y ? v.scale.y : 1;
    this.scale.z = v.scale.z ? v.scale.z : 1;
    this.body = this._.game.physic.createBody(this);
  }

  GameObject.prototype.tick = function(options) {
    library.Entity.prototype.tick.call(this, options);
    if (this.dynamic) {
      this.position.copy(this.body.getPosition());
      return this.quaternion.copy(this.body.getQuaternion());
    }
  };

  GameObject.prototype.serialize = function() {
    return {
      classname: this.classname,
      name: this.name,
      physic: this.physic,
      graphic: this.graphic,
      sound: this.sound,
      position: {
        x: this.position.x,
        y: this.position.y,
        z: this.position.z
      },
      quaternion: {
        x: this.quaternion.x,
        y: this.quaternion.y,
        z: this.quaternion.z,
        w: this.quaternion.w
      },
      scale: {
        x: this.scale.x,
        y: this.scale.y,
        z: this.scale.z
      },
      states: this.states.serialize()
    };
  };

  GameObject.prototype.getHit = function(options) {
    var f, p;
    f = options.vDirection.normalize().multiplyScalar(options.f * this.body.body.mass);
    p = options.source.body.getPosition();
    f = new OIMO.Vec3(f.x, f.y, f.z);
    return this.body.body.applyImpulse(p, f);
  };

  return GameObject;

})();

var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

library.Unit = (function(_super) {
  __extends(Unit, _super);

  function Unit(constructor) {
    library.GameObject.call(this, constructor);
    this.classname.Unit = true;
    this.vY = 0;
    this.physic.velocity = {
      move: 0,
      jump: 0,
      rotation: {
        x: 0,
        y: 0,
        z: 0
      }
    };
    this.states['walk.forward'] = new State({
      id: 'walk.forward',
      data: {
        velocity: 2,
        limit: 2
      },
      tick: (function(_this) {
        return function(options) {
          var dv;
          dv = _this.states['walk.forward'].data.velocity * options.dt / 1000;
          if (_this.states['walk.forward'].enabled) {
            if (_this.physic.velocity.move < _this.states['walk.forward'].data.limit) {
              return _this.physic.velocity.move += dv;
            }
          } else {
            if (_this.physic.velocity.move > 0) {
              _this.physic.velocity.move -= dv;
              if (_this.physic.velocity.move <= dv) {
                return _this.physic.velocity.move = 0;
              }
            }
          }
        };
      })(this)
    });
    this.states['walk.back'] = new State({
      id: 'walk.back',
      data: {
        velocity: 4,
        limit: 4
      },
      tick: (function(_this) {
        return function(options) {
          var dv;
          dv = _this.states['walk.back'].data.velocity * options.dt / 1000;
          if (_this.states['walk.back'].enabled) {
            if (_this.physic.velocity.move > -_this.states['walk.back'].data.limit) {
              return _this.physic.velocity.move -= dv;
            }
          } else {
            if (_this.physic.velocity.move < 0) {
              _this.physic.velocity.move += dv;
              if (_this.physic.velocity.move >= -dv) {
                return _this.physic.velocity.move = 0;
              }
            }
          }
        };
      })(this)
    });
    this.states['jump'] = new State({
      id: 'jump',
      data: {
        velocity: 2,
        duration: 1000
      },
      tick: (function(_this) {
        return function(options) {
          var dv;
          dv = _this.states['jump'].data.velocity * options.dt / 1000;
          if (_this.states['jump'].enabled) {
            if (!_this.states['jump'].data.phase) {
              _this.physic.velocity['jump'] += dv;
            } else {
              _this.physic.velocity['jump'] -= dv;
            }
            delay(_this.states['jump'].data.duration / 2, function() {
              return _this.states['jump'].data.phase = true;
            });
            return delay(_this.states['jump'].data.duration, function() {
              _this.states['jump'].enabled = false;
              _this.states['jump'].data.phase = false;
              return _this.physic.velocity.jump = 0;
            });
          }
        };
      })(this)
    });
    this.states['rotation.left'] = new State({
      id: 'rotation.left',
      data: {
        velocity: 180,
        limit: 120
      },
      tick: (function(_this) {
        return function(options) {
          var dv;
          dv = _this.states['rotation.right'].data.velocity * options.dt / 1000;
          if (_this.states['rotation.right'].enabled) {
            if (_this.physic.velocity.rotation.y > -_this.states['rotation.right'].data.limit) {
              return _this.physic.velocity.rotation.y -= dv;
            }
          } else {
            if (_this.physic.velocity.rotation.y < 0) {
              return _this.physic.velocity.rotation.y += dv;
            }
          }
        };
      })(this)
    });
    this.states['rotation.right'] = new State({
      id: 'rotation.right',
      data: {
        velocity: 180,
        limit: 120
      },
      tick: (function(_this) {
        return function(options) {
          var dv;
          dv = _this.states['rotation.left'].data.velocity * options.dt / 1000;
          if (_this.states['rotation.left'].enabled) {
            if (_this.physic.velocity.rotation.y < _this.states['rotation.left'].data.limit) {
              return _this.physic.velocity.rotation.y += dv;
            }
          } else {
            if (_this.physic.velocity.rotation.y > 0) {
              return _this.physic.velocity.rotation.y -= dv;
            }
          }
        };
      })(this)
    });
  }

  Unit.prototype.tick = function(options) {
    var x, y;
    library.GameObject.prototype.tick.call(this, options);
    this.vY += this.physic.velocity.rotation.y * options.dt / 1000;
    x = Math.cos(this.vY * Math.PI / 180) * this.physic.velocity.move * 0.25;
    y = Math.sin(this.vY * Math.PI / 180) * this.physic.velocity.move * 0.25;
    return this.body.body.linearVelocity.set(x, this.body.body.linearVelocity.y, y);
  };

  Unit.prototype.serialize = function() {
    return {
      classname: this.classname,
      name: this.name,
      physic: this.physic,
      graphic: this.graphic,
      sound: this.sound,
      position: this.position,
      vY: this.vY + 90,
      scale: this.scale,
      states: this.states.serialize()
    };
  };

  Unit.prototype.setHit = function(c) {
    var d, k, p0, p1, v, _ref, _results;
    p0 = this.body.getPosition();
    _ref = this._.game.world.objects.dynamic;
    _results = [];
    for (k in _ref) {
      v = _ref[k];
      if (v.name !== this.name) {
        switch (c) {
          case 1:
            p1 = v.body.getPosition();
            d = new THREE.Vector3(p1.x - p0.x, p1.y - p0.y, p1.z - p0.z);
            if (d.length() < 10) {
              _results.push(v.getHit({
                f: 1,
                vDirection: d,
                source: this
              }));
            } else {
              _results.push(void 0);
            }
            break;
          default:
            _results.push(void 0);
        }
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  return Unit;

})(library.GameObject);

var ai;

ai = {};

ai.Manager = (function() {
  function Manager(options) {
    this.reference = options.reference;
    this.tasks = new ai.TaskList;
  }

  Manager.prototype.add = function(v) {};

  Manager.prototype.tick = function(world) {
    return this.tasks.tick(world);
  };

  return Manager;

})();

ai.TaskList = (function() {
  function TaskList(options) {
    this.stack = [];
  }

  TaskList.prototype.add = function(v) {
    return this.stack.push(v);
  };

  TaskList.prototype.remove = function() {};

  TaskList.prototype.tick = function(world) {
    var v, _i, _len, _ref, _results;
    _ref = this.stack;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      v = _ref[_i];
      _results.push(v.tick(world));
    }
    return _results;
  };

  return TaskList;

})();

ai.Task = (function() {
  function Task(options) {
    this.priority = options.priority, this.data = options.data, this.tick = options.tick;
  }

  return Task;

})();

var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

library.NPC = (function(_super) {
  __extends(NPC, _super);

  function NPC(options) {
    library.Unit.call(this, options);
    this.classname.NPC = true;
    this.ai = new ai.Manager({
      reference: this
    });
  }

  return NPC;

})(library.Unit);

var InputManager;

InputManager = (function() {
  function InputManager(options) {
    this.object = options.object, this.socket = options.socket;
    this.events = {};
    this.socket.on('input', (function(_this) {
      return function(packet) {
        if (_this.events[packet.event]) {
          return _this.events[packet.event](packet);
        }
      };
    })(this));
  }

  InputManager.prototype.on = function(id, fn) {
    return this.events[id] = fn;
  };

  return InputManager;

})();

var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

library.Character = (function(_super) {
  __extends(Character, _super);

  function Character(constructor) {
    library.Unit.call(this, constructor);
    this.classname.Character = true;
    this.inputmanager = new InputManager({
      object: this,
      socket: constructor.options.socket
    });
  }

  return Character;

})(library.Unit);

var Time;

Time = (function() {
  function Time(_) {
    var _ref;
    this._ = _;
    _ref = this._.assets.gamedata.world.data.time, this.day = _ref.day, this.hour = _ref.hour, this.minute = _ref.minute, this.flow = _ref.flow;
    this.start();
  }

  Time.prototype.start = function() {
    return this.interval = setInterval((function(_this) {
      return function() {
        return _this.tick();
      };
    })(this), this.dt);
  };

  Time.prototype.stop = function() {
    return clearInterval(this.interval);
  };

  Time.prototype.tick = function() {
    this.minute += 1 * this.flow;
    return this.format();
  };

  Time.prototype.format = function() {
    if (this.minute >= 60) {
      this.minute = this.minute - 60;
      this.format();
      this.hour += 1;
      if (this.hour >= 24) {
        this.format();
        this.hour = this.hour - 24;
        return this.day += 1;
      }
    }
  };

  Time.prototype.serialize = function() {
    return {
      day: this.day,
      hour: this.hour,
      minute: this.minute,
      flow: this.flow
    };
  };

  return Time;

})();

var GameServer;

GameServer = (function() {
  function GameServer(_) {
    this._ = _;
    this.temp = {};
    this.loop = 0;
    this.dt = 20;
    this.ticks = 0;
    this.broadcast = new Broadcast(this._);
    this.world = new World(this._);
    this.time = new Time(this._);
    this.physic = new Physic(this._);
    this._.addEventListener('ready', (function(_this) {
      return function() {
        console.log(getTime(), 'GameServer' + '.start'.yellow);
        _this.world.initialize();
        return _this.loop = setInterval(function() {
          return _this.tick();
        }, _this.dt);
      };
    })(this));
    this._.io.server.on('connection', (function(_this) {
      return function(socket) {
        socket.on('AccountManager.registrationRequest', function(packet) {
          return _this.registrationRequest(socket, packet);
        });
        socket.on('AccountManager.loginRequest', function(packet) {
          return _this.loginRequest(socket, packet);
        });
        socket.on('AccountManager.logoutRequest', function(packet) {
          return _this.logoutRequest(socket, packet);
        });
        return socket.on('disconnect', function() {
          return _this.socketDisconnect(socket);
        });
      };
    })(this));
  }

  GameServer.prototype.tick = function() {
    this.world.tick({
      dt: this.dt
    });
    this.physic.tick();
    return this.broadcast.tick();
  };

  GameServer.prototype.registrationRequest = function(socket, packet) {
    var characterID;
    characterID = this._.account.getAccountBySocketID(socket.client.id).name;
    if (this._.assets.gamedata.objects.characters.data[characterID]) {
      return socket.emit('GameServer.registrationResponce', {
        result: false,
        error: 'error.GameServer.registrationResponce.characterExisting'
      });
    } else {
      this._.assets.gamedata.objects.characters.data[characterID] = new library.Character;
      this._.assets.gamedata.objects.characters.save();
      return socket.emit('GameServer.registrationResponce', {
        result: true
      });
    }
  };

  GameServer.prototype.loginRequest = function(socket, packet) {
    this.broadcast.addListener(socket.client.id, socket);
    this.world.add({
      k: packet.name,
      v: this._.assets.gamedata.objects.characters.data[packet.name],
      dynamic: true,
      socket: socket
    });
    return socket.emit('GameServer.loginResponce', {
      result: true
    });
  };

  GameServer.prototype.leaveWorldRequest = function(socket, packet) {
    var account, k, v, _ref;
    account = this._.AccountServer.getAccountBySocketID(socket.client.id);
    if (!account) {
      return socket.emit('GameServer.leaveWorld', {
        result: false,
        error: 'error.GameServer.leaveWorld.undefinedAccount'
      });
    } else {
      this.broadcast.removeListener(socket.client.id);
      _ref = this.world.objects.dynamic;
      for (k in _ref) {
        v = _ref[k];
        if (v.name === account.name) {
          this.world.remove(v);
        }
      }
      return socket.emit('GameServer.leaveWorldResponse', {
        result: true
      });
    }
  };

  GameServer.prototype.socketDisconnect = function(socket) {
    var account, k, v, _ref, _results;
    account = this._.account.getAccountBySocketID(socket.client.id);
    if (account) {
      this.broadcast.removeListener(socket.client.id);
      _ref = this.world.objects.dynamic;
      _results = [];
      for (k in _ref) {
        v = _ref[k];
        if (v.name === account.name) {
          _results.push(this.world.remove(v));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    }
  };

  return GameServer;

})();

var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

library.BasicCharacter = (function(_super) {
  __extends(BasicCharacter, _super);

  function BasicCharacter(options) {
    library.Character.call(this, options);
    this.classname.BasicCharacter = true;
    this.inputmanager.on('walk.forward', (function(_this) {
      return function(e) {
        if (e.bool) {
          return _this.states['walk.forward'].enable();
        } else {
          return _this.states['walk.forward'].disable();
        }
      };
    })(this));
    this.inputmanager.on('walk.back', (function(_this) {
      return function(e) {
        if (e.bool) {
          return _this.states['walk.back'].enable();
        } else {
          return _this.states['walk.back'].disable();
        }
      };
    })(this));
    this.inputmanager.on('jump', (function(_this) {
      return function(e) {
        if (e.bool) {
          return _this.states['jump'].enable();
        } else {
          return _this.states['jump'].disable();
        }
      };
    })(this));
    this.inputmanager.on('rotation.left', (function(_this) {
      return function(e) {
        if (e.bool) {
          return _this.states['rotation.left'].enable();
        } else {
          return _this.states['rotation.left'].disable();
        }
      };
    })(this));
    this.inputmanager.on('rotation.right', (function(_this) {
      return function(e) {
        if (e.bool) {
          return _this.states['rotation.right'].enable();
        } else {
          return _this.states['rotation.right'].disable();
        }
      };
    })(this));
    this.inputmanager.on('hit1', (function(_this) {
      return function(e) {
        return _this.setHit(1);
      };
    })(this));
  }

  return BasicCharacter;

})(library.Character);

var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

library.BasicNPC = (function(_super) {
  __extends(BasicNPC, _super);

  function BasicNPC(options) {
    library.NPC.call(this, options);
    this.classname.BasicNPC = true;
    this.ai.add(new ai.Task({
      priority: 0,
      data: {
        k: 'v'
      },
      tick: function(world) {
        return console.log('NPC.ai.tick');
      }
    }));
  }

  return BasicNPC;

})(library.NPC);



var OIMO, System, THREE, system, _color, _compression, _events, _express, _fs, _http, _log, _path, _png, _socket, _util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

THREE = require('./libs/three.server.js');

OIMO = require('./libs/oimo.server.js');

_color = require('colors');

_socket = require('socket.io');

_png = require('pngjs');

_compression = require('compression');

_express = require('express');

_events = require('events');

_fs = require('fs');

_http = require('http');

_path = require('path');

_util = require('util');

_log = require('eyes').inspector({
  styles: {
    other: 'cyan',
    key: 'grey',
    special: 'blue',
    number: 'red',
    string: 'green',
    bool: 'magenta',
    label: 'grey',
    pretty: true
  }
});


/*
-------------------------------------------------------
	defines basic system class
-------------------------------------------------------
 */

System = (function(_super) {
  __extends(System, _super);

  function System(options) {
    Component.call(this, {
      componentID: 'System',
      loading: {
        enabled: true,
        startTask: 'initialization',
        endFn: (function(_this) {
          return function() {
            return _this.fireEvent('ready');
          };
        })(this)
      }
    });
    this.config = JSON.parse(_fs.readFileSync(_path.join(__dirname, 'config.json')));
    this.http = new HTTPServer(this);
    this.io = new IO(this);
    this.cmd = new CMD(this);
    this.assets = new AssetsManager(this);
    this.account = new AccountServer(this);
    this.game = new GameServer(this);
    this.removeLoadingTask('initialization');
  }

  return System;

})(Component);

system = new System;
