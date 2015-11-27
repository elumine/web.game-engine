material = new THREE.MeshPhongMaterial({
	side: THREE.DoubleSide,
	map: diffuse,
	normalMap: normal,
	alphaTest: 0.5,
	transparent: true
})