/*material = new THREE.ShaderMaterial({
	uniforms: {
		time: { type: "f", value: 1.0 }
	},
	vertexShader: vert,
	fragmentShader: frag
});*/
diffuse.wrapT = diffuse.wrapS = THREE.RepeatWrapping
diffuse.repeat.set(5, 5)
normal.wrapT = normal.wrapS = THREE.RepeatWrapping
normal.repeat.set(5, 5)
material = new THREE.MeshPhongMaterial({
	map: diffuse,
	normalMap: normal,
	envMap: env,
	combine: THREE.MixOperation,
	reflectivity: 0.5
})