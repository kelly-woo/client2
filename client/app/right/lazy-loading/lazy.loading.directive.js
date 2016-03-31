/**
 * @fileoverview lazy loading directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('lazyLoading', lazyLoading);

  function lazyLoading($position, $timeout) {
    return {
      restrict: 'A',
      controller: 'LazyLoadingCtrl',
      link: link
    };

    function link(scope, el, attrs) {
      var _list = el.find('.lazy-loading-list');
      var _jqLazyImages = el.find('.lazy-image');

      console.log('lazy loading ::: ', _jqLazyImages);

      _init();

      function _init() {
        $timeout(function () {
          var _jqLazyImages = el.find('.lazy-image');

          console.log('jq lazy images ::: ', _jqLazyImages);
        }, 0, false);
        _attachDomEvents();
      }

      function _attachDomEvents() {
        el.on('mousewheel', _onMouseWheel);
        el.on('scroll', _onScroll);
      }

      function _onMouseWheel() {
        if (!scope.isScrollLoading) {
          if (_list.height() <= el.height()) {
            scope.$apply(attrs.lazyLoading);
          }
        }
      }

      function _onScroll() {
        var elementHeight;
        var currentScrollPosition;

        if (!scope.isScrollLoading) {
          elementHeight = _list.height();
          currentScrollPosition = el.scrollTop() + el.height();

          if (elementHeight - currentScrollPosition < 20) {
            scope.$apply(attrs.lazyLoading);
          }
        }

        var _jqLazyImages = el.find('.lazy-image');

        _.each(_jqLazyImages, function (image) {
          var jqImage = $(image);
          _isImageInViewport(jqImage);
          //console.log('is image in viewport ::: ', _isImageInViewport(jqImage), image);
          jqImage.removeClass('lazy-image');
        });
      }

      function _isImageInViewport(image) {
        var containerOffset = $position.offset(el);
        var imageTop = $position.offset(image).top;

        //console.log('image in viewport :: ', containerOffset.top , containerOffset.height , imageTop, image);
        return imageTop > 0 && containerOffset.top + containerOffset.height > imageTop;
      }
    }
  }
})();
