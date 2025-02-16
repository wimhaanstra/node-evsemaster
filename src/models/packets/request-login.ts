import { bytesToIntLittle, byteToIntLittle, trimLast } from "../byte-helpers";
import { CommandConstant } from "../command-constant";
import { createPackageData } from "../package-data";
import { UdpConnectionOptions } from "../udp-connection-options";

type commandKey = keyof typeof CommandConstant;

export interface GenericPacket {
    command: commandKey;
}

export const requestLogin = (options: UdpConnectionOptions): Buffer => {
    return createPackageData(options.serialNumber, options.password, CommandConstant.s_requestLogin, null)
}

export interface LoginPacket extends GenericPacket {
    command: "d_Login";
    brand: string;
    model: string;
    version: string;

    outputPower: number;
    outputElectricity: number;
}

export const parseLoginPacket = (buffer: Buffer): LoginPacket => {
    const brand = trimLast(buffer.subarray(1, 16)).toString();
    const model = trimLast(buffer.subarray(17, 32)).toString();
    const version = trimLast(buffer.subarray(33, 48)).toString();

    const outputPower = bytesToIntLittle(buffer.subarray(49, 53));
    const outputElectricity = byteToIntLittle(buffer[53]);

    return {
        command: "d_Login",
        brand,
        model,
        version,
        outputPower,
        outputElectricity
    };
}