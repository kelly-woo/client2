/**
 * @fileoverview Webhook 타입 컨넥트 공통 컨트롤러
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('JndConnectWebhookCtrl', JndConnectWebhookCtrl);

  /* @ngInject */
  function JndConnectWebhookCtrl($scope, $filter, JndUtil, JndConnectUnionApi, JndConnectUnion) {
    var TEMPLATE_BASE_PATH = 'app/connect/union/webhook/template/';
    $scope.isInitialized = false;
    $scope.isLoading = false;
    $scope.isUpdate = false;
    $scope.formData = {
      header: {
        hasAccount: false
      },
      roomId: null,
      token: null,
      footer: {}
    };
    $scope.requestData = {};
    $scope.guideTemplateUrl = TEMPLATE_BASE_PATH + $filter('camelToDot')($scope.current.union.name) + '.html';

    _init();

    /**
     * 생성자
     * @private
     */
    function _init() {
      $scope.isUpdate = !!$scope.current.connectId;
      JndConnectUnion.initData($scope.current, {
        header: $scope.formData.header,
        footer: $scope.formData.footer
      });
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
      var formData = $scope.formData;
      var current = $scope.current;
      var name = JndUtil.pick(current, 'union', 'name');
      //update 모드일 경우 조회 API 를 콜한다.
      if ($scope.isUpdate) {
        JndConnectUnion.read({
          current: current,
          header: formData.header,
          footer: formData.footer
        }).success(_onSuccessGetSetting)
          .finally(_onInitialRequestEnd);
      } else {
        JndConnectUnionApi.getWebhookToken(name)
          .success(_onSuccessGetWebhookToken)
          .error(JndUtil.alertUnknownError)
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
      _.extend($scope.formData, {
        webhookUrl: response.webhookUrl,
        roomId: response.roomId
      });
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
      _.extend($scope.requestData, footer, {
        webhookToken: formData.webhookToken,
        roomId: formData.roomId
      });
    }

    /**
     * 저장 버튼 클릭시 이벤트 핸들러
     * @private
     */
    function _onSave() {
      _setRequestData();
      $scope.isLoading = true;
      JndConnectUnion.save({
        current: $scope.current,
        data: $scope.requestData
      }).finally(_onSaveEnd);
    }

    /**
     * 저장 완료시 finally callback
     * @private
     */
    function _onSaveEnd() {
      $scope.isLoading = false;
    }
  }
})();
