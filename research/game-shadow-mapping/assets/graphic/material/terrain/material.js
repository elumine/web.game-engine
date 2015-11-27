diffuse.wrapT = diffuse.wrapS = THREE.RepeatWrapping
diffuse.repeat.set(100, 100)
material = new THREE.MeshLambertMaterial({
	//color: 0x999999,
	map: diffuse
})