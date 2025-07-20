// const socket = io('http://localhost:3000');

// const constraints = { audio: false, video: true };
// const configuration = {
//     iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
// };

// let localStream;
// let remoteStream;
// let peerConnection;
// const roomId = 'room-1'



// async function init() {
//     localStream = await navigator.mediaDevices.getUserMedia(constraints);
//     document.getElementById('user-1').srcObject = localStream;

// }
// socket.emit('join', roomId)


// async function createPeerConnection() {
//     peerConnection = new RTCPeerConnection(configuration);


//     remoteStream = new MediaStream();
//     document.getElementById('user-2').srcObject = remoteStream;

//     if (!localStream) {
//         localStream = await navigator.mediaDevices.getUserMedia(constraints);
//         document.getElementById('user-1').srcObject = localStream;
//     }

//     localStream?.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

//     peerConnection.ontrack = (event) => {
//         event?.streams[0].getTracks().forEach((track) => remoteStream.addTrack(track));
//     }


//     peerConnection.onicecandidate = ({ candidate }) => {
//         if (candidate) {
//             socket.emit('candidate', { candidate, roomId });

//         }
//     }
// }
// async function createOffer() {
//     await createPeerConnection()



//     let offer = await peerConnection.createOffer();
//     peerConnection.setLocalDescription(offer);
//     // console.log(offer);

//     socket.emit('offer', { offer, roomId, memberId: socket.id });
// }


// async function createAnswer(offer,memberId) {
//     await createPeerConnection()

//     await peerConnection.setRemoteDescription(offer);
//     let answer = await peerConnection.createAnswer();
//     peerConnection.setLocalDescription(answer)
//     socket.emit('answer', { answer, roomId,memberId });

// }

// socket.on('joined', (data) => {

//     createOffer();
// })

// socket.on('offer', (offer) => {
//     createAnswer(offer,socket.id)

// })

// socket.on('candidate', (candidate) => {
//     if (peerConnection) {
//         peerConnection.addIceCandidate(candidate)
//     }
// })

// socket.on('answer', (answer) => {
//     addAnswer(answer)
// })

// async function addAnswer(answer) {
//     if (!peerConnection.currentRemoteDescription) {
//         peerConnection.setRemoteDescription(answer)
//     }
// }
// init()


const socket = io('http://localhost:3000');

const roomId = 'room-1';
const configuration = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};
let localStream;
let peerConnections = {};
let localvideo = document.getElementById('localVideo');
let remoteVideos = document.getElementById('remoteVideos');

 async function init() {
  localStream = await  navigator.mediaDevices.getUserMedia({ audio: false, video: true })
  localvideo.srcObject = localStream;
  socket.emit('join', roomId)
}


socket.on('all-users', async (allUsers) => {
  for (const user of allUsers) {
    await createPeerConnection(user, true)
  }
})



async function createPeerConnection(peerId, initiator) {
  if (peerConnections[peerId])
    return peerConnections[peerId];

  const pc = new RTCPeerConnection(configuration);
  peerConnections[peerId] = pc;
  localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

  const remoteStream = new MediaStream();
  const remoteVideo = document.createElement('video');
  remoteVideo.id = peerId;
  remoteVideo.autoplay = true;
  remoteVideo.playsInline = true;
  remoteVideo.srcObject = remoteStream;
  remoteVideos.appendChild(remoteVideo);

  pc.ontrack = (event) => {
    event.streams[0].getTracks().forEach((track) => remoteStream.addTrack(track));
  }

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit('candidate', {
        candidate: event.candidate,
        from: socket.id,
        to: peerId
      })
    }
  }

  if (initiator) {
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit('offer', { offer, to: peerId, from: socket.id })
  }
  return pc;
}


socket.on('offer', async ({ offer, from }) => {
  const pc = await createPeerConnection(from, false);
  await pc.setRemoteDescription(new RTCSessionDescription(offer));

  const answer = await pc.createAnswer();
  pc.setLocalDescription(answer);
  socket.emit('answer', { answer, from: socket.id, to: from })

})

socket.on('answer', async ({ answer, from }) => {
  const pc = peerConnections[from];
  await pc.setRemoteDescription(new RTCSessionDescription(answer))
})

socket.on('candidate', async ({ candidate, from }) => {
  const pc = peerConnections[from];
  await pc.addIceCandidate(new RTCIceCandidate(candidate))
})
init();
