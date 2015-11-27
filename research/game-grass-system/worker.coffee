importScripts 'three.js'

self.addEventListener 'message', (e) ->
  geometry = createFlat e.data.level, e.data.units, e.data.options.dencity, e.data.options.flatsize, e.data.options.grasswidth, e.data.options.grassheight
  result = 
    faces: []
    vertices: []
  for face, k in geometry.faces
    result.faces[k] =
      a: face.a
      b: face.b
      c: face.c
  for vertex, k in geometry.vertices
    result.vertices[k] =
      x: vertex.x
      y: vertex.y
      z: vertex.z
  
  #buff = str2ab obj2str
  #  geometry: 0
  #self.postMessage buff, [buff]
  
  self.postMessage
    geometry: result 

  self.close()



createFlat = (level, units, dencity, flatsize, grasswidth, grassheight) ->
  geometry = new THREE.Geometry
  switch level
    when 0
      count = dencity
      for row, j in units
        for unit, i in row
          if unit
            for k in [0..count - 1] by 1
              for l in [0..count - 1] by 1
                sampe_mesh = getGrassMesh i + l / count - flatsize / 2, j + k / count - flatsize / 2, 0, grasswidth, grassheight
                geometry.merge sampe_mesh.geometry, sampe_mesh.matrix
    when 1
      count = dencity - 1
      for row, j in units
        for unit, i in row
          if unit
            for k in [0..count - 1] by 1
              for l in [0..count - 1] by 1
                sampe_mesh = getGrassMesh i + l / count - flatsize / 2, j + k / count - flatsize / 2, 1, grasswidth, grassheight
                geometry.merge sampe_mesh.geometry, sampe_mesh.matrix
    when 2
      for j in [0..units.length] by 2
        row = units[j]
        for i in [0..row.length - 1] by 2
          draw = false
          if units[j]
            if units[j][i]    then draw = true
            if units[j][i+1]  then draw = true
          if units[j+1]
            if units[j+1][i]  then draw = true
            if units[j+1][i+1]  then draw = true
          if draw
            sampe_mesh = getGrassMesh i + 0.5 - flatsize / 2, j + 0.5 - flatsize / 2, 2, grasswidth, grassheight
            geometry.merge sampe_mesh.geometry, sampe_mesh.matrix
    when 3
      for j in [0..units.length] by 4
        row = units[j]
        for i in [0..row.length - 1] by 4
          draw = false
          if units[j]
            if units[j][i]    then draw = true
            if units[j][i+2]  then draw = true
          if units[j+2]
            if units[j+2][i]  then draw = true
            if units[j+2][i+2]  then draw = true
          if draw
            sampe_mesh = getGrassMesh i + 2 - flatsize / 2, j + 2 - flatsize / 2, 3, grasswidth, grassheight
            geometry.merge sampe_mesh.geometry, sampe_mesh.matrix
    when 4
      for j in [0..units.length] by 10
        row = units[j]
        for i in [0..row.length - 1] by 10
          draw = false
          if units[j]
            if units[j][i]    then draw = true
            if units[j][i+5]  then draw = true
          if units[j+5]
            if units[j+5][i]  then draw = true
            if units[j+5][i+5]  then draw = true
          if draw
            sampe_mesh = getGrassMesh i + 5 - flatsize / 2, j + 5 - flatsize / 2, 4, grasswidth, grassheight
            geometry.merge sampe_mesh.geometry, sampe_mesh.matrix

  return geometry


getGrassMesh = (px, pz, d, sx, sy) ->
  ds = 2*(Math.random()-0.5) * 0.1
  dp = 2*(Math.random()-0.5) * 0.2 #(2*(Math.random()-0.5) * (d + 1)) * 0.2
  #sampe_geometry = new THREE.PlaneGeometry (sx * (1 + ds)) * (d + 1), sy * (1 + ds), 1, 1
  sampe_geometry = new THREE.PlaneGeometry sx, sy, 1, 1
  sampe_mesh = new THREE.Mesh sampe_geometry
  sampe_mesh.position.x = px #+ dp
  sampe_mesh.position.z = pz #+ dp
  sampe_mesh.position.y = sy/2
  sampe_mesh.rotation.y = Math.random() * Math.PI
  sampe_mesh.updateMatrix()

  return sampe_mesh


str2obj = (str) ->
  return JSON.parse str

obj2str = (obj) ->
  return JSON.stringify obj

ab2str = (buf) ->
  return String.fromCharCode.apply(null, new Uint16Array(buf));

str2ab = (str) ->
  buf = new ArrayBuffer(str.length*2); # 2 bytes for each char
  bufView = new Uint16Array(buf);
  for i in [0..str.length] by 1
    bufView[i] = str.charCodeAt(i)
  return buf;