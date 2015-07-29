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

    _init();

    // First function to be called.
    function _init() {
      $scope.records = [];

      _getMentionList();
    }

    function _getMentionList() {
      MentionsAPI.getMentionList(mentionListData)
        .success(function(data) {

          if (data) {
            _updatePage(data.cursor);

            if (data.records && data.records.length) {
              $scope.records = data.records;
            } else {
              // empty

              $scope.records = [];
            }
          }


          console.log('mentions ::: ', data);
        });
    }

    function _updatePage(cursor) {
      mentionListData.page = cursor.page + 1;
    }
  }
})();
