
/**
 *
 */

const types = require('./types')

/**
 *
 */

const ___long = require('./long')
const ___cstring = require('./cstring')
const ___ieee754 = require('./ieee754')

/**
 * based on http://bsonspec.org/#/specification
 */

const ___write = (data) => {

	const buffers = []
	const concats = []

	___toBson(buffers, null, data, 0)
	___toFlat(buffers, concats, 0)

	return Buffer.concat(concats)

}

const ___toBson = (buffers, key, data, level) => {

	key += ''

	let buffer_type = null
	let buffer_key = null
	let buffer_data = null
	let buffer_data_size = null

	if (data == null) {

		buffer_type = Buffer.alloc(1)
		buffer_type.writeInt8(types.TYPE_NULL, 0)
		buffer_key = ___cstring.write(key)

		buffers.push(buffer_type)
		buffers.push(buffer_key)

	} else if (data.constructor === Date) {

		const long = ___long.fromNumber(data.getTime())

		buffer_type = Buffer.alloc(1)
		buffer_type.writeInt8(types.TYPE_DATE, 0)
		buffer_key = ___cstring.write(key)
		buffer_data = Buffer.alloc(8)
		buffer_data.writeInt32LE(long.low, 0)
		buffer_data.writeInt32LE(long.high, 4)

		buffers.push(buffer_type)
		buffers.push(buffer_key)
		buffers.push(buffer_data)

	} else if (data.constructor === Boolean) {

		buffer_type = Buffer.alloc(1)
		buffer_type.writeInt8(types.TYPE_BOOLEAN, 0)
		buffer_key = ___cstring.write(key)
		buffer_data = Buffer.alloc(1)
		buffer_data.writeInt8(data ? 1 : 0, 0)

		buffers.push(buffer_type)
		buffers.push(buffer_key)
		buffers.push(buffer_data)

	} else if (data.constructor === Number) {

		buffer_type = Buffer.alloc(1)
		buffer_key = ___cstring.write(key)

		/**
		 * TODO: handle > 32bit longs that aren't doubles? Or is that too magical?
		 * Integer?
		 */

		if (~~data === data) {

			buffer_type.writeInt8(types.TYPE_INT32, 0)
			buffer_data = Buffer.alloc(4)
			buffer_data.writeInt32LE(data, 0)

		} else {

			buffer_type.writeInt8(types.TYPE_FLOAT, 0)
			buffer_data = ___ieee754.write(data, 'L', 52, 8)

		}

		buffers.push(buffer_type)
		buffers.push(buffer_key)
		buffers.push(buffer_data)

	} else if (data.constructor === String) {

		if (types.TYPE_ISO_8601.test(data)) {

			return ___toBson(buffers, key, new Date(data), level)

		} else {

			buffer_type = Buffer.alloc(1)
			buffer_type.writeInt8(types.TYPE_STRING, 0)
			buffer_key = ___cstring.write(key)
			buffer_data = ___cstring.write(data)
			buffer_data_size = Buffer.alloc(4)
			buffer_data_size.writeInt32LE(buffer_data.length, 0)

			buffers.push(buffer_type)
			buffers.push(buffer_key)
			buffers.push(buffer_data_size)
			buffers.push(buffer_data)

		}

	} else if (data.constructor === Object || data.constructor === Array) {

		let next = null

		if (level) {

			buffer_type = Buffer.alloc(1)
			buffer_type.writeInt8(data.constructor === Object && types.TYPE_OBJECT || data.constructor === Array && types.TYPE_ARRAY, 0)
			buffer_key = ___cstring.write(key)

			buffers.push(buffer_type)
			buffers.push(buffer_key)

		}

		if (buffers[0]) {

			next = []
			buffers.push(next)

		}

		for (key in data) {

			___toBson(next || buffers, key, data[key], 1)

		}

		buffers.push(Buffer.alloc(1))

	} else {

		/**
		 *
		 */

	}

}

const ___toFlat = (buffers, concated, level) => {

	let i = 0
	let size = 0
	const buffer = Buffer.alloc(4)

	size += 4

	concated.push(buffer)

	for (i = 0; i < buffers.length; i++) {

		if (Buffer.isBuffer(buffers[i])) {

			size += buffers[i].length

			concated.push(buffers[i])

		} else {

			size += ___toFlat(buffers[i], concated, 1)

		}

	}

	/**
	 * + next 0x00
	 */

	buffer.writeInt32LE(size + level, 0)

	return size

}

/**
 *
 */

module.exports = (data) => ___write(data)


