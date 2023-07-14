const port = 3500;
const host = '10.0.0.11';

const net = require('node:net');

const server = net.createServer((socket) => {
    console.log("Add listeners")
    socket.addListener('connect', () => {
        console.log("asd");
    })

    socket.addListener('data', () => {
        console.log("asd");
    })

    socket.addListener('error', () => {
        console.log("asd");
    })

    socket.addListener('timeout', () => {
        console.log("asd t");
    })
    console.log('client connected');
    socket.on('end', () => {
        console.log('client disconnected');
    });
    socket.on('error', (err) => console.log(err));

    socket.write('hello ' + socket.address().address + '\r\n');
    socket.end(() => console.log('client disconnected by server'));
});

server.addListener('connection', (socket) => {
    console.log("asd");
})

server.addListener('listening', (socket) => {
    console.log("listening OK");
})

server.on('error', (err) => console.log(err));

server.listen(port, host, () => {
    console.log('server bound address: ' + server.address().address)
    console.log('server bound family: ' + server.address().family)
    console.log('server bound port: ' + server.address().port)
}); 