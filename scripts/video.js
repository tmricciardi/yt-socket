let socket = io();

// 2. This code loads the IFrame Player API code asynchronously.
var tag = document.createElement("script");

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName("script")[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
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

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
  event.target.playVideo();
}

// 5. The API calls this function when the player's state changes.
function onPlayerStateChange(event) {
  /*
                          onStateChange
                          This event fires whenever the player's state changes. 
                          The data property of the event object that the API passes to your event listener function 
                          will specify an integer that corresponds to the new player state. 
                          Possible values are:
          
                          -1 (unstarted)
                          0 (ended)
                          1 (playing)
                          2 (paused)
                          3 (buffering)
                          5 (video cued).
          
                      */
}

//Play
$("#playBtn").on("click", () => {
  console.log("Playing");
  socket.emit("play");
});
//Client recieved play from server after sending userPlay to server
socket.on("userPlay", function(message) {
  player.playVideo();
});

//Pause
$("#pauseBtn").on("click", () => {
  console.log("Paused");
  socket.emit("pause");
});
//Client recieves pause from server after sending userPause to server
socket.on("userPause", function(message) {
  player.pauseVideo();
});

//Sync
$("#syncBtn").on("click", () => {
  let userTime = player.getCurrentTime();
  socket.emit("sync", userTime);
});
//Client recieved sync + userTime from server after sending userSync to server
socket.on("userSync", userTime => {
  player.seekTo(userTime);
});

$("#IdBtn").on("click", () => {
  userVideo = $("#IdInput").val();
  socket.emit("video", userVideo);
});
socket.on("changeVideo", userVideo => {
  player.loadVideoById(userVideo, 0, "default");
});
