(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('JndConnectJiraCtrl', JndConnectJiraCtrl);

  /* @ngInject */
  function JndConnectJiraCtrl($scope, modalHelper, jndPubSub, Popup) {
    $scope.openTopicCreateModal = openTopicCreateModal;
    _init();

    /**
     * 생성자
     * @private
     */
    function _init() {
      _attachEvents();
    }

    function _attachEvents() {
      $scope.$on('unionFooter:save', _onSave);
    }

    function _onSave() {

    }

    /**
     * topic 생성 모달을 open 한다.
     */
    function openTopicCreateModal() {
      modalHelper.openTopicCreateModal();
    }
  }
})();
