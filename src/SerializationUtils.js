class SerializationUtils {

    /**
     * Convert a BigInt scalar into a uint_32 hex string
     *
     * @param scalar {BigInt}
     * @return {string}
     */
    static bigintScalarToUint32Hex(scalar) {
        let hex = scalar.toString(16);
        if( hex.length % 2) { hex = '0' + hex; }

        const len = hex.length / 2;
        const u8 = new Uint32Array(len);

        let i = 0;
        let j = 0;
        while (i < len) {
            u8[i] = parseInt(hex.slice(j, j+2), 16);
            i += 1;
            j += 2;
        }

        return Array.prototype.map.call(u8, (byte) => {
            return ('0' + (byte & 0xFF).toString(16)).slice(-2);
        }).join('');
    }

    /**
     * Convert a hex encoded Uint32 number into a BigInt
     *
     * @param hex {string}
     * @return {string}
     */
    static bigintScalarFromUint32Hex(hex) {
        const bytes = Buffer.from(hex, 'hex');
        const uint = Uint32Array.from(bytes);
    }
}

module.exports = SerializationUtils;