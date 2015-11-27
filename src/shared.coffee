billinearInterpolation = (options) ->
	v1 = options.D + ( options.C - options.D ) * options.px 	#v in px
	v2 = options.A + ( options.B - options.A ) * options.px 	#v in px
	return v1 + (v2 - v1) * options.py 	#v in pz
	


getGeometryVFData = (geometry) ->
	result = 
		faces: []
		vertices: []
		faceVertexUvs: []
	for face, i in geometry.faces
		result.faces[i] =
			a: face.a
			b: face.b
			c: face.c
	for vertex, i in geometry.vertices
		result.vertices[i] =
			x: vertex.x
			y: vertex.y
			z: vertex.z
	for uv, i in geometry.faceVertexUvs
		result.faceVertexUvs[i] = []
		for face, j in uv
			result.faceVertexUvs[i][j] = []
			for v, k in face
				result.faceVertexUvs[i][j][k] = 
					x: v.x
					y: v.y
	return result

setGeometryVFData = (geometry) ->
	result = new THREE.Geometry
	for vertex, i in geometry.vertices
		result.vertices[i] = new THREE.Vector3 vertex.x, vertex.y, vertex.z
	for face, i in geometry.faces
		result.faces[i] = new THREE.Face3 face.a, face.b, face.c
	for uv, i in geometry.faceVertexUvs
		result.faceVertexUvs[i] = []
		for face, j in uv
			result.faceVertexUvs[i][j] = []
			for v, k in face
				result.faceVertexUvs[i][j][k] = new THREE.Vector2 v.x, v.y
		
	result.computeFaceNormals()
	return result



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