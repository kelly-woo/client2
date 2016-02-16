/**
 * @fileoverview Sticker 레이어 컨트롤러
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('StickerLayerCtrl', StickerLayerCtrl);

  function StickerLayerCtrl($scope, $attrs, jndPubSub, Sticker) {
    var currentItem;
    var _jqImg = $attrs.$$element.find('img');
    //Sticker 영역 이름
    $scope.name = $attrs.name;
    $scope.fileUrl = '';

    $scope.hide = hide;

    _init();

    /**
     * 초기화 함수
     * @private
     */
    function _init() {
      _bindHandlers();
    }

    /**
     * 이벤트 핸들러 바인딩
     * @private
     */
    function _bindHandlers() {
      $scope.$watch('fileUrl', function(newValue, oldValue) {
        jndPubSub.pub('onChangeSticker:' + $scope.name, currentItem);
      });

      $scope.$on('selectSticker:' + $scope.name, _show);
      $scope.$on('deselectSticker:' + $scope.name, hide);
    }

    /**
     * 영역을 감춘다.
     */
    function hide() {
      currentItem = null;
      $scope.fileUrl = '';
    }

    /**
     * 영역을 보인다.
     * @param {Event} angularEvent AngularJS 이벤트
     * @param {object} item 선택한 이미지 item
     * @private
     */
    function _show(angularEvent, item) {
      var url = item.url;
      currentItem = item;

      if (_.isString(url)) {
        $scope.fileUrl = Sticker.getRetinaStickerUrl(url);
      }
    }
  }

})();
