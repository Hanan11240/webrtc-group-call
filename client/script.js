const socket = io('http://localhost:3000');

const constraints = { audio: false, video: true };
const configuration = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

let localStream;
let remoteStream;
let peerConnection;
const roomId = 'room-1'



async function init() {
    localStream = await navigator.mediaDevices.getUserMedia(constraints);
    document.getElementById('user-1').srcObject = localStream;

}
socket.emit('join', roomId)


async function createPeerConnection() {
    peerConnection = new RTCPeerConnection(configuration);


    remoteStream = new MediaStream();
    document.getElementById('user-2').srcObject = remoteStream;

    if (!localStream) {
        localStream = await navigator.mediaDevices.getUserMedia(constraints);
        document.getElementById('user-1').srcObject = localStream;
    }

    localStream?.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

    peerConnection.ontrack = (event) => {
        event?.streams[0].getTracks().forEach((track) => remoteStream.addTrack(track));
    }


    peerConnection.onicecandidate = ({ candidate }) => {
        if (candidate) {
            socket.emit('candidate', { candidate, roomId });

        }
    }
}
async function createOffer() {
    await createPeerConnection()



    let offer = await peerConnection.createOffer();
    peerConnection.setLocalDescription(offer);
    // console.log(offer);

    socket.emit('offer', { offer, roomId });
}


async function createAnswer(offer) {
    await createPeerConnection()

    await peerConnection.setRemoteDescription(offer);
    let answer = await peerConnection.createAnswer();
    peerConnection.setLocalDescription(answer)
    socket.emit('answer', { answer, roomId });

}

socket.on('joined', (data) => {
    
    createOffer();
})

socket.on('offer', (offer) => {
    createAnswer(offer)

})

socket.on('candidate', (candidate) => {
    if(peerConnection){
        peerConnection.addIceCandidate(candidate)
    }
})

socket.on('answer', (answer) => {
    addAnswer(answer)
})

async function addAnswer(answer) {
    if (!peerConnection.currentRemoteDescription) {
        peerConnection.setRemoteDescription(answer)
    }
}
init()