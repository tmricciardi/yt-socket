let express = require("express"),
  app = express(),
  http = require("http").Server(app),
  io = require("socket.io")(http),
  port = process.env.PORT || 3000;
const debounce = require("lodash/debounce"),
  throttle = require("lodash/throttle");

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


// an obj of objs containing the user's socket id as the outer obj key. inner obj has two keys, 
// playerCount and pauseCount with values inc'd on socket.on('play') and socket.on('pause)
const userObj = {};

// a global const which represents the amount of times a user can play/pause before they get ignored
const RATE_LIMIT = 3;


io.on("connect", socket => {
  const userID = socket.id;
  //Viewer Count
  io.emit("viewerUpdate", ++userCount);
  console.log(`User ${userID} has connected. ${userCount} Connected.`);
  //console.log(`test ${currentVideoInfo}`);
  if(userID in userObj === false){
    console.log(`emitting changeVideo for user ${userID} with value ${currentVideo}`)
   io.emit("changeVideo", currentVideo); 
  }
  userObj[userID] = {
    playCount: 0,
    pauseCount: 0,
  };
  console.log("after new connect, userObj: ", userObj)


  // every 30 seconds, give everyone a clean slate
  setInterval(function() {
    //iterate over userObj and set everyones play/pause value to 0
    Object.keys(userObj).forEach(userKey => {
      userObj[userKey]['playCount'] = 0;
      userObj[userKey]['pauseCount'] = 0;
    });
    console.log("after cleaning", userObj)
  }, 30000)


  socket.on("disconnect", () => {
    io.emit("viewerUpdate", --userCount);
    console.log(`User ${socket.id} has disconnected. ${userCount} Connected.`);
    //console.log(`test ${currentVideoInfo}`);
  });

  //Play
  socket.on(
    "play",
    throttle(
      () => {
        console.log('socket id',userID)
        if(userObj[userID]){
          console.log("userDoingStuff", userObj[userID])
          userObj[userID]['playCount'] += 1;
          console.log("after inc", userObj[userID])
          if(userObj[userID]['playCount'] < RATE_LIMIT){
            console.log("user  hasnt played in awhile, let them play")
            io.emit("userPlay");

          }else{
            io.emit('slowDown')
          }
        }
      },
      100
    )
  );

  //Pause
  socket.on(
    "pause",
    throttle(
      () => {
        console.log('socket id',userID);
        if(userObj[userID]){
          console.log("userDoingStuff", userObj[userID])
          userObj[userID]['pauseCount'] += 1;
          console.log("after inc", userObj[userID])
          if(userObj[userID]['pauseCount'] < RATE_LIMIT){
            console.log("user  hasnt paused in awhile, let them pause")
            io.emit("userPause");

          }else{
            io.emit('slowDown')
          }
        }
      },
      100
    )
  );

  //Sync
  socket.on(
    "sync",
    throttle(
      userTime => {
        io.emit("userSync", userTime);
      },
      100
    )
  );

  //New Video
  socket.on(
    "newVideo",
    throttle(
      userNewVideo => {
        io.emit("changeVideo", userNewVideo);
        currentVideo = userNewVideo;
      },
      100
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
