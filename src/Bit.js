/** 
 * Set a bit
 * 
 * @param int data The data to set a bit on
 * @param int bit The bit index to set (0 indexed)  
 */
EthosJS.setBit = function(data, bit) {
    return data | (1 << bit);
}


/** 
 * Unset a bit
 * 
 * @param int data The data to set a bit on
 * @param int bit The bit index to set (0 indexed)  
 */
EthosJS.unsetBit = function(data, bit) {
    return data & ~(1 << bit);
}


/** 
 * Toggle a bit
 * 
 * @param int data The data to set a bit on
 * @param int bit The bit index to set (0 indexed)  
 */
EthosJS.toggleBit = function(data, bit) {
    return data ^= (1 << bit);
}


/** 
 * Append bit(s) to the beginning of an existing byte/integer
 * 
 * @param int data The data to add bit(s) to
 * @param int value The value to append
 * @param int maxValue (optional) The maximum value the appended value can be 
 */
EthosJS.addBits = function(data, value, maxValue) {
    maxValue = (maxValue === undefined) ? value : maxValue;
    var shift = Math.ceil(Math.log2(maxValue));
    return (data << shift) | value;
}


/** 
 * Read bit(s) from a byte/integer
 * 
 * @param int data The data to read from
 * @param int firstBit The location in the data to start reading a byte from 
 * @param int count The length of the data to read
 */
EthosJS.readBits = function(data, firstBit, count) {
    return (data >> firstBit) & ((1 << count) - 1);
}