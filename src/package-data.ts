import { UniversalConstant } from "./models/universal-constant";

function stringToBytes(str: string): Int8Array {
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

function getBytes(str: string): Uint8Array {
    return new TextEncoder().encode(str);
}

export function createPackageData(serialNumber: string, password: string, i: number, bArr: Int8Array | null): Int8Array {
    const length = bArr ? 25 + bArr.length : 25;

    const buffer = new Int8Array(length);
    let offset = 0;

    const headerBytes = stringToBytes(UniversalConstant.PACKET_HEADER);
    buffer.set(headerBytes, offset);
    offset += headerBytes.length;

    buffer[offset++] = length >> 8;
    buffer[offset++] = length % 256;
    buffer[offset++] = 0;

    const serialBytes = stringToBytes(serialNumber);

    buffer.set(serialBytes, offset);
    offset += serialBytes.length;

    const passwordBytes = getBytes(password);

    buffer.set(passwordBytes, offset);
    offset += passwordBytes.length;

    buffer[offset++] = i >> 8;
    buffer[offset++] = i % 256;

    if (bArr && bArr.length > 0) {
        buffer.set(bArr, offset);
        offset += bArr.length;
    }

    let checksum = 0;
    for (let i = 0; i < length; i++) {
        checksum += buffer[i] & -1;
    }
    const checksumValue = checksum % 65536;
    buffer[offset++] = checksumValue >> 8;
    buffer[offset++] = checksumValue % 256;

    buffer.set(stringToBytes(UniversalConstant.PACKET_TAIL), offset);
    return buffer;
}
