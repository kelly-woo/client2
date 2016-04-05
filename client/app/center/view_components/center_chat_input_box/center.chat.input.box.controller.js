/**
 * @fileoverview center chat input controller
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('CenterChatInputBoxCtrl', CenterChatInputBoxCtrl);

  /* @ngInject */
  function CenterChatInputBoxCtrl($scope) {
    _init();

    /**
     * init
     * @private
     */
    function _init() {
      $scope.mentionahead = {
        isOpen: false,
        list: []
      };
    }
  }
})();
