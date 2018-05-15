let app = require("express")();
let http = require("http").Server(app);
let io = require("socket.io")(http);
let port = process.env.PORT || 3000;

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

http.listen(port, function() {
  console.log("listening on *:" + port);
});

io.on("connect", user => {
  //User ID
  console.log(`User ${user.id} has connected`);
  user.on("disconnect", () => {
    console.log(`User ${user.id} has disconnected`);
  });

  //Play
  user.on("play", () => {
    console.log(`${user.id} hit play`);
    io.emit("userPlay");
  });

  //Pause
  user.on("pause", () => {
    console.log(`${user.id} hit pause`);
    io.emit("userPause");
  });
});
