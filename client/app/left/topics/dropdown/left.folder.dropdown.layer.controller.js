/**
 * @fileoverview 센터페널 메세지중 단순 텍스트일때만 관리하는 컨트롤러
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('leftFolderDropdownLayerCtrl', leftFolderDropdownLayerCtrl);

  /* @ngInject */
  function leftFolderDropdownLayerCtrl($scope, jndPubSub, TopicFolderModel) {

    $scope.remove = remove;
    $scope.rename = rename;

    _init();

    /**
     * 초기화 함수
     * @private
     */
    function _init() {
    }

    /**
     * 폴더에서 제거한다.
     */
    function remove() {
      TopicFolderModel.remove($scope.folder.id);
    }

    /**
     *
     */
    function rename() {
      jndPubSub.pub('topic-folder:rename', $scope.folder.id);
    }
  }
})();
