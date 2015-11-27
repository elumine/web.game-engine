THREE.GammaCorrectionShader = {
	
	uniforms: {
		tDiffuse: { type: "t", value: 0, texture: null },
		gamma: { type: "f", value: 1.5 }
	},
	
	vertexShader: [
		"varying vec2 vUv;",
		"void main()	{",
			"vUv  = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
		"}"
	].join("\n"),

	fragmentShader: [
		"varying vec2 vUv;",
		"uniform sampler2D tDiffuse;",
		"uniform float gamma;",
		"void main(void)",
		"{",
		  "vec3 color = texture2D(tDiffuse, vUv).rgb;",
		  "gl_FragColor.rgb = pow(color, vec3(1.0 / gamma));",
		  "gl_FragColor.a = 1.0;",
		"}"
	].join("\n")
}