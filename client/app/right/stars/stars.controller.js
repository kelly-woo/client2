/**
 * @fileoverview mentions controller
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('RightPanelStarsTabCtrl', RightPanelStarsTabCtrl);

  /* @ngInject */
  function RightPanelStarsTabCtrl($scope, $rootScope, $filter, fileAPIservice, MessageQuery, messageAPIservice,
                                accountService, AnalyticsHelper) {
    _init();

    // First function to be called.
    function _init() {
      $scope.starList = [];
    }
  }
})();
