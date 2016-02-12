/**
 * @fileoverview image carousel item directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('imageCarouselItem', imageCarouselItem);

  function imageCarouselItem($timeout, Viewport, ListRenderer, jndKeyCode, jndPubSub) {
    return {
      restrict: 'E',
      link: link
    };

    function link(scope, el, attrs) {

    }
  }
})();
