importScripts 'three.js', 'common.js'

self.addEventListener 'message', (e) ->
  switch e.data.task
    when 'GrassLayer.createGrassFlatGeometry'
      geometry = tasks.GrassLayer.createGrassFlatGeometry
        level: e.data.level
        units: e.data.units.grassmap
        heightmap: e.data.units.heightmap
        dencity: e.data.options.dencity
        flatsize: e.data.options.flatsize
        grasswidth: e.data.options.grasswidth
        grassheight: e.data.options.grassheight
      self.postMessage
        geometry: getGeometryVFData geometry
    when 'TerrainLayer.createTerrainFlatGeometry'
      geometry = tasks.TerrainLayer.createTerrainFlatGeometry
        step: e.data.step
        units: e.data.units
        flatsize: e.data.options.flatsize
      self.postMessage
        geometry: getGeometryVFData geometry
    when 'ObjectsLayer.creteGroupGeometry'
      geometry = tasks.ObjectsLayer.creteGroupGeometry
        group: e.data.group
      self.postMessage
        geometry: getGeometryVFData geometry

  self.close()







tasks = {}


tasks.ObjectsLayer = {}

tasks.ObjectsLayer.creteGroupGeometry = (options) ->
  geometry = new THREE.Geometry
  for object in options.group
    if object.geometry.task
      mesh = tasks[object.geometry.task]
        object: object
    else if object.geometry.faces
      mesh = tasks.ObjectsLayer.createObjectMesh
        object: object
    geometry.merge mesh.geometry, mesh.matrix
  return geometry


tasks.ObjectsLayer.createObjectMesh = (options) ->
  geometry = setGeometryVFData options.object.geometry
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
  geometry = new THREE.SphereGeometry options.object.data.size.x/2, 5, 5
  mesh = new THREE.Mesh geometry
  if options.object.position
    mesh.position.x = options.object.position.x
    mesh.position.y = options.object.position.y + Math.random() * options.object.data.size.x/2
    mesh.position.z = options.object.position.z
  if options.object.rotation
    mesh.rotation.x = 2*(Math.random() - 0.5) * Math.PI
    mesh.rotation.y = 2*(Math.random() - 0.5) * Math.PI
    mesh.rotation.z = 2*(Math.random() - 0.5) * Math.PI
  if options.object.scale
    mesh.scale.x = options.object.scale.x or 1
    mesh.scale.y = options.object.scale.y or 1
    mesh.scale.z = options.object.scale.z or 1
  mesh.updateMatrix()
  return mesh



tasks.TerrainLayer = {}

tasks.TerrainLayer.createTerrainFlatGeometry = (options) ->
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



tasks.GrassLayer = {}


tasks.GrassLayer.createGrassFlatGeometry = (options) ->
  geometry = new THREE.Geometry
  if options.level is 0 then count = 2 else count = 1
  sizeXArray = [ 0.75, 1.5, options.flatsize/3, options.flatsize/2, options.flatsize ]
  sizeX = sizeXArray[options.level]
  stepArray = [ 1, 1, 2, 3, 5 ]
  step = stepArray[options.level]
  for j in [0..options.units.length - 1] by step
    for i in [0..options.units[j].length - 1] by step
      if options.units[j][i]
        for k in [0..count - 1] by 1
          for l in [0..count - 1] by 1
            sampe_mesh = tasks.GrassLayer.createGrassMesh
              flatsize: options.flatsize
              i: i
              j: j
              heightmap: options.heightmap 
              position:
                x: i + l/count + sizeX/2
                z: j + k/count + sizeX/2 
              level: options.level
              size: 
                x: sizeX
                y: options.grassheight * options.units[j][i]/256
            geometry.merge sampe_mesh.geometry, sampe_mesh.matrix
  return geometry


tasks.GrassLayer.createGrassMesh = (options) ->
  i = Math.floor options.position.x
  j = Math.floor options.position.z
  #console.log 'i', i, 'j', j, 'posx', options.position.x, 'posy', options.position.z
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
  dPosition = (Math.random()-0.5) * options.size.x/4
  mesh = new THREE.Mesh geometry
  geometry = new THREE.Geometry
  
  geometry1 = new THREE.PlaneGeometry options.size.x, options.size.y, 1, 1
  mesh1 = new THREE.Mesh geometry1
  mesh1.updateMatrix()
  mesh.geometry.merge mesh1.geometry, mesh1.matrix

  mesh2 = new THREE.Mesh geometry1
  mesh2.rotation.y = Math.PI/2
  mesh2.updateMatrix()
  mesh.geometry.merge mesh2.geometry, mesh2.matrix

  mesh.position.x = options.position.x - options.flatsize/2 #+ dPosition
  mesh.position.y = options.size.y/2 +  y
  mesh.position.z = options.position.z - options.flatsize/2 #+ dPosition
  #mesh.rotation.y = Math.PI/4
  mesh.updateMatrix()

  return mesh
