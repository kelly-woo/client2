/**
 * @fileoverview file detail comment input controller
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('FileDetailCommentInputCtrl', FileDetailCommentInputCtrl);

  /* @ngInject */
  function FileDetailCommentInputCtrl($scope, Mentionahead) {
    _init();

    /**
     * init
     * @private
     */
    function _init() {
      $scope.mentionahead = {
        isOpen: Mentionahead.CLOSE,
        list: []
      };
    }
  }
})();
