(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('JndConnectTrelloCtrl', JndConnectTrelloCtrl);

  /* @ngInject */
  function JndConnectTrelloCtrl($scope, JndUtil, JndConnect, JndConnectUnionApi, JndConnectTrelloApi) {

    $scope.isInitialized = false;
    $scope.isLoading = false;
    $scope.isBoardLoaded = false;

    $scope.requestData = {
      mode: 'authed',
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
        botThumbnailFile: $scope.current.union.botThumbnailUrl,
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

      $scope.boards = boards;
      $scope.isBoardLoaded = true;
    }

    function _onSuccessGetSetting(response) {
      console.log(response);
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

      console.log($scope.formData);
      //_.each($scope.formData.hookEvent, function(value, key) {
      //  if (value) {
      //    hookEvent.push(key);
      //    if (key === 'create') {
      //      hookEvent.push('delete');
      //    }
      //  }
      //});
      //_.extend($scope.requestData, {
      //  roomId: formData.roomId,
      //  hookRepoId: formData.hookRepoId,
      //  hookRepoName: JndUtil.pick(_getRepoData(formData.hookRepoId), 'full_name'),
      //  hookEvent: hookEvent.join(','),
      //  hookBranch: _getBranches(),
      //  botName: footer.botName,
      //  botThumbnailFile: footer.botThumbnailFile,
      //  connectId: $scope.current.connectId,
      //  lang: footer.lang
      //});

    }
  }
})();
