const port = 3500;
const host = '10.0.0.11';

const net = require('node:net');

const server = net.createServer((socket) => {
    debugger;
    console.log('client connected');
    socket.on('end', () => {
        console.log('client disconnected');
    });
    socket.on('error', (err) => console.log(err));

    socket.write('hello ' + socket.address().address + '\r\n');
    socket.end(() => console.log('client disconnected by server'));
});

server.on('error', (err) => console.log(err));

server.listen(port, host, () => console.log('server bound')); 