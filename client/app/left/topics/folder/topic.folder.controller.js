/**
 * @fileoverview left panel 에서 토픽 하나만 controll한다.
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('TopicFolderCtrl', TopicFolderCtrl);

  /* @ngInject */
  function TopicFolderCtrl($scope, memberService, TopicFolderModel) {

    $scope.rename = rename;
    $scope.remove = remove;

    /**
     * 초기화
     * @private
     */
    function _init() {

    }

    function rename() {

    }
    function remove() {
      TopicFolderModel.remove($scope.folder.id);
    }
  }
})();
