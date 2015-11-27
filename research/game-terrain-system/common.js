var ab2str, billinearInterpolation, getGeometryVFData, obj2str, str2ab, str2obj;

billinearInterpolation = function(options) {
  var v1, v2;
  v1 = options.D + (options.C - options.D) * options.px;
  v2 = options.A + (options.B - options.A) * options.px;
  return v1 + (v2 - v1) * options.py;
};

getGeometryVFData = function(geometry) {
  var face, k, result, vertex, _i, _j, _len, _len1, _ref, _ref1;
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
