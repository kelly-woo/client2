(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('JndConnectTrelloCtrl', JndConnectTrelloCtrl);

  /* @ngInject */
  function JndConnectTrelloCtrl($scope, JndUtil, JndConnect, JndConnectUnionApi, JndConnectTrelloApi) {
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
      footer: {
        botThumbnailFile: $scope.current.union.imageUrl,
        botName: 'Trello Bot',
        defaultBotName: 'Trello Bot',
        lang: 'ko'
      }
    };
    $scope.openTopicCreateModal = JndConnect.openTopicCreateModal;

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
        if ($scope.isUpdate) {
          JndConnectUnionApi.update('trello', $scope.requestData)
            .success(_onSuccessUpdate)
            .error(_onErrorUpdate)
            .finally(_onSaveEnd);
        } else {
          JndConnectUnionApi.create('trello', $scope.requestData)
            .success(_onSuccessCreate)
            .error(_onErrorCreate)
            .finally(_onSaveEnd);
        }
      } else {
        _onSaveEnd();
        Dialog.error({
          'title': '@required 필드 오류'
        });
      }
    }

    function _onSaveEnd() {
      $scope.isLoading = false;
    }

    /**
     * update request 성공 콜백
     * @param {object} response
     * @private
     */
    function _onSuccessUpdate(response) {
      Dialog.success({
        body:  '업데이트 성공성공',
        allowHtml: true,
        extendedTimeOut: 0,
        timeOut: 0
      });
      JndConnect.backToMain();
    }

    /**
     * 생성 성공 콜백
     * @param {object} response
     * @private
     */
    function _onSuccessCreate(response) {
      Dialog.success({
        body:  '생성 성공성공',
        allowHtml: true,
        extendedTimeOut: 0,
        timeOut: 0
      });
      JndConnect.backToMain();
    }

    /**
     * update 오류 콜백
     * @param {object} response
     * @private
     */
    function _onErrorUpdate(response) {
      JndUtil.alertUnknownError(response);
    }

    /**
     * create 오류 콜백
     * @param {object} response
     * @private
     */
    function _onErrorCreate(response) {
      JndUtil.alertUnknownError(response);
    }

    /**
     * trello 데이터를 가져오기 위한 첫번째 request
     * @private
     */
    function _initialRequest() {
      JndConnectTrelloApi.getBoards()
        .success(_onSuccessGetBoards)
        .error(_onErrorInitialRequest);

      //update 모드가 아닐 경우 바로 view 를 노출한다.
      if (!$scope.isUpdate) {
        $scope.isInitialized = true;
      } else {
        JndConnectUnionApi.read('trello', $scope.current.connectId)
          .success(_onSuccessGetSetting)
          .error(_onErrorInitialRequest);
      }
    }

    /**
     * initial  request 성공 시 이벤트 핸들러
     * @param {array} response
     * @private
     */
    function _onSuccessGetBoards(response) {
      console.log(response);
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
    }

    function _onSuccessGetSetting(response) {
      _setFormDataFromResponse(response);
      $scope.isInitialized = true;
    }

    function _setFormDataFromResponse(response) {
      var formData = $scope.formData;
      formData.roomId = response.roomId;
      formData.trelloBoardId = _trelloBoardId = response.webhookTrelloBoardId;

      _.each(formData.hookEvent, function(value, name) {
        formData.hookEvent[name] = !!response[name];
      });

      console.log('###', formData.hookEvent);
      console.log('###', response);
      //footers
      formData.footer.botName = response.botName;
      formData.footer.botThumbnailFile = response.botThumbnailUrl;
      formData.footer.lang = response.lang;
    }
    /**
     * initial request 실패 시 이벤트 핸들러
     * @param results
     * @private
     */
    function _onErrorInitialRequest(results) {
      JndUtil.alertUnknownError(results);
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

      _.extend($scope.requestData, hookEvent, {
        connectId: $scope.current.connectId,
        botName: footer.botName,
        botThumbnailFile: footer.botThumbnailFile,
        lang: footer.lang,
        roomId: formData.roomId,
        trelloBoardId: formData.trelloBoardId
      });
    }

    function _getInvalidField() {
      return null;
    }
  }
})();
