const socket = io(),
  $syncBtn = $("#syncBtn"),
  $playForm = $("#playForm"),
  $idInput = $("#idInput"),
  $nameForm = $("#nameForm"),
  $nameInput = $("#nameInput"),
  $chatForm = $("#chatForm"),
  $chatInput = $("#chatInput"),
  $messages = $("#messages"),
  $viewers = $("#viewers");

//https://developers.google.com/youtube/iframe_api_reference#Loading_a_Video_Player
var tag = document.createElement("script");

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName("script")[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;

function onYouTubeIframeAPIReady() {
  player = new YT.Player("player", {
    height: "100%",
    width: "100%",
    videoId: "",
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange
    }
  });
}

//https://developers.google.com/youtube/iframe_api_reference#Events
function onPlayerReady(event) {
  player.stopVideo();
}

function onPlayerStateChange(event) {
  switch (event.target.getPlayerState()) {
    case 1:
      socket.emit("play");
      break;
    case 2:
      socket.emit("pause");
      break;
    case 5:
      socket.emit("newConnection");
      socket.on("connectVideo", data => {
        currentVideo = data.currentVideo;
        currentTime = data.currentTime;
        if (event.target.getPlayerState() == 5) {
          player.loadVideoById(currentVideo, currentTime, "default");
          console.log(currentVideo, currentTime);
        }
      });
  }
}

//Play
socket.on("userPlay", () => {
  player.playVideo();
});

//Pause
socket.on("userPause", () => {
  player.pauseVideo();
});

//Sync
$syncBtn.on("click", () => {
  let userTime = player.getCurrentTime();
  socket.emit("sync", userTime);
});

socket.on("userSync", userTime => {
  player.seekTo(userTime);
});

//New Video
$playForm.submit(() => {
  let idInputVal = $idInput.val();
  //Finds ID for https://www.youtube.com/watch?v=
  let idRegex1 = /(\?|&)v=([^&#]+)/;
  //Finds ID for https://youtu.be/
  let idRegex2 = /(\.be\/)+([^\/]+)/;

  if (idRegex1.test(idInputVal)) {
    userNewVideo = idInputVal.match(idRegex1).pop();
    socket.emit("newVideo", userNewVideo);
  } else if (idRegex2.test(idInputVal)) {
    userNewVideo = idInputVal.match(idRegex2).pop();
    socket.emit("newVideo", userNewVideo);
  } else {
    if ($idInput.val()) {
      userNewVideo = $idInput.val();
      socket.emit("newVideo", userNewVideo);
    }
  }

  setInterval(() => {
    let userNewTime = player.getCurrentTime();
    socket.emit("newTime", userNewTime);
  }, 1000);
});

socket.on("changeVideo", userNewVideo => {
  player.loadVideoById(userNewVideo, 0, "default");
});

//Username
let username;
let $currentInput = $nameInput.focus();

$nameForm.submit(() => {
  username = $nameInput.val();

  if (username) {
    $nameForm.fadeOut();
    $messages.removeClass("blur");
    $chatForm.removeClass("blur");
    $currentInput = $chatInput.focus();
  }
});

//Chat
$chatForm.submit(() => {
  message = $chatInput.val();

  if (message) {
    $chatInput.val("");
    socket.emit("chatMessage", `${username}: ${message}`);
  }
});

socket.on("chatMessage", msg => {
  $messages.append($("<li>").text(msg));
});

//Total connected
socket.on("viewerUpdate", function (count) {
  $viewers.text(count);
});