
var createSongRow = function(songNumber, songName, songLength) {
  var template =
      '<tr class="album-view-song-item">'
      +  '<td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>'
      +  '<td class="song-item-title">' + songName + '</td>'
      +  '<td class="song-item-duration">' + songLength + '</td>'
      + '</tr>'

      var $row = $(template);

      var onHover = function(event) {
      var $songItemNumber = $(this).find('.song-item-number');

        if ($songItemNumber.attr('data-song-number') !== currentlyPlayingSongNumber) {
              $songItemNumber.html(playButtonTemplate);
      };
}
      var offHover = function(event) {
      var $songItemNumber = $(this).find('.song-item-number');

      if ($songItemNumber.attr('data-song-number') !== currentlyPlayingSongNumber) {
            $songItemNumber.html(songNumber);
        };
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
  currentlyPlayingSongNumber = currentSongIndex + 1;
  currentSongFromAlbum = currentAlbum.songs[currentSongIndex];

  // Update the Player Bar information
  updatePlayerBarSong();

  var $nextSongNumberCell = $('.song-item-number[data-song-number="' + currentlyPlayingSongNumber + '"]');
  var $lastSongNumberCell = $('.song-item-number[data-song-number="' + lastSongNumber + '"]');

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
    currentlyPlayingSongNumber = currentSongIndex + 1;
    currentSongFromAlbum = currentAlbum.songs[currentSongIndex];

    // Update the Player Bar information
    updatePlayerBarSong();

    $('.main-controls .play-pause').html(playerBarPauseButton);

    var $previousSongNumberCell = $('.song-item-number[data-song-number="' + currentlyPlayingSongNumber + '"]');
    var $lastSongNumberCell = $('.song-item-number[data-song-number="' + lastSongNumber + '"]');

    $previousSongNumberCell.html(pauseButtonTemplate);
    $lastSongNumberCell.html(lastSongNumber);
};

var clickHandler = function() {
  if (currentlyPlayingSong === null) {
        $(this).html(pauseButtonTemplate);
        currentlyPlayingSong = $(this).attr('data-song-number');
    } else if (currentlyPlayingSong === $(this).attr('data-song-number')) {
        $(this).html(playButtonTemplate);
        currentlyPlayingSong = null;
    } else if (currentlyPlayingSong !== $(this).attr('data-song-number')) {
        var $currentlyPlayingSongElement = $('.song-item-number[data-song-number="' + currentlyPlayingSong + '"]');
        $currentlyPlayingSongElement.html($currentlyPlayingSongElement.attr('data-song-number'));
        $(this).html(pauseButtonTemplate);
        currentlyPlayingSong = $(this).attr('data-song-number');
    }
  };

  var clickHandler = function() {
    var songNumber = $(this).attr('data-song-number');

    if (currentlyPlayingSongNumber !== null) {
  		var currentlyPlayingCell = $('.song-item-number[data-song-number="' + currentlyPlayingSongNumber + '"]');
  		currentlyPlayingCell.html(currentlyPlayingSongNumber);
  	}
    if (currentlyPlayingSongNumber !== songNumber) {
        $(this).html(pauseButtonTemplate);
        currentlyPlayingSongNumber = songNumber;
        currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
        updatePlayerBarSong();
    } else if (currentlyPlayingSongNumber === songNumber) {
        $(this).html(playButtonTemplate);
        $('.main-controls .play-pause').html(playerBarPlayButton);
        currentlyPlayingSongNumber = null;
        currentSongFromAlbum = null;
    }
    };

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
var $previousButton = $('.main-controls .previous');
var $nextButton = $('.main-controls .next');

$(document).ready(function() {
  setCurrentAlbum(albumPicasso);
  $previousButton.click(previousSong);
  $nextButton.click(nextSong);
});
