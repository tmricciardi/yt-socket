let socket = io();

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
socket.on("userPlay", function(message) {
  player.playVideo();
});

//Pause
socket.on("userPause", function(message) {
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
  userNewVideo = $("#idInput").val();
  socket.emit("newVideo", userNewVideo);
});

socket.on("changeVideo", userNewVideo => {
  player.loadVideoById(userNewVideo, 0, "default");
});

/*
//Add Video
$("#addVideoBtn").on("click", () => {
  userAddVideo = $("#idInput").val();
  socket.emit("addVideo", userAddVideo);
});

socket.on("addVideo", userAddVideo => {
  player.cueVideoById(userAddVideo, 0, "default");
});
*/

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
