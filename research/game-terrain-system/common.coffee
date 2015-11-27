billinearInterpolation = (options) ->
	v1 = options.D + ( options.C - options.D ) * options.px 	#v in px
	v2 = options.A + ( options.B - options.A ) * options.px 	#v in px
	return v1 + (v2 - v1) * options.py 	#v in pz
	


getGeometryVFData = (geometry) ->
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