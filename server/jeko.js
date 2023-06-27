const net = require('net');
const port = 3500;
const host = '10.0.0.11';


const client = new net.Socket();

const server = net.createServer();
server.listen(port, host, () => {
    console.log('TCP Server is running on port ' + port + '.');
});

let sockets = [];

server.on('connection', function (sock) {
    console.log('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort);
    sockets.push(sock);

    sock.on('data', function (data) {
        console.log('DATA ' + sock.remoteAddress + ': ' + data);

        sock.write('/iclock/cdata?SN=5204225260217&options=all&pushver=2.4.1')
        // Write the data back to all the connected, the client will receive it as data from the server
        sockets.forEach(function (sock, index, array) {
            sock.write(sock.remoteAddress + ':' + sock.remotePort + " said " + data + '\n');
        });
    });

    // Add a 'close' event handler to this instance of socket
    sock.on('close', function (data) {
        let index = sockets.findIndex(function (o) {
            return o.remoteAddress === sock.remoteAddress && o.remotePort === sock.remotePort;
        })
        if (index !== -1) sockets.splice(index, 1);
        console.log('CLOSED: ' + sock.remoteAddress + ' ' + sock.remotePort);
    });
});



setTimeout(() => {
    client.connect(port, host, function () {
        console.log('Connected');
        client.write("Hello From Client " + client.address().address);
    });
}, 500)