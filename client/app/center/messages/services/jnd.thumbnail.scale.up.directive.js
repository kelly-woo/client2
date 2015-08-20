/**
 * @fileoverview 각 토픽마다 생성되는 announcement directive
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndThumbnailScaleUp', jndThumbnailScaleUp);

  function jndThumbnailScaleUp($compile, MessageCollection) {
    return {
      restrict: 'A',
      replace: true,
      link: link
    };

    function link(scope, el, attrs) {

      _init();

      /**
       * 생성자
       * @private
       */
      function _init() {
        el.on('click', _onClick);

      }

      function _onClick() {

      }
    }
  }
})();
