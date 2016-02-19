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
      var _jqWindow = $(window);
      var _jqModal;
      var _jqImageList;

      var _jqPrevBtn;
      var _jqNextBtn;

      var _prevLoadedItems = [];

      var _timerResize;
      var _timerImageLoad;

      var _lockerMore;

      _init();

      /**
       * init
       * @private
       */
      function _init() {
        $timeout(function() {
          // dom rendering이 완료된 후 _jqModal, _jqImageList, _jqPrevBtn, _jqNextBtn 돔을 선택하기 위함

          _jqModal = $('.image-carousel-modal').focus();

          _jqImageList = el.find('.image-list');

          _jqPrevBtn = el.find('#viewer_prev_btn');
          _jqNextBtn = el.find('#viewer_next_btn');

          // 최초 image item 추가
          scope.pushImage('init', scope.pivot);

          // 최초 image item 기준으로 출력해야할 image list get
          scope.getList('init', scope.pivot, function() {
            // image list get 후 prev, next button 상태 변경
            _setButtonStatus();
          });

          // 최초 image item 출력
          _show(scope.pivot);

          _attachScopeEvents();
          _attachDOMEvents();
        });
      }

      /**
       * attach scope events
       * @private
       */
      function _attachScopeEvents() {
        scope.$on('$destroy', _onDestroy);
      }

      /**
       * attach dom events
       * @private
       */
      function _attachDOMEvents() {
        // window reisze event handling
        _jqWindow.on('resize.imageCarousel', _onWindowResize);
        _jqModal
          .on('keydown.imageCarousel', _onKeyDown)
          .on('click.imageCarousel', 'button', _onNavButtonClick)
          .on('click.imageCarousel', '.viewer-body', _onViewBodyClick)
          .on('mouseleave.imageCarousel', '.image-item', _onMouseLeave)
          .on('mousemove.imageCarousel', '.image-item', _onMouseMove);
      }

      /**
       * detach dom events
       * @private
       */
      function _detachDOMEvents() {
        // window reisze event handling
        _jqWindow.off('resize.imageCarousel');
        _jqModal
          .off('keydown.imageCarousel')
          .off('click.imageCarousel')
          .off('click.imageCarousel')
          .off('mouseleave.imageCarousel')
          .off('mousemove.imageCarousel');
      }

      /**
       * window resize event handler
       * @private
       */
      function _onWindowResize() {
        $timeout.cancel(_timerResize);
        _timerResize = $timeout(function() {
          resetPosition();
        }, 50);
      }

      /**
       * key down event handler
       * @param {object} evt
       * @private
       */
      function _onKeyDown(evt) {
        var keyCode = evt.keyCode;

        // image carousel에서 발생한 key down 이벤트 처리가 parents 전달되어 다른 component에 영향을 미치지 않도록 방지
        evt.preventDefault();
        evt.stopPropagation();

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
       * @param {object} evt
       * @private
       */
      function _onNavButtonClick(evt) {
        var currentTarget = evt.currentTarget;
        evt.stopPropagation();

        currentTarget.className.indexOf('prev') > -1 ? _navigation('prev') : _navigation('next');
      }

      /**
       * view body click evt handler
       * @param {object} evt
       * @private
       */
      function _onViewBodyClick(evt) {
        // image carousel에서 발생한 click 이벤트 처리가 parents 전달되어 modal 닫힘
        evt.stopPropagation();

        if (evt.currentTarget === evt.target) {
          JndUtil.safeApply(scope, function () {
            scope.close();
          });
        }
      }

      /**
       * mouse leave event handler
       * @param {object} evt
       * @private
       */
      function _onMouseLeave(evt) {
        evt.stopPropagation();

        // 하단에 file 정보를 숨김
        $(evt.currentTarget).children('.image-item-footer').css('opacity', 0);
      }

      /**
       * mouse move event handler
       * @param {object} evt
       * @private
       */
      function _onMouseMove(evt) {
        evt.stopPropagation();

        // 하단에 file 정보를 출력
        $(evt.currentTarget).children('.image-item-footer').css('opacity', 1);
      }

      /**
       * scope destroy event handler
       * @private
       */
      function _onDestroy() {
        _detachDOMEvents();
      }

      /**
       * reset position
       */
      function resetPosition() {
        var jqImageItem;

        if (scope.pivot &&
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

        scope.imageList[pivotIndex - 1] == null ? _jqPrevBtn.removeClass('has-prev') : _jqPrevBtn.addClass('has-prev');
        scope.imageList[pivotIndex + 1] == null ? _jqNextBtn.removeClass('has-next') : _jqNextBtn.addClass('has-next');
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

        _jqImageList.append($imageCarouselItem);

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
          _jqPrevBtn.focus();
        } else {
          offset = 1;
          _jqNextBtn.focus();
        }

        // 다음 출력 해야할 image item의 index를 얻음
        index = scope.imageList.indexOf(currentMessageId) + offset;

        // getList를 호출하여 imageList에 추가된 image item 이라면
        // imageMap에 해당 image item의 정보가 있음
        if (index > -1 && scope.imageList[index] != null) {
          scope.pivot = scope.imageMap[scope.imageList[index]];

          // image list에서 이동시 마다 _load를 호출하여
          // image를 출력하는 canvas element 생성을 방지하기 위해서 timeout 사용
          if (_timerImageLoad != null) {
            $timeout.cancel(_timerImageLoad);
            _timerImageLoad = null;
          }

          _timerImageLoad = $timeout((function(type, index, offset) {
            return function() {
              var prevLoadedItem;

              // 이전 image item이 출력되어 있다면 숨김
              while(prevLoadedItem = _prevLoadedItems.pop()) {
                if (prevLoadedItem != null && scope.imageMap[prevLoadedItem].jqElement) {
                  scope.imageMap[prevLoadedItem].jqElement.hide().children('.image-item-footer').css('opacity', 0);
                }
              }

              // image item을 출력함
              _show(scope.pivot);

              _setMoreStatus(type, index, offset);
            };
          }(type, index, offset)) , _timerImageLoad == null ? 0 : 500);
          _prevLoadedItems.push(currentMessageId);
        }
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
        if (_isMore(index, offset) && !_lockerMore) {
          // getList transaction begin
          _lockerMore = true;

          scope.getList(type, scope.pivot, function() {
            _setButtonStatus();

            // getList transaction end
            _lockerMore = false;
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
