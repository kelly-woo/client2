/**
 * @fileoverview 컨넥트 JIRA 컨트롤러
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('JndConnectIncomingCtrl', JndConnectIncomingCtrl);

  /* @ngInject */
  function JndConnectIncomingCtrl($scope, Dialog, JndUtil, JndConnect, modalHelper, JndConnectUnionApi) {
    $scope.isInitialized = false;
    $scope.isLoading = false;
    $scope.isUpdate = false;
    $scope.formData = {
      roomId: null,
      token: null,
      footer: {
        botThumbnailFile: $scope.current.union.botThumbnailUrl,
        botName: 'Incoming Webhook',
        lang: 'ko'
      }
    };
    $scope.requestData = {};
    $scope.openTopicCreateModal = openTopicCreateModal;

    _init();

    /**
     * 생성자
     * @private
     */
    function _init() {
      $scope.isUpdate = !!$scope.current.connectId;
      _attachEvents();
      _initialRequest();
    }

    /**
     * 이벤트 핸들러를 추가한다.
     * @private
     */
    function _attachEvents() {
      $scope.$on('unionFooter:save', _onSave);
    }

    /**
     * JIRA 데이터를 가져오기 위한 첫번째 request
     * @private
     */
    function _initialRequest() {
      //update 모드일 경우 조회 API 를 콜한다.
      if ($scope.isUpdate) {
        JndConnectUnionApi.read('incoming', $scope.current.connectId)
          .success(_onSuccessGetSetting)
          .error(_onErrorInitialRequest)
          .finally(_onInitialRequestEnd);
      } else {
        JndConnectUnionApi.getWebhookToken('incoming')
          .success(_onSuccessGetWebhookToken)
          .error(_onErrorInitialRequest)
          .finally(_onInitialRequestEnd);
      }
    }

    /**
     * 첫번째 request 완료 후 콜백
     * @private
     */
    function _onInitialRequestEnd() {
      $scope.isInitialized = true;
    }

    /**
     * 수정 모드일 경우 setting 값 조회 완료 콜백
     * @param {object} response
     * @private
     */
    function _onSuccessGetSetting(response) {
      $scope.requestData.connectId = $scope.current.connectId;
      _.extend($scope.formData, {
        webhookUrl: response.webhookUrl,
        roomId: response.roomId
      });
      $scope.formData.footer.botThumbnailFile = response.botThumbnailUrl;
      $scope.formData.footer.botName = response.botName;
    }

    /**
     * 초기 request 실패시 콜백
     * @param {array} results
     * @private
     */
    function _onErrorInitialRequest(results) {
      JndUtil.alertUnknownError(results);
    }

    /**
     * 웹훅 토큰 조회 성공시 콜백
     * @param {object} response
     * @private
     */
    function _onSuccessGetWebhookToken(response) {
      $scope.formData.webhookToken = response.webhookToken;
      $scope.formData.webhookUrl = response.webhookUrl;
    }

    /**
     * topic 생성 모달을 open 한다.
     */
    function openTopicCreateModal() {
      modalHelper.openTopicCreateModal();
    }

    /**
     * create, update 를 위한 request 데이터를 생성한다.
     * @private
     */
    function _setRequestData() {
      var formData = $scope.formData;
      var footer = formData.footer;
      _.extend($scope.requestData, {
        webhookToken: formData.webhookToken,
        roomId: formData.roomId,
        botName: footer.botName,
        botThumbnailFile: footer.botThumbnailFile
      });
    }

    /**
     * 저장 버튼 클릭시 이벤트 핸들러
     * @private
     */
    function _onSave() {
      _setRequestData();
      $scope.isLoading = true;
      if ($scope.isUpdate) {
        JndConnectUnionApi.update('incoming', $scope.requestData)
          .success(_onSuccessUpdate)
          .error(_onErrorUpdate)
          .finally(_onSaveEnd);
      } else {
        JndConnectUnionApi.create('incoming', $scope.requestData)
          .success(_onSuccessCreate)
          .error(_onErrorCreate)
          .finally(_onSaveEnd);
      }
    }

    /**
     * 저장 완료시 finally callback
     * @private
     */
    function _onSaveEnd() {
      $scope.isLoading = false;
    }

    /**
     * 업데이트 성공 콜백
     * @private
     */
    function _onSuccessUpdate() {
      Dialog.success({
        body:  '업데이트 성공성공',
        allowHtml: true,
        extendedTimeOut: 0,
        timeOut: 0
      });
      JndConnect.backToMain();
    }

    /**
     * 업데이트 오류 콜백
     * @private
     */
    function _onErrorUpdate(response) {
      JndUtil.alertUnknownError(response);
    }

    /**
     * 생성 성공 콜백
     * @private
     */
    function _onSuccessCreate() {
      Dialog.success({
        body:  '생성 성공성공',
        allowHtml: true,
        extendedTimeOut: 0,
        timeOut: 0
      });
      JndConnect.backToMain();
    }

    /**
     * 생성 오류 콜백
     * @private
     */
    function _onErrorCreate() {
      JndUtil.alertUnknownError(response);
    }
  }
})();
