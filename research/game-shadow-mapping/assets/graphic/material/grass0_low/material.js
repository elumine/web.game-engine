material = new THREE.MeshLambertMaterial({
	side: THREE.DoubleSide,
	shading: THREE.FlatShading,
	map: diffuse,
	transparent: true,
	alphaTest: 0.5,
	normalMap: normal
})