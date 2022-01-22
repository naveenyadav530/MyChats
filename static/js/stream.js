const APP_ID = 'f3fec87093bd4bac90e8609acbd5cc20'
const CHANNEL = sessionStorage.getItem('room')
const TOKEN = sessionStorage.getItem('token')
//const TOKEN ='006f3fec87093bd4bac90e8609acbd5cc20IAArrYuOd26qDONNq/Q+kbgzpZ+pnkJzepsX6UQQHFb5j2f+nQgK0hIAIgCv2H0BHyHqYQQAAQAfIephAgAfIephAwAfIephBAAfIeph'
let UID = Number(sessionStorage.getItem('UID'))

let NAME = sessionStorage.getItem('name')


const client = AgoraRTC.createClient({mode:'rtc',codec:'vp8'})

let localTracks = []
let remoteUsers = {}


let joinAndDisplayLocalStream = async () => {
   document.getElementById("room-name").innerText = CHANNEL
  
   client.on('user-published', handleUserJoined)
   client.on('user-left', handleUserLeft)

   try {
    await client.join(APP_ID,CHANNEL, TOKEN, UID)

   } catch (error) {
      
       console.error(error);
       window.open('/','_self')
   }
   
   localTracks = await AgoraRTC.createMicrophoneAndCameraTracks()
    
   let member  = await createMember()


   let player = ` <div class="video-container" id="user-container-${UID}">
                    <div class="username-wrapper">
                        <span class="user-name">${member.name}</span>
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
    document.getElementById(`user-container-${user.uid}`).remove()
}

//leave button
let leaveAndRemoveLocalStream = async() =>{
    for(let i = 0; localTracks.length >i; i++){
        localTracks[i].stop()
        localTracks[i].close()
    }
    await client.leave()
    //delete the member
    deleteMember()
    
    window.open('/', '_self')
}

//camera on of
let toggleCamera = async(e)=>{
    if(localTracks[1].muted){
        await localTracks[1].setMuted(false)
        e.target.style.backgroundColor = '#fff'
    }else{
        await localTracks[1].setMuted(true)
        e.target.style.backgroundColor = 'rgb(255, 80, 80, 1)'
    }

}
//mute the mic
let toggleMic = async(e)=>{
    if(localTracks[0].muted){
        await localTracks[0].setMuted(false)
        e.target.style.backgroundColor = '#fff'
    }else{
        await localTracks[0].setMuted(true)
        e.target.style.backgroundColor = 'rgb(255, 80, 80, 1)'
    }

}
//when new user come then show it to uid
let handleUserJoined = async(user, mediaType) => {
    remoteUsers[user.uid] = user
    await client.subscribe(user, mediaType)

    if(mediaType === 'video'){
        let player = document.getElementById(`user-container-${user.uid}`)
        if(player != null){
            player.remove()
        }

        let member = await getMember(user)

        player = ` <div class="video-container" id="user-container-${user.uid}">
                    <div class="username-wrapper">
                        <span class="user-name">${member.name}</span>
                    </div>
                    <div class="video-player" id="user-${user.uid}"></div> 
                    
                    </div>`
        document.getElementById('video-streams').insertAdjacentHTML('beforeend',player)

        
        user.videoTrack.play(`user-${user.uid}`)

    }
    if(mediaType === 'audio'){
        user.audioTrack.play()
    }
}



let createMember = async()=>{
    let response  = await fetch('/create_member/',{
        method: 'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({'name':NAME, 'room_name':CHANNEL, 'UID':UID})
    })
    let member = await  response.json()
    return member
}

let getMember = async(user)=>{
    let response = await fetch(`/get_member/?UID=${user.uid}&room_name=${CHANNEL}`)
    let member = await response.json()
    return member 
}


let deleteMember = async()=>{
    let response  = await fetch('/delete_member/',{
        method: 'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({'name':NAME, 'room_name':CHANNEL, 'UID':UID})
    })
   let member = await response.json()
}
//open your camera and start streaming
joinAndDisplayLocalStream()

window.addEventListener('beforeunload', deleteMember)

document.getElementById('leave-btn').addEventListener('click', leaveAndRemoveLocalStream)

document.getElementById('camera-btn').addEventListener('click', toggleCamera)
document.getElementById('mic-btn').addEventListener('click', toggleMic)



