(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('JndConnectTrelloCtrl', JndConnectTrelloCtrl);

  /* @ngInject */
  function JndConnectTrelloCtrl($scope, JndUtil, JndConnectUnion, JndConnectTrelloApi) {
    var _trelloBoardId = null;

    $scope.isInitialized = false;
    $scope.isLoading = false;
    $scope.isBoardLoaded = false;

    $scope.requestData = {
      authenticationId: null
    };

    $scope.boards = [
      {
        text: '@불러오는중',
        value: ''
      }
    ];

    $scope.formData = {
      header: JndConnectUnion.getDefaultHeader($scope.current),
      trelloBoardId: null,
      roomId: null,
      hookEvent: {
        showBoardRenamed: false,
        showCardArchived: false,
        showCardAttachmentCreated: false,
        showCardChecklistCreated: false,
        showCardChecklistItemCreated: false,
        showCardChecklistItemUpdated: false,
        showCardCommentCreated: false,
        showCardCreated: false,
        showCardDescriptionUpdated: false,
        showCardDueDateUpdated: false,
        showCardLabelCreated: false,
        showCardLabelDeleted: false,
        showCardMemberCreated: false,
        showCardMoved: false,
        showCardRenamed: false,
        showListArchived: false,
        showListCreated: false,
        showListRenamed: false
      },
      footer: JndConnectUnion.getDefaultFooter($scope.current)
    };

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
     * 설정 저장하기 버튼 클릭 시 이벤트 핸들러
     * @private
     */
    function _attachEvents() {
      $scope.$on('unionFooter:save', _onSave);
    }

    /**
     * 설정 저장하기 버튼 클릭 시 이벤트 핸들러
     * @private
     */
    function _onSave() {
      _setRequestData();
      $scope.isLoading = true;
      var invalidField = _getInvalidField();
      if (!invalidField) {
        JndConnectUnion.save({
          current: $scope.current,
          data: $scope.requestData
        }).finally(_onSaveEnd);
      } else {
        _onSaveEnd();
        Dialog.error({
          'title': '@required 필드 오류'
        });
      }
    }

    /**
     * 저장 완료 이후 반드시 수행되는 콜백
     * @private
     */
    function _onSaveEnd() {
      $scope.isLoading = false;
    }

    /**
     * trello 데이터를 가져오기 위한 첫번째 request
     * @private
     */
    function _initialRequest() {
      JndConnectTrelloApi.getBoards()
        .success(_onSuccessGetBoards)
        .error(JndUtil.alertUnknownError);

      //update 모드가 아닐 경우 바로 view 를 노출한다.
      if (!$scope.isUpdate) {
        $scope.isInitialized = true;
      } else {
        JndConnectUnion.read({
          current: $scope.current,
          header: $scope.formData.header,
          footer: $scope.formData.footer
        }).success(_onSuccessGetSetting);
      }
    }

    /**
     * initial  request 성공 시 이벤트 핸들러
     * @param {array} response
     * @private
     */
    function _onSuccessGetBoards(response) {
      var boards = [];
      _.forEach(response.boards, function(board) {
        boards.push({
          value: board.id,
          text: board.name
        });
      });
      $scope.requestData.authenticationId = response.authenticationId;
      $scope.boards = boards;
      $scope.isBoardLoaded = true;
      $scope.isInitialized = true;
      $scope.formData.trelloBoardId = _trelloBoardId;
      JndConnectUnion.setHeaderAccountData($scope.formData.header, response);
    }

    /**
     * setting 값 조회 완료시 콜백
     * @param {object} response
     * @private
     */
    function _onSuccessGetSetting(response) {
      var formData = $scope.formData;

      formData.roomId = response.roomId;
      formData.trelloBoardId = _trelloBoardId = response.webhookTrelloBoardId;

      _.each(formData.hookEvent, function(value, name) {
        formData.hookEvent[name] = !!response[name];
      });
      $scope.isInitialized = true;
    }

    /**
     * request 데이터를 가공한다.
     * @private
     */
    function _setRequestData() {
      var formData = $scope.formData;
      var hookEvent = formData.hookEvent;
      var footer = formData.footer;

      _.each(hookEvent, function(value, key) {
        if (key === 'showCardLabelCreated') {
          hookEvent.showCardLabelDeleted = value;
        }
      });

      _.extend($scope.requestData, footer, hookEvent, {
        roomId: formData.roomId,
        trelloBoardId: formData.trelloBoardId
      });
    }

    /**
     * invalid
     * @returns {null}
     * @private
     */
    function _getInvalidField() {
      return null;
    }
  }
})();
