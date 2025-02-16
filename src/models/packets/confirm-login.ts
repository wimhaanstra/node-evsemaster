import { CommandConstant } from "../command-constant";
import { createPackageData } from "../package-data";
import { UdpConnectionOptions } from "../udp-connection-options";

export const confirmLogin = (options: UdpConnectionOptions): Buffer => {
    return createPackageData(options.serialNumber, options.password, CommandConstant.s_loginConfirm, Int8Array.from([1]));
}
