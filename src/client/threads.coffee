class ThreadManager
	constructor: (options) ->
		@threads = []
		@tasks = []
		for i in [0..options.threads - 1] by 1
			@threads[i] = new Thread
				id: i

		@interval = setInterval =>
			if @tasks[0]
				for thread in @threads
					if thread.idle
						if @tasks[0] 	#coud be cancelled
							thread.process @tasks[0]
							@tasks.splice 0, 1
		, 1


	do: (task) ->
		@tasks.push task


	cancel: (task) ->
		for v, i in @tasks
			if v
				if v.id is task.id
					if @tasks[i] then @tasks.splice i, 1



class Thread
	constructor: (options) ->
		{ @id } = options
		@idle = true
		@worker = {}

	process: (task) ->
		@idle = false
		time = new Date
		#console.log 'Thread', @id, 'process', task
		@worker = new Worker 'libs/' + task.worker + '.js'

		@worker.postMessage task.data
		@worker.addEventListener 'message', (e) =>
			task.callback e
		
			@worker.terminate()
			@idle = true
			#console.log 'Thread', @id, 'finished, total time', (new Date - time)/1000, 'data', e.data
			



class Task
	constructor: (options) ->
		{ @id, @worker, @callback, @data } = options