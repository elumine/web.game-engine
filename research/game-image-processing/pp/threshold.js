THREE.ThresholdShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"threshold": { type: "f", value: 0.5}

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [
		"varying vec2 vUv;",
		"uniform sampler2D tDiffuse;",
		"uniform float threshold;",

		"void main() {",
		    "vec3 luminanceVector = vec3(0.2125, 0.7154, 0.0721);",
			"vec3 sample = texture2D(tDiffuse, vUv).rgb;",

		    "float luminance = dot(luminanceVector, sample.rgb);",
		    "luminance = max(0.0, luminance - threshold);",
		    "sample.rgb *= sign(luminance);",

		    "gl_FragColor = vec4( sample, 1.0);",
		"}"

	].join("\n")

};
