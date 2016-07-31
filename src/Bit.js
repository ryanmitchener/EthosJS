/** 
 * Set a bit
 * 
 * @param int byte The value to set a bit on
 * @param int bit The bit index to set (0 indexed)  
 */
EthosJS.setBit = function(byte, bit) {
    return byte | (1 << bit);
}


/** 
 * Unset a bit
 * 
 * @param int byte The value to set a bit on
 * @param int bit The bit index to set (0 indexed)  
 */
EthosJS.unsetBit = function(byte, bit) {
    return byte & ~(1 << bit);
}


/** 
 * Append a value to the beginning of an existing byte/integer
 * 
 * @param int byte The value to append another value to
 * @param int value The value to append
 * @param int maxValue (optional) The maximum value the appended value can be 
 */
EthosJS.appendBitValue = function(byte, value, maxValue) {
    maxValue = (maxValue === undefined) ? value : maxValue;
    var shift = Math.ceil(Math.log2(maxValue));
    return (byte << shift) | value;
}


/** 
 * Read a value from a byte/integer
 * This function allows reading of whole values based on a maximum value
 * 
 * @param int byte The value to read from
 * @param int shift The shift amount/location in the data to start reading a byte from 
 * @param int maxValue The maximum value the read value can be  
 */
EthosJS.readBitValue = function(byte, shift, maxValue) {
    var mask = Math.pow(2, Math.ceil(Math.log2(maxValue))) - 1;
    return (byte >> shift) & mask;
}