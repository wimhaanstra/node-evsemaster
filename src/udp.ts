import dgram from 'dgram';

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
}