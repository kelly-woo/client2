/**
 * @fileoverview STICKER LAYER DIRECTIVE
 * @author Young Park <young.park@tosslab.com>
 */

(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('stickerLayer', stickerLayer);

  function stickerLayer() {
    return {
      restrict: 'E',
      replace: true,
      scope: false,
      controller: 'StickerLayerCtrl',
      link: link,
      templateUrl: 'app/sticker/layer/sticker.layer.html'
    };

    function link(scope, el, attrs) {
      _init();

      /**
       * 초기화 함수
       * @private
       */
      function _init() {
        if (attrs.height) {
          el.find('.sticker_layer').height(attrs.height);
        }
      }
    }
  }
})();
