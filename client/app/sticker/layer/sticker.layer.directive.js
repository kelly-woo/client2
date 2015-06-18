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
      var IMG_ANIMATION_DURATION = 200;
      var _jqImg = el.find('img');

      _init();

      /**
       * 초기화 함수
       * @private
       */
      function _init() {
        if (attrs.height) {
          el.find('.sticker_layer').height(attrs.height);
        }
        _attachEvents();
        scope.$on('$destroy', _onDestroy);
      }

      /**
       * 소멸자
       * @private
       */
      function _onDestroy() {
        _detachEvents();
      }

      /**
       * 이벤트 바인딩
       * @private
       */
      function _attachEvents() {
        _jqImg.on('load', _onImgLoad);
      }

      /**
       * 이벤트 바인딩 해제
       * @private
       */
      function _detachEvents() {
        _jqImg.off('load', _onImgLoad);
      }

      /**
       * onload 이벤트 핸들러
       * @private
       */
      function _onImgLoad() {
        _jqImg.css({
          width: '0px',
          height: '0px',
          marginLeft: '73px',
          marginTop: '73px'
        }).animate({
          width: 145,
          height: 145,
          marginLeft: 0,
          marginTop: 0
        }, IMG_ANIMATION_DURATION);
      }
    }


  }
})();