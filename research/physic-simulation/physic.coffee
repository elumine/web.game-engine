class PhysicEngine
	constructor: () ->
		@world   = new OIMO.World
		@world.timeStep /= 10

		setInterval =>
			@world.step()
		, 1000/60
		