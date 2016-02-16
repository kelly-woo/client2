/**
 * @fileoverview mentions controller
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('RightPanelMentionsTabCtrl', RightPanelMentionsTabCtrl);

  /* @ngInject */
  function RightPanelMentionsTabCtrl($scope, $state, Router, MentionsAPI) {
    var mentionListData = {
      messageId: null
    };
    var isActivated;

    _init();

    // First function to be called.
    function _init() {
      $scope.loadMore = loadMore;
      $scope.messageType = 'mention';

      _initMentionListData();
      if (Router.getActiveRightTabName($state.current) === 'mentions') {
        isActivated = true;

        _initGetMentionList();
      }
    }

    /**
     * open right panel event handler
     */
    $scope.$on('rightPanelStatusChange', function($event, data) {
      if (data.type === 'mentions') {
        isActivated = true;

        if (data.toUrl !== data.fromUrl) {
          _initMentionListData();
          _initGetMentionList();
        }
      } else {
        isActivated = false;
      }
    });

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
      mentionListData.messageId = null;

      $scope.records = [];
      $scope.isEndOfList = $scope.isLoading = $scope.isScrollLoading = false;
    }

    /**
     * mention list 초기 load
     * @private
     */
    function _initGetMentionList() {
      $scope.isLoading = true;
      $scope.isMentionEmpty = false;

      _getMentionList();
    }

    /**
     * mention list 전달
     * @private
     */
    function _getMentionList() {
      MentionsAPI.getMentionList(mentionListData)
        .success(function(data) {
          if (data) {
            if (data.records && data.records.length) {
              _pushMentionList(data.records);
            }

            // 다음 getMentionList에 전달할 param 갱신
            _updateCursor(data);
          }
        })
        .finally(function() {
          $scope.isMentionEmpty = $scope.records.length === 0;
          $scope.isLoading = $scope.isScrollLoading = false;
        });
    }

    /**
     * mention의 list를 설정
     * @param {object} records
     * @private
     */
    function _pushMentionList(records) {
      var i;
      var len;

      for (i = 0, len = records.length; i < len; i++) {
        $scope.records.push(records[i]);
      }
    }

    /**
     * 다음 mention list를 얻어오는 param과 mention list의 상태 갱신
     * @param {object} data
     * @private
     */
    function _updateCursor(data) {
      if (data.records && data.records.length > 0) {
        mentionListData.messageId = data.records[data.records.length - 1].message.id;
      }

      if ($scope.records && $scope.records.length > 0 ) {
        // 더 이상 mention list가 존재하지 않으므로 endOfList로 처리함
        $scope.isEndOfList = !data.hasMore;
      }
    }
  }
})();
