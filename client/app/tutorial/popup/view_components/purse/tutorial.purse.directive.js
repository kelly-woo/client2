/**
 * @fileoverview 튜토리얼 purse 버튼 디렉티브
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('tutorialPurse', tutorialPurse);

  function tutorialPurse() {
    return {
      link: link,
      scope: {
        options: '=options'
      },
      controller: 'tutorialPurseCtrl',
      templateUrl: 'app/tutorial/popup/view_components/purse/tutorial.purse.html',
      restrict: 'E'
    };

    function link(scope, element, attrs) {
    }
  }
})();
