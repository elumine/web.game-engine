THREE.HDRBloomBrightFilerShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"tThreshold": { type: "t", value: null }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [
		"uniform sampler2D tDiffuse;",
		"uniform sampler2D tThreshold;",

		"varying vec2 vUv;",

		"void main() {",
		
			"vec3 luminanceVector = vec3(0.2125, 0.7154, 0.0721);",

			"vec3 colorBlur = texture2D(tDiffuse, vUv).rgb;",
			"float luminanceColorBlur = dot(luminanceVector, colorBlur.rgb);",

			"vec3 colorSample = texture2D(tThreshold, vUv).rgb;",
			"float luminanceColorSample = dot(luminanceVector, colorSample.rgb);",

			"if (luminanceColorSample > luminanceColorBlur) {",
				"gl_FragColor = vec4(colorSample, 1.0);",
			"}",
			"else {",
				"gl_FragColor = vec4(colorBlur, 1.0);",
			"}",

		"}"

	].join("\n")

};






THREE.HDRBloomAddShader = {

	uniforms: {

		tDiffuse: { type: "t", value: null },
		tAdd: { type: "t", value: null },
		fCoeff: { type: "f", value: 1.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [
		"uniform sampler2D tDiffuse;",
		"uniform sampler2D tAdd;",
		"uniform float fCoeff;",

		"varying vec2 vUv;",

		"void main() {",
		
			"vec3 luminanceVector = vec3(0.2125, 0.7154, 0.0721);",

			"vec3 colorDiffuse = texture2D(tDiffuse, vUv).rgb;",
			"float luminanceDiffuse = dot(luminanceVector, colorDiffuse.rgb);",

			"vec3 colorAdd = texture2D(tAdd, vUv).rgb;",
			"float luminanceAdd = dot(luminanceVector, colorAdd.rgb);",

			"if (luminanceAdd > luminanceDiffuse) {",
				"gl_FragColor = vec4(colorAdd * fCoeff, 1.0);",
			"}",
			"else {",
				"gl_FragColor = vec4(colorDiffuse, 1.0);",
			"}",

		"}"

	].join("\n")

};
