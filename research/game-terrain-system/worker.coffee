importScripts 'three.js', 'common.js'

self.addEventListener 'message', (e) ->
  switch e.data.task
    when 'GrassSystem.createGrassFlatGeometry'
      geometry = tasks.GrassSystem.createGrassFlatGeometry
        level: e.data.level
        units: e.data.units.grassmap
        heightmap: e.data.units.heightmap
        dencity: e.data.options.dencity
        flatsize: e.data.options.flatsize
        grasswidth: e.data.options.grasswidth
        grassheight: e.data.options.grassheight
      self.postMessage
        geometry: getGeometryVFData geometry
    when 'TerrainSystem.createTerrainFlatGeometry'
      geometry = tasks.TerrainSystem.createTerrainFlatGeometry
        step: e.data.step
        units: e.data.units
        flatsize: e.data.options.flatsize
      self.postMessage
        geometry: getGeometryVFData geometry
    when 'ObjectsSystem.creteGroupGeometry'
      geometry = tasks.ObjectsSystem.creteGroupGeometry
        group: e.data.group
      self.postMessage
        geometry: getGeometryVFData geometry

  self.close()







tasks = {}


tasks.ObjectsSystem = {}

tasks.ObjectsSystem.creteGroupGeometry = (options) ->
  geometry = new THREE.Geometry
  for object in options.group
    if object.geometry.task
      mesh = tasks[object.geometry.task]
        object: object
    else if object.geometry.faces
      mesh = tasks.ObjectsSystem.createObjectGeometry
        object: object
    geometry.merge mesh.geometry, mesh.matrix
  return geometry


tasks.ObjectsSystem.createObjectGeometry = (options) ->
  geometry = new THREE.Geometry
  for vertex in options.object.geometry.vertices
    geometry.vertices.push new THREE.Vector3 vertex.x, vertex.y, vertex.z
  for face in options.object.geometry.faces
    geometry.faces.push new THREE.Face3 face.a, face.b, face.c
  geometry.computeFaceNormals()
  mesh = new THREE.Mesh geometry
  if options.object.position
    mesh.position.x = options.object.position.x or 0
    mesh.position.y = options.object.position.y or 0
    mesh.position.z = options.object.position.z or 0
  if options.object.rotation
    mesh.rotation.x = options.object.rotation.x or 0
    mesh.rotation.y = options.object.rotation.y or 0
    mesh.rotation.z = options.object.rotation.z or 0
  if options.object.scale
    mesh.scale.x = options.object.scale.x or 1
    mesh.scale.y = options.object.scale.y or 1
    mesh.scale.z = options.object.scale.z or 1
  mesh.updateMatrix()
  return mesh
  



tasks.createStone1Geometry = (options) ->
  #geometry = new THREE.BoxGeometry options.object.data.size.x, options.object.data.size.y, options.object.data.size.z
  geometry = new THREE.SphereGeometry options.object.data.size.x/2, 6, 6
  for vertex in geometry.vertices
    vertex.x += (Math.random() - 0.5) * 0.5 
    vertex.y += (Math.random() - 0.5) * 0.5
    vertex.z += (Math.random() - 0.5) * 0.5
  mesh = new THREE.Mesh geometry
  if options.object.position
    mesh.position.x = options.object.position.x or 0
    mesh.position.y = options.object.position.y or 0
    mesh.position.z = options.object.position.z or 0
  mesh.position.y += options.object.data.size.y/2
  if options.object.rotation
    mesh.rotation.x = options.object.rotation.x or 0
    mesh.rotation.y = options.object.rotation.y or 0
    mesh.rotation.z = options.object.rotation.z or 0
  if options.object.scale
    mesh.scale.x = options.object.scale.x or 1
    mesh.scale.y = options.object.scale.y or 1
    mesh.scale.z = options.object.scale.z or 1
  mesh.updateMatrix()
  return mesh



tasks.TerrainSystem = {}

tasks.TerrainSystem.createTerrainFlatGeometry = (options) ->
  step = options.step
  count = options.flatsize/step
  geometry = new THREE.PlaneGeometry options.flatsize, options.flatsize, count, count
  for j in [0..count] by 1
    for i in [0..count] by 1
      geometry.vertices[ j * (count+1) + i ].z = options.units[ j * step ][ i * step ]
   
  for i in [1..count] by 2
    prev = options.units[options.units.length - 1][(i - 1) * step]
    if options.units[options.units.length - 1][(i + 1) * step]
      next = options.units[options.units.length - 1][(i + 1) * step]
    else
      next = options.units[options.units.length - 1][i * step]
      
    geometry.vertices[ count * (count+1) + i ].z = (next + prev)/2

   for j in [1..count] by 2
    prev = options.units[(j - 1) * step][options.units.length - 1]
    if options.units[(j + 1) * step]
      next = options.units[(j + 1) * step][options.units.length - 1]
    else
      next = options.units[j * step][options.units.length - 1]

    geometry.vertices[ j * (count+1) + count ].z = (next + prev)/2

  return geometry



tasks.GrassSystem = {}

tasks.GrassSystem.createGrassFlatGeometry = (options) ->
  geometry = new THREE.Geometry
  switch options.level
    when 0
      count = options.dencity
      for row, j in options.units
        for unit, i in row
          if unit
            for k in [0..count - 1] by 1
              for l in [0..count - 1] by 1
                sampe_mesh = tasks.GrassSystem.createGrassMesh
                  step: 1
                  flatsize: options.flatsize
                  i: i
                  j: j
                  heightmap: options.heightmap 
                  position:
                    x: i + l / count
                    z: j + k / count
                  level: options.level
                  size: 
                    x: options.grasswidth
                    y: options.grassheight
                geometry.merge sampe_mesh.geometry, sampe_mesh.matrix
    when 1
      count = options.dencity - 1
      for row, j in options.units
        for unit, i in row
          if unit
            for k in [0..count - 1] by 1
              for l in [0..count - 1] by 1
                sampe_mesh = tasks.GrassSystem.createGrassMesh
                  step: 1
                  flatsize: options.flatsize
                  i: i
                  j: j
                  heightmap: options.heightmap 
                  position:
                    x: i + l / count
                    z: j + k / count
                  level: options.level
                  size: 
                    x: options.grasswidth
                    y: options.grassheight
                geometry.merge sampe_mesh.geometry, sampe_mesh.matrix
    when 2
      for j in [0..options.units.length - 1] by 2
        row = options.units[j]
        for i in [0..row.length - 1] by 2
          draw = false
          if options.units[j]
            if options.units[j][i]    then draw = true
            if options.units[j][i+1]  then draw = true
          if options.units[j+1]
            if options.units[j+1][i]  then draw = true
            if options.units[j+1][i+1]  then draw = true
          if draw
            sampe_mesh = tasks.GrassSystem.createGrassMesh
              step: 2
              flatsize: options.flatsize
              i: i
              j: j
              heightmap: options.heightmap 
              position:
                x: i + 0.5
                z: j + 0.5
              level: options.level
              size: 
                x: options.grasswidth
                y: options.grassheight
            geometry.merge sampe_mesh.geometry, sampe_mesh.matrix
    when 3
      for j in [0..options.units.length - 1] by 4
        row = options.units[j]
        for i in [0..row.length - 1] by 4
          draw = false
          if options.units[j]
            if options.units[j][i]    then draw = true
            if options.units[j][i+2]  then draw = true
          if options.units[j+2]
            if options.units[j+2][i]  then draw = true
            if options.units[j+2][i+2]  then draw = true
          if draw
            sampe_mesh = tasks.GrassSystem.createGrassMesh
              step: 4
              flatsize: options.flatsize
              i: i
              j: j
              heightmap: options.heightmap 
              position:
                x: i + 2
                z: j + 2
              level: options.level
              size: 
                x: options.grasswidth
                y: options.grassheight
            geometry.merge sampe_mesh.geometry, sampe_mesh.matrix
    when 4
      for j in [0..options.units.length - 1] by 10
        row = options.units[j]
        for i in [0..row.length - 1] by 10
          draw = false
          if options.units[j]
            if options.units[j][i]    then draw = true
            if options.units[j][i+5]  then draw = true
          if options.units[j+5]
            if options.units[j+5][i]  then draw = true
            if options.units[j+5][i+5]  then draw = true
          if draw
            sampe_mesh = tasks.GrassSystem.createGrassMesh
              step: 10
              flatsize: options.flatsize
              i: i
              j: j
              heightmap: options.heightmap 
              position:
                x: i + 5
                z: j + 5
              level: options.level
              size: 
                x: options.grasswidth
                y: options.grassheight
            geometry.merge sampe_mesh.geometry, sampe_mesh.matrix

  return geometry


tasks.GrassSystem.createGrassMesh = (options) ->
  i = Math.floor options.position.x
  j = Math.floor options.position.z
  A = options.heightmap[j][i]
  B = options.heightmap[j][i+1]
  C = options.heightmap[j+1][i+1]
  D = options.heightmap[j+1][i]
  px = options.position.x - i
  py = 1 - (options.position.z - j)
  y = billinearInterpolation
    A: A
    B: B
    C: C
    D: D
    px: px
    py: py
  
  #console.log 'i', i, 'j', j, 'step', options.step, 'posx', options.position.x, 'posy', options.position.z, 'px', px, 'py', py, 'y', y, 'abcd', A, B, C, D

  dSize = 2*(Math.random()-0.5) * 0.1
  dPosition = 2*(Math.random()-0.5) * 0.2
  sampe_geometry = new THREE.PlaneGeometry (options.size.x * (1 + dSize)) * (options.level + 1), options.size.y * (1 + dSize), 1, 1
  sampe_mesh = new THREE.Mesh sampe_geometry
  sampe_mesh.position.x = options.position.x - options.flatsize/2 #+ dPosition
  sampe_mesh.position.z = options.position.z - options.flatsize/2 #+ dPosition
  sampe_mesh.position.y = y + options.size.y/2
  #sampe_mesh.rotation.y = Math.random() * Math.PI
  sampe_mesh.updateMatrix()

  return sampe_mesh
