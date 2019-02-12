
/**
 * @return {Long} long - The bitwise-NOT of this value.
 */

module.exports = (long) => {

	return {
		low: ~long.low,
		high: ~long.high
	}

}


