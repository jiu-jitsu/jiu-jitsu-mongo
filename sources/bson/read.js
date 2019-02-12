
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

const ___read = (buffer, offset, type) => {

	const data = type === Object && {} || Array && []

	offset += 4

	while (true) {

		const type = buffer[offset]

		if (!type) {

			break

		} else {

			offset++

			let long = null
			let size = null

			const key = ___cstring.read(buffer, offset)

			offset += Buffer.byteLength(key) + 1

			switch (type) {

				case types.TYPE_FLOAT:

					data[key] = ___ieee754.read(buffer.slice(offset, offset + 8), 'L', 52, 8)
					offset += 8

					break

				case types.TYPE_INT32:

					data[key] = buffer.readInt32LE(offset)
					offset += 4

					break

				case types.TYPE_INT64:

					offset += 8

					break

				case types.TYPE_STRING:
				case types.TYPE_SYMBOL:

					size = buffer.readInt32LE(offset)
					offset += 4
					data[key] = buffer.toString('utf8', offset, offset + size - 1)
					offset += size

					break

				case types.TYPE_OBJECT:

					data[key] = ___read(buffer, offset, Object)
					offset += buffer.readInt32LE(offset)

					break

				case types.TYPE_OBJECT_ID:

					offset += 12

					break

				case types.TYPE_ARRAY:

					data[key] = ___read(buffer, offset, Array)
					offset += buffer.readInt32LE(offset)

					break

				case types.TYPE_BOOLEAN:

					data[key] = buffer[offset++] === 1

					break

				case types.TYPE_DATE:

					long = {
						low: buffer.readInt32LE(offset),
						high: buffer.readInt32LE(offset + 4)
					}

					data[key] = ___long.toNumber(long)
					offset += 8

					break

				case types.TYPE_TIMESTAMP:

					long = {
						low: buffer.readInt32LE(offset),
						high: buffer.readInt32LE(offset + 4)
					}

					data[key] = ___long.toNumber(long)
					offset += 8

					break

				case types.TYPE_NULL:

					data[key] = null

					break

				default:

					throw new Error(`Unknown BSON type: ${type}`)

			}

		}

	}

	return data

}

/**
 *
 */

module.exports = (buffer) => ___read(buffer, 0, Object)


