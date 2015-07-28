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
                                accountService, AnalyticsHelper) {
    _init();

    // First function to be called.
    function _init() {
      $scope.mentionList = [];
    }
  }
})();
