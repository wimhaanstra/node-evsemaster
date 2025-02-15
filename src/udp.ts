import dgram from 'dgram';
import { bytesToString, trimLast } from './models/byte-helpers';
import { UniversalConstant } from './models/universal-constant';

const CLIENT_PORT = 28376;

export class UDP {
    private client: dgram.Socket
    private sendClient?: dgram.Socket;

    // This port is actually negotiated with the device on Bluetooth connection, 
    // but we'll use a fixed port for simplicity
    private port: number = CLIENT_PORT;

    constructor(private serverAddress: string, private serverPort: number) {
        console.log('UDP client created', serverAddress, serverPort);

        this.client = dgram.createSocket({
            type: 'udp4',
            reuseAddr: true
        });
    }

    start() {
        this.client.bind(this.port);
        this.client.on('connect', () => {
            this.client.setBroadcast(true);
        });

        this.client.on('listening', () => {
            console.log('UDP client listening on port', CLIENT_PORT);
        });

        this.client.on('message', (msg, rinfo) => {
            console.log(`Received message from ${rinfo.address}:${rinfo.port}`);
            console.log('Message:', msg.toString());

            this.receivePacket(msg);

        });

        this.client.on('error', (err) => {
            console.error('Error:', err);
        });
    }

    send(data: Int8Array): void {

        if (!this.sendClient) {
            this.sendClient = dgram.createSocket('udp4');
        }

        this.sendClient!.send(data, 0, data.length, this.serverPort, this.serverAddress, (err, bytes) => {
            if (err) {
                console.error('Error sending message:', err);
                this.sendClient!.close();
                return;
            }
            console.log('Sent ', bytes, ' bytes to ', this.serverAddress);
        });
    }

    /* 
     * This method will perform some basic checks on the received packet
     * and will then hand it off to `processPacket` for further processing.
     * 
     * Only Wifi packets are supported, bluetooth packets are not supported.
     */
    private receivePacket(buffer: Buffer) {
        if (buffer.length < 4) {
            console.error('Invalid packet length, should be at least 4 bytes, was', buffer.length);
            return;
        }

        const packetHeader = bytesToString(buffer.slice(0, 2));
        if (UniversalConstant.PACKET_HEADER !== packetHeader) {
            console.error('Invalid packet header');
            return;
        }

        const lengthCheck = ((buffer[2] << 8) + buffer[3]) & 255;
        if (lengthCheck > buffer.length) {
            console.error('Invalid checksum');
            return;
        }

        this.processPacket(buffer);
    }

    private processPacket(buffer: Buffer) {
        console.log('Processing packet', buffer.length, 'bytes');
        const lengthCheck = ((buffer[2] << 8) + buffer[3]) & 255;

        var command: number = 0;

        const b2 = buffer[4];
        var smallBuffer: Buffer | undefined = undefined;

        if (b2 === 0) {
            const value = bytesToString(buffer.subarray(19, 21));
            const int = parseInt(value, 16);

            if (int !== 3) {
                smallBuffer = buffer.subarray(21, lengthCheck - 4);
            }

            command = int;
        }

        if (!smallBuffer) {
            console.log('Small buffer is null');
            return;
        }

        const bytes = buffer.subarray(lengthCheck - 4, lengthCheck - 2);
        const validation = (bytes[0] << 8) + (bytes[1] & -1);

        var checksum = 0;
        for (let i = 0; i < lengthCheck - 4; i++) {
            checksum += buffer[i] & -1;
        }

        if (checksum % 65536 !== validation) {
            console.error('Invalid checksum');
            return;
        }
        console.log('Received command:', command);

        this.processCommand(command, /* connectiontype ,*/ /* serial : byteToString, */ smallBuffer);

        if (buffer.length > lengthCheck) {
            console.log('Processing additional packet');
            this.processPacket(buffer.subarray(lengthCheck));
        }
    }

    processCommand(command: number, buffer: Buffer) {
        console.log('Processing command:', command, 'buffer:', buffer);

        switch (command) {
            case 1:
                this.login(buffer);
                break;
            default:
                console.log('Unknown command:', command);
                break;
        }
    }

    private login(buffer: Buffer) {
        console.log('Logging in');

        const brand = trimLast(buffer.subarray(1, 16)).toString();
        const model = trimLast(buffer.subarray(17, 32)).toString();
        const version = trimLast(buffer.subarray(33, 48)).toString();

        console.log('Found charger:', brand, model, version);
    }
}