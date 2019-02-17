
/**
 *
 */

const constants = require('./constants')

/**
 *
 */

module.exports = (long) => {

	/**
	 *
	 */

	if (long.low >= 0) {

		/**
		 *
		 */

		return long.low

		/**
		 *
		 */

	} else {

		/**
		 *
		 */

		return constants.TWO_PWR_32 + long.low

	}

}


