(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('JndConnectJiraCtrl', JndConnectJiraCtrl);

  /* @ngInject */
  function JndConnectJiraCtrl($scope, modalHelper, jndPubSub) {
    $scope.save = save;
    $scope.openTopicCreateModal = openTopicCreateModal;
    _init();

    /**
     * 생성자
     * @private
     */
    function _init() {

    }

    /**
     * 설정을 저장한다.
     */
    function save() {

    }

    /**
     * topic
     */
    function openTopicCreateModal() {
      modalHelper.openTopicCreateModal();
    }
  }
})();
