// const express = require('express');
// const http = require('http');
// const { Server } = require('socket.io');


// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {

//     cors: {
//         origin: "*",
//         methods: ["GET", "POST"]
//     }
// })

// io.on('connection', (socket) => {
//     // connectedSockets.add(socket);
//     console.log('user connected')

//     socket.on('disconnect', () => {
//         console.log('user disconnected');

//     })


//     socket.on('join', (room) => {

//         socket.join(room);
//         socket.to(room).emit('joined', socket.id)
//     })

//     socket.on('offer', ({ offer, roomId, memberId }) => {
//         // pass to particular member id
//         // socket.to(roomId).emit('offer', offer)
//         socket.to(memberId).emit('offer', offer)

//     })

//     socket.on('candidate', ({ candidate, roomId }) => {

//         socket.to(roomId).emit('candidate', candidate)
//     })

//     socket.on('answer', ({ answer, roomId, memberId }) => {
//         // pass answer to member id
//         // socket.to(roomId).emit('answer', answer)
//         socket.to(memberId).emit('answer', answer)
//     })

// })




// server.listen(3000, () => console.log('Server listening at 3000'));

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
});

const rooms = {}; // roomId -> [socketId]

io.on('connection', (socket) => {


  socket.on('join', (roomId) => {
    socket.join(roomId);

    if (!rooms[roomId]) {
      rooms[roomId] = []
    }

    rooms[roomId].push(socket.id);
    const otherUsers = rooms[roomId].filter(id => id !== socket.id);
    socket.emit('all-users', otherUsers);

    socket.on('offer', ({ offer, to, from }) => {
      io.to(to).emit('offer', { offer, from })
    })

    socket.on('answer', ({ answer, to, from }) => {
      io.to(to).emit('answer', { answer, from })
    })
  })

  socket.on('candidate', ({ candidate, from, to }) => {
    io.to(to).emit('candidate', { candidate, from })
  })
});

server.listen(3000, () => console.log('🚀 Server listening on port 3000'));
