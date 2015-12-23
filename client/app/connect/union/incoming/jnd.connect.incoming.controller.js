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
  function JndConnectIncomingCtrl($scope, $q, JndUtil, modalHelper, JndConnectUnionApi, jndPubSub, Popup) {
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
     * 저장 버튼 클릭시 이벤트 핸들러
     * @private
     */
    function _onSave() {
      _setRequestData();
      if ($scope.isUpdate) {
        JndConnectUnionApi.update('jira', $scope.requestData)
          .success(_onSuccessUpdate)
          .error(_onErrorUpdate)
          .finally(_onSaveEnd);
      } else {
        JndConnectUnionApi.create('jira', $scope.requestData)
          .success(_onSuccessCreate)
          .error(_onErrorCreate)
          .finally(_onSaveEnd);
      }
    }

    function _onSaveEnd() {
      $scope.isLoading = false;
    }

    function _onSuccessUpdate() {

    }

    function _onErrorUpdate() {

    }

    function _onSuccessCreate() {

    }

    function _onErrorCreate() {

    }

    /**
     * trello 데이터를 가져오기 위한 첫번째 request
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
     *
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
     * create, update 를 위한 request 데이터를 생성한다.
     * @private
     */

    function _setRequestData() {
      var formData = $scope.formData;
      var footer = formData.footer;
      _.extend($scope.requestData, {
        webhookUrl: formData.webhookUrl,
        roomId: formData.roomId,
        botName: footer.botName,
        botThumbnailFile: footer.botThumbnailFile
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
