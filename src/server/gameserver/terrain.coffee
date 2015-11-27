#-------------------------------------------------------
# defines terrain class
#-------------------------------------------------------
class library.Terrain
	constructor: (@_) ->
		@classname = 
			Terrain: true

		@heightmap = @_.assets.gamedata.terrain.heightmap.data



	getHeightValue: (x, z) ->
		i = Math.floor x
		j = Math.floor z
		if i >= 0 and j >= 0
			return @_.assets.gamedata.world.data.constants.size.y * (1/255) * billinearInterpolation
				A: @heightmap[j][i] 
				B: @heightmap[j][i + 1]
				C: @heightmap[j + 1][i]
				D: @heightmap[j + 1][i + 1]
				px: x - i
				py: z - j
		else
			return 0