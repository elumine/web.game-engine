var tasks;

importScripts('three.js', 'common.js');

self.addEventListener('message', function(e) {
  var geometry;
  switch (e.data.task) {
    case 'GrassLayer.createGrassFlatGeometry':
      geometry = tasks.GrassLayer.createGrassFlatGeometry({
        level: e.data.level,
        units: e.data.units.grassmap,
        heightmap: e.data.units.heightmap,
        dencity: e.data.options.dencity,
        flatsize: e.data.options.flatsize,
        grasswidth: e.data.options.grasswidth,
        grassheight: e.data.options.grassheight
      });
      self.postMessage({
        geometry: getGeometryVFData(geometry)
      });
      break;
    case 'TerrainLayer.createTerrainFlatGeometry':
      geometry = tasks.TerrainLayer.createTerrainFlatGeometry({
        step: e.data.step,
        units: e.data.units,
        flatsize: e.data.options.flatsize
      });
      self.postMessage({
        geometry: getGeometryVFData(geometry)
      });
      break;
    case 'ObjectsLayer.creteGroupGeometry':
      geometry = tasks.ObjectsLayer.creteGroupGeometry({
        group: e.data.group
      });
      self.postMessage({
        geometry: getGeometryVFData(geometry)
      });
  }
  return self.close();
});

tasks = {};

tasks.ObjectsLayer = {};

tasks.ObjectsLayer.creteGroupGeometry = function(options) {
  var geometry, mesh, object, _i, _len, _ref;
  geometry = new THREE.Geometry;
  _ref = options.group;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    object = _ref[_i];
    if (object.geometry.task) {
      mesh = tasks[object.geometry.task]({
        object: object
      });
    } else if (object.geometry.faces) {
      mesh = tasks.ObjectsLayer.createObjectMesh({
        object: object
      });
    }
    geometry.merge(mesh.geometry, mesh.matrix);
  }
  return geometry;
};

tasks.ObjectsLayer.createObjectMesh = function(options) {
  var geometry, mesh;
  geometry = setGeometryVFData(options.object.geometry);
  mesh = new THREE.Mesh(geometry);
  if (options.object.position) {
    mesh.position.x = options.object.position.x || 0;
    mesh.position.y = options.object.position.y || 0;
    mesh.position.z = options.object.position.z || 0;
  }
  if (options.object.rotation) {
    mesh.rotation.x = options.object.rotation.x || 0;
    mesh.rotation.y = options.object.rotation.y || 0;
    mesh.rotation.z = options.object.rotation.z || 0;
  }
  if (options.object.scale) {
    mesh.scale.x = options.object.scale.x || 1;
    mesh.scale.y = options.object.scale.y || 1;
    mesh.scale.z = options.object.scale.z || 1;
  }
  mesh.updateMatrix();
  return mesh;
};

tasks.createStone1Geometry = function(options) {
  var geometry, mesh;
  geometry = new THREE.SphereGeometry(options.object.data.size.x / 2, 5, 5);
  mesh = new THREE.Mesh(geometry);
  if (options.object.position) {
    mesh.position.x = options.object.position.x;
    mesh.position.y = options.object.position.y + Math.random() * options.object.data.size.x / 2;
    mesh.position.z = options.object.position.z;
  }
  if (options.object.rotation) {
    mesh.rotation.x = 2 * (Math.random() - 0.5) * Math.PI;
    mesh.rotation.y = 2 * (Math.random() - 0.5) * Math.PI;
    mesh.rotation.z = 2 * (Math.random() - 0.5) * Math.PI;
  }
  if (options.object.scale) {
    mesh.scale.x = options.object.scale.x || 1;
    mesh.scale.y = options.object.scale.y || 1;
    mesh.scale.z = options.object.scale.z || 1;
  }
  mesh.updateMatrix();
  return mesh;
};

tasks.TerrainLayer = {};

tasks.TerrainLayer.createTerrainFlatGeometry = function(options) {
  var count, geometry, i, j, next, prev, step, _i, _j, _k, _l;
  step = options.step;
  count = options.flatsize / step;
  geometry = new THREE.PlaneGeometry(options.flatsize, options.flatsize, count, count);
  for (j = _i = 0; _i <= count; j = _i += 1) {
    for (i = _j = 0; _j <= count; i = _j += 1) {
      geometry.vertices[j * (count + 1) + i].z = options.units[j * step][i * step];
    }
  }
  for (i = _k = 1; _k <= count; i = _k += 2) {
    prev = options.units[options.units.length - 1][(i - 1) * step];
    if (options.units[options.units.length - 1][(i + 1) * step]) {
      next = options.units[options.units.length - 1][(i + 1) * step];
    } else {
      next = options.units[options.units.length - 1][i * step];
    }
    geometry.vertices[count * (count + 1) + i].z = (next + prev) / 2;
  }
  for (j = _l = 1; _l <= count; j = _l += 2) {
    prev = options.units[(j - 1) * step][options.units.length - 1];
    if (options.units[(j + 1) * step]) {
      next = options.units[(j + 1) * step][options.units.length - 1];
    } else {
      next = options.units[j * step][options.units.length - 1];
    }
    geometry.vertices[j * (count + 1) + count].z = (next + prev) / 2;
  }
  return geometry;
};

tasks.GrassLayer = {};

tasks.GrassLayer.createGrassFlatGeometry = function(options) {
  var count, geometry, i, j, k, l, sampe_mesh, sizeX, sizeXArray, step, stepArray, _i, _j, _k, _l, _ref, _ref1, _ref2, _ref3;
  geometry = new THREE.Geometry;
  if (options.level === 0) {
    count = 2;
  } else {
    count = 1;
  }
  sizeXArray = [0.75, 1.5, options.flatsize / 3, options.flatsize / 2, options.flatsize];
  sizeX = sizeXArray[options.level];
  stepArray = [1, 1, 2, 3, 5];
  step = stepArray[options.level];
  for (j = _i = 0, _ref = options.units.length - 1; step > 0 ? _i <= _ref : _i >= _ref; j = _i += step) {
    for (i = _j = 0, _ref1 = options.units[j].length - 1; step > 0 ? _j <= _ref1 : _j >= _ref1; i = _j += step) {
      if (options.units[j][i]) {
        for (k = _k = 0, _ref2 = count - 1; _k <= _ref2; k = _k += 1) {
          for (l = _l = 0, _ref3 = count - 1; _l <= _ref3; l = _l += 1) {
            sampe_mesh = tasks.GrassLayer.createGrassMesh({
              flatsize: options.flatsize,
              i: i,
              j: j,
              heightmap: options.heightmap,
              position: {
                x: i + l / count + sizeX / 2,
                z: j + k / count + sizeX / 2
              },
              level: options.level,
              size: {
                x: sizeX,
                y: options.grassheight * options.units[j][i] / 256
              }
            });
            geometry.merge(sampe_mesh.geometry, sampe_mesh.matrix);
          }
        }
      }
    }
  }
  return geometry;
};

tasks.GrassLayer.createGrassMesh = function(options) {
  var A, B, C, D, dPosition, geometry, geometry1, i, j, mesh, mesh1, mesh2, px, py, y;
  i = Math.floor(options.position.x);
  j = Math.floor(options.position.z);
  A = options.heightmap[j][i];
  B = options.heightmap[j][i + 1];
  C = options.heightmap[j + 1][i + 1];
  D = options.heightmap[j + 1][i];
  px = options.position.x - i;
  py = 1 - (options.position.z - j);
  y = billinearInterpolation({
    A: A,
    B: B,
    C: C,
    D: D,
    px: px,
    py: py
  });
  dPosition = (Math.random() - 0.5) * options.size.x / 4;
  mesh = new THREE.Mesh(geometry);
  geometry = new THREE.Geometry;
  geometry1 = new THREE.PlaneGeometry(options.size.x, options.size.y, 1, 1);
  mesh1 = new THREE.Mesh(geometry1);
  mesh1.updateMatrix();
  mesh.geometry.merge(mesh1.geometry, mesh1.matrix);
  mesh2 = new THREE.Mesh(geometry1);
  mesh2.rotation.y = Math.PI / 2;
  mesh2.updateMatrix();
  mesh.geometry.merge(mesh2.geometry, mesh2.matrix);
  mesh.position.x = options.position.x - options.flatsize / 2;
  mesh.position.y = options.size.y / 2 + y;
  mesh.position.z = options.position.z - options.flatsize / 2;
  mesh.updateMatrix();
  return mesh;
};
