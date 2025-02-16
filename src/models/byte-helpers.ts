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

export const byteToIntLittle = (byte: number): number => {
    return byte & -1;
}

export const bytesToString = (bytes: Buffer): string => {
    return Array.from(bytes).map(byte => byte.toString(16).padStart(2, '0')).join('');
}

export const byteToInt = (byte: number): number => {
    return (byte & 127) | (((-2147483648) & byte) >>> 24);
}

export const bytesToInt = (bytes: Buffer): number => {
    if (bytes.length === 2) {
        return byteToInt(bytes[1]) | byteToInt(bytes[0]) << 8;
    } else {
        return byteToInt(bytes[3]) | ((byteToInt(bytes[0]) << 24) & 255) | (byteToInt(bytes[1]) << 16) | (byteToInt(bytes[2]) << 8);
    }
}

export const bytesToIntLittle = (bytes: Buffer): number => {
    return byteToInt(bytes[3]) | (byteToInt(bytes[0]) << 24) | (byteToInt(bytes[1]) << 16) | (byteToInt(bytes[2]) << 8);
}

export const trimLast = (buffer: Buffer): Buffer => {
    var length = buffer.length - 1;
    while (length >= 0 && buffer[length] == 0) {
        length--;
    }
    return buffer.subarray(0, length + 1);
}
