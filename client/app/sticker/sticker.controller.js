(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('StickerCtrl', StickerCtrl);

  function StickerCtrl($scope, Sticker) {

    init();
    this.onClickRecent = onClickRecent;
    this.onClickList = onClickList;
    this.getList = getList;
    this.getRecent = getRecent;

    function init() {
      Sticker.getList().success(function(response) {
        $scope.list = response;
      });
    }
    function onClickList(clickEvent) {
      console.log('test');
      clickEvent.stopPropagation();
    }
    function onClickRecent(clickEvent) {
      console.log('test');
      clickEvent.stopPropagation();
    }
    function getList(groupId) {
      Sticker.getList().success(function(response) {
        $scope.list = response;
      });
    }
    function getRecent() {
      Sticker.getRecentList().success(function(response) {
        $scope.list = response;
      });
    }
  }
})();
