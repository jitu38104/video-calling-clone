const socket = io('/');
const myPeer = new Peer(undefined, {
    host: "/",
    port: 8000
});
const videoGrid = document.querySelector(".video-container");
const alertMsg = document.getElementById("alertMsg");
const myVideo = document.createElement("video");    //video tag for our own streaming

const peers = {};
myVideo.muted = true; //to mute our own video voice not the other users', bcoz we just need the feedback of the others
    
navigator.mediaDevices.getUserMedia({   //sending our video stream to other clients
    audio: true,
    video: true
}).then(stream =>{
    addVideoStream(myVideo, stream); //I can see my video streaming now!

    /*they will be listening me but i wouldn't be getting their stream to watch once they call me via copy n paste my link on their browser*/
    /*Therefore in order to be able to receive their call to me "call" is supposed to be triggered*/
    myPeer.on("call", call =>{      //receiving calls from other users
        call.answer(stream);        //now answering their call and send them our stream
        // console.log(stream);
         
        const video = document.createElement("video");
        call.on("stream", resUserStream=>{            //getting response from them and add their stream on our browser  
            //console.log("creating new video tag");            
            addVideoStream(video, resUserStream);                        
        }); 
    });    

    socket.on("user-connected", userId => { //it triggers the event to inform all the users of the current room of joining the new user except the joined user himself.
        console.log(userId, "is connected just now!");
        alertMsg.innerText = `New user has joined the room!`;
        alertMsg.style.display = "block";
        $("#alertMsg").fadeOut(5000);

        connectToNewUser(userId, stream);
        
        setTimeout(function(){            
            alertMsg.style.display = "none";
        }, 5000);
    });
});

socket.on("user-disconnect", userId =>{
    console.log(userId, "is disconnected");
    if(peers[userId]) {peers[userId].close();}

    alertMsg.innerText = `User left the room!`;
    alertMsg.style.display = "block";
    $("#alertMsg").fadeOut(5000);

    setTimeout(function(){        
        alertMsg.style.display = "none";
    }, 5000);    
});

myPeer.on("open", userId =>{ //as soon as myPeer's "open" event gets triggered, it passes the new user-Id to the userId of callback function which will be used for further socket events
    //user joins the room 
    socket.emit("join-room", ROOM_ID, userId);
    //console.log(peers);
});

function addVideoStream(video, stream){    
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", (e) =>{        
        video.play();        
    });
    //videoGrid.appendChild(video);
    //sessionStorage.setItem("newID", stream.id); //upcoming video tag

    //if(sessionStorage.getItem("newID") != sessionStorage.getItem("prevID")){    //I did this bcoz it was adding same video tag two times therefore if the same video comes with same id then it wouldn't allowed.
        videoContainer(video);//, stream.id);
    //}
}

function connectToNewUser(id, stream){  //informing others with stream
    const call = myPeer.call(id, stream);   //calling others with their ID and sending them our stream on their respectative IDs.
    const video = document.createElement("video");
    peers[id] = call;

    call.on("stream", newUserStream=>{     //this is the event when their streams come to me after calling them, this will be triggered which brings their stream to me
        addVideoStream(video, newUserStream);
    });

    call.on("close", ()=>{
        const id = video.id;;
        const videoBoxDiv = `video-box-${id}`;
        document.querySelector(`.${videoBoxDiv}`).remove();
    });
}


function videoContainer(videoTag){//, id){ 
    //sessionStorage.setItem("prevID", id); //already has come that id
    const videoId = Math.round(Math.random() * 1E9);
    const vidContainer = document.querySelector(".video-container");
    const videoBoxDiv = document.createElement("div");
    const btnBoxDiv = document.createElement("div");
    const videoBtnDiv = document.createElement("div");
    const micBtnDiv = document.createElement("div");    
    const videoBtn = document.createElement("button");
    const micBtn = document.createElement("button");
    
    videoBoxDiv.classList.add(`video-box-${videoId}`, "video-box", "w-50", "w-auto", "m-4", "col-md-3", "col-6");
    btnBoxDiv.classList.add("btn-box", "bg-dark", "row", "w-100", "m-0");
    videoBtnDiv.classList.add("video-btn", "col-md-2", "col-3");
    micBtnDiv.classList.add("mic-btn", "col-md-2", "col-3");    
    videoTag.classList.add("w-100");
    videoBtn.classList.add("video-path", videoId, "0");
    micBtn.classList.add("mic-path", videoId, "0");

    videoTag.setAttribute("id", videoId);
    videoBoxDiv.appendChild(videoTag);
    videoBtn.setAttribute("type", "button");
    videoBtn.innerText = "Pause";
    videoBtn.style.color = "#c00";
    micBtn.setAttribute("type", "button");    
    micBtn.innerText = "Mute";
    micBtn.style.color = "#c00";

    videoBtnDiv.appendChild(videoBtn);
    micBtnDiv.appendChild(micBtn);
    btnBoxDiv.appendChild(videoBtnDiv);
    btnBoxDiv.appendChild(micBtnDiv);    
    videoBoxDiv.appendChild(btnBoxDiv);
    
    vidContainer.appendChild(videoBoxDiv);
    eventListener(videoBtn, micBtn);  //note: Add only one time eventListener to button or else it would run as much time as you add it to button               
}

function eventListener(vid, mic) {
    [vid, mic].forEach(btn=>{
        btn.addEventListener("click", e=>{
            e.preventDefault();            
            const classArr = btn.classList;
            toggleFun(btn, classArr);
        });           
    });
}

const toggleFun = (btn, classNameList)=>{
    if(classNameList[0] === "video-path"){
        if(Number(classNameList[2])){
            btn.innerText = "Pause";             
            btn.classList.remove("1"); 
            btn.classList.add("0");  
            btn.style.color = "#c00";   
            document.getElementById(classNameList[1]).play();
        } else {
            btn.innerText = "Play";            
            btn.classList.remove("0")
            btn.classList.add("1");
            btn.style.color = "#007bff";
            document.getElementById(classNameList[1]).pause();            
        }        
    } else if(classNameList[0] === "mic-path"){        
        if(Number(classNameList[2])){
            btn.innerText = "Mute";
            btn.classList.remove("1"); 
            btn.classList.add("0");
            btn.style.color = "#c00";
            document.getElementById(classNameList[1]).muted = false;
        } else {
            btn.innerText = "Unmute";            
            btn.classList.remove("0")
            btn.classList.add("1");            
            btn.style.color = "#007bff";
            document.getElementById(classNameList[1]).muted = true;
        }       
    }
}


$("#hideShow").click(function(){    //to show or hide classes  
    let className = document.getElementById("share").classList[0];
    console.log(className);
    if(className !== "jssocials") {
        className = document.getElementById("share").classList[0];
    } else {
        className = document.getElementById("share").classList[1];
    }            
    
    if(className === "hideDiv"){
        $("#share").removeClass("hideDiv");
        $("#share").addClass("showDiv");
        assignTitles();
    } else if(className === "showDiv"){
        $("#share").removeClass("showDiv");
        $("#share").addClass("hideDiv");
    }
});


//titles for the share social buttons
function assignTitles(){
    const titleNames = ["Email", "Facebook", "Twitter", "Telegram", "Whatsapp"];
    const socialClassNames = document.querySelectorAll(".jssocials-share-logo");
    socialClassNames.forEach((icon, index)=>{
        icon.setAttribute("title", titleNames[index]);
    });    
}
