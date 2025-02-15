import { stringToBytes } from "./byte-helpers";
import { UniversalConstant } from "./universal-constant";

export function createPackageData(serialNumber: string, password: string, command: number, bArr: Int8Array | null): Int8Array {
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

    const passwordBytes = new TextEncoder().encode(password);

    buffer.set(passwordBytes, offset);
    offset += passwordBytes.length;

    buffer[offset++] = command >> 8;
    buffer[offset++] = command % 256;

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
