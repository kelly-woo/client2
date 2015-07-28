/**
 * @fileoverview mentions controller
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('RightPanelMentionsTabCtrl', RightPanelMentionsTabCtrl);

  /* @ngInject */
  function RightPanelMentionsTabCtrl($scope, $rootScope, $filter, fileAPIservice, MessageQuery, messageAPIservice,
                                accountService, MentionsAPI) {
    _init();

    // First function to be called.
    function _init() {
      $scope.mentionList = [];

      MentionsAPI.getMentionList()
        .success(function(data) {
          console.log('mention list ::: ', data);
        })
    }
  }
})();
