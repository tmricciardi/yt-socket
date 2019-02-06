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

let userCount = 0,
  currentVideo = "",
  currentVideoInfo = "",
  currentTime = 0;
io.on("connect", socket => {
  //Viewer Count
  io.emit("viewerUpdate", ++userCount);
  console.log(`User ${socket.id} has connected. ${userCount} Connected.`);
  //console.log(`test ${currentVideoInfo}`);

  socket.on("disconnect", () => {
    io.emit("viewerUpdate", --userCount);
    console.log(`User ${socket.id} has disconnected. ${userCount} Connected.`);
    //console.log(`test ${currentVideoInfo}`);
  });

  //Play
  socket.on(
    "play",
    () => {
      io.emit("userPlay");
    }
  );

  //Pause
  socket.on(
    "pause",
    () => {
      io.emit("userPause");
    }
  );

  //Sync
  socket.on(
    "sync",
    debounce(
      userTime => {
        io.emit("userSync", userTime);
      },
      1000, {
        leading: true,
        trailing: false
      }
    )
  );

  //New Video
  socket.on(
    "newVideo",
    debounce(
      userNewVideo => {
        io.emit("changeVideo", userNewVideo);
        currentVideo = userNewVideo;
      },
      1000, {
        leading: true,
        trailing: false
      }
    )
  );

  //Video Info
  socket.on("videoInfoURL", videoInfoURL => {
    currentVideoInfo = videoInfoURL;
    io.emit("changeVideoInfo", currentVideoInfo);
  });

  //New Time
  socket.on("newTime", userNewTime => {
    currentTime = userNewTime;
  });

  //New Video on connect
  socket.on("newConnection", () => {
    io.emit("connectVideo", {
      currentVideo,
      currentTime,
      currentVideoInfo
    });
  });

  //Chat
  socket.on(
    "chatMessage",
    debounce(
      msg => {
        io.emit("chatMessage", msg);
      },
      500, {
        leading: true,
        trailing: false
      }
    )
  );
});