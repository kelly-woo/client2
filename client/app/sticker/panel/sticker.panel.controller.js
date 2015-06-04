/**
 * @fileoverview Sticker 컨트롤러
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('StickerPanelCtrl', StickerPanelCtrl);

  function StickerPanelCtrl($scope, $attrs, jndPubSub, Sticker) {

    $scope.name = $attrs.name;
    $scope.onClickTabRecent = onClickTabRecent;
    $scope.onClickTabGroup = onClickTabGroup;
    $scope.onClickItem = onClickItem;
    $scope.onToggled = onToggled;
    $scope.status = {
      isOpen: false
    };

    init();

    function init() {
      _getList();
    }

    function onToggled(isOpen) {
      $scope.status.isOpen = isOpen;
      console.log($scope.status.isOpen);
    }

    function _selectTab(groupId) {

    }


    /**
     * 최근 사용 탭 클릭 시
     * @param {event} clickEvent
     */
    function onClickTabRecent(clickEvent) {
      clickEvent.stopPropagation();
      _getRecent();
    }

    /**
     * 스티커 탭 클릭시
     * @param clickEvent
     */
    function onClickTabGroup(clickEvent) {
      clickEvent.stopPropagation();
      _getList();
    }

    /**
     * 스티커 클릭시
     * @param clickEvent
     * @param item
     */
    function onClickItem(item) {
      jndPubSub.pub('selectSticker:' + $scope.name, item);
    }

    /**
     * groupId 에 해당하는 스티커를 로드한다.
     * @param {number} groupId
     * @private
     */
    function _getList(groupId) {
      groupId = _.isUndefined(groupId) ? 100 : groupId;
      Sticker.getList(groupId)
        .success(function(response) {
          $scope.list = response;
        })
        .error(function() {
          $scope.list = [];
        });
    }

    /**
     * 최근 사용 리스트를 반환한다.
     * @private
     */
    function _getRecent() {
      Sticker.getRecentList()
        .success(function(response) {
          $scope.list = response;
        })
        .error(function() {
          $scope.list = [];
        });
    }
  }
})();
