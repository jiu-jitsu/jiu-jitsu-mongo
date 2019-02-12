
/**
 * Local
 */

const constants = require('./constants')

/**
 * getLowBitsUnsigned
 */

module.exports = (long) => {

	if (long.low >= 0) {

		return long.low

	} else {

		return constants.TWO_PWR_32 + long.low

	}

}


