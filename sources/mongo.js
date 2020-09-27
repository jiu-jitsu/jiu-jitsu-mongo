
/**
 *
 */

const net = require(`net`)

/**
 *
 */

const ___log = require(`jiu-jitsu-log`)

/**
 *
 */

const ___protocol = require(`./protocol`)

/**
 *
 */

class Mongo {

	/**
	 *
	 */

	constructor (options) {
		this.___id = 1
		this.___socket = null
		this.___protocol = null
		this.___options = options
		this.___promises = {}
	}

	/**
	 *
	 */

	async connect () {
		await new Promise((resolve) => this.___connect(resolve))
	}

	/**
	 *
	 */

	___connect (resolve) {
		const options = this.___options
		this.___socket = new net.Socket()
		this.___protocol = new ___protocol()
		this.___protocol.on(`message`, (message) => this.___onProtocolMessage(message))
		this.___socket.on(`connect`, (error) => this.___onSocketConnect(error, resolve))
		this.___socket.on(`error`, (error) => this.___onSocketError(error))
		this.___socket.on(`data`, (data) => this.___onSocketData(data))
		this.___socket.connect(options)
	}

	/**
	 *
	 */

	___onSocketConnect (error, resolve) {
		const options = this.___options
		___log(`jiu-jitsu-mongo`, `OK`, `${options.db} ✔`)
		resolve(error)
	}

	/**
	 *
	 */

	___onSocketError (error) {
		const options = this.___options
		___log(`jiu-jitsu-mongo`, `FAIL`, `${options.db} !`, error, true)
		process.exit(1)
	}

	/**
	 *
	 */

	___onSocketData (data) {
		this.___protocol.read(data)
	}

	/**
	 *
	 */

	___onProtocolMessage (message) {
		const promise = this.___promises[message.id]
		const resolve = promise && promise[0]
		const reject = promise && promise[1]
		delete this.___promises[message.id]
		message.error && reject && reject(message.error)
		!message.error && resolve && resolve(message.data)
	}

	/**
	 *
	 */

	async find (message = {}) {
		return await new Promise((resolve, reject) => {
			const id = this.___id++
			const db = this.___options.db
			const ___message = {}
			const ___options = {}
			___message.find = `table`
			___message.$db = db
			___message.filter = message.filter || {}
			___message.sort = message.sort || {}
			___message.limit = message.limit || 999999999
			___message.batchSize = message.limit || 999999999
			___message.projection = message.projection || {}
			___message.projection._id = 0
			___options.id = id
			___options.db = db
			const buffer = this.___protocol.write(___message, ___options)
			this.___promises[id] = [resolve, reject]
			this.___socket.write(buffer)
		})
	}

	/**
	 *
	 */

	async insert (message = {}) {
		return await new Promise((resolve, reject) => {
			const id = this.___id++
			const db = this.___options.db
			const ___message = {}
			const ___options = {}
			___message.insert = `table`
			___message.$db = db
			___message.documents = []
			___message.documents.push(message)
			___message.ordered = true
			___options.id = id
			___options.db = db
			const buffer = this.___protocol.write(___message, ___options)
			this.___promises[id] = [resolve, reject]
			this.___socket.write(buffer)
		})
	}

	/**
	 *
	 */

	async update (message = {}) {
		return await new Promise((resolve, reject) => {
			const id = this.___id++
			const db = this.___options.db
			const ___message = {}
			const ___options = {}
			___message.update = `table`
			___message.$db = db
			___message.updates = []
			___message.updates[0] = {}
			___message.updates[0].q = message.filter || {}
			___message.updates[0].u = message.update || {}
			___message.updates[0].multi = !!message.multi || false
			___message.updates[0].upsert = !!message.upsert || false
			___options.id = id
			___options.db = db
			const buffer = this.___protocol.write(___message, ___options)
			this.___promises[id] = [resolve, reject]
			this.___socket.write(buffer)
		})
	}

	/**
	 *
	 */

	async remove (message = {}) {
		return await new Promise((resolve, reject) => {
			const id = this.___id++
			const db = this.___options.db
			const ___message = {}
			const ___options = {}
			___message.delete = `table`
			___message.$db = db
			___message.deletes = []
			___message.deletes[0] = {}
			___message.deletes[0].q = message.filter || {}
			// limit -
			// specify either a 0 to delete all matching documents,
			// or 1 to delete a single document
			___message.deletes[0].limit = !message.multi && 1 || 0
			___options.id = id
			___options.db = db
			const buffer = this.___protocol.write(___message, ___options)
			this.___promises[id] = [resolve, reject]
			this.___socket.write(buffer)
		})
	}

	/**
	 *
	 */

	async aggregate (message = {}) {
		return await new Promise((resolve, reject) => {
			const id = this.___id++
			const db = this.___options.db
			const ___message = {}
			const ___options = {}
			___message.aggregate = `table`
			___message.$db = db
			___message.pipeline = message.pipeline
			___message.cursor = {}
			___message.cursor.batchSize = message.limit || 999999999
			___options.id = id
			___options.db = db
			const buffer = this.___protocol.write(___message, ___options)
			this.___promises[id] = [resolve, reject]
			this.___socket.write(buffer)
		})
	}

	/**
	 *
	 */

	async removeIndex (index) {
		if (index.name === `_id_`) return
		return await new Promise((resolve, reject) => {
			const id = this.___id++
			const db = this.___options.db
			const ___message = {}
			const ___options = {}
			___message.dropIndexes = `table`
			___message.$db = db
			___message.index = index.name
			___options.id = id
			___options.db = db
			const buffer = this.___protocol.write(___message, ___options)
			this.___promises[id] = [resolve, reject]
			this.___socket.write(buffer)
		})
	}

	/**
	 *
	 */

	async createIndex (index) {
		return await new Promise((resolve, reject) => {
			const id = this.___id++
			const db = this.___options.db
			const ___message = {}
			const ___options = {}
			const fields = Object.keys(index.keys)
			const indexKey = index.keys
			const indexName = `${!index.options.unique && `ix` || `ux`}@${fields.join(`|`)}`
			___message.createIndexes = `table`
			___message.$db = db
			___message.indexes = []
			___message.indexes[0] = {}
			___message.indexes[0].key = indexKey
			___message.indexes[0].name = indexName
			___message.indexes[0].unique = !!index.options.unique
			___message.indexes[0].background = !!index.options.background
			___options.id = id
			___options.db = db
			const buffer = this.___protocol.write(___message, ___options)
			this.___promises[id] = [resolve, reject]
			this.___socket.write(buffer)
		})
	}

	/**
	 *
	 */

	async getIndexes () {
		return await new Promise((resolve, reject) => {
			const id = this.___id++
			const db = this.___options.db
			const ___message = {}
			const ___options = {}
			___message.listIndexes = `table`
			___message.$db = db
			___message.cursor = {}
			___options.id = id
			___options.db = db
			const buffer = this.___protocol.write(___message, ___options)
			this.___promises[id] = [resolve, reject]
			this.___socket.write(buffer)
		})
	}

}

/**
 *
 */

module.exports = Mongo
