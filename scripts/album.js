var filterTimeCode = function (input) {
  var time = parseFloat(input);
  var minutes = Math.floor(time/60);
  var seconds = Math.floor(time - minutes * 60);
  return minutes + ":" + seconds;
}

var setCurrentTimeInPlayerBar = function() {
  var currentTime = currentSoundFile.getTime();
  $('.current-time').html(filterTimeCode(currentTime));
}

var setTotalTimeInPlayerBar = function() {
  var totalTime = currentSoundFile.getDuration();
  $('.total-time').html(filterTimeCode(totalTime));
}

var setupSeekBars = function() {
  var $seekBars = $('.player-bar .seek-bar');

  $seekBars.click(function(event) {
    var offsetX = event.pageX - $(this).offset().left;
    var barWidth = $(this).width();
    var seekBarFillRatio = offsetX / barWidth;

    updateSeekPercentage($(this), seekBarFillRatio);
    if ($(this).parent().hasClass('control-group volume')) {
      setVolume(seekBarFillRatio * 100);
    } else {
      seek(seekBarFillRatio * currentSoundFile.getDuration());
    }
  });

  $seekBars.find('.thumb').mousedown(function(event) {

    var $seekBar = $(this).parent();

    $(document).bind('mousemove.thumb', function(event) {
      var offsetX = event.pageX - $seekBar.offset().left;
      var barWidth = $seekBar.width();
      var seekBarFillRatio = offsetX / barWidth;

      updateSeekPercentage($seekBar, seekBarFillRatio);
      if ($seekBar.parent().hasClass('control-group volume')) {
        setVolume(seekBarFillRatio * 100);
      } else {
        seek(seekBarFillRatio * currentSoundFile.getDuration());
      }
});
      $(document).bind('mouseup.thumb', function() {
        $(document).unbind('mousemove.thumb');
        $(document).unbind('mouseup.thumb');
    });
  });
};

var updateSeekPercentage = function($seekBar, seekBarFillRatio) {
  var offsetXPercent = seekBarFillRatio * 100;

  offsetXPercent = Math.max(0, offsetXPercent);
  offsetXPercent = Math.min(100, offsetXPercent);

  var percentageString = offsetXPercent + "%";
  $seekBar.find('.fill').width(percentageString);
  $seekBar.find('.thumb').css({left: percentageString});
};

var updateSeekBarWhileSongPlays = function() {
  if (currentSoundFile) {

    currentSoundFile.bind('timeupdate', function(event) {

      var seekBarFillRatio = this.getTime() / this.getDuration();
      var $seekBar = $('.seek-control .seek-bar');

      updateSeekPercentage($seekBar, seekBarFillRatio);
      setCurrentTimeInPlayerBar();
      setTotalTimeInPlayerBar();
    });
  }
};

var setSong = function (songNumber) {
    if (currentSoundFile) {
      currentSoundFile.stop();
    }

    currentlyPlayingSongNumber = parseInt(songNumber);
    currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
    currentSoundFile = new buzz.sound(currentSongFromAlbum.audioUrl, {
        // #2
        formats: [ 'mp3' ],
        preload: true
    });

    setVolume(currentVolume);
  };

var seek = function(time) {
       if (currentSoundFile) {
           currentSoundFile.setTime(time);
       }
   }

var setVolume = function(volume) {
    if (currentSoundFile) {
        currentSoundFile.setVolume(volume);
      };
};

var getSongNumberCell = function(number) {
  return $('.song-item-number[data-song-number="' + number + '"]');
}

var createSongRow = function(songNumber, songName, songLength) {
  var template =
      '<tr class="album-view-song-item">'
      +  '<td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>'
      +  '<td class="song-item-title">' + songName + '</td>'
      +  '<td class="song-item-duration">' + filterTimeCode(songLength) + '</td>'
      + '</tr>'

      var $row = $(template);

      var onHover = function(event) {
      var $songItemNumber = $(this).find('.song-item-number');

        if (parseInt($songItemNumber.attr('data-song-number')) !== currentlyPlayingSongNumber) {
              $songItemNumber.html(playButtonTemplate);
      };
}
      var offHover = function(event) {
      var $songItemNumber = $(this).find('.song-item-number');

      if (parseInt($songItemNumber.attr('data-song-number')) !== currentlyPlayingSongNumber) {
            $songItemNumber.html(songNumber);
        };
        console.log("songNumber type is " + typeof songNumber + "\n and currentlyPlayingSongNumber type is " + typeof currentlyPlayingSongNumber);
      };

      $row.find('.song-item-number').click(clickHandler);
      $row.hover(onHover, offHover);
      return $row;

}

var setCurrentAlbum = function(album) {
  currentAlbum = album;
  var $albumTitle = $('.album-view-title');
  var $albumArtist = $('.album-view-artist');
  var $albumReleaseInfo = $('.album-view-release-info');
  var $albumImage = $('.album-cover-art');
  var $albumSongList = $('.album-view-song-list');

  $albumTitle.text(album.title);
  $albumArtist.text(album.artist);
  $albumReleaseInfo.text(album.year + ' ' + album.label);
  $albumImage.attr('src', album.albumArtUrl);

  $albumSongList.empty();

  for (var i = 0; i < album.songs.length; i++) {
    var $newRow = createSongRow(i + 1, album.songs[i].title, album.songs[i].duration);
    $albumSongList.append($newRow);
  }
}

var trackIndex = function(album, song) {
  return album.songs.indexOf(song);
}

var nextSong = function() {
  var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
  // Note that we're _incrementing_ the song here
  currentSongIndex++;

  if (currentSongIndex >= currentAlbum.songs.length) {
      currentSongIndex = 0;
  }

  // Save the last song number before changing it
  var lastSongNumber = currentlyPlayingSongNumber;

  // Set a new current song
  setSong(currentSongIndex + 1);
  currentSoundFile.play();
  updateSeekBarWhileSongPlays();

  // Update the Player Bar information
  updatePlayerBarSong();

  var $nextSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
  var $lastSongNumberCell = getSongNumberCell(lastSongNumber);

  $nextSongNumberCell.html(pauseButtonTemplate);
  $lastSongNumberCell.html(lastSongNumber);
};
var previousSong = function() {
    var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
    // Note that we're _decrementing_ the index here
    currentSongIndex--;

    if (currentSongIndex < 0) {
        currentSongIndex = currentAlbum.songs.length - 1;
    }

    // Save the last song number before changing it
    var lastSongNumber = currentlyPlayingSongNumber;

    // Set a new current song
    setSong(currentSongIndex + 1);
    currentSoundFile.play();
    updateSeekBarWhileSongPlays();


    // Update the Player Bar information
    updatePlayerBarSong();

    $('.main-controls .play-pause').html(playerBarPauseButton);

    var $previousSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
    var $lastSongNumberCell = getSongNumberCell(lastSongNumber);

    $previousSongNumberCell.html(pauseButtonTemplate);
    $lastSongNumberCell.html(lastSongNumber);
};

  var clickHandler = function() {
    var songNumber = parseInt($(this).attr('data-song-number'));

    if (currentlyPlayingSongNumber !== parseInt(null)) {
  		var currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
  		currentlyPlayingCell.html(currentlyPlayingSongNumber);
  	}
    if (currentlyPlayingSongNumber !== songNumber) {
        $(this).html(pauseButtonTemplate);
        setSong(songNumber);
        updatePlayerBarSong();
        currentSoundFile.play();
        updateSeekBarWhileSongPlays();
        updateSeekPercentage($('.control-group .volume'),currentVolume / 100);

    } else if (currentlyPlayingSongNumber === songNumber) {

        if (currentSoundFile.isPaused() === true) {
          currentSoundFile.play();
          updateSeekBarWhileSongPlays();
          $(this).html(pauseButtonTemplate);
          $('.main-controls .play-pause').html(playerBarPauseButton);
        } else {
          currentSoundFile.pause();
          $(this).html(playButtonTemplate);
          $('.main-controls .play-pause').html(playerBarPlayButton);
        } ;
    }
    };

  ///  var clickHandler = function() {
    //  var songNumber = parseInt($(this).attr('data-song-number'));

      //if (currentlyPlayingSongNumber !== parseInt(null)) {
    		//var currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
    		//currentlyPlayingCell.html(currentlyPlayingSongNumber);
    	//}
      //if (currentlyPlayingSongNumber !== songNumber) {
          //$(this).html(pauseButtonTemplate);
          //setSong(songNumber);
          //updatePlayerBarSong();
      //} else if (currentlyPlayingSongNumber === songNumber) {
          //$(this).html(playButtonTemplate);
          //$('.main-controls .play-pause').html(playerBarPlayButton);
          //setSong(null);
      //}
    //};

var playButtonTemplate = '<a class="album-song-button"><span class ="ion-play"></span></a>';
var pauseButtonTemplate = '<a class="album-song-button"><span class ="ion-pause"></span></a>';
var playerBarPlayButton = '<span class="ion-play"></span>';
var playerBarPauseButton = '<span class="ion-pause"></span>';

var updatePlayerBarSong = function() {
  $('.currently-playing .artist-name ').text(currentAlbum.artist);
  $('.currently-playing .song-name ').text(currentSongFromAlbum.title);
  $('.currently-playing .artist-song-mobile .currently-playing').text(currentAlbum.artist + "-" + currentSongFromAlbum.title);
  $('.main-controls .play-pause').html(playerBarPauseButton);
}

var currentAlbum = null;
var currentlyPlayingSongNumber = null;
var currentSongFromAlbum = null;
var currentSoundFile = null;
var currentVolume = 80;
var $previousButton = $('.main-controls .previous');
var $nextButton = $('.main-controls .next');
var $playBar = $('.main-controls .play-pause');

$(document).ready(function() {
  setupSeekBars();
  setCurrentAlbum(albumPicasso);
  $previousButton.click(previousSong);
  $nextButton.click(nextSong);
});

$(document).ready(function() {
  $playBar.click(togglePlayFromPlayerBar);
});

var togglePlayFromPlayerBar = function() {
  if (currentSoundFile) {
  if (currentSoundFile.isPaused() === true) {
    (getSongNumberCell(currentlyPlayingSongNumber)).html(pauseButtonTemplate);
    updatePlayerBarSong();
    currentSoundFile.play();
  } else if (currentSoundFile) {
    (getSongNumberCell(currentlyPlayingSongNumber)).html(playButtonTemplate);
    $('.main-controls .play-pause').html(playerBarPlayButton);
    currentSoundFile.pause();
  }
} else {
  setSong(1);
  (getSongNumberCell(currentlyPlayingSongNumber)).html(pauseButtonTemplate);
  updatePlayerBarSong();
  currentSoundFile.play();
}
}
