const express = require('express');
const http = require('http');
const { Server } = require('socket.io');


const app = express();
const server = http.createServer(app);
const io = new Server(server, {

    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})

io.on('connection', (socket) => {
    // connectedSockets.add(socket);
    console.log('user connected')

    socket.on('disconnect', () => {
        console.log('user disconnected');

    })


    socket.on('join', (room) => {
       
        socket.join(room);
        socket.to(room).emit('joined', socket.id)
    })

    socket.on('offer', ({ offer, roomId }) => {
        socket.to(roomId).emit('offer', offer)

    })

    socket.on('candidate', ({ candidate, roomId }) => {
      
        socket.to(roomId).emit('candidate', candidate)
    })

    socket.on('answer',({answer,roomId})=>{
        socket.to(roomId).emit('answer',answer)
    })

})




server.listen(3000, () => console.log('Server listening at 3000'));