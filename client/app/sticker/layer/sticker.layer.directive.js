/**
 * @fileoverview 네트워크 오류로 인해 보내지 못한 text 메세지 directive
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
      scope: false,
      controller: 'StickerLayerCtrl',
      link: link,
      templateUrl: 'app/sticker/layer/sticker.layer.html'
    };

    function link(scope, el, attrs) {
      if (attrs.height) {
        el.find('.sticker_layer').height(attrs.height);
      }
    }
  }
})();