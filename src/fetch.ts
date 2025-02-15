import dgram from 'dgram';
import { createPackageData, } from './package-data';
import { UDP } from './udp';
import { CommandConstant } from './models/command-constant';


const SERVER_PORT = 28376;
const SERVER_ADDRESS = '10.210.5.3'; // Replace with the actual server address
const SERIAL = '7472984956552814';
const PASSWD = '841315';

const requestLogin = createPackageData(SERIAL, PASSWD, CommandConstant.s_requestLogin, null);


const udp = new UDP(SERVER_ADDRESS, SERVER_PORT);
udp.start();
udp.send(requestLogin);
