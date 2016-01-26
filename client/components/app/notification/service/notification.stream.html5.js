/**
 * @fileoverview sound stream service
 */
(function() {
  'use strict';
  
  angular
    .module('jandiApp')
    .service('NotificationStreamHTML5', NotificationStreamHTML5);
  
  function NotificationStreamHTML5() {
    var that = this;

    that.init = init
    that.destroy = destroy
    that.play = play
    that.stop = stop

    function init(options) {
      that.audio = new Audio();

      _.extend(that.options = {}, options);

      that._on();
      that._load();
    }

    function destroy() {
      that.audio = null;

      _off();
    }

    function play() {
      var audio = that.audio;

      if (that.options.multiple || !that.playing) {
        that.playing = true;
        audio.play();
      }
    }

    function stop() {
      that.playing = false;
      that.audio.pause();
    }

    function _on() {
      that.audio.addEventListener('ended', that._onEnded.bind(that), false);
    }

    function _off() {
      that.audio.removeEventListener('ended', that._onEnded.bind(that), false);
    }

    function _load() {
      var audio = that.audio;

      audio.src = that.options.url;
      audio.preload = that.options.preload ? 'auto' : 'none';
      if (that.options.preload) {
        audio.load();
      }
    }

    function _onEnded() {
      that.playing = false;
      that.options.endCallback && that.options.endCallback();
    }
  }
})();