/**
 * @fileoverview sound stream service
 */
(function() {
  'use strict';
  
  angular
    .module('jandiApp')
    .service('NotificationAudio', NotificationAudio);
  
  function NotificationAudio(AudioElementStream) {
    var that = this;
    var options = {
      path: '../assets/sounds/',
      ext: 'wav'
    };
    var streams = {};

    that.getInstance = getInstance;
    that.destroy = destory;
    that.play = play;
    that.stop = stop;

    function getInstance(sounds, options) {
      _.extend(that.options, options);

      _load(sounds, options);

      return that;
    }

    function destory() {
      _.each(streams, function(stream) {
        stream.destroy();
        stream = null;
      });
      streams = {};
    }

    function _load(sounds, options) {
      _.each(sounds, function(sound) {
        streams[sound] = AudioElementStream.getInstance(_getUrl(sound), options);
      });
    }

    function _getUrl(sound) {
      return options.path + encodeURIComponent(sound) + '.' + options.ext + '?' + (new Date().valueOf());
    }

    function play(sound) {
      var stream;

      if (stream = streams[sound]) {
        stream.play();
      }
    }

    function stop(sound) {
      var stream;

      if (stream = streams[sound]) {
        stream.stop();
      }
    }
  }
})();
