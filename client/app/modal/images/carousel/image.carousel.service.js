/**
 * @fileoverview image carousel service
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('ImageCarousel', ImageCarousel);

  /* @ngInject */
  function ImageCarousel($rootScope, $state, $timeout, fileAPIservice, jndKeyCode) {
    var that = this;
    var entityId = parseInt($state.params.entityId);
    var MIN_WIDTH = 400;
    var MIN_HEIGHT = 400;

    var jqWindow;
    var jqModal;
    var jqViewerBody;
    var jqContent;

    var _pivot;
    var _next;
    var _prev;


    that.init = init;

    that.show = show;
    that.hide = hide;

    _.each(['prev', 'next'], function(value) {
      that[value] = (function(value) {
        var isPrev = value === '';
        return function() {

        };
      }(value));
    });

    function init(pivot, options) {
      var that = this;

      _pivot = pivot;
      _next = [];
      _prev = [];

      that.options = {
        // message id보다 오래되거나 새로운 목록 대상 또는 양방향 item get
        type: '',
        // 한번 get시 load할 image item 수
        count: 20,

        // image api
        getImage: null,

        onHide: function() {},
        onLookUp: function() {}
      };
      angular.extend(that.options, options);

      jqWindow = $(window);
      jqViewerBody = $('.viewer-body');
      jqContent = $('.content');

      $timeout(function() {
        jqModal = $('.image-carousel-modal').focus();

        _on();

        _load(that.pivot);
      });
    }

    function _on() {
      var keyHandlerMap = {};
      var resizeTimer;

      $timeout.cancel(resizeTimer);
      resizeTimer = $timeout(function() {
        jqWindow.on('resize.imageCarousel', function() {
          _rePosition();
        });
      }, 300);

      keyHandlerMap[jndKeyCode.keyCodeMap.ESC] = function() {
        that.hide();
      };
      keyHandlerMap[jndKeyCode.keyCodeMap.LEFT_ARROW] = function() {
        console.log('keydown prev :::');
        // that.prev();
      };
      keyHandlerMap[jndKeyCode.keyCodeMap.RIGHT_ARROW] = function() {
        console.log('keydown next :::');
        // that.next();
      };
      jqModal
        .on('keydown.imageCarousel', function(event) {
          var fn;
          event.preventDefault();
          event.stopPropagation();

          (fn = keyHandlerMap[event.which]) && fn();
        })
        .on('click.imageCarousel', function(event) {
          event.stopPropagation();

          event.target.className.indexOf('viewer-body') !== -1 && hide();
        });
    }


    function _load(pivot) {
      // carousel body의 position 초기화
      jqContent.css({marginLeft: MIN_WIDTH / 2 * -1, marginTop: MIN_HEIGHT / 2 * -1});

      that.options.onLookUp(pivot);

      jqContent.addClass('icon-loading loading');

      // loadImage 전역 변수
      loadImage(pivot.imageUrl, function(img) {
        jqContent.removeClass('icon-loading loading');

        if (img.type && img.type === 'error') {

        } else {
          // image의 size에 맞춰 carousel body를 repositioning
          _rePosition(img);

          jqContent.children('img').remove();
          jqContent.prepend(img);
        }
      });

      _getImage(
        function(data) {
          setStatus(data);
        },
        function() {

        }
      );
    }

    function setStatus(data) {
      var message;
      var i;

      if (data) {
        for (i = data.length; i > -1; --i) {
          message = data[i];

          if (message.id === _pivot.messageId) {

          }
        }
      }
    }

    function setButtonStatus(data) {
      var currentMessageId = that.options.messageId;
      var message;
      var i;

      var status = {
        hasPrev: false,
        hasNext: false
      };

      if (data) {
        for (i = data.length - 1; i > -1; --i) {
          message = data[i];
          if (message.id === currentMessageId) {
            break;
          }
        }

        i !== 0 && (status.hasPrev = true);
        i !== data.length - 1 && (status.hasNext = true);
      }

      // button 상태 변경
      that.options.onButtonStatusChange(status);
    }

    function _rePosition(img) {
      // image를 정중앙에 출력할때 필요로 하는 여백
      var margin = 56 * 2;
      var ratio = [];
      var maxWidth = jqViewerBody.width() - margin;
      var maxHeight = jqViewerBody.height() - margin;

      var imageWidth;
      var imageHeight;

      if (img) {
        img = $(img);

        imageWidth = img[0].getAttribute('width');
        imageHeight = img[0].getAttribute('height');

        img[0].removeAttribute('width');
        img[0].removeAttribute('height');
      } else {
        img = jqContent.children('img');

        imageWidth = img.width();
        imageHeight = img.height();
      }

      if (maxWidth < imageWidth || maxHeight < imageHeight) {
        // maxWidth, maxHeight 보다 imageWidth, imageHeight가 크다면 비율 조정 필요함.
        ratio = [maxWidth / imageWidth, maxHeight / imageHeight];
        ratio = Math.min(ratio[0], ratio[1]);
      } else {
        ratio = 1;
      }
      imageWidth = imageWidth * ratio;
      imageHeight = imageHeight * ratio;

      imageWidth < MIN_WIDTH && (imageWidth = MIN_WIDTH);
      imageHeight < MIN_HEIGHT && (imageHeight = MIN_HEIGHT);

      jqContent.css({marginLeft: imageWidth / 2 * -1, marginTop: imageHeight / 2 * -1});

      img.css({
        maxWidth: maxWidth,
        maxHeight: maxHeight
      });
    }

    function show() {
    }

    function hide() {
      $timeout(function() {
        that.options.onHide();
      });

      jqWindow.off('reisze.imageCarousel');
      jqModal.off('keydown.imageCarousel').off('click.imageCarousel');
    }

    function _getImage(success, error) {
      return that.options.getImage({
          roomId: that.options.roomId,
          messageId: that.options.messageId,
          // type: null,
          count: that.options.count,
          q: that.options.keyword,
          writerId:that.options.writerId
        })
        .success(function(data) {
          success(data);
        })
        .error(function(err) {
          error(err);
        });
    }
  }
}());
