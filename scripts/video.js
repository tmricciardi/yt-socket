const socket = io(),
  $syncBtn = $("#syncBtn"),
  $queueBtn = $("#queueBtn"),
  $playForm = $("#playForm"),
  $idInput = $("#idInput"),
  $nameForm = $("#nameForm"),
  $nameInput = $("#nameInput"),
  $chatForm = $("#chatForm"),
  $chatInput = $("#chatInput"),
  $messages = $("#messages"),
  $viewers = $("#viewers"),
  $videoQueueInfo = $("#videoQueueInfo");

let queuedVideoCount = 0;

let fistVisit = true;

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
  console.log("in here xd")
  player.stopVideo();
  //Sync currently playing video on connection.
  socket.on("connectVideo", data => {
    let currentVideo = data.currentVideo,
      currentTime = data.currentTime,
      currentVideoInfo = data.currentVideoInfo;
    console.log("in here xdddd", data)
    if (event.target.getPlayerState() == 5) {
      player.loadVideoById(currentVideo, currentTime, "default");
      player.playVideo();
      $.getJSON(currentVideoInfo,
        (data) => {
          $videoQueueInfo.text("Now playing 🛈");
          $videoQueueInfo.attr("title", data.title);
        });
    }
  });
}

function onPlayerStateChange(event) {
  switch (event.target.getPlayerState()) {
    case 0:
      console.log("fistVisit", fistVisit)
      if(fistVisit === false){
        socket.emit("playSyncedVideo");
      }
      console.log("first visit")
      break;
    case 1:
      //PlayerState = Playing
      socket.emit("play");
      console.log(event.target.getPlayerState());
      break;
    case 2:
      //PlayerState = Paused
      socket.emit("pause");
      console.log(event.target.getPlayerState());
      break;
    case 5:
      //PlayerState = Cued (What the PlayerState starts as.)
      socket.emit("newConnection");
      fistVisit = false;
      /*socket.on("connectVideo", data => {
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
      });*/
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
  // remove p tags from the queued up videos list if they exist
  if(queuedVideoCount > 0){
    queuedVideoCount--;
    if(document.getElementById(`up-next-${userNewVideo}`)){
      document.getElementById(`up-next-${userNewVideo}`).remove();
    }
    queuedVideoInfoContainer.style.display = 'none';
  }
  player.loadVideoById(userNewVideo, 0, "default");
});

socket.on("changeVideoInfo", currentVideoInfo => {
  $.getJSON(currentVideoInfo,
    (data) => {
      $videoQueueInfo.text("Up Next 🛈");
      $videoQueueInfo.attr("title", data.title);
    });
});

/*$queueBtn.on("click", () => {
  let idInputVal = $idInput.val();
  //Finds ID for https://www.youtube.com/watch?v=
  let idRegex1 = /(\?|&)v=([^&#]+)/;
  //Finds ID for https://youtu.be/
  let idRegex2 = /(\.be\/)+([^\/]+)/;
  if (idRegex1.test(idInputVal)) {
    let videoQueue = idInputVal.match(idRegex1).pop(),
      videoInfoURL = ("http://noembed.com/embed?url=http%3A//www.youtube.com/watch%3Fv%3D" + videoQueue);
    //socket.emit("newVideo", videoQueue);
    socket.emit("videoInfoURL", videoInfoURL);
    console.log(videoQueue);
  } else if (idRegex2.test(idInputVal)) {
    let videoQueue = idInputVal.match(idRegex2).pop(),
      videoInfoURL = ("http://noembed.com/embed?url=http%3A//www.youtube.com/watch%3Fv%3D" + videoQueue);
    //socket.emit("newVideo", videoQueue);
    socket.emit("videoInfoURL", videoInfoURL);
    console.log(videoQueue);
  } else {
    if ($idInput.val()) {
      let videoQueue = $idInput.val(),
        videoInfoURL = ("http://noembed.com/embed?url=http%3A//www.youtube.com/watch%3Fv%3D" + videoQueue);
      //socket.emit("newVideo", videoQueue);
      socket.emit("videoInfoURL", videoInfoURL);
      console.log(videoQueue);
    }
  }
});*/

//Username
let username;
let $currentInput = $nameInput.focus();

$nameForm.submit(() => {
  // username = $nameInput.val();
  username = $nameInput.val();

  if (username) {
    $.when($nameForm.fadeOut()).done(() => {
      // $("#chatForm").fadeIn().css("display","flex")
      $currentInput = $chatInput.focus();
      const chatInput = document.getElementById("chatInput");
      chatInput.placeholder = "Send a message (Limit 140)";
    });
  }

  // if (username) {
  //   $.when($nameForm.fadeOut()).done(() => $("#chatForm").fadeIn().css("display","flex"));
  // }
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


const queueVideo = (userNewVideo) => {
  socket.emit("queueVideo", userNewVideo);
}

socket.on("successfulVideoQueue", userNewVideo => {
  $("#queuedVideoInfoContainer").append(`<a class='white' href='https://www.youtube.com/watch?v=${userNewVideo}' target="_blank" id='up-next-${userNewVideo}'>${userNewVideo}</a>`);
  queuedVideoCount++;
  videoCount.innerHTML  = `${queuedVideoCount}`;
});



$("#queueBtn").on('click', () => {
  let idInputVal = $idInput.val();
  //Finds ID for https://www.youtube.com/watch?v=
  let idRegex1 = /(\?|&)v=([^&#]+)/;
  //Finds ID for https://youtu.be/
  let idRegex2 = /(\.be\/)+([^\/]+)/;

  if (idRegex1.test(idInputVal)) {
    const userNewVideo = idInputVal.match(idRegex1).pop();
    const videoInfoURL = ("http://noembed.com/embed?url=http%3A//www.youtube.com/watch%3Fv%3D" + userNewVideo);
    queueVideo(userNewVideo);

  } else if (idRegex2.test(idInputVal)) {
    const userNewVideo = idInputVal.match(idRegex2).pop();
    const videoInfoURL = ("http://noembed.com/embed?url=http%3A//www.youtube.com/watch%3Fv%3D" + userNewVideo);
    queueVideo(userNewVideo);
  } else {
    if ($idInput.val()) {
      const userNewVideo = $idInput.val();
      const videoInfoURL = ("http://noembed.com/embed?url=http%3A//www.youtube.com/watch%3Fv%3D" + userNewVideo);
      queueVideo(userNewVideo);


    }
  }
});


$videoQueueInfo.on('click', () => {
  const queuedVideoInfoContainer = document.getElementById('queuedVideoInfoContainer');
  
  if(queuedVideoCount > 0){
    queuedVideoInfoContainer.style.display = 'flex';
  }

});


$("#redCross").on('click', () => {
  queuedVideoInfoContainer.style.display = 'none';
});