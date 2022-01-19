const APP_ID = 'f3fec87093bd4bac90e8609acbd5cc20'
const CHANNEL = 'main'
const TOKEN ='006f3fec87093bd4bac90e8609acbd5cc20IACgEw/yfkMpKkVc2NO8wTQ12KVCGEEfkrtl4nc0TIp35WTNKL8AAAAAEADC8VeA9fzoYQEAAQD2/Ohh'
let UID;
const client = AgoraRTC.createClient({mode:'rtc',codec:'vp8'})

let localTracks = []
let remoteUsers = {}
let joinAndDisplayLocalStream = async () => {
   client.on('user-published', handleUserJoined)
   client.on('user-left', handleUserLeft)


   UID = await client.join(APP_ID,CHANNEL, TOKEN, null)
   localTracks = await AgoraRTC.createMicrophoneAndCameraTracks()

   let player = ` <div class="video-container" id="user-container-${UID}">
                    <div class="username-wrapper">
                        <span class="user-name">Dennis Ivanov</span>
                    </div>
                    <div class="video-player" id="user-${UID}"></div> 
                    
                    </div>`
    document.getElementById('video-streams').insertAdjacentHTML('beforeend',player)

    //play audio for player
    localTracks[1].play(`user-${UID}`)

    //other users will also see using this
    await client.publish([localTracks[0],localTracks[1]])
}

//remove user from ui
let handleUserLeft = async(user)=>{
    delete remoteUsers[user.uid]
    document.getElementById(`user-container`)
}

//when new user come then show it to ui
let handleUserJoined = async(user, mediaType) => {
    remoteUsers[user.uid] = user
    await client.subscribe(user, mediaType)
    if(mediaType === 'video'){
        let player = document.getElementById("user-container-${user.uid}")
        if(player != null){
            player.remove()
        }
        player = ` <div class="video-container" id="user-container-${user.uid}">
                    <div class="username-wrapper">
                        <span class="user-name">Dennis Ivanov</span>
                    </div>
                    <div class="video-player" id="user-${user.uid}"></div> 
                    
                    </div>`
        document.getElementById('video-streams').insertAdjacentHTML('beforeend',player)


        user.videoTrack().play(`user-${user.uid}`)

    }
    if(mediaType === 'audio'){
        user.audioTrack.play()
    }
}


//open your camera and start streaming
joinAndDisplayLocalStream()




