diffuse.wrapT = diffuse.wrapS = THREE.RepeatWrapping
material = new THREE.MeshPhongMaterial({
	map: diffuse,
	normalMap: normal
})