
/**
 * Returns a Long representing the given (32-bit) integer value.
 */

module.exports = (value) => {

	return {
		low: value | 0,
		high: value < 0 ? -1 : 0
	}

}


