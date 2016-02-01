/**
 * @fileoverview sound stream service
 */
(function() {
  'use strict';
  
  angular
    .module('jandiApp')
    .service('NotificationAudio', NotificationAudio);
  
  function NotificationAudio(NotificationStream) {
    var that = this;
    var streams = {};

    that.options = {
      path: '../assets/sounds/',
      ext: 'mp3',
      preload: true,
      multiple: true
    };
    that.getInstance = getInstance;
    that.destroy = destroy;
    that.play = play;

    function getInstance(sounds, options) {
      _.extend(that.options, options);

      _load(sounds, that.options);

      return that;
    }

    function destroy(sound) {
      var stream;

      if (stream = streams[sound]) {
        stream.destroy();
        delete streams[sound];
      } else {
        _.each(streams, function(stream) {
          stream.destroy();
          stream = null;
        });
        streams = {};
      }
    }

    function play(sound) {
      var stream;

      if (stream = streams[sound]) {
        stream.play();
      } else {
        _load([sound], that.options);
      }
    }

    function _load(sounds, options) {
      _.each(sounds, function(sound) {
        streams[sound] = NotificationStream.getInstance(_getUrl(sound), options);
      });
    }

    function _getUrl(sound) {
      return that.options.path + encodeURIComponent(sound) + '.' + that.options.ext + '?' + (new Date().valueOf());
    }
  }
})();
