import dgram from 'dgram';
import { bytesToString } from './byte-helpers';
import { UniversalConstant } from './universal-constant';
import { CommandConstant } from './command-constant';
import { GenericPacket, parseLoginPacket } from './packets/request-login';
import { UdpConnectionOptions } from './udp-connection-options';
import { parseSingleAcStatus } from './packets/single-ac-status';

const CLIENT_PORT = 28376;

export class UdpConnection {
    private options: UdpConnectionOptions;

    private isConnected: boolean = false;
    private client: dgram.Socket
    private sendClient?: dgram.Socket;

    eventEmitter?: <T extends GenericPacket>(packet: T) => void;

    // This port is actually negotiated with the device on Bluetooth connection, 
    // but we'll use a fixed port for simplicity
    private listenPort: number = CLIENT_PORT;

    constructor(options: UdpConnectionOptions) {
        this.options = options;

        console.log('UDP client created', this.options);

        this.client = dgram.createSocket({
            type: 'udp4',
            reuseAddr: true
        });
    }

    start(connected: () => void): void {
        this.client.on('connect', () => {
        });

        this.client.on('listening', () => {
            console.log('UDP client listening on port', this.listenPort);
        });

        this.client.on('message', (msg, rinfo) => {
            console.log(`Received message from ${rinfo.address}:${rinfo.port}`);
            console.log('Message:', msg.toString());

            this.receivePacket(msg);

            if (!this.isConnected) {
                this.client.setBroadcast(true);
                connected();
            }

            this.isConnected = true;
        });

        this.client.on('close', () => {
            console.log('Connection closed');
            this.isConnected = false;
        });

        this.client.on('error', (err) => {
            console.error('Error:', err);
        });

        this.client.bind(this.listenPort);

    }


    send(method: (options: UdpConnectionOptions) => Buffer): void {
        const data = method(this.options);
        this.sendBuffer(data);
    }

    private sendBuffer(data: Buffer): void {
        console.log('Sending data to ', this.options.serverAddress, 'port', this.options.serverPort, ':', data.length, 'bytes');

        if (!this.sendClient) {
            this.sendClient = dgram.createSocket({
                type: 'udp4',
                reuseAddr: false,
            });
        }

        this.sendClient!.send(data, this.options.serverPort, this.options.serverAddress, (err, bytes) => {
            if (err) {
                console.error('Error sending message:', err);
                this.sendClient!.close();
                return;
            }
            console.log('Sent ', bytes, ' bytes to ', this.options.serverAddress);
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

        const packetHeader = bytesToString(buffer.subarray(0, 2));
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
        console.log('Processing packet:', buffer.length, 'bytes');
        const lengthCheck = ((buffer[2] << 8) + buffer[3]) & 255;

        var command: number = 0;

        const b2 = buffer[4];
        var packetBuffer: Buffer | undefined = undefined;

        if (b2 === 0) {
            const value = bytesToString(buffer.subarray(19, 21));
            const int = parseInt(value, 16);

            if (int !== 3) {
                packetBuffer = buffer.subarray(21, lengthCheck - 4);
            }

            command = int;
        }

        if (!packetBuffer) {
            console.log('Packetbuffer is null');
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

        this.processCommand(command, packetBuffer);

        if (buffer.length > lengthCheck) {
            console.log('Processing additional packet');
            this.processPacket(buffer.subarray(lengthCheck));
        }
    }

    private processCommand(command: number, buffer: Buffer) {
        switch (command) {
            case CommandConstant.d_Login:
                this.eventEmitter?.(parseLoginPacket(buffer));
                break;
            case CommandConstant.d_singleAC_status:
                this.eventEmitter?.(parseSingleAcStatus(buffer));
                break;
            default:
                console.log('Unknown command:', command, ':', buffer.length, 'bytes');
                break;
        }
    }

    /*
    private sendChargeFee = () => {
        const parameters = {
            setType: 1,
            rateType: 1,
            num: 0
        }

        const buffer = Buffer.alloc(4);
        buffer.writeUInt8(parameters.setType, 0);
        buffer.writeUInt8(parameters.rateType, 1);
        buffer.writeUInt8(parameters.num, 2);

        const packageData = createPackageData(this.options.serialNumber, this.options.password, CommandConstant.s_setAndGetChargeFee, Int8Array.from(buffer));
        this.send(packageData);

    }

    private sendServiceFee = () => {
        const parameters = {
            setType: 1,
            rateType: 1,
            num: 0
        }

        const buffer = Buffer.alloc(4);
        buffer.writeUInt8(parameters.setType, 0);
        buffer.writeUInt8(parameters.rateType, 1);
        buffer.writeUInt8(parameters.num, 2);

        const packageData = createPackageData(this.options.serialNumber, this.options.password, CommandConstant.s_setAndGetServiceFee, Int8Array.from(buffer));
        this.send(packageData);
    }
    */
}