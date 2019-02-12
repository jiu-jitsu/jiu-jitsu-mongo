
/**
 * Local
 */

const add = require('./add')
const not = require('./not')
const constants = require('./constants')

/**
 * @return {Long} long - The negation of this value.
 */

module.exports = (long) => {

	return add(not(long), constants.ONE)

}


