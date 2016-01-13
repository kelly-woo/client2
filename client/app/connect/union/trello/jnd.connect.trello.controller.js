(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('JndConnectTrelloCtrl', JndConnectTrelloCtrl);

  /* @ngInject */
  function JndConnectTrelloCtrl($scope, $filter, JndUtil, JndConnect, JndConnectUnion, JndConnectTrelloApi, Dialog) {
    var _trelloBoardId = null;
    var EVENT_PAIR = {
      'showCardLabelCreated': 'showCardLabelDeleted',
      'showBoardListToMoved': 'showBoardListFromMoved',
      'showCardArchived': 'showCardUnarchived',
      'showListArchived': 'showListUnarchived'
    };
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
        showCardAttachmentCreated: true,
        showCardChecklistCreated: true,
        showCardChecklistItemCreated: true,
        showCardChecklistItemUpdated: true,
        showCardCommentCreated: true,
        showCardCreated: true,
        showCardDescriptionUpdated: false,
        showCardDueDateUpdated: false,
        showCardMemberCreated: false,
        showCardMoved: true,
        showCardRenamed: false,
        showListCreated: true,
        showListRenamed: false,
        showBoardMemberCreated: false,

        showCardLabelCreated: false,
        showCardLabelDeleted: false,

        showListArchived: false,
        showListUnarchived: false,

        showCardArchived: false,
        showCardUnarchived: false,

        showBoardListToMoved: false,
        showBoardListFromMoved: false
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
      $scope.$on('JndConnectUnion:showLoading', _onShowLoading);
      $scope.$on('JndConnectUnion:hideLoading', _onHideLoading);
      $scope.$on('unionFooter:save', _onSave);
    }

    /**
     * show loading 이벤트 핸들러
     * @private
     */
    function _onShowLoading() {
      $scope.isLoading = true;
    }

    /**
     * hide loading 이벤트 핸들러
     * @private
     */
    function _onHideLoading() {
      $scope.isLoading = false;
    }

    /**
     * 설정 저장하기 버튼 클릭 시 이벤트 핸들러
     * @private
     */
    function _onSave() {
      _setRequestData();
      var key;
      var invalidField = _getInvalidField();

      if (!$scope.isLoading) {
        $scope.isLoading = true;

        if (!invalidField) {
          JndConnectUnion.save({
            current: $scope.current,
            data: $scope.requestData
          }).finally(_onSaveEnd);
        } else {
          switch (invalidField) {
            case 'trelloBoardId':
              key = '@jnd-connect-218';
              break;
            case 'hookEvent':
              key = '@jnd-connect-219';
              break;
            default:
              key = invalidField;
          }
          _onSaveEnd();
          Dialog.warning({
            'title': $filter('translate')(key)
          });
        }
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
        .error(_onErrorGetBoards);

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
     * board 조회 실패시 콜백
     * @param {object} err
     * @private
     */
    function _onErrorGetBoards(err) {
      JndConnectUnion.handleCommonLoadError($scope.current, err);
    }

    /**
     * board 조회 성공 시 이벤트 핸들러
     * @param {array} response
     * @private
     */
    function _onSuccessGetBoards(response) {
      var boards = [];
      boards.push({
        value: '',
        text: $filter('translate')('@jnd-connect-112')
      });
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
      JndConnectUnion.setHeaderAccountData($scope.formData.header, {
        accountList: [response]
      });
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

      //init events
      _.forEach(formData.hookEvent, function(value, eventName) {
        formData.hookEvent[eventName] = false;
      });

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
      var pairKey;
      _.each(hookEvent, function(value, key) {
        pairKey = EVENT_PAIR[key];
        if (EVENT_PAIR[key]) {
          hookEvent[pairKey] = value;
        }
      });

      _.extend($scope.requestData, footer, hookEvent, {
        roomId: formData.roomId,
        trelloBoardId: formData.trelloBoardId
      });
    }

    /**
     * invalid field 를 반환한다.
     * @returns {*}
     * @private
     */
    function _getInvalidField() {
      var invalidField = null;
      var selectedList;
      var requiredList = [
        'trelloBoardId',
        'roomId'
      ];

      _.forEach(requiredList, function(fieldName) {
        if (!$scope.formData[fieldName]) {
          invalidField = fieldName;
          return false;
        }
      });

      if (!invalidField) {
        selectedList = _.filter($scope.formData.hookEvent, function(value) {
          return value === true;
        });
        if (!selectedList.length) {
          invalidField = 'hookEvent';
        }
      }
      return invalidField;
    }
  }
})();
