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
      // sounds path
      path: '../assets/sounds/',
      // sound ext
      ext: 'mp3',
      // stream 객체 생성 후 바로 stream data load 여부
      preload: true,
      // 하나의 stream이 끝나기 전에 stream 시작 가능 영부
      multiple: true
    };

    that.getInstance = getInstance;
    that.destroy = destroy;
    that.play = play;

    /**
     * 객체 전달자
     * @param {array} sounds
     * @param {object} options
     * @returns {NotificationAudio}
     */
    function getInstance(sounds, options) {
      _.extend(that.options, options);

      _load(sounds, that.options);

      return that;
    }

    /**
     * 객체 삭제
     * @param {string} sound
     */
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

    /**
     * 특정 stream play
     * @param {string} sound
     */
    function play(sound) {
      var stream;

      if (stream = streams[sound]) {
        stream.play();
      } else {
        // streams에 존재하지 않는다면 stream 객체를 생성하고 바로 play를 수행하도록 한다.
        _load([sound], _.extend({ready: _ready.bind(that, sound)} ,that.options));
      }
    }

    /**
     * stream 객체 생성
     * @param {array} sounds
     * @param {object} options
     * @private
     */
    function _load(sounds, options) {
      _.each(sounds, function(sound) {
        streams[sound] = NotificationStream.getInstance(_getUrl(sound), options);
      });
    }

    /**
     * stream 객체 ready 이벤트 핸들러
     * @param {string} sound
     * @private
     */
    function _ready(sound) {
      play(sound);
    }

    /**
     * get url
     * @param {string} sound
     * @returns {string}
     * @private
     */
    function _getUrl(sound) {
      return that.options.path + encodeURIComponent(sound) + '.' + that.options.ext + '?' + (new Date().valueOf());
    }
  }
})();
