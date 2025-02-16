import { bytesToInt, bytesToIntLittle, byteToIntLittle } from "../byte-helpers";
import { ChargingStatus } from "../evse/charging-status";
import { GenericPacket } from "./request-login";

export interface SingleAcStatus extends GenericPacket {
    command: "d_singleAC_status";
    lineId: number;
    currentVoltage: number;
    currentElectricity: number;
    currentPower: number;
    currentAmount: number;

    innerTemperature: number;
    outerTemperature: number;

    gunState: number;
    outputState: number;
    currentState: number;

    chargingStatus: ChargingStatus;
}

export const parseSingleAcStatus = (buffer: Buffer): SingleAcStatus => {
    const gunState = byteToIntLittle(buffer[18]);
    const currentState = byteToIntLittle(buffer[20]);

    return {
        command: "d_singleAC_status",
        lineId: byteToIntLittle(buffer[0]),

        currentVoltage: bytesToInt(buffer.subarray(1, 3)),
        currentElectricity: bytesToInt(buffer.subarray(3, 5)),
        currentPower: bytesToIntLittle(buffer.subarray(5, 9)),
        currentAmount: bytesToIntLittle(buffer.subarray(9, 13)) * 0.01,

        innerTemperature: (bytesToInt(buffer.subarray(13, 15)) - 20000) * 0.01,
        outerTemperature: (bytesToInt(buffer.subarray(15, 17)) - 20000) * 0.01,

        gunState,
        outputState: byteToIntLittle(buffer[19]),
        currentState,

        chargingStatus: statesToChargingStatus(gunState, currentState)
    };
}

const statesToChargingStatus = (gunState: number, currentState: number): ChargingStatus => {
    if (gunState === undefined || currentState === undefined) {
        return ChargingStatus.Unknown;
    }

    switch (currentState) {
        case 1:
            return ChargingStatus.Fault;
        case 2:
        case 3:
            return ChargingStatus.Fault; // No idea?
        case 10:
            // "Wait for the swipe to start" ??
            return ChargingStatus.Waiting;
        case 11:
            return ChargingStatus.Charging;
        case 12:
            return ChargingStatus.NotConnected;
        case 13:
            return ChargingStatus.Connected;
        case 14:
            if (gunState === 4) {
                return ChargingStatus.Charging;
            }
            if (gunState === 2) {
                return ChargingStatus.ChargingStarted;
            }

            return ChargingStatus.Unknown;
        case 15:
            if (gunState === 4 || gunState === 2) {
                return ChargingStatus.Finished;
            }
        case 17:
            return ChargingStatus.FullyCharged;
        case 20:
            return ChargingStatus.ChargingReservation;
        default:
            return ChargingStatus.Unknown;
    }
}
