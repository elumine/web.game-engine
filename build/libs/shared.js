var ab2str, billinearInterpolation, getGeometryVFData, obj2str, setGeometryVFData, str2ab, str2obj;

billinearInterpolation = function(options) {
  var v1, v2;
  v1 = options.D + (options.C - options.D) * options.px;
  v2 = options.A + (options.B - options.A) * options.px;
  return v1 + (v2 - v1) * options.py;
};

getGeometryVFData = function(geometry) {
  var face, i, j, k, result, uv, v, vertex, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _ref, _ref1, _ref2;
  result = {
    faces: [],
    vertices: [],
    faceVertexUvs: []
  };
  _ref = geometry.faces;
  for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
    face = _ref[i];
    result.faces[i] = {
      a: face.a,
      b: face.b,
      c: face.c
    };
  }
  _ref1 = geometry.vertices;
  for (i = _j = 0, _len1 = _ref1.length; _j < _len1; i = ++_j) {
    vertex = _ref1[i];
    result.vertices[i] = {
      x: vertex.x,
      y: vertex.y,
      z: vertex.z
    };
  }
  _ref2 = geometry.faceVertexUvs;
  for (i = _k = 0, _len2 = _ref2.length; _k < _len2; i = ++_k) {
    uv = _ref2[i];
    result.faceVertexUvs[i] = [];
    for (j = _l = 0, _len3 = uv.length; _l < _len3; j = ++_l) {
      face = uv[j];
      result.faceVertexUvs[i][j] = [];
      for (k = _m = 0, _len4 = face.length; _m < _len4; k = ++_m) {
        v = face[k];
        result.faceVertexUvs[i][j][k] = {
          x: v.x,
          y: v.y
        };
      }
    }
  }
  return result;
};

setGeometryVFData = function(geometry) {
  var face, i, j, k, result, uv, v, vertex, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _ref, _ref1, _ref2;
  result = new THREE.Geometry;
  _ref = geometry.vertices;
  for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
    vertex = _ref[i];
    result.vertices[i] = new THREE.Vector3(vertex.x, vertex.y, vertex.z);
  }
  _ref1 = geometry.faces;
  for (i = _j = 0, _len1 = _ref1.length; _j < _len1; i = ++_j) {
    face = _ref1[i];
    result.faces[i] = new THREE.Face3(face.a, face.b, face.c);
  }
  _ref2 = geometry.faceVertexUvs;
  for (i = _k = 0, _len2 = _ref2.length; _k < _len2; i = ++_k) {
    uv = _ref2[i];
    result.faceVertexUvs[i] = [];
    for (j = _l = 0, _len3 = uv.length; _l < _len3; j = ++_l) {
      face = uv[j];
      result.faceVertexUvs[i][j] = [];
      for (k = _m = 0, _len4 = face.length; _m < _len4; k = ++_m) {
        v = face[k];
        result.faceVertexUvs[i][j][k] = new THREE.Vector2(v.x, v.y);
      }
    }
  }
  result.computeFaceNormals();
  return result;
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
