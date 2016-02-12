/**
 * @fileoverview image carousel list directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('imageCarouselList', imageCarouselList);

  function imageCarouselList($timeout, Viewport, ListRenderer, jndKeyCode, jndPubSub) {
    return {
      restrict: 'E',
      link: link
    };

    function link(scope, el, attrs) {
      var jqWindow = $(window);
      var jqModal = $('.image-carousel-modal').focus();

      var timerResize;

      _init();

      function _init() {
        _attachEvents();
      }

      function _attachEvents() {
        // window reisze event handling
        jqWindow.on('resize.imageCarousel', _onWindowResize);
        jqModal
          .on('keydown.imageCarousel', _onKeyDown)
          .on('click.imageCarousel', 'button', _onNavButtonClick)
          .on('click.imageCarousel', '.viewer-body', _onViewBodyClick)
          .on('mouseleave.imageCarousel', '.image-item', _onMouseLeave)
          .on('mousemove.imageCarousel', '.image-item', _onMouseMove);

        scope.$destroy(_onDestroy);
      }

      function _onWindowResize() {
        $timeout.cancel(timerResize);
        timerResize = $timeout(function() {
          resetPosition();
        }, 50);
      }

      function _onKeyDown(event) {
        var keyCode = event.keyCode;

        event.preventDefault();
        event.stopPropagation();

        if (jndKeyCode.match('ESC', keyCode)) {
          //close();
        } else if (jndKeyCode.match('LEFT_ARROW', keyCode)) {
          //prev();
        } else if (jndKeyCode.match('RIGHT_ARROW', keyCode)) {
          //next();
        }
      }

      function _onNavButtonClick(event) {
        var currentTarget = event.currentTarget;
        event.stopPropagation();

        currentTarget.className.indexOf(PREV) > -1 ? slide.prev() : slide.next();
      }

      function _onViewBodyClick(event) {
        event.stopPropagation();

        event.currentTarget === event.target && close();
      }

      function _onMouseLeave(event) {
        event.stopPropagation();

        // 하단에 file 정보를 숨김
        $(event.currentTarget).children('.image-item-footer').css('opacity', 0);
      }

      function _onMouseMove(event) {
        event.stopPropagation();

        // 하단에 file 정보를 출력
        $(event.currentTarget).children('.image-item-footer').css('opacity', 1);
      }

      function _onDestroy() {
        // window reisze event handling
        jqWindow.off('resize.imageCarousel');
        jqModal
          .off('keydown.imageCarousel')
          .off('click.imageCarousel')
          .off('click.imageCarousel')
          .off('mouseleave.imageCarousel')
          .off('mousemove.imageCarousel');
      }

      function resetPosition() {
        //var jqImageItem;
        //
        //if (that.options.messageId != null && (jqImageItem = imageMap[that.options.messageId].jqElement)) {
        //  //_setPosition(jqImageItem);
        //}
      }
    }
  }
})();
