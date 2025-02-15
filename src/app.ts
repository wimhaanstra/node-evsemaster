import dgram from 'dgram';

const client = dgram.createSocket('udp4');

const SERVER_PORT = 28376;
const SERVER_ADDRESS = '10.210.5.3'; // Replace with the actual server address

// Function to create a start charging command
function createStartChargingCommand(): Buffer {
    const buffer = Buffer.alloc(47);
    buffer.writeUInt8(1, 0); // lineId
    buffer.write('userID', 1, 8, 'utf8'); // userID
    buffer.write('chargeId', 9, 8, 'utf8'); // chargeId
    buffer.writeUInt8(0, 17); // isReservation
    buffer.writeUInt32BE(Math.floor(Date.now() / 1000), 18); // reservationDate
    buffer.writeUInt8(1, 22); // startType
    buffer.writeUInt8(1, 23); // chargeType
    buffer.writeUInt16BE(100, 24); // param1
    buffer.writeUInt16BE(200, 26); // param2
    buffer.writeUInt16BE(300, 28); // param3
    buffer.writeUInt8(50, 30); // maxElectricity
    return buffer;
}

// Send the start charging command
function startCharging(): void {
    const message = createStartChargingCommand();
    client.send(message, 0, message.length, SERVER_PORT, SERVER_ADDRESS, (err) => {
        if (err) {
            console.error('Error sending message:', err);
        } else {
            console.log('Start charging command sent');
        }
        client.close();
    });
}

startCharging();