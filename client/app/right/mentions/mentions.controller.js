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
    var MENTIONS_COUNT = 40;

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
      _mentionSendCount++;

      clearTimeout(_timerMentionList);
      _timerMentionList = setTimeout(function() {
        Mentions.getMentionList(null, _mentionSendCount)
          .success(function(data) {
            if (data.records) {
              _addMentionList(data.records.reverse());
            }
          });
        _mentionSendCount = 0;
      }, 1000);
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
              _addMentionList(data.records, true);
            }

            // 다음 getMentionList에 전달할 param 갱신
            _updateCursor(data);
        })
        .finally(function() {
          $scope.isInitDone = true;
          $scope.isEmpty = $scope.records.length === 0;
          $scope.isLoading = $scope.isScrollLoading = false;

          $scope.searchStatus = _getSearchStatus();
        });
    }

    /**
     * mention의 list를 설정
     * @param {object} records
     * @param {boolean} [isPush] - true가 아니면 unshift 함
     * @private
     */
    function _addMentionList(records, isPush) {
      var fn = isPush ? 'push' : 'unshift';
      var messageId;

      _.each(records, function(record) {
        messageId = record.message.id;

        if (!_mentionMap[messageId]) {
          $scope.records[fn](record);
          _mentionMap[messageId] = true;
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
