(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('onImageLoad', onImageLoad);

  function onImageLoad() {
    return {
      restrict: 'A',
      link: function(scope, el, attr) {
        el.bind('load', function () {
          if (attr.onImageLoadOpacParent) {
            el.parent().css('opacity', 1);
          } else {
            el.css('opacity', 1);
          }
        });
      }
    };
  }

})();
