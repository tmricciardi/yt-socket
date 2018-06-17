let express = require("express"),
  app = express(),
  http = require("http").Server(app),
  io = require("socket.io")(http),
  port = process.env.PORT || 3000;
const debounce = require("lodash/debounce");

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.use("/scripts", express.static(__dirname + "/scripts"));
app.use("/styles", express.static(__dirname + "/styles"));

http.listen(port, () => {
  console.log("listening on *:" + port);
});

let userCount = 0;
io.on("connect", socket => {
  io.emit("viewerUpdate", ++userCount);
  console.log(`User ${socket.id} has connected. ${userCount} Connected.`);

  socket.on("disconnect", () => {
    io.emit("viewerUpdate", --userCount);
    console.log(`User ${socket.id} has disconnected. ${userCount} Connected.`);
  });

  socket.on(
    "play",
    debounce(
      () => {
        io.emit("userPlay");
      },
      1000,
      { leading: true, trailing: false }
    )
  );

  //Pause
  socket.on(
    "pause",
    debounce(
      () => {
        io.emit("userPause");
      },
      1000,
      { leading: true, trailing: false }
    )
  );

  //Sync
  socket.on(
    "sync",
    debounce(
      userTime => {
        io.emit("userSync", userTime);
      },
      1000,
      { leading: true, trailing: false }
    )
  );

  //New Video
  socket.on(
    "newVideo",
    debounce(
      userNewVideo => {
        io.emit("changeVideo", userNewVideo);
      },
      1000,
      { leading: true, trailing: false }
    )
  );

  //Chat
  socket.on(
    "chatMessage",
    debounce(
      msg => {
        io.emit("chatMessage", msg);
      },
      500,
      { leading: true, trailing: false }
    )
  );
});
