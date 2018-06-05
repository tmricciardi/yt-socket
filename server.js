let express = require("express");
let app = express();
let http = require("http").Server(app);
let io = require("socket.io")(http);
let port = process.env.PORT || 3000;
const debounce = require("lodash/debounce");

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.use("/scripts", express.static(__dirname + "/scripts"));
app.use("/styles", express.static(__dirname + "/styles"));

http.listen(port, function() {
  console.log("listening on *:" + port);
});

let count = 0;
io.on("connect", user => {
  count++;
  console.log(`User ${user.id} has connected. ${count} Connected.`);
  user.on("disconnect", () => {
    count--;
    console.log(`User ${user.id} has disconnected. ${count} Connected.`);
  });

  //Play
  user.on(
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
  user.on(
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
  user.on(
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
  user.on(
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
  user.on(
    "chatMessage",
    debounce(
      function(msg) {
        io.emit("chatMessage", msg);
      },
      500,
      { leading: true, trailing: false }
    )
  );
});
