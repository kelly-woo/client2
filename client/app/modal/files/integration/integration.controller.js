(function() {
  'use strict';

  // FILE UPLOAD controller
  angular
    .module('jandiApp')
    .controller('fileIntegrationModalCtrl', fileIntegrationModalCtrl);

  /* @ngInject */
  function fileIntegrationModalCtrl($scope, $modalInstance, $filter, data, integrationService) {
    var descs = data.descs;
    var i;
    var len;

    _init();

    /**
     * init
     * @private
     */
    function _init() {
      $scope[data.cInterface] = true;
      $scope.title = $filter('translate')(data.title);
      for (i = 0, len = descs.length; i < len; ++i) {
        $scope['descClassName' + (i + 1)] = descs[i].className;
        $scope['descText' + (i + 1)] = $filter('translate')(descs[i].txt);
      }

      $scope.close = close;
      $scope.integrate = integrate;

      _attachScopeEvents();
    }

    /**
     * attach scope events
     * @private
     */
    function _attachScopeEvents() {
      $scope.$on('googleDriveToken', _onGoogleDriveToken);
    }

    /**
     * google drive token on
     * @param {object} $event
     * @param {object} data
     * @private
     */
    function _onGoogleDriveToken($event, data) {
      var googleDrive = integrationService.getGoogleDrive();
      var token;

      try {
        token = JSON.parse(data[0]);
      } catch(e) {}

      if (token) {
        googleDrive.setToken(token);
        googleDrive.showPicker();
      }
    }

    /**
     * close integration modal
     */
    function close() {
      data.closeIntegration ? data.closeIntegration() : $modalInstance.dismiss('cancel');
    }

    /**
     * open integration modal
     */
    function integrate() {
      data.startIntegration && data.startIntegration();
    }
  }
}());
