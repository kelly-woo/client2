/**
 * @fileoverview union 공통 footer 컨트롤러
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('JndConnectUnionFooterCtrl', JndConnectUnionFooterCtrl);

  /* @ngInject */
  function JndConnectUnionFooterCtrl($scope, JndUtil, jndPubSub, modalHelper) {
    $scope.save = save;
    $scope.onFileSelect = onFileSelect;
    $scope.data = $scope.data || {};

    $scope.langList = [
      {
        text: '@한국어',
        value: 'ko'
      },
      {
        text: '@영어',
        value: 'en'
      },
      {
        text: '@중국어',
        value: 'zh-cn'
      },
      {
        text: '@중국어(tw)',
        value: 'zh-tw'
      },
      {
        text: '@일본어',
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
      $scope.$on('BlobProfileSettingCtrl:done', _onProfileSettingDone);
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
