require('peer').PeerServer({ port: 8000, path: '/' });
const express = require("express");
const app = express();
const cors = require("cors");
const http = require("https").Server(app);
const io = require("socket.io")(http);
const {v4: uuidv4} = require("uuid");
const users = {};

//ejs engine middleware
app.set("view engine", "ejs");

//creating public directory
app.use(express.static("public"));

//bodyParser middleware
app.use(express.urlencoded({extended: false}));
app.use(express.json());

//cors middleware
// const corsOptions = {
//     origin: ["http://localhost:3000", "http://localhost:8000", "http://localhost:3001", "http://localhost:5000", "http://localhost:5500"]
// }
// app.use(cors(corsOptions));

app.get("/", (req, res)=>{
    const roomId = uuidv4();
    res.redirect(`/${roomId}`);
});

app.get("/:roomId", (req, res)=>{
    const roomId = req.params.roomId;
    res.render("room", {roomId});
});

PORT = process.env.PORT || 3000;
http.listen(PORT, ()=>{
    console.log("Server is running on port:", PORT);
    //console.log("Click on this link: http://localhost:" + PORT);
});

io.on("connection", socket => {
    socket.on("join-room", (roomId, userId) => {
        users[socket.id] = userId;
        // console.log(roomId+"(uuid)", userId+"(socket-id)");
        // console.log(users);
        socket.join(roomId); //firstly user gets connected to the current room through this event "join-room"                       
        socket.broadcast.to(roomId).emit("user-connected", userId); //then his joining is informed to all other users of the same room except himself by this event "user-connected".

        socket.on("disconnect", ()=>{
            socket.broadcast.to(roomId).emit("user-disconnect", userId);
        });
    });    
});