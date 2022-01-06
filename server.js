const express = require("express");
const http = require("http");
const SocketIO = require("socket.io");
const engines = require("consolidate");
const app = express();
const cors = require("cors");

const httpServer = http.createServer(app);
const ioServer = SocketIO(httpServer);

let ROOM_NAME = "";
let USER_NAME = "";
const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
};

app.use(cors(corsOptions));
// view 경로 설정
// app.set("views", __dirname + "/demo/dist");

// 화면 engine을 html로 설정
// app.engine("html", engines.mustache);
// app.set("view engine", "html");

// front routing
// app.use(express.static(__dirname + "/demo/dist"));
// app.get("/", (req, res) => res.render("main"));
// app.get("/room", (req, res) => res.render("room"));
// app.get("/exit", (req, res) => res.render("exit"));

app.post("/join/:roomname/:username", (req, res) => {
  console.log("##", req.params);
  ROOM_NAME = req.params.roomname;
  USER_NAME = req.params.username;
  res.send({ data: "SUCCESS" });
});
app.get("/join", (req, res) => {
  res.json({ roomName: ROOM_NAME, userName: USER_NAME });
});

httpServer.listen(process.env.PORT || 3000, () => console.log("start server"));

// socket server
ioServer.on("connection", (socket) => {
  console.log("connect socket server");

  socket.on("join-room", (roomName, userName) => {
    ROOM_NAME = roomName;
    USER_NAME = userName;
    socket.join(roomName);
    socket.to(ROOM_NAME).emit("success-join", roomName, userName);
    // socket.to(ROOM_NAME).emit('Room-Info', roomName, userName)
  });

  // received offer
  socket.on("offer", (offer, roomName) => {
    socket.to(roomName).emit("offer", offer);
  });

  // received answer
  socket.on("answer", (answer, roomName) => {
    socket.to(roomName).emit("answer", answer);
  });

  socket.on("ice", (ice, roomName) => {
    socket.to(roomName).emit("icecandidate", ice);
  });

  socket.on("disconnect", () => {
    socket.to(ROOM_NAME).emit("leave", `leaveUser`);
  });

  socket.on("leave-room", () => {
    socket.leave(ROOM_NAME);
    socket.to(ROOM_NAME).emit("leave-user", socket.rooms);
  });
});
