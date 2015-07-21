/**
 * @fileoverview C패널 헤더 디렉티브
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('tutorialEntityHeader', tutorialEntityHeader);

  function tutorialEntityHeader() {
    return {
      link: link,
      scope: false,
      replace: true,
      templateUrl: 'app/tutorial/popup/view_components/entity_header/tutorial.entity.header.html',
      controller: 'tutorialEntityHeaderCtrl',
      restrict: 'E'
    };

    function link(scope, element, attrs) {
    }
  }
})();
