const socket = io(),
  $syncBtn = $("#syncBtn"),
  $playForm = $("#playForm"),
  $idInput = $("#idInput"),
  $nameForm = $("#nameForm"),
  $nameInput = $("#nameInput"),
  $chatForm = $("#chatForm"),
  $chatInput = $("#chatInput"),
  $messages = $("#messages"),
  $viewers = $("#viewers"),
  $videoQueueInfo = $("#videoQueueInfo");

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
        let currentVideo = data.currentVideo,
          currentTime = data.currentTime,
          currentVideoInfo = data.currentVideoInfo;
        if (event.target.getPlayerState() == 5) {
          player.loadVideoById(currentVideo, currentTime, "default");
          $.getJSON(currentVideoInfo,
            (data) => {
              $videoQueueInfo.text("Now playing 🛈");
              $videoQueueInfo.attr("title", data.title);
            });
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
    let userNewVideo = idInputVal.match(idRegex1).pop(),
      videoInfoURL = ("http://noembed.com/embed?url=http%3A//www.youtube.com/watch%3Fv%3D" + userNewVideo);
    socket.emit("newVideo", userNewVideo);
    socket.emit("videoInfoURL", videoInfoURL);
  } else if (idRegex2.test(idInputVal)) {
    let userNewVideo = idInputVal.match(idRegex2).pop(),
      videoInfoURL = ("http://noembed.com/embed?url=http%3A//www.youtube.com/watch%3Fv%3D" + userNewVideo);
    socket.emit("newVideo", userNewVideo);
    socket.emit("videoInfoURL", videoInfoURL);
  } else {
    if ($idInput.val()) {
      let userNewVideo = $idInput.val(),
        videoInfoURL = ("http://noembed.com/embed?url=http%3A//www.youtube.com/watch%3Fv%3D" + userNewVideo);
      socket.emit("newVideo", userNewVideo);
      socket.emit("videoInfoURL", videoInfoURL);
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

socket.on("changeVideoInfo", currentVideoInfo => {
  $.getJSON(currentVideoInfo,
    (data) => {
      $videoQueueInfo.text("Now playing 🛈");
      $videoQueueInfo.attr("title", data.title);
    });
})

//Username
let username;
let $currentInput = $nameInput.focus();

$nameForm.submit(() => {
  username = $nameInput.val();

  if (username) {
    $nameForm.fadeOut();
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
socket.on("viewerUpdate", count => {
  $viewers.text("Viewers: " + count);
});

//Toggle dark/light mode
function toggleLightDark() {
  let $body = $("body"),
    $input = $("input"),
    $videoQueueWrapper = $("#videoQueueWrapper"),
    $viewersWrapper = $("#viewersWrapper"),
    $messagesOdd = $("li:nth-child(odd)");

  $body.toggleClass("lightMode");
  $input.toggleClass("lightMode");
  $videoQueueWrapper.toggleClass("lightMode");
  $viewersWrapper.toggleClass("lightMode");
  $messages.toggleClass("lightMode");
  $messagesOdd.toggleClass("lightMode");
};