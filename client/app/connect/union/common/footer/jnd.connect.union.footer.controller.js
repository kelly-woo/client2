/**
 * @fileoverview union 공통 footer 컨트롤러
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('JndConnectUnionFooterCtrl', JndConnectUnionFooterCtrl);

  /* @ngInject */
  function JndConnectUnionFooterCtrl($scope, $filter, JndUtil, jndPubSub, modalHelper) {
    var _translate = $filter('translate');
    $scope.save = save;
    $scope.onFileSelect = onFileSelect;
    $scope.data = _.extend({}, $scope.data);

    $scope.langList = [
      {
        text: _translate('@jnd-connect-103'),
        value: 'ko'
      },
      {
        text: _translate('@jnd-connect-104'),
        value: 'en'
      },
      {
        text: _translate('@jnd-connect-105'),
        value: 'zh-cn'
      },
      {
        text: _translate('@jnd-connect-106'),
        value: 'zh-tw'
      },
      {
        text: _translate('@jnd-connect-107'),
        value: 'ja'
      }
    ];
    $scope.changedFileUri = null;

    _init();

    /**
     * 생성자
     * @private
     */
    function _init() {
      $scope.data.inputBotName = $scope.data.botName;
      $scope.$watch('data.inputBotName', _onChangeBotName);
      $scope.$on('BlobProfileSettingCtrl:done', _onProfileSettingDone);
    }

    /**
     * bot name 변경되었을 시 빈값이라면 default bot name 으로 설정한다.
     * @private
     */
    function _onChangeBotName() {
      $scope.data.botName = $scope.data.inputBotName || $scope.data.defaultBotName;
    }

    /**
     * 모달의 profile 이미지 변경 완료 이벤트 발생시 핸들러
     * @param {object} angularEvent
     * @param {string} url
     * @private
     */
    function _onProfileSettingDone(angularEvent, url) {
      $scope.changedFileUri = url;
      $scope.data.botThumbnailFile = JndUtil.dataURItoBlob(url);
    }

    /**
     * 설정 저장하기 클릭 시
     */
    function save() {
      jndPubSub.pub('unionFooter:save');
    }

    /**
     * file select 이벤트 핸들러
     * @param {object} $files
     */
    function onFileSelect($files) {
      if ($files && $files.length) {
        modalHelper.openBotProfileSettingModal($scope, $files);
      }
    }
  }
})();
