import dgram from 'dgram';
import { CommandConstant, packageData, stringToBytes } from './package-data';

const client = dgram.createSocket('udp4');

const SERVER_PORT = 28376;
const SERVER_ADDRESS = '10.210.5.3'; // Replace with the actual server address
const SERIAL = '7472984956552814';
const PASSWD = '841315';

// Function to create a status request command
function createStatusRequestCommand(): Buffer {
    const buffer = Buffer.alloc(10); // Adjust the size as needed
    buffer.write('statusReq', 0, 'utf8'); // Example command, adjust as needed
    return buffer;
}

const sendData = (data: any): void => {
    const sendSocket = dgram.createSocket('udp4');
    sendSocket.send(data, SERVER_PORT, SERVER_ADDRESS, (err, bytes) => {
        console.log('Data sent', bytes);
        if (err) {
            console.error('Error sending message:', err);
            sendSocket.close();
            return;
        }
        console.log('Data send: ', data);
    });
}

// Send the status request command and receive the response
function fetchStatus(): void {
    const message = packageData(SERIAL, PASSWD, CommandConstant.s_requestStatusRecord, null);
    const getVersionData = packageData(SERIAL, PASSWD, CommandConstant.s_getVersion, null);
    const requestStatusRecord = packageData(SERIAL, PASSWD, 32781, null);

    // const message = createStatusRequestCommand();

    client.on('message', (msg, rinfo) => {
        console.log(`Received message from ${rinfo.address}:${rinfo.port}`);
        console.log('Status:', msg.toString());
        client.close();
    });

    client.on('connect', () => {
        console.log('Connected to server');

        sendData(requestStatusRecord);
    });

    client.on('listening', () => {
        console.log('Listening for messages');
    });

    client.on('error', (err) => {
        console.error('Error:', err);
        client.close();
    });

    client.connect(SERVER_PORT, SERVER_ADDRESS, () => {
        /*
        client.send(message, (err) => {
            if (err) {
                console.error('Error sending message:', err);
                client.close();
                return;
            }
            console.log('Status request command sent');

        });
        */
    });
}

fetchStatus();
//console.log(stringToBytes(SERIAL))