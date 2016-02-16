/**
 * @fileoverview image carousel list directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('imageCarousel', imageCarousel);

  function imageCarousel($rootScope, $compile, $timeout, JndUtil, jndKeyCode, ImageCarousel) {
    var imageCarouselItemTpl = '<image-carousel-item></image-carousel-item>';

    return {
      restrict: 'A',
      link: link
    };

    function link(scope, el) {
      var jqWindow = $(window);
      var jqModal;
      var jqImageList;

      var jqPrevBtn;
      var jqNextBtn;

      var prevLoadedItems = [];

      var timerResize;
      var timerImageLoad;

      var lockerMore;

      _init();

      /**
       * init
       * @private
       */
      function _init() {
        $timeout(function() {
          jqModal = $('.image-carousel-modal').focus();

          jqImageList = el.find('.image-list');

          jqPrevBtn = el.find('#viewer_prev_btn');
          jqNextBtn = el.find('#viewer_next_btn');

          // 최초 image item 추가
          scope.pushImage('init', scope.pivot);

          // 최초 image item 기준으로 출력해야할 image list get
          scope.getList('init', scope.pivot, function() {
            // image list get 후 prev, next button 상태 변경
            _setButtonStatus();
          });

          // 최초 image item 출력
          _show(scope.pivot);
          _attachEvents();
        });
      }

      /**
       * attach events
       * @private
       */
      function _attachEvents() {
        // window reisze event handling
        jqWindow.on('resize.imageCarousel', _onWindowResize);
        jqModal
          .on('keydown.imageCarousel', _onKeyDown)
          .on('click.imageCarousel', 'button', _onNavButtonClick)
          .on('click.imageCarousel', '.viewer-body', _onViewBodyClick)
          .on('mouseleave.imageCarousel', '.image-item', _onMouseLeave)
          .on('mousemove.imageCarousel', '.image-item', _onMouseMove);

        scope.$on('$destroy', _onDestroy);
      }

      /**
       * window resize event handler
       * @private
       */
      function _onWindowResize() {
        $timeout.cancel(timerResize);
        timerResize = $timeout(function() {
          resetPosition();
        }, 50);
      }

      /**
       * key down event handler
       * @param {object} event
       * @private
       */
      function _onKeyDown(event) {
        var keyCode = event.keyCode;

        event.preventDefault();
        event.stopPropagation();

        if (jndKeyCode.match('ESC', keyCode)) {
          JndUtil.safeApply(scope, function() {
            scope.close();
          });
        } else if (jndKeyCode.match('LEFT_ARROW', keyCode)) {
          _navigation('prev');
        } else if (jndKeyCode.match('RIGHT_ARROW', keyCode)) {
          _navigation('next');
        }
      }

      /**
       * nav button click event handler
       * @param {object} event
       * @private
       */
      function _onNavButtonClick(event) {
        var currentTarget = event.currentTarget;
        event.stopPropagation();

        currentTarget.className.indexOf('prev') > -1 ? _navigation('prev') : _navigation('next');
      }

      /**
       * view body click event handler
       * @param {object} event
       * @private
       */
      function _onViewBodyClick(event) {
        event.stopPropagation();

        if (event.currentTarget === event.target) {
          JndUtil.safeApply(scope, function () {
            scope.close();
          });
        }
      }

      /**
       * mouse leave event handler
       * @param {object}event
       * @private
       */
      function _onMouseLeave(event) {
        event.stopPropagation();

        // 하단에 file 정보를 숨김
        $(event.currentTarget).children('.image-item-footer').css('opacity', 0);
      }

      /**
       * mouse move event handler
       * @param event
       * @private
       */
      function _onMouseMove(event) {
        event.stopPropagation();

        // 하단에 file 정보를 출력
        $(event.currentTarget).children('.image-item-footer').css('opacity', 1);
      }

      /**
       * scope destroy event handler
       * @private
       */
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

      /**
       * reset position
       */
      function resetPosition() {
        var jqImageItem;

        if (scope.pivot && scope.pivot.messageId != null &&
          (jqImageItem = scope.imageMap[scope.pivot.messageId].jqElement)) {
          ImageCarousel.setPosition(jqImageItem, scope.pivot);
        }
      }

      /**
       * image carousel button 상태 설정
       * @private
       */
      function _setButtonStatus() {
        var pivotIndex = scope.imageList.indexOf(scope.pivot.messageId);

        scope.imageList[pivotIndex - 1] != null ? jqPrevBtn.addClass('has-prev') : jqPrevBtn.removeClass('has-prev');
        scope.imageList[pivotIndex + 1] != null ? jqNextBtn.addClass('has-next') : jqNextBtn.removeClass('has-next');
      }

      /**
       * image item을 출력하거나 image item element를 만듬
       * @param {number} currMessageId - 출력할 image item의 id
       * @param {object} imageItem
       * @private
       */
      function _show(imageItem) {
        var jqImageItem;

        if (jqImageItem = imageItem.jqElement) {
          // 이미 생성된 image item element가 존재한다면 바로 출력
          jqImageItem.show();
          ImageCarousel.setPosition(jqImageItem, imageItem);
        } else {
          // 생성된 image item element가 존재하지 않는다면 생성함
          _createImageElement(imageItem);
        }
      }

      /**
       * create image element
       * @param {object} imageItem
       * @private
       */
      function _createImageElement(imageItem) {
        var imageCarouselItemEl = angular.element(imageCarouselItemTpl);
        var $scope = $rootScope.$new(true);
        var $imageCarouselItem;

        $scope.imageItem = imageItem;
        imageCarouselItemEl.attr({
          'item': 'imageItem'
        });

        $imageCarouselItem = $compile(imageCarouselItemEl)($scope);

        jqImageList.append($imageCarouselItem);

        // jqImageItem cashing
        imageItem.jqElement = $imageCarouselItem;
      }

      /**
       * carousel navigation
       * @param {string} type
       * @private
       */
      function _navigation(type) {
        var currentMessageId = scope.pivot.messageId;
        var index;
        var offset;

        if (type === 'prev') {
          offset = -1;
          jqPrevBtn.focus();
        } else {
          offset = 1;
          jqNextBtn.focus();
        }

        // 다음 출력 해야할 image item의 index를 얻음
        index = scope.imageList.indexOf(currentMessageId) + offset;

        // getList를 호출하여 imageList에 추가된 image item 이라면
        // imageMap에 해당 image item의 정보가 있음
        if (index > -1 && scope.imageList[index] != null) {
          scope.pivot = scope.imageMap[scope.imageList[index]];

          // image list에서 이동시 마다 _load를 호출하여
          // image를 출력하는 canvas element 생성을 방지하기 위해서 timeout 사용
          if (timerImageLoad != null) {
            $timeout.cancel(timerImageLoad);
            timerImageLoad = null;
          }

          timerImageLoad = $timeout(function() {
            var prevLoadedItem;

            // 이전 image item이 출력되어 있다면 숨김
            while(prevLoadedItem = prevLoadedItems.pop()) {
              if (prevLoadedItem != null && scope.imageMap[prevLoadedItem].jqElement) {
                scope.imageMap[prevLoadedItem].jqElement.hide().children('.image-item-footer').css('opacity', 0);
              }
            }

            // image item을 출력함
            _show(scope.pivot);
          }, timerImageLoad == null ? 0 : 500);
          prevLoadedItems.push(currentMessageId);
        }

        _setMoreStatus(type, index, offset);
      }

      /**
       * set more status
       * @param {string} type
       * @param {number} index
       * @param {number} offset
       * @private
       */
      function _setMoreStatus(type, index, offset) {
        // getList를 호출하여 server에서 image list를 얻어와야 하는지 여부 확인
        if (_isMore(index, offset) && !lockerMore) {
          // getList transaction begin
          lockerMore = true;

          scope.getList(type, scope.pivot, function() {
            var messageId = scope.pivot.messageId;
            var index = scope.imageList.indexOf(messageId);

            if (index === 0 || index === scope.imageList.length - 1) {
              _setButtonStatus();
            }

            // getList transaction end
            lockerMore = false;
          });
        }

        // 출력할 image item 이동 후 prev, next button 상태 설정
        _setButtonStatus();
      }

      /**
       * server로 부터 image list를 요청해야 하는지 여부
       * @param {number} index - 현재 출력된 image item의 image list상 index
       * @param {number} offset - next, prev 방향에 따라 달라지는 offset
       * @returns {boolean}
       * @private
       */
      function _isMore(index, offset) {
        return (offset === -1 ? index : (scope.imageList.length + index * -1)) < 4;
      }
    }
  }
})();
