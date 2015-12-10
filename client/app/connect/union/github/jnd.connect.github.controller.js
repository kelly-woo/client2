(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('JndConnectGithubCtrl', JndConnectGithubCtrl);

  /* @ngInject */
  function JndConnectGithubCtrl($scope, JndConnect, EntityMapManager) {
    $scope.selectedRoom = null;
    $scope.selectedRepo = 0;

    $scope.repositories = [
      {
        text: 'repo0',
        value: 0
      },
      {
        text: 'repo1',
        value: 1
      },
      {
        text: 'repo2',
        value: 2
      },
      {
        text: 'repo3',
        value: 3
      },
      {
        text: 'repo4',
        value: 4
      }
    ];
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
      console.log('###github save');
    }
  }
})();
