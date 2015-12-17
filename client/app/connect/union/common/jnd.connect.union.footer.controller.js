(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('JndConnectUnionFooterCtrl', JndConnectUnionFooterCtrl);

  /* @ngInject */
  function JndConnectUnionFooterCtrl($scope, jndPubSub, modalHelper) {
    $scope.save = save;
    $scope.onFileSelect = onFileSelect;
    $scope.profileImg = '';
    _init();

    /**
     * 생성자
     * @private
     */
    function _init() {
      $scope.$on('BlobProfileSettingCtrl:done', _onProfileSettingDone);
    }

    function _onProfileSettingDone(angularEvent, url) {
      console.log('### _onProfileSettingDone', url);
      $scope.profileImg = url;
    }

    function save() {
      jndPubSub.pub('unionFooter:save');
    }

    function onFileSelect($files) {
      if ($files && $files.length) {
        modalHelper.openBotProfileSettingModal($scope, $files);
      }
    }
  }
})();
