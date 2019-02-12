
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

module.exports = (buffer, endian, m_len, n_bytes) => {

	let e = null
	let m = null

	/**
	 * L - little
	 * B - big
	 */

	let b_be = endian === 'B'
	let e_len = n_bytes * 8 - m_len - 1
	let e_max = (1 << e_len) - 1
	let e_bias = e_max >> 1
	let n_bits = -7
	let i = b_be ? 0 : (n_bytes - 1)
	let d = b_be ? 1 : -1
	let s = buffer[i]

	i += d

	e = s & ((1 << (-n_bits)) - 1)
	s >>= (-n_bits)
	n_bits += e_len

	for (; n_bits > 0; e = e * 256 + buffer[i], i += d, n_bits -= 8);

	m = e & ((1 << (-n_bits)) - 1)
	e >>= (-n_bits)
	n_bits += m_len

	for (; n_bits > 0; m = m * 256 + buffer[i], i += d, n_bits -= 8);

	if (e === 0) {

		e = 1 - e_bias

	} else if (e === e_max) {

		return m ? NaN : ((s ? -1 : 1) * Infinity)

	} else {

		m = m + Math.pow(2, m_len)
		e = e - e_bias

	}

	return (s ? -1 : 1) * m * Math.pow(2, e - m_len)

}


