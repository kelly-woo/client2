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
    _init();

    // First function to be called.
    function _init() {
      $scope.records = [];

      _getMentionList();
    }

    function _getMentionList() {
      MentionsAPI.getMentionList()
        .success(function(data) {
          if (data && data.records && data.records.length) {
            $scope.records = data.records;
          } else {
            // empty

            $scope.records = [];
          }

          console.log('mentions ::: ', data);
        });
    }
  }
})();
