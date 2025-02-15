export const stringToBytes = (str: string): Int8Array => {
    const length = str.length;
    const byteArray = new Int8Array((length + 1) / 2);
    for (let i = 0; i < length; i += 2) {
        const substring = str.substring(i, Math.min(2, length - i) + i);
        const value = parseInt(substring, 16);

        if (value >= 128) {
            byteArray[i / 2] = value - 256;
        } else {
            byteArray[i / 2] = value;
        }
    }
    return byteArray;
}

export const bytesToString = (bytes: Buffer): string => {
    return Array.from(bytes).map(byte => byte.toString(16).padStart(2, '0')).join('');
}

export const trimLast = (buffer: Buffer): Buffer => {
    var length = buffer.length - 1;
    while (length >= 0 && buffer[length] == 0) {
        length--;
    }
    return buffer.subarray(0, length + 1);
}
