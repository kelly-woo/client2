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

    $scope.$on('onRightPanel', function($event, data) {
      if (data.type === 'mentions') {
        isActivated = true;

        _initMentionListData();
        _initGetMentionList();
      } else {
        isActivated = false;
      }
    });

    function loadMore() {
      if (!($scope.isScrollLoading || $scope.isEndOfList)) {
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
      mentionListData.messageId = null;

      $scope.records = [];
      $scope.isEndOfList = $scope.isLoading = $scope.isScrollLoading = false;
    }

    function _getMentionList() {
      MentionsAPI.getMentionList(mentionListData)
        .success(function(data) {
          if (data) {
            if (data.records && data.records.length) {
              _pushMentionList(data.records);
            }

            _updateCursor(data);
          }
        })
        .finally(function() {
          $scope.isMentionEmpty = $scope.records.length === 0;
          $scope.isLoading = $scope.isScrollLoading = false;
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
      if (data.records && data.records.length > 0) {
        mentionListData.messageId = data.records[data.records.length - 1].message.id;
      }

      if ($scope.records && $scope.records.length > 0 ) {
        $scope.isEndOfList = !data.hasMore;
      }
    }
  }
})();
