THREE.OcclusionGenerateShader = {
	
	uniforms: {
		tDiffuse: { type: "t", value: 0, texture: null },
		tDiffuse2: { type: "t", value: 0, texture: null }
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
		"uniform sampler2D tDiffuse2;",
		"void main()",
		"{",
			"vec3 color1 = texture2D(tDiffuse, vUv).rgb;",
			"vec3 color2 = texture2D(tDiffuse2, vUv).rgb;",
			"if (color2.r > 0.0) {",
				"gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0);",
			"}",
			"else {",
				"gl_FragColor = vec4(color1.r, color1.g, color1.b, 1.0);",
			"}",
		"}"
	].join("\n")
}