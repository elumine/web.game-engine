var ab2str, createFlat, getGrassMesh, obj2str, str2ab, str2obj;

importScripts('three.js');

self.addEventListener('message', function(e) {
  var face, geometry, k, result, vertex, _i, _j, _len, _len1, _ref, _ref1;
  geometry = createFlat(e.data.level, e.data.units, e.data.options.dencity, e.data.options.flatsize, e.data.options.grasswidth, e.data.options.grassheight);
  result = {
    faces: [],
    vertices: []
  };
  _ref = geometry.faces;
  for (k = _i = 0, _len = _ref.length; _i < _len; k = ++_i) {
    face = _ref[k];
    result.faces[k] = {
      a: face.a,
      b: face.b,
      c: face.c
    };
  }
  _ref1 = geometry.vertices;
  for (k = _j = 0, _len1 = _ref1.length; _j < _len1; k = ++_j) {
    vertex = _ref1[k];
    result.vertices[k] = {
      x: vertex.x,
      y: vertex.y,
      z: vertex.z
    };
  }
  self.postMessage({
    geometry: result
  });
  return self.close();
});

createFlat = function(level, units, dencity, flatsize, grasswidth, grassheight) {
  var count, draw, geometry, i, j, k, l, row, sampe_mesh, unit, _i, _j, _k, _l, _len, _len1, _len2, _len3, _m, _n, _o, _p, _q, _r, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, _s, _t, _u, _v;
  geometry = new THREE.Geometry;
  switch (level) {
    case 0:
      count = dencity;
      for (j = _i = 0, _len = units.length; _i < _len; j = ++_i) {
        row = units[j];
        for (i = _j = 0, _len1 = row.length; _j < _len1; i = ++_j) {
          unit = row[i];
          if (unit) {
            for (k = _k = 0, _ref = count - 1; _k <= _ref; k = _k += 1) {
              for (l = _l = 0, _ref1 = count - 1; _l <= _ref1; l = _l += 1) {
                sampe_mesh = getGrassMesh(i + l / count - flatsize / 2, j + k / count - flatsize / 2, 0, grasswidth, grassheight);
                geometry.merge(sampe_mesh.geometry, sampe_mesh.matrix);
              }
            }
          }
        }
      }
      break;
    case 1:
      count = dencity - 1;
      for (j = _m = 0, _len2 = units.length; _m < _len2; j = ++_m) {
        row = units[j];
        for (i = _n = 0, _len3 = row.length; _n < _len3; i = ++_n) {
          unit = row[i];
          if (unit) {
            for (k = _o = 0, _ref2 = count - 1; _o <= _ref2; k = _o += 1) {
              for (l = _p = 0, _ref3 = count - 1; _p <= _ref3; l = _p += 1) {
                sampe_mesh = getGrassMesh(i + l / count - flatsize / 2, j + k / count - flatsize / 2, 1, grasswidth, grassheight);
                geometry.merge(sampe_mesh.geometry, sampe_mesh.matrix);
              }
            }
          }
        }
      }
      break;
    case 2:
      for (j = _q = 0, _ref4 = units.length; _q <= _ref4; j = _q += 2) {
        row = units[j];
        for (i = _r = 0, _ref5 = row.length - 1; _r <= _ref5; i = _r += 2) {
          draw = false;
          if (units[j]) {
            if (units[j][i]) {
              draw = true;
            }
            if (units[j][i + 1]) {
              draw = true;
            }
          }
          if (units[j + 1]) {
            if (units[j + 1][i]) {
              draw = true;
            }
            if (units[j + 1][i + 1]) {
              draw = true;
            }
          }
          if (draw) {
            sampe_mesh = getGrassMesh(i + 0.5 - flatsize / 2, j + 0.5 - flatsize / 2, 2, grasswidth, grassheight);
            geometry.merge(sampe_mesh.geometry, sampe_mesh.matrix);
          }
        }
      }
      break;
    case 3:
      for (j = _s = 0, _ref6 = units.length; _s <= _ref6; j = _s += 4) {
        row = units[j];
        for (i = _t = 0, _ref7 = row.length - 1; _t <= _ref7; i = _t += 4) {
          draw = false;
          if (units[j]) {
            if (units[j][i]) {
              draw = true;
            }
            if (units[j][i + 2]) {
              draw = true;
            }
          }
          if (units[j + 2]) {
            if (units[j + 2][i]) {
              draw = true;
            }
            if (units[j + 2][i + 2]) {
              draw = true;
            }
          }
          if (draw) {
            sampe_mesh = getGrassMesh(i + 2 - flatsize / 2, j + 2 - flatsize / 2, 3, grasswidth, grassheight);
            geometry.merge(sampe_mesh.geometry, sampe_mesh.matrix);
          }
        }
      }
      break;
    case 4:
      for (j = _u = 0, _ref8 = units.length; _u <= _ref8; j = _u += 10) {
        row = units[j];
        for (i = _v = 0, _ref9 = row.length - 1; _v <= _ref9; i = _v += 10) {
          draw = false;
          if (units[j]) {
            if (units[j][i]) {
              draw = true;
            }
            if (units[j][i + 5]) {
              draw = true;
            }
          }
          if (units[j + 5]) {
            if (units[j + 5][i]) {
              draw = true;
            }
            if (units[j + 5][i + 5]) {
              draw = true;
            }
          }
          if (draw) {
            sampe_mesh = getGrassMesh(i + 5 - flatsize / 2, j + 5 - flatsize / 2, 4, grasswidth, grassheight);
            geometry.merge(sampe_mesh.geometry, sampe_mesh.matrix);
          }
        }
      }
  }
  return geometry;
};

getGrassMesh = function(px, pz, d, sx, sy) {
  var dp, ds, sampe_geometry, sampe_mesh;
  ds = 2 * (Math.random() - 0.5) * 0.1;
  dp = 2 * (Math.random() - 0.5) * 0.2;
  sampe_geometry = new THREE.PlaneGeometry(sx, sy, 1, 1);
  sampe_mesh = new THREE.Mesh(sampe_geometry);
  sampe_mesh.position.x = px;
  sampe_mesh.position.z = pz;
  sampe_mesh.position.y = sy / 2;
  sampe_mesh.rotation.y = Math.random() * Math.PI;
  sampe_mesh.updateMatrix();
  return sampe_mesh;
};

str2obj = function(str) {
  return JSON.parse(str);
};

obj2str = function(obj) {
  return JSON.stringify(obj);
};

ab2str = function(buf) {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
};

str2ab = function(str) {
  var buf, bufView, i, _i, _ref;
  buf = new ArrayBuffer(str.length * 2);
  bufView = new Uint16Array(buf);
  for (i = _i = 0, _ref = str.length; _i <= _ref; i = _i += 1) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
};
