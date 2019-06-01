
/**
 *
 */

const types = require(`./types`)

/**
 *
 */

const ___longRead = require(`./long/read`)
const ___stringRead = require(`./string/read`)

/**
 * based on http://bsonspec.org/#/specification
 */

const ___read = (buffer, offset, type) => {

	/**
	 *
	 */

	const data = type === Object && {} || Array && []

	/**
	 *
	 */

	offset += 4

	/**
	 *
	 */

	while (true) {

		/**
		 *
		 */

		const type = buffer[offset]

		/**
		 *
		 */

		if (!type) {
			break
		}

		/**
		 *
		 */

		offset++

		/**
		 *
		 */

		let long = null
		let size = null

		/**
		 *
		 */

		const key = ___stringRead(buffer, offset)

		/**
		 *
		 */

		offset += Buffer.byteLength(key) + 1

		/**
		 *
		 */

		switch (type) {

			/**
			 *
			 */

			case types.TYPE_NUMBER:

				/**
				 *
				 */

				data[key] = buffer.readDoubleLE(offset)
				offset += 8
				break

			/**
			 *
			 */

			case types.TYPE_INT32:

				/**
				 *
				 */

				data[key] = buffer.readInt32LE(offset)
				offset += 4
				break

			/**
			 *
			 */

			case types.TYPE_INT64:

				/**
				 *
				 */

				offset += 8
				break

			/**
			 *
			 */

			case types.TYPE_STRING:

				/**
				 *
				 */

				size = buffer.readInt32LE(offset)
				offset += 4
				data[key] = buffer.toString(`utf8`, offset, offset + size - 1)
				offset += size
				break

			/**
			 *
			 */

			case types.TYPE_OBJECT:

				/**
				 *
				 */

				data[key] = ___read(buffer, offset, Object)
				offset += buffer.readInt32LE(offset)
				break

			/**
			 *
			 */

			case types.TYPE_OID:

				/**
				 *
				 */

				offset += 12
				break

			/**
			 *
			 */

			case types.TYPE_ARRAY:

				/**
				 *
				 */

				data[key] = ___read(buffer, offset, Array)
				offset += buffer.readInt32LE(offset)
				break

			/**
			 *
			 */

			case types.TYPE_BOOLEAN:

				/**
				 *
				 */

				data[key] = buffer[offset++] === 1
				break

			/**
			 *
			 */

			case types.TYPE_DATE:

				/**
				 *
				 */

				long = {}
				long.low = buffer.readInt32LE(offset)
				long.high = buffer.readInt32LE(offset + 4)
				data[key] = ___longRead(long)
				data[key] = new Date(data[key])
				offset += 8
				break

			/**
			 *
			 */

			case types.TYPE_TIMESTAMP:

				/**
				 *
				 */

				long = {}
				long.low = buffer.readInt32LE(offset)
				long.high = buffer.readInt32LE(offset + 4)
				data[key] = ___longRead(long)
				offset += 8
				break

			/**
			 *
			 */

			case types.TYPE_NULL:

				/**
				 *
				 */

				data[key] = null
				break

			/**
			 *
			 */

			default:

				/**
				 *
				 */

				throw new Error(`Unknown BSON type: ${type}`)

		}

	}

	/**
	 *
	 */

	return data

}

/**
 *
 */

module.exports = (buffer) => ___read(buffer, 0, Object)
