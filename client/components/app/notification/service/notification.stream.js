/**
 * @fileoverview sound stream service
 */
(function() {
  'use strict';
  
  angular
    .module('jandiApp')
    .service('NotificationStream', NotificationStream);
  
  function NotificationStream() {
    var Stream = {};

    function init(url, options) {
      var that = this;
      that.audio = new Audio();

      that.playing = false;

      _.extend(that.options = {}, options);

      that._on();
      that.load(url);

      return that;
    }

    function destroy() {
      var that = this;
      that.audio = null;

      that.playing = false;

      that._off();
    }

    function load(url) {
      var that = this;
      var audio = that.audio;

      audio.src = url;
      audio.preload = that.options.preload ? 'auto' : 'none';
      if (that.options.preload) {
        audio.load();
      }
    }

    function play() {
      var that = this;
      var audio = that.audio;

      if (that.options.multiple || !that.playing) {
        that.playing = true;

        try {
          audio.currentTime = 0;
        } catch (e) {}

        audio.play();
      }
    }

    function stop() {
      var that = this;
      that.playing = false;
      that.audio.pause();
    }

    function _on() {
      var that = this;
      that.audio.addEventListener('ended', that._onEnded.bind(that), false);
      that.audio.addEventListener('canplaythrough', that._onCanPlayThrough.bind(that), false);
    }

    function _off() {
      var that = this;
      that.audio.removeEventListener('ended', that._onEnded.bind(that), false);
      that.audio.removeEventListener('canplaythrough', that._onCanPlayThrough.bind(that), false);
    }

    function _onEnded() {
      var that = this;

      that.stop();
      that.options.end && that.options.end();
    }

    function _onCanPlayThrough() {
      var that = this;

      if (that.options.preload) {
        that.options.ready && that.options.ready();
      }
    }

    Stream.init = init;
    Stream.destroy = destroy;
    Stream.load = load;
    Stream.play = play;
    Stream.stop = stop;

    Stream._on = _on;
    Stream._off = _off;
    Stream._onEnded = _onEnded;
    Stream._onCanPlayThrough = _onCanPlayThrough;

    return  {
      getInstance: function(url, options) {
        return Object.create(Stream).init(url, options);
      }
    };
  }
})();
