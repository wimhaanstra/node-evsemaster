import { UdpConnection } from './models/udp-connection';
import { requestLogin, LoginPacket } from './models/packets/request-login';
import { confirmLogin } from './models/packets/confirm-login';

// This port does not seem to change for now, but 
// it's possible that it's negotiated on bluetooth connection
const SERVER_PORT = 28376;

// The IP address of the Besen charger
const SERVER_ADDRESS = '10.210.5.3';

// The serialnumber of the Besen charger, you can find this in the app.
const SERIAL = '7472984956552814';

// The password of the Besen charger, you configured this yourself, through the app.
const PASSWD = '841315';

const handleLogin = (packet: LoginPacket) => {
    udp.send(confirmLogin);
};

const udp = new UdpConnection({
    serverAddress: SERVER_ADDRESS,
    serverPort: SERVER_PORT,
    serialNumber: SERIAL,
    password: PASSWD
});

// When the UDP connection receives a packet, we'll handle it here
udp.eventEmitter = (packet) => {
    console.log('Received packet', packet.command, packet);

    if (packet.command === 'd_Login') {
        handleLogin(packet as unknown as LoginPacket);
    }
};

// Start the UDP connection
udp.start(() => {
    // When the UDP connection is started, we want to send a login request
    udp.send(requestLogin);
});


