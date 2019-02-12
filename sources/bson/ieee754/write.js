
/**
 *

	Copyright (c) 2008, Fair Oaks Labs, Inc.
	All rights reserved.

	Redistribution and use in source and binary forms, with or without
	modification, are permitted provided that the following conditions are met:

	 * Redistributions of source code must retain the above copyright notice,
	   this list of conditions and the following disclaimer.

	 * Redistributions in binary form must reproduce the above copyright notice,
	   this list of conditions and the following disclaimer in the documentation
	   and/or other materials provided with the distribution.

	 * Neither the name of Fair Oaks Labs, Inc. nor the names of its contributors
	   may be used to endorse or promote products derived from this software
	   without specific prior written permission.

	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
	AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
	IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
	ARE DISCLAIMED.  IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
	LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
	CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
	SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
	INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
	CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
	ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
	POSSIBILITY OF SUCH DAMAGE.


	Modifications to writeIEEE754 to support negative zeroes made by Brian White

 */

module.exports = (value, endian, m_len, n_bytes) => {

	const buffer = Buffer.alloc(8)

	let e = null
	let m = null
	let c = null

		/**
		 * L - little
		 * B - big
		 */

	let b_be = (endian === 'B')
	let e_len = n_bytes * 8 - m_len - 1
	let e_max = (1 << e_len) - 1
	let e_bias = e_max >> 1
	let rt = (m_len === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
	let i = b_be ? (n_bytes-1) : 0
	let d = b_be ? -1 : 1
	let s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

	value = Math.abs(value)

	if (isNaN(value) || value === Infinity) {

		m = isNaN(value) ? 1 : 0
		e = e_max

	} else {

		e = Math.floor(Math.log(value) / Math.LN2)

		if (value * (c = Math.pow(2, -e)) < 1) {

			e--
			c *= 2

		}

		if (e + e_bias >= 1) {

			value += rt / c

		} else {

			value += rt * Math.pow(2, 1 - e_bias)

		}

		if (value * c >= 2) {

			e++
			c /= 2

		}

		if (e + e_bias >= e_max) {

			m = 0
			e = e_max

		} else if (e + e_bias >= 1) {

			m = (value * c - 1) * Math.pow(2, m_len)
			e = e + e_bias

		} else {

			m = value * Math.pow(2, e_bias - 1) * Math.pow(2, m_len)
			e = 0

		}

	}

	for (; m_len >= 8; buffer[i] = m & 0xff, i += d, m /= 256, m_len -= 8);

	e = (e << m_len) | m
	e_len += m_len

	for (; e_len > 0; buffer[i] = e & 0xff, i += d, e /= 256, e_len -= 8);

	buffer[i - d] |= s * 128

	return buffer

}


