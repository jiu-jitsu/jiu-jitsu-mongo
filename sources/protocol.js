
/**
 *
 */

const zlib = require('zlib')
const events = require('events')

/**
 *
 */

const ___bson = require('./bson')

/**
 *
 */

const OP_MSG = 2013
const OP_COMPRESSED = 2012
const COMPRESSOR_ID_ZLIB = 2

/**
 * This driver implement Modern Wire Protocol 3.6
 *
 * https://docs.mongodb.com/manual/reference/mongodb-wire-protocol
 * https://github.com/mongodb/specifications/blob/master/source/message/OP_MSG.rst
 * https://github.com/mongodb/specifications/blob/master/source/compression/OP_COMPRESSED.rst
 */

class Protocol extends events {

	/**
	 *
	 */

	constructor () {

		/**
		 *
		 */

		super()

		/**
		 *
		 */

		this.___read = {}
		this.___read.buffer = null
		this.___read.buffers = []
		this.___read.length = 0

	}

	/**
	 *
	 */

	read (chunk) {

		/**
		 *
		 */

		if (chunk) {
			this.___read.length += chunk.length
			this.___read.buffers.push(chunk)
		}

		/**
		 *
		 */

		if (!this.___read.buffers[0]) {
			return
		}

		/**
		 *
		 */

		if (!this.___read.buffers[0].length) {
			return
		}

		/**
		 *
		 */

		const header_length = this.___read.buffers[0].readInt32LE(0)

		/**
		 *
		 */

		if (this.___read.length < header_length) {
			return
		}

		/**
		 * Concat completely received data
		 */

		this.___read.buffer = Buffer.concat(this.___read.buffers)

		/**
		 * Parse compressed message
		 */

		const next = this.___read.buffer.slice(0, header_length)

		/**
		 *
		 */

		const header_message_length = next.readInt32LE(0)
		const header_req_id = next.readInt32LE(4)
		const header_res_id = next.readInt32LE(8)
		const header_op_code = next.readInt32LE(12)

		/**
		 *
		 */

		const original_op_code = next.readInt32LE(16)
		const uncompressed_size = next.readInt32LE(20)
		const compressor_id = next.readUInt8(24)

		/**
		 *
		 */

		const compressed = next.slice(25)
		const decompressed = zlib.unzipSync(compressed)

		/**
		 *
		 */

		const body = ___bson.read(decompressed.slice(5))

		/**
		 *
		 */

		const message = {
			id: null,
			error: null,
			data: null
		}

		/**
		 *
		 */

		message.id = header_res_id

		/**
		 *
		 */

		if (body.writeErrors) {
			message.error = body.writeErrors[0]
		} else if (body.errmsg) {
			message.error = body
		} else {
			message.data = body.cursor && body.cursor.firstBatch || body.value || body
		}

		/**
		 *
		 */

		this.___read.buffer = this.___read.buffer.slice(header_length, this.___read.length)
		this.___read.buffers = this.___read.buffer.length ? [this.___read.buffer] : []
		this.___read.length = this.___read.buffer.length

		/**
		 *
		 */

		this.emit('message', message)
		this.read()

	}

	/**
	 *
	 */

	write (message, options) {

		/**
		 * Bson
		 */

		const buffer_message = ___bson.write(message)

		/**
		 * Uncompressed
		 */

		const buffer = Buffer.alloc(

			/**
			 * header
			 *
			 * int32 - message Length
			 * int32 - req id
			 * int32 - res id
			 * int32 - op code
			 */

			4 * 4

			/**
			 * flagBits
			 */

			+ 4

			/**
			 * payloadType 0
			 */

			+ 1

			/**
			 * document
			 */

			+ buffer_message.length

		)

		/**
		 *
		 */

		buffer.writeInt32LE(buffer.length, 0)
		buffer.writeInt32LE(options.id, 4)
		buffer.writeInt32LE(0, 8)
		buffer.writeInt32LE(OP_MSG, 12)
		buffer.writeInt32LE(0, 16)
		buffer.writeUInt8(0, 20)
		buffer_message.copy(buffer, 21)

		/**
		 *
		 */

		return this.___writeZip(buffer, options)

	}

	/**
	 *
	 */

	___writeZip (decompressed, options) {

		/**
		 * Skip header (16 bytes)
		 */

		const to_be_compressed = decompressed.slice(16)

		/**
		 * Compress
		 */

		const compressed = zlib.deflateSync(to_be_compressed)

		/**
		 * Full compressed buffer
		 */

		const buffer = Buffer.alloc(

			/**
			 * header
			 *
			 * int32 - message Length
			 * int32 - req id
			 * int32 - res id
			 * int32 - op code
			 */

			4 * 4

			/**
			 * int32 - original op code
			 */

			+ 4

			/**
			 * int32 - uncompressed size (the size of decompressed message, which excludes the header)
			 */

			+ 4

			/**
			 * uint8 - compressor id
			 */

			+ 1

			/**
			 * compressed data
			 */

			+ compressed.length

		)

		/**
		 *
		 */

		buffer.writeInt32LE(16 + 9 + compressed.length, 0)
		buffer.writeInt32LE(options.id, 4)
		buffer.writeInt32LE(0, 8)
		buffer.writeInt32LE(OP_COMPRESSED, 12)

		/**
		 *
		 */

		buffer.writeInt32LE(decompressed.readInt32LE(12), 16)
		buffer.writeInt32LE(to_be_compressed.length, 20)
		buffer.writeUInt8(COMPRESSOR_ID_ZLIB, 24)

		/**
		 *
		 */

		compressed.copy(buffer, 25)

		/**
		 *
		 */

		return buffer

	}

}

/**
 *
 */

module.exports = Protocol
