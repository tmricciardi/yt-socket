const socket = io();

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
  //event.target.playVideo();
}

function onPlayerStateChange(event) {
  switch (event.target.getPlayerState()) {
    case 1:
      socket.emit("play");
      break;
    case 2:
      socket.emit("pause");
      break;
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
$("#syncBtn").on("click", () => {
  let userTime = player.getCurrentTime();
  socket.emit("sync", userTime);
});

socket.on("userSync", userTime => {
  player.seekTo(userTime);
});

//New Video
$("#newVideoBtn").on("click", () => {
  let idTest = $("#idInput").val();
  //Finds ID for https://www.youtube.com/watch?v=
  let idRegex1 = /(\?|&)v=([^&#]+)/;
  //Finds ID for https://youtu.be/
  let idRegex2 = /(\.be\/)+([^\/]+)/;

  if (idRegex1.test(idTest)) {
    userNewVideo = idTest.match(idRegex1).pop();
    socket.emit("newVideo", userNewVideo);
  } else if (idRegex2.test(idTest)) {
    userNewVideo = idTest.match(idRegex2).pop();
    socket.emit("newVideo", userNewVideo);
  } else {
    userNewVideo = $("#idInput").val();
    socket.emit("newVideo", userNewVideo);
  }
});

socket.on("changeVideo", userNewVideo => {
  player.loadVideoById(userNewVideo, 0, "default");
});

//Chat
$(() => {
  $("#chatBoxWrapper").submit(function() {
    socket.emit("chatMessage", $("#chatBox").val());
    $("#chatBox").val("");
    return false;
  });

  socket.on("chatMessage", function(msg) {
    $("#messages").append($("<li>").text(msg));
  });
});

//Total connected
socket.on("viewerUpdate", function(count) {
  $("#viewers").text(count);
});
