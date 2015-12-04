(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('JndConnectJiraCtrl', JndConnectJiraCtrl);

  /* @ngInject */
  function JndConnectJiraCtrl($scope, modalHelper, jndPubSub, Popup) {
    $scope.save = save;
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
      //for test
      $scope.$on('popup-done', function() {
        console.log('### popup done recv');
      });
    }

    /**
     * 설정을 저장한다.
     */
    function save() {
      Popup.open('http://local.jandi.io:8080/connect/google/calendar/auth', {
        name: 'google',
        optionStr: 'resizable=no, scrollbars=1, toolbar=no, menubar=no, status=no, directories=no, width=1024, height=768',
        data: {
          redirectUri: '/popup/success?callbackEvent=popup-done'
        }
      });
    }

    /**
     * topic 생성 모달을 open 한다.
     */
    function openTopicCreateModal() {
      modalHelper.openTopicCreateModal();
    }
  }
})();
