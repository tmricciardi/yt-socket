let socket = io();

//https://developers.google.com/youtube/iframe_api_reference#Loading_a_Video_Player
var tag = document.createElement("script");

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName("script")[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
function onYouTubeIframeAPIReady() {
  player = new YT.Player("player", {
    height: "390",
    width: "640",
    videoId: "M7lc1UVf-VE",
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange
    }
  });
}

//https://developers.google.com/youtube/iframe_api_reference#Events
function onPlayerReady(event) {
  event.target.playVideo();
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
$("#IdBtn").on("click", () => {
  userVideo = $("#IdInput").val();
  socket.emit("video", userVideo);
});

socket.on("changeVideo", userVideo => {
  player.loadVideoById(userVideo, 0, "default");
});
