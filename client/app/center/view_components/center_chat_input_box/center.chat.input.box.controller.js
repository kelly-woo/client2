/**
 * @fileoverview center chat input controller
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('CenterChatInputBoxCtrl', CenterChatInputBoxCtrl);

  /* @ngInject */
  function CenterChatInputBoxCtrl($scope, Mentionahead) {
    _init();

    /**
     * init
     * @private
     */
    function _init() {
      $scope.mentionahead = {
        status: Mentionahead.CLOSE,
        list: []
      };
    }
  }
})();
