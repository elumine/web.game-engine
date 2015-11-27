diffuse.wrapT = diffuse.wrapS = THREE.RepeatWrapping
diffuse.repeat.set(2, 5)
normal.wrapT = normal.wrapS = THREE.RepeatWrapping
normal.repeat.set(2, 5)
material = new THREE.MeshPhongMaterial({
	map: diffuse,
	normalMap: normal
})