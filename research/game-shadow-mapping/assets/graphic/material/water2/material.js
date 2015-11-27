diffuse.wrapT = diffuse.wrapS = THREE.RepeatWrapping
normal.wrapT = normal.wrapS = THREE.RepeatWrapping
material = new THREE.MeshPhongMaterial({
	ambient		: 0x111111,
	color		: 0x112233,
	shininess	: 300,
	specular	: 0xFF4411,
	//map 		: diffuse,
	normalMap	: normal
})