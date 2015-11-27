# @prepros-prepend 			graphic.coffee
# @prepros-prepend 			physic.coffee
# @prepros-prepend 			combat.coffee

gamedata =
	static:
		terrain: { position: { x: 0, y: -5, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 100, y: 10, z: 100 }, collider: 'box' }
		s_a: { position: { x: -10, y: 1, z: 10 }, rotation: { x: 0, y: 45, z: 0 }, scale: { x: 2, y: 2, z: 2 }, collider: 'box' }
		s_b: { position: { x: -10, y: 1.5, z: -10 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 2, y: 3, z: 2 }, collider: 'box' }
		s_c: { position: { x: 10, y: 2, z: 10 }, rotation: { x: 0, y: -45, z: 0 }, scale: { x: 2, y: 4, z: 2 }, collider: 'box' }
		s_d: { position: { x: 10, y: 2.5, z: -10 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 2, y: 5, z: 2 }, collider: 'box' }
		s_a1: { position: { x: 0, y: 1, z: 15 }, rotation: { x: 0, y: 45, z: 0 }, scale: { x: 2, y: 2, z: 2 }, collider: 'box' }
		s_b1: { position: { x: 0, y: 1.5, z: -15 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 2, y: 3, z: 2 }, collider: 'box' }
		s_c1: { position: { x: -15, y: 2, z: 0 }, rotation: { x: 0, y: -45, z: 0 }, scale: { x: 2, y: 4, z: 2 }, collider: 'box' }
		s_d1: { position: { x: 15, y: 2.5, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 2, y: 5, z: 2 }, collider: 'box' }
	dynamic: 
		d_a: { position: { x: -5, y: 5, z: -5 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, collider: 'box' }
		d_b: { position: { x: -5, y: 5, z: 5 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, collider: 'box' }
		d_c: { position: { x: 5, y: 5, z: -5 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, collider: 'box' }
		d_d: { position: { x: 5, y: 5, z: 5 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, collider: 'box' }
		d_a1: { position: { x: 0, y: 5, z: -5 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, collider: 'box' }
		d_b1: { position: { x: 0, y: 5, z: 5 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, collider: 'box' }
		d_c1: { position: { x: 5, y: 5, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, collider: 'box' }
		d_d1: { position: { x: -5, y: 5, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, collider: 'box' }
		d_a2: { position: { x: 1, y: 4, z: 4 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, collider: 'box' }
		d_b2: { position: { x: 2, y: 3, z: 3 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, collider: 'box' }
		d_c2: { position: { x: 3, y: 2, z: 2 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, collider: 'box' }
		d_d2: { position: { x: 4, y: 1, z: 1 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, collider: 'box' }
		d_a3: { position: { x: -1, y: 4, z: 4 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, collider: 'box' }
		d_b3: { position: { x: -2, y: 3, z: 3 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, collider: 'box' }
		d_c3: { position: { x: -3, y: 2, z: 2 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, collider: 'box' }
		d_d3: { position: { x: -4, y: 1, z: 1 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, collider: 'box' }
	character: { position: { x: 0, y: 2.5, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 2, z: 1 }, collider: 'sphere' }




character 	= false
physic 		= {}
graphic 	= {}
world 		= {}
settings 	= {}
$(document).ready ->
	settings = new dat.GUI
	physic 		= new PhysicEngine
	graphic 	= new GraphicEngine
	world 		= new WorldSystem gamedata