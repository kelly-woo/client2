/**
 * @fileoverview mentions controller
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('RightPanelMentionsTabCtrl', RightPanelMentionsTabCtrl);

  /* @ngInject */
  function RightPanelMentionsTabCtrl($scope, MentionsAPI) {
    var mentionListData = {
      page: 1
    };
    var isEndOfList;
    var isActivated;

    _init();

    // First function to be called.
    function _init() {
      $scope.loadMore = loadMore;
      $scope.messageType = 'mention';
      _initMentionListData();
    }

    $scope.$on('onRightPanel', function($event, type) {
      if (type === 'mention') {
        isActivated = true;

        _initMentionListData();
        _initGetMentionList();
      } else {
        isActivated = false;
      }
    });

    function loadMore() {
      if (!($scope.isScrollLoading || isEndOfList)) {
        $scope.isScrollLoading = true;

        _getMentionList();
      }
    }

    function _initGetMentionList() {
      $scope.isLoading = true;
      $scope.isMentionEmpty = false;
      _getMentionList();
    }

    function _initMentionListData() {
      mentionListData.page = 1;

      $scope.records = [];
      $scope.isLoading = $scope.isScrollLoading = false;
    }

    function _getMentionList() {
      MentionsAPI.getMentionList(mentionListData)
        .success(function(data) {
          if (data) {
            _updateCursor(data);

            if (data.records && data.records.length) {
              _pushMentionList(data.records);
            }
          }
          $scope.isLoading = $scope.isScrollLoading = false;
        })
        .finally(function() {
          $scope.isMentionEmpty = $scope.records.length === 0;
        });
    }

    function _pushMentionList(records) {
      var i;
      var len;

      for (i = 0, len = records.length; i < len; i++) {
        $scope.records.push(records[i]);
      }
    }

    function _updateCursor(data) {
      if (data.record && data.record.length > 0) {
        mentionListData.messageId = data.records[data.records.length - 1].message.id;
      }

      isEndOfList = !data.hasMore;
    }
  }
})();
