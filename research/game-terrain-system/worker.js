var tasks;

importScripts('three.js', 'common.js');

self.addEventListener('message', function(e) {
  var geometry;
  switch (e.data.task) {
    case 'GrassSystem.createGrassFlatGeometry':
      geometry = tasks.GrassSystem.createGrassFlatGeometry({
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
    case 'TerrainSystem.createTerrainFlatGeometry':
      geometry = tasks.TerrainSystem.createTerrainFlatGeometry({
        step: e.data.step,
        units: e.data.units,
        flatsize: e.data.options.flatsize
      });
      self.postMessage({
        geometry: getGeometryVFData(geometry)
      });
      break;
    case 'ObjectsSystem.creteGroupGeometry':
      geometry = tasks.ObjectsSystem.creteGroupGeometry({
        group: e.data.group
      });
      self.postMessage({
        geometry: getGeometryVFData(geometry)
      });
  }
  return self.close();
});

tasks = {};

tasks.ObjectsSystem = {};

tasks.ObjectsSystem.creteGroupGeometry = function(options) {
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
      mesh = tasks.ObjectsSystem.createObjectGeometry({
        object: object
      });
    }
    geometry.merge(mesh.geometry, mesh.matrix);
  }
  return geometry;
};

tasks.ObjectsSystem.createObjectGeometry = function(options) {
  var face, geometry, mesh, vertex, _i, _j, _len, _len1, _ref, _ref1;
  geometry = new THREE.Geometry;
  _ref = options.object.geometry.vertices;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    vertex = _ref[_i];
    geometry.vertices.push(new THREE.Vector3(vertex.x, vertex.y, vertex.z));
  }
  _ref1 = options.object.geometry.faces;
  for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
    face = _ref1[_j];
    geometry.faces.push(new THREE.Face3(face.a, face.b, face.c));
  }
  geometry.computeFaceNormals();
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
  var geometry, mesh, vertex, _i, _len, _ref;
  geometry = new THREE.SphereGeometry(options.object.data.size.x / 2, 6, 6);
  _ref = geometry.vertices;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    vertex = _ref[_i];
    vertex.x += (Math.random() - 0.5) * 0.5;
    vertex.y += (Math.random() - 0.5) * 0.5;
    vertex.z += (Math.random() - 0.5) * 0.5;
  }
  mesh = new THREE.Mesh(geometry);
  if (options.object.position) {
    mesh.position.x = options.object.position.x || 0;
    mesh.position.y = options.object.position.y || 0;
    mesh.position.z = options.object.position.z || 0;
  }
  mesh.position.y += options.object.data.size.y / 2;
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

tasks.TerrainSystem = {};

tasks.TerrainSystem.createTerrainFlatGeometry = function(options) {
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

tasks.GrassSystem = {};

tasks.GrassSystem.createGrassFlatGeometry = function(options) {
  var count, draw, geometry, i, j, k, l, row, sampe_mesh, unit, _i, _j, _k, _l, _len, _len1, _len2, _len3, _m, _n, _o, _p, _q, _r, _ref, _ref1, _ref10, _ref11, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, _s, _t, _u, _v;
  geometry = new THREE.Geometry;
  switch (options.level) {
    case 0:
      count = options.dencity;
      _ref = options.units;
      for (j = _i = 0, _len = _ref.length; _i < _len; j = ++_i) {
        row = _ref[j];
        for (i = _j = 0, _len1 = row.length; _j < _len1; i = ++_j) {
          unit = row[i];
          if (unit) {
            for (k = _k = 0, _ref1 = count - 1; _k <= _ref1; k = _k += 1) {
              for (l = _l = 0, _ref2 = count - 1; _l <= _ref2; l = _l += 1) {
                sampe_mesh = tasks.GrassSystem.createGrassMesh({
                  step: 1,
                  flatsize: options.flatsize,
                  i: i,
                  j: j,
                  heightmap: options.heightmap,
                  position: {
                    x: i + l / count,
                    z: j + k / count
                  },
                  level: options.level,
                  size: {
                    x: options.grasswidth,
                    y: options.grassheight
                  }
                });
                geometry.merge(sampe_mesh.geometry, sampe_mesh.matrix);
              }
            }
          }
        }
      }
      break;
    case 1:
      count = options.dencity - 1;
      _ref3 = options.units;
      for (j = _m = 0, _len2 = _ref3.length; _m < _len2; j = ++_m) {
        row = _ref3[j];
        for (i = _n = 0, _len3 = row.length; _n < _len3; i = ++_n) {
          unit = row[i];
          if (unit) {
            for (k = _o = 0, _ref4 = count - 1; _o <= _ref4; k = _o += 1) {
              for (l = _p = 0, _ref5 = count - 1; _p <= _ref5; l = _p += 1) {
                sampe_mesh = tasks.GrassSystem.createGrassMesh({
                  step: 1,
                  flatsize: options.flatsize,
                  i: i,
                  j: j,
                  heightmap: options.heightmap,
                  position: {
                    x: i + l / count,
                    z: j + k / count
                  },
                  level: options.level,
                  size: {
                    x: options.grasswidth,
                    y: options.grassheight
                  }
                });
                geometry.merge(sampe_mesh.geometry, sampe_mesh.matrix);
              }
            }
          }
        }
      }
      break;
    case 2:
      for (j = _q = 0, _ref6 = options.units.length - 1; _q <= _ref6; j = _q += 2) {
        row = options.units[j];
        for (i = _r = 0, _ref7 = row.length - 1; _r <= _ref7; i = _r += 2) {
          draw = false;
          if (options.units[j]) {
            if (options.units[j][i]) {
              draw = true;
            }
            if (options.units[j][i + 1]) {
              draw = true;
            }
          }
          if (options.units[j + 1]) {
            if (options.units[j + 1][i]) {
              draw = true;
            }
            if (options.units[j + 1][i + 1]) {
              draw = true;
            }
          }
          if (draw) {
            sampe_mesh = tasks.GrassSystem.createGrassMesh({
              step: 2,
              flatsize: options.flatsize,
              i: i,
              j: j,
              heightmap: options.heightmap,
              position: {
                x: i + 0.5,
                z: j + 0.5
              },
              level: options.level,
              size: {
                x: options.grasswidth,
                y: options.grassheight
              }
            });
            geometry.merge(sampe_mesh.geometry, sampe_mesh.matrix);
          }
        }
      }
      break;
    case 3:
      for (j = _s = 0, _ref8 = options.units.length - 1; _s <= _ref8; j = _s += 4) {
        row = options.units[j];
        for (i = _t = 0, _ref9 = row.length - 1; _t <= _ref9; i = _t += 4) {
          draw = false;
          if (options.units[j]) {
            if (options.units[j][i]) {
              draw = true;
            }
            if (options.units[j][i + 2]) {
              draw = true;
            }
          }
          if (options.units[j + 2]) {
            if (options.units[j + 2][i]) {
              draw = true;
            }
            if (options.units[j + 2][i + 2]) {
              draw = true;
            }
          }
          if (draw) {
            sampe_mesh = tasks.GrassSystem.createGrassMesh({
              step: 4,
              flatsize: options.flatsize,
              i: i,
              j: j,
              heightmap: options.heightmap,
              position: {
                x: i + 2,
                z: j + 2
              },
              level: options.level,
              size: {
                x: options.grasswidth,
                y: options.grassheight
              }
            });
            geometry.merge(sampe_mesh.geometry, sampe_mesh.matrix);
          }
        }
      }
      break;
    case 4:
      for (j = _u = 0, _ref10 = options.units.length - 1; _u <= _ref10; j = _u += 10) {
        row = options.units[j];
        for (i = _v = 0, _ref11 = row.length - 1; _v <= _ref11; i = _v += 10) {
          draw = false;
          if (options.units[j]) {
            if (options.units[j][i]) {
              draw = true;
            }
            if (options.units[j][i + 5]) {
              draw = true;
            }
          }
          if (options.units[j + 5]) {
            if (options.units[j + 5][i]) {
              draw = true;
            }
            if (options.units[j + 5][i + 5]) {
              draw = true;
            }
          }
          if (draw) {
            sampe_mesh = tasks.GrassSystem.createGrassMesh({
              step: 10,
              flatsize: options.flatsize,
              i: i,
              j: j,
              heightmap: options.heightmap,
              position: {
                x: i + 5,
                z: j + 5
              },
              level: options.level,
              size: {
                x: options.grasswidth,
                y: options.grassheight
              }
            });
            geometry.merge(sampe_mesh.geometry, sampe_mesh.matrix);
          }
        }
      }
  }
  return geometry;
};

tasks.GrassSystem.createGrassMesh = function(options) {
  var A, B, C, D, dPosition, dSize, i, j, px, py, sampe_geometry, sampe_mesh, y;
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
  dSize = 2 * (Math.random() - 0.5) * 0.1;
  dPosition = 2 * (Math.random() - 0.5) * 0.2;
  sampe_geometry = new THREE.PlaneGeometry((options.size.x * (1 + dSize)) * (options.level + 1), options.size.y * (1 + dSize), 1, 1);
  sampe_mesh = new THREE.Mesh(sampe_geometry);
  sampe_mesh.position.x = options.position.x - options.flatsize / 2;
  sampe_mesh.position.z = options.position.z - options.flatsize / 2;
  sampe_mesh.position.y = y + options.size.y / 2;
  sampe_mesh.updateMatrix();
  return sampe_mesh;
};
