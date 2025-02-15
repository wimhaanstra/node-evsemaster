import * as dgram from 'dgram';

const UniversalConstant = {
    PACKET_HEADER: '0601', // Replace with actual header
    PACKET_TAIL: '0F02' // Replace with actual tail
};

export const CommandConstant = {
    s_chargeStart: 32775,
    s_chargeStop: 32776,
    s_currentChargeRecordResponse: 32777,
    s_getChargeCount: 33040,
    s_getDataPackageResponse: 33105,
    s_getReLaunchCount: 33041,
    s_getServerIPPort: 33035,
    s_getVersion: 33030,
    s_headingResponse: 32771,
    s_loginConfirm: 32769,
    s_maneuver: 33122,
    s_remotelyUpgrade: 33104,
    s_remotelyUpgradeCancel: 33107,
    s_remotelyUpgradeResultResponse: 33106,
    s_requestHistoryChargeRecord: 32779,
    s_requestHistoryChargeRecordByDate: 32780,
    s_requestLogin: 32770,
    s_requestStatusRecord: 32781,
    s_request_singleAC_chargingStatus_auto: 32774,
    s_resetDevice: 33108,
    s_setAndGetAlarmChargeStrategy: 33038,
    s_setAndGetBlePwd: 33033,
    s_setAndGetChargeFee: 33028,
    s_setAndGetLanguage: 33039,
    s_setAndGetNickname: 33032,
    s_setAndGetOffLineCharge: 33037,
    s_setAndGetOutputElectricity: 33031,
    s_setAndGetServiceFee: 33029,
    s_setAndGetSystemTime: 33025,
    s_setAndGetTemperatureUnit: 33042,
    s_setAndGetWIFIInfo: 33034,
    s_setPassword: 33026,
    s_setSecret: 33027,
    s_singleAC_chargingResponse: 32773,
    s_singleAC_statusResponse: 32772,
    s_switchCommunicationPipe: 33036,
    s_uploadLocalChargeRecordResponse: 32778
};

export function stringToBytes(str: string): Int8Array {
    const length = str.length;
    console.log('length:', length);
    const byteArray = new Int8Array((length + 1) / 2);
    for (let i = 0; i < length; i += 2) {
        const substring = str.substring(i, Math.min(2, length - i) + i);
        const value = parseInt(substring, 16);
        console.log('value:', value);

        if (value >= 128) {
            console.log('Value > 128!!!!');
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

function byteToString(bytes: Int8Array): string {
    return new TextDecoder().decode(bytes);
}

export function packageData(serialNumber: string, password: string, i: number, bArr: Int8Array | null): Int8Array {
    const length = bArr ? 25 + bArr.length : 25;
    console.log('length:', length);

    const buffer = new Int8Array(length);
    let offset = 0;

    const headerBytes = stringToBytes(UniversalConstant.PACKET_HEADER);
    buffer.set(headerBytes, offset);
    offset += headerBytes.length;

    console.log('offset:', offset);

    buffer[offset++] = length >> 8;
    buffer[offset++] = length % 256;
    buffer[offset++] = 0;

    console.log('offset:', offset);

    const serialBytes = stringToBytes(serialNumber);

    buffer.set(serialBytes, offset);
    offset += serialBytes.length;

    console.log('offset:', offset);

    const passwordBytes = getBytes(password);

    buffer.set(passwordBytes, offset);
    offset += passwordBytes.length;
    console.log('offset:', offset);

    buffer[offset++] = i >> 8;
    buffer[offset++] = i % 256;
    console.log('offset:', offset);

    if (bArr && bArr.length > 0) {
        buffer.set(bArr, offset);
        offset += bArr.length;
    }

    let checksum = 0;
    for (let i = 0; i < length; i++) {
        checksum += buffer[i] & -1;
    }
    console.log('offset:', offset);

    const checksumValue = checksum % 65536;
    buffer[offset++] = checksumValue >> 8;
    buffer[offset++] = checksumValue % 256;

    buffer.set(stringToBytes(UniversalConstant.PACKET_TAIL), offset);

    console.log(`[ 发送指令[ 0x${i.toString(16)} ], 检验码：${checksumValue}, 数据包：${byteToString(buffer)} ]`);
    return buffer;
}
