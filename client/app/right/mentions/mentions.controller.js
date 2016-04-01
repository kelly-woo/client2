/**
 * @fileoverview mentions controller
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('RightMentionsCtrl', RightMentionsCtrl);

  /* @ngInject */
  function RightMentionsCtrl($scope, Mentions) {
    var MENTIONS_COUNT = 20;

    var _mentionMap = {};

    var _lastMessageId;
    var _mentionSendCount;

    var _timerMentionList;

    _init();

    /**
     * init
     * @private
     */
    function _init() {
      $scope.loadMore = loadMore;
      $scope.messageType = 'mention';

      _initMentionListData();

      if ($scope.status.isActive) {
        _initGetMentionList();
      }

      _attachScopeEvents();
    }

    /**
     * attach scope events
     * @private
     */
    function _attachScopeEvents() {
      $scope.$on('rightPanelStatusChange', _onRightPanelStatusChange);

      $scope.$on('jndWebSocketMessage:mentionNotificationSend', _onMentionNotificationSend);
      $scope.$on('jndWebSocketMessage:topicMessageDeleted', _onMessageDeleted);
      $scope.$on('jndWebSocketFile:commentDeleted', _onCommentDeleted);
    }

    /**
     * 오른쪽 패널의 텝 열림 이벤트 핸들러
     * @private
     */
    function _onRightPanelStatusChange() {
      if ($scope.status.isActive && !$scope.isInitDone) {
        _initMentionListData();
        _initGetMentionList();
      }
    }

    /**
     * 멘션 알림 이벤트 핸들러
     * @private
     */
    function _onMentionNotificationSend() {
      if ($scope.isInitDone) {
        _mentionSendCount++;

        clearTimeout(_timerMentionList);
        _timerMentionList = setTimeout(function() {
          Mentions.getMentionList(null, _mentionSendCount)
            .success(function(data) {
              if (data.records) {
                if ($scope.records.length === 0) {
                  $scope.isEndOfList = true;
                }

                _addMentions(data.records.reverse());
                _setStatus();
              }
            });
          _mentionSendCount = 0;
        }, 1000);
      }
    }

    /**
     * 메시지 삭제 이벤트 핸들러
     * @param {object} $event
     * @param {object} data
     * @private
     */
    function _onMessageDeleted($event, data) {
      _removeMention(data.messageId);
    }

    /**
     * 코멘트 삭제 이벤트 핸들러
     * @param {object} $event
     * @param {object} data
     * @private
     */
    function _onCommentDeleted($event, data) {
      _removeMention(data.comment.id);
    }

    /**
     * mention 삭제함
     * @param {object} mention
     * @private
     */
    function _removeMention(mentionId) {
      var mention = _mentionMap[mentionId];
      var index = $scope.records.indexOf(mention);

      if (index > -1) {
        $scope.records.splice(index, 1);
        delete _mentionMap[mentionId];

        if ($scope.records.length === 0) {
          $scope.isEndOfList = false;
        }

        _setStatus();
      }
    }

    /**
     * scrolling시 mention list 불러오기
     */
    function loadMore() {
      if (!($scope.isScrollLoading || $scope.isEndOfList)) {
        $scope.isScrollLoading = true;

        _getMentionList();
      }
    }

    /**
     * mention list 초기화
     * @private
     */
    function _initMentionListData() {
      _lastMessageId = null;
      _mentionSendCount = 0;

      $scope.records = [];
      $scope.isInitDone = $scope.isEndOfList = $scope.isLoading = $scope.isScrollLoading = false;
      $scope.searchStatus = _getSearchStatus();
    }

    /**
     * mention list 초기 load
     * @private
     */
    function _initGetMentionList() {
      $scope.isEmpty = false;
      $scope.isLoading = true;

      $scope.searchStatus = _getSearchStatus();

      _getMentionList();
    }

    /**
     * mention list 전달
     * @private
     */
    function _getMentionList() {
      Mentions.getMentionList(_lastMessageId, MENTIONS_COUNT)
        .success(function(data) {
            if (data.records) {
              _addMentions(data.records, true);
            }

            // 다음 getMentionList에 전달할 param 갱신
            _updateCursor(data);
        })
        .finally(function() {
          $scope.isInitDone = true;

          _setStatus();
        });
    }

    function _setStatus() {
      $scope.isEmpty = $scope.records.length === 0;
      $scope.isLoading = $scope.isScrollLoading = false;
      $scope.searchStatus = _getSearchStatus();
    }

    /**
     * mention의 list를 설정
     * @param {object} records
     * @param {boolean} [isPush] - true가 아니면 unshift 함
     * @private
     */
    function _addMentions(mentions, isPush) {
      var fn = isPush ? 'push' : 'unshift';
      var messageId;

      _.each(mentions, function(mention) {
        messageId = mention.message.id;

        if (!_mentionMap[messageId]) {
          _mentionMap[messageId] = mention;
          $scope.records[fn](mention);
        }
      });
    }

    /**
     * 다음 mention list를 얻어오는 param과 mention list의 상태 갱신
     * @param {object} data
     * @private
     */
    function _updateCursor(data) {
      if (data.records && data.records.length > 0) {
        _lastMessageId = data.records[data.records.length - 1].message.id;
      }

      if ($scope.records && $scope.records.length > 0 ) {
        // 더 이상 mention list가 존재하지 않으므로 endOfList로 처리함
        $scope.isEndOfList = !data.hasMore;
      }
    }

    /**
     * 검색 상태 전달
     * @returns {*}
     * @private
     */
    function _getSearchStatus() {
      var searchStatus;

      if ($scope.isLoading) {
        searchStatus = 'loading';
      } else if ($scope.isEmpty) {
        searchStatus = 'empty';
      }

      return searchStatus;
    }
  }
})();
