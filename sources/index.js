
/**
 *
 */

const net = require('net')
const util = require('util')
const events = require('events')

/**
 *
 */

const ___error = require('./error')
const ___protocol = require('./protocol')

/**
 *
 */

class Mongo extends events {

	/**
	 *
	 */

	constructor (endpoint) {

		/**
		 *
		 */

		super()

		/**
		 *
		 */

		this.___id = 1
		this.___callbacks = {}
		this.___timeout = 1000
		this.___connected = false
		this.___reconnecting = false
		this.___endpoint = endpoint
		this.___connect()

		/**
		 *
		 */

		this.find = util.promisify(this.find)
		this.insert = util.promisify(this.insert)
		this.update = util.promisify(this.update)
		this.remove = util.promisify(this.remove)
		this.aggregate = util.promisify(this.aggregate)
		this.removeIndex = util.promisify(this.removeIndex)
		this.createIndex = util.promisify(this.createIndex)
		this.getIndexes = util.promisify(this.getIndexes)

	}

	___protocol () {

		/**
		 *
		 */

		this.___socket.___protocol = new ___protocol()
		this.___socket.___protocol.on('message', (message) => this.___onMessage(message))

	}

	___connect () {

		/**
		 *
		 */

		this.___socket = new net.Socket()
		this.___socket

			.on('connect', (error) => this.___onConnect(error))
			.on('error', (error) => this.___onError(error))
			.on('data', (data) => this.___onData(data))
			.on('end', (error) => this.___onEnd(error))
			.connect(this.___endpoint)

	}

	___reconnect (error) {

		/**
		 *
		 */

		const ids = Object.keys(this.___callbacks)

		/**
		 *
		 */

		ids.forEach((id) =>
			this.___callbacks[id] &&
			this.___callbacks[id](___error('jiu-jitsu-mongo/MONGO_CONNECTION_HAS_BEEN_CLOSED', error)))

		/**
		 *
		 */

		this.___buffers = []
		this.___callbacks = {}
		this.___reconnecting = true
		this.___socket.___protocol.flush()

		/**
		 *
		 */

		setTimeout(() => this.___connect(), this.___timeout)

	}

	___onConnect (error) {

		/**
		 *
		 */

		this.___protocol()
		this.___reconnecting = false

		/**
		 *
		 */

		if (!this.___connected) {

			/**
			 *
			 */

			this.___connected = true

			/**
			 *
			 */

			process.nextTick(() => this.emit('ready', error))

		}

	}

	___onData (chunk) {

		/**
		 *
		 */

		this.___socket.___protocol.read(chunk)

	}

	___onError (error) {

		/**
		 *
		 */

		process.nextTick(() => this.emit('error', error))

		/**
		 *
		 */

		this.___reconnect(error)

	}

	___onEnd (error) {

		/**
		 *
		 */

		process.nextTick(() => this.emit('error', error))

		/**
		 *
		 */

		this.___reconnect(error)

	}

	___onMessage (message) {

		/**
		 *
		 */

		const callback = this.___callbacks[message.id]

		/**
		 *
		 */

		if (!callback) {

			/**
			 *
			 */

			return

		}

		/**
		 *
		 */

		delete this.___callbacks[message.id]

		/**
		 *
		 */

		callback(message.error, message.data)

	}

	find (message, callback) {

		/**
		 *
		 */

		message = message || {}

		/**
		 *
		 */

		if (!this.___connected || this.___reconnecting) {

			/**
			 *
			 */

			return callback(___error('jiu-jitsu-mongo/MONGO_SOCKET_IS_NOT_READY'))

		}

		/**
		 *
		 */

		const id = this.___id++
		const db = this.___endpoint.db

		/**
		 *
		 */

		const ___message = {}
		const ___options = {}

		/**
		 *
		 */

		___message.find = 'x'
		___message.$db = db
		___message.filter = message.filter || {}
		___message.sort = message.sort || {}
		___message.limit = message.limit || 999999999
		___message.batchSize = message.limit || 999999999
		___message.projection = message.projection || {}
		___message.projection._id = 0

		/**
		 *
		 */

		___options.id = id
		___options.db = db

		/**
		 *
		 */

		const buffer = this.___socket.___protocol.write(___message, ___options)

		/**
		 *
		 */

		this.___socket.write(buffer)

		/**
		 *
		 */

		this.___callbacks[id] = (error, data) => callback(error, data)

	}

	insert (message, callback) {

		/**
		 *
		 */

		if (!this.___connected || this.___reconnecting) {

			/**
			 *
			 */

			return callback(___error('jiu-jitsu-mongo/MONGO_SOCKET_IS_NOT_READY'))

		}

		/**
		 *
		 */

		const id = this.___id++
		const db = this.___endpoint.db

		/**
		 *
		 */

		const ___message = {}
		const ___options = {}

		/**
		 *
		 */

		___message.insert = 'x'
		___message.$db = db
		___message.documents = []
		___message.documents.push(message)
		___message.ordered = true

		/**
		 *
		 */

		___options.id = id
		___options.db = db

		/**
		 *
		 */

		const buffer = this.___socket.___protocol.write(___message, ___options)

		/**
		 *
		 */

		this.___socket.write(buffer)

		/**
		 *
		 */

		this.___callbacks[id] = (error) => callback(error, message)

	}

	update (message, callback) {

		/**
		 *
		 */

		if (!this.___connected || this.___reconnecting) {

			/**
			 *
			 */

			return callback(___error('jiu-jitsu-mongo/MONGO_SOCKET_IS_NOT_READY'))

		}

		/**
		 *
		 */

		const id = this.___id++
		const db = this.___endpoint.db

		/**
		 *
		 */

		const ___message = {}
		const ___options = {}

		/**
		 *
		 */

		___message.update = 'x'
		___message.$db = db
		___message.updates = []
		___message.updates[0] = {}
		___message.updates[0].q = message.filter || {}
		___message.updates[0].u = message.update || {}
		___message.updates[0].multi = !!message.multi || false
		___message.updates[0].upsert = !!message.upsert || false

		/**
		 *
		 */

		___options.id = id
		___options.db = db

		/**
		 *
		 */

		const buffer = this.___socket.___protocol.write(___message, ___options)

		/**
		 *
		 */

		this.___socket.write(buffer)

		/**
		 *
		 */

		this.___callbacks[id] = (error, data) => callback(error, !error && data && data.ok && data.n || 0)

	}

	remove (message, callback) {

		/**
		 *
		 */

		if (!this.___connected || this.___reconnecting) {

			/**
			 *
			 */

			return callback(___error('jiu-jitsu-mongo/MONGO_SOCKET_IS_NOT_READY'))

		}

		/**
		 *
		 */

		const id = this.___id++
		const db = this.___endpoint.db

		/**
		 *
		 */

		const ___message = {}
		const ___options = {}

		/**
		 * limit - specify either a 0 to delete all matching documents, or 1 to delete a single document
		 */

		___message.delete = 'x'
		___message.$db = db
		___message.deletes = []
		___message.deletes[0] = {}
		___message.deletes[0].q = message.filter || {}
		___message.deletes[0].limit = !message.multi && 1 || 0

		/**
		 *
		 */

		___options.id = id
		___options.db = db

		/**
		 *
		 */

		const buffer = this.___socket.___protocol.write(___message, ___options)

		/**
		 *
		 */

		this.___socket.write(buffer)

		/**
		 *
		 */

		this.___callbacks[id] = (error, data) => callback(error, !error && data && data.ok && data.n || 0)

	}

	aggregate (message, callback) {

		/**
		 *
		 */

		if (!this.___connected || this.___reconnecting) {

			/**
			 *
			 */

			return callback(___error('jiu-jitsu-mongo/MONGO_SOCKET_IS_NOT_READY'))

		}

		/**
		 *
		 */

		const id = this.___id++
		const db = this.___endpoint.db

		/**
		 *
		 */

		const ___message = {}
		const ___options = {}

		/**
		 *
		 */

		___message.aggregate = 'x'
		___message.$db = db
		___message.pipeline = message.pipeline
		___message.cursor = {}
		___message.cursor.batchSize = message.limit || 999999999

		/**
		 *
		 */

		___options.id = id
		___options.db = db

		/**
		 *
		 */

		const buffer = this.___socket.___protocol.write(___message, ___options)

		/**
		 *
		 */

		this.___socket.write(buffer)

		/**
		 *
		 */

		this.___callbacks[id] = (error, data) => callback(error, !error && data || null)

	}

	removeIndex (message, callback) {

		/**
		 *
		 */

		if (!this.___connected || this.___reconnecting) {

			/**
			 *
			 */

			return callback(___error('jiu-jitsu-mongo/MONGO_SOCKET_IS_NOT_READY'))

		}

		/**
		 *
		 */

		const id = this.___id++
		const db = this.___endpoint.db

		/**
		 *
		 */

		const ___message = {}
		const ___options = {}

		/**
		 *
		 */

		___message.dropIndexes = 'x'
		___message.$db = db
		___message.index = message

		/**
		 *
		 */

		___options.id = id
		___options.db = db

		/**
		 *
		 */

		const buffer = this.___socket.___protocol.write(___message, ___options)

		/**
		 *
		 */

		this.___socket.write(buffer)

		/**
		 *
		 */

		this.___callbacks[id] = (error, data) => callback(error, !error && data && data.ok || null)

	}

	createIndex (message, callback) {

		/**
		 *
		 */

		if (!this.___connected || this.___reconnecting) {

			/**
			 *
			 */

			return callback(___error('jiu-jitsu-mongo/MONGO_SOCKET_IS_NOT_READY'))

		}

		/**
		 *
		 */

		const id = this.___id++
		const db = this.___endpoint.db

		/**
		 *
		 */

		const ___message = {}
		const ___options = {}

		/**
		 *
		 */

		const fields = Object.keys(message.keys)

		/**
		 *
		 */

		const indexKey = message.keys

		/**
		 *
		 */

		const indexName = `${!message.options.unique && 'ix' || 'ux'}@${fields.join('|')}`

		/**
		 *
		 */

		___message.createIndexes = 'x'
		___message.$db = db
		___message.indexes = []
		___message.indexes[0] = {}
		___message.indexes[0].key = indexKey
		___message.indexes[0].name = indexName
		___message.indexes[0].unique = !!message.options.unique
		___message.indexes[0].background = !!message.options.background

		/**
		 *
		 */

		___options.id = id
		___options.db = db

		/**
		 *
		 */

		const buffer = this.___socket.___protocol.write(___message, ___options)

		/**
		 *
		 */

		this.___socket.write(buffer)

		/**
		 *
		 */

		this.___callbacks[id] = (error, data) => callback(error, !error && data && data.ok || null)

	}

	getIndexes (message, callback) {

		/**
		 *
		 */

		if (!this.___connected || this.___reconnecting) {

			/**
			 *
			 */

			return callback(___error('jiu-jitsu-mongo/MONGO_SOCKET_IS_NOT_READY'))

		}

		/**
		 *
		 */

		const id = this.___id++
		const db = this.___endpoint.db

		/**
		 *
		 */

		const ___message = {}
		const ___options = {}

		/**
		 *
		 */

		___message.listIndexes = 'x'
		___message.$db = db
		___message.cursor = {}

		/**
		 *
		 */

		___options.id = id
		___options.db = db

		/**
		 *
		 */

		const buffer = this.___socket.___protocol.write(___message, ___options)

		/**
		 *
		 */

		this.___socket.write(buffer)

		/**
		 *
		 */

		this.___callbacks[id] = (error, data) => callback(error, !error && data && data.filter((index) => index.name !== '_id_').map((index) => index.name) || null)

	}

}

/**
 *
 */

module.exports = Mongo
