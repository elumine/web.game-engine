var Tasks;

importScripts('three.js', 'shared.js');

self.addEventListener('message', function(e) {
  var geometry;
  switch (e.data.task) {
    case 'GrassLayer.createGrassFlatGeometry':
      geometry = Tasks.GrassLayer.createGrassFlatGeometry(e.data);
      self.postMessage({
        geometry: getGeometryVFData(geometry)
      });
      break;
    case 'TerrainLayer.createTerrainFlatGeometry':
      geometry = Tasks.TerrainLayer.createTerrainFlatGeometry(e.data);
      self.postMessage({
        geometry: getGeometryVFData(geometry)
      });
  }
  return self.close();
});

Tasks = {
  TerrainLayer: {
    createTerrainFlatGeometry: function(options) {
      var count, filter, geometry, i, j, next, prev, scaledown, _i, _j, _k, _l;
      filter = Math.pow(2, options.level);
      count = options.flatsize / filter;
      scaledown = 1 / 255;
      geometry = new THREE.PlaneGeometry(options.flatsize, options.flatsize, count, count);
      for (j = _i = 0; _i <= count; j = _i += 1) {
        for (i = _j = 0; _j <= count; i = _j += 1) {
          geometry.vertices[j * (count + 1) + i].z = scaledown * options.units[j * filter][i * filter];
        }
      }
      for (i = _k = 1; _k <= count; i = _k += 2) {
        prev = options.units[options.units.length - 1][(i - 1) * filter];
        if (options.units[options.units.length - 1][(i + 1) * filter]) {
          next = options.units[options.units.length - 1][(i + 1) * filter];
        } else {
          next = options.units[options.units.length - 1][i * filter];
        }
        geometry.vertices[count * (count + 1) + i].z = scaledown * (next + prev) / 2;
      }
      for (j = _l = 1; _l <= count; j = _l += 2) {
        prev = options.units[(j - 1) * filter][options.units.length - 1];
        if (options.units[(j + 1) * filter]) {
          next = options.units[(j + 1) * filter][options.units.length - 1];
        } else {
          next = options.units[j * filter][options.units.length - 1];
        }
        geometry.vertices[j * (count + 1) + count].z = scaledown * (next + prev) / 2;
      }
      return geometry;
    }
  },
  GrassLayer: {
    createGrassFlatGeometry: function(options) {
      var count, filter, geometry, i, j, sampe_mesh, sx, _i, _j, _ref, _ref1;
      geometry = new THREE.Geometry;
      filter = Math.pow(2, options.level);
      count = options.flatsize / filter;
      sx = options.dencity.size * options.flatsize / count;
      for (j = _i = 0, _ref = count - 1; _i <= _ref; j = _i += 1) {
        for (i = _j = 0, _ref1 = count - 1; _j <= _ref1; i = _j += 1) {
          sampe_mesh = Tasks.GrassLayer.createGrassMesh({
            i: i,
            j: j,
            position: {
              x: i * options.flatsize / count + 0.5 * options.flatsize / count,
              z: j * options.flatsize / count + 0.5 * options.flatsize / count
            },
            size: {
              x: sx,
              y: options.grassheight
            },
            heightmap: options.units.heightmap,
            flatsize: options.flatsize,
            mid_value: options.mid_value,
            terrain: options.terrain
          });
          geometry.merge(sampe_mesh.geometry, sampe_mesh.matrix);
        }
      }
      return geometry;
    },
    createGrassMesh: function(options) {
      var A, B, C, D, getDeltaPosition, getDeltaRotation, getDeltaScale, i, j, mesh, mesh1, mesh2, px, py, sampleGeometry, y;
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
      y = (y - options.mid_value) / 255 * options.terrain.size.y;
      getDeltaPosition = function() {
        return Math.random() - 0.5;
      };
      getDeltaRotation = function() {
        return Math.random() * Math.PI / 4;
      };
      getDeltaScale = function() {
        return {
          x: 1,
          y: 1
        };
      };
      mesh = new THREE.Mesh(new THREE.Geometry);
      sampleGeometry = new THREE.PlaneGeometry(options.size.x * getDeltaScale().x, options.size.y * getDeltaScale().y, 1, 1);
      mesh1 = new THREE.Mesh(sampleGeometry);
      mesh1.updateMatrix();
      mesh.geometry.merge(mesh1.geometry, mesh1.matrix);
      mesh2 = new THREE.Mesh(sampleGeometry);
      mesh2.rotation.y = Math.PI / 2;
      mesh2.updateMatrix();
      mesh.geometry.merge(mesh2.geometry, mesh2.matrix);
      mesh.position.x = options.position.x - options.flatsize / 2 + getDeltaPosition();
      mesh.position.y = options.size.y / 2 + y;
      mesh.position.z = options.position.z - options.flatsize / 2 + getDeltaPosition();
      mesh.rotation.y = getDeltaRotation();
      mesh.updateMatrix();
      return mesh;
    }
  }
};
