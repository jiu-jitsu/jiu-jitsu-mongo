
/**
 * read c string
 */

module.exports = (buffer, offset) => {

	/**
	 *
	 */

	for (let i = offset; i < buffer.length; i++) {
		if (buffer[i] === 0) {
			return buffer.toString(`utf8`, offset, i)
		}
	}

	/**
	 *
	 */

	throw new Error(`Unterminated c-string!`)

}
