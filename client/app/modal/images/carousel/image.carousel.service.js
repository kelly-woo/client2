/**
 * @fileoverview image carousel service
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('ImageCarousel', ImageCarousel);

  /* @ngInject */
  function ImageCarousel($timeout, Preloader, jndKeyCode, config) {
    var that = this;

    var MIN_WIDTH = 400;
    var MIN_HEIGHT = 400;

    var INIT = 'init';
    var PREV = 'prev';
    var NEXT = 'next';

    var jqWindow;
    var jqModal;
    var jqViewerBody;
    var jqContent;
    var jqContentDescription;
    var jqPrevBtn;
    var jqNextBtn;

    var timerImageLoad;

    var _pivot;
    var _imageList;
    var _imageMap;

    that.init = init;
    that.hide = hide;
    _.each([PREV, NEXT], function(value) {
      that[value] = (function(value) {
        var offset = value === PREV ? -1 : 1;
        return function() {
          var currentMessageId = that.options.messageId;
          var messageId;
          var index;

          // button focus
          value === PREV ? jqPrevBtn.focus() : jqNextBtn.focus();

          index = _imageList.indexOf(currentMessageId) + offset;

          if (index > -1 && _imageList[index] != null) {
            that.options.messageId = messageId = _imageList[index];

            if (timerImageLoad != null) {
              $timeout.cancel(timerImageLoad);
              timerImageLoad = null;
            }

            timerImageLoad = $timeout(function() {
              _load(messageId, _imageMap[messageId]);
            }, timerImageLoad == null ? 0 : 500);
          }

          _setButtonStatus();

          if (_isMore(index)) {
            _getList(value, function(data) {
              var messageId = that.options.messageId;
              var index = _imageList.indexOf(messageId) + offset;

              if (data.hasEndPoint) {
                _setButtonStatus();
              }
            });
          }
        };
      }(value));
    });

    function init(pivot, options) {
      var that = this;

      _pivot = pivot;
      _imageList = [];
      _imageMap = {};

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
      jqContentDescription = jqContent.children('.content-footer');

      jqPrevBtn = $('#viewer_prev_btn');
      jqNextBtn = $('#viewer_next_btn');

      $timeout(function() {
        jqModal = $('.image-carousel-modal').focus();

        _on();

        _getList(INIT, function() {
          _setButtonStatus();
        });

        _load(that.options.messageId, _pivot);
      });
    }

    function _on() {
      var keyHandlerMap = {};
      var timerResize;

      $timeout.cancel(timerResize);
      timerResize = $timeout(function() {
        jqWindow.on('resize.imageCarousel', function() {
          _rePosition();
        });
      }, 300);

      keyHandlerMap[jndKeyCode.keyCodeMap.ESC] = function() {
        that.hide();
      };
      keyHandlerMap[jndKeyCode.keyCodeMap.LEFT_ARROW] = function() {
        that.prev();
      };
      keyHandlerMap[jndKeyCode.keyCodeMap.RIGHT_ARROW] = function() {
        that.next();
      };
      jqModal
        .on('keydown.imageCarousel', function(event) {
          var fn;
          event.preventDefault();
          event.stopPropagation();

          (fn = keyHandlerMap[event.which]) && fn();
        })
        .on('click.imageCarousel', 'button', function(event) {
          var currentTarget = event.currentTarget;
          event.stopPropagation();

          if (currentTarget.className.indexOf(PREV) > -1) {
            // prev
            that.prev();
          } else {
            // next
            that.next();
          }
        })
        .on('click.imageCarousel', '.viewer-body', function(event) {
          event.stopPropagation();

          event.target.className.indexOf('viewer-body') > -1 && hide();
        });
      jqContent
        .on('mouseleave', function() {
          jqContentDescription.css('opacity', 0);
        })
        .on('mouseenter', function() {
          jqContentDescription.css('opacity', 1);
        })
        .on('mouseover', function() {
          jqContentDescription.css('opacity', 1);
        });
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

    function hide() {
      $timeout(function() {
        that.options.onHide();
      });

      jqWindow.off('reisze.imageCarousel');
      jqModal.off('keydown.imageCarousel').off('click.imageCarousel');
    }

    function _getList(type, success) {
      var searchType = undefined;
      var count = that.options.count;

      if (type !== INIT) {
        // messageId 보다 오래된/새로운 목록 대상
        searchType = type === PREV ? 'old' : 'new';
        count = Math.ceil(count / 2);
      }

      return that.options.getImage({
          roomId: that.options.roomId,
          messageId: that.options.messageId,
          type: null,
          count: that.options.count,
          q: that.options.keyword,
          writerId:that.options.writerId
        })
        .success(function(data) {
          data.records != null && (data = data.records);

          var index = _imageList.indexOf(that.options.messageId);
          var hasEndPoint = false;
          if (index === 0 || index === _imageList.length - 1) {
            hasEndPoint = true;
          }

          _pushImages(type, data);
          success && success({
            hasEndPoint: hasEndPoint
          });
        })
        .error(function(err) {
        });
    }

    function _pushImages(type, data) {
      var message;
      var i;

      if (data) {
        for (i = 0; message = data[i++];) {
          _pushItem(type, message.id, {
            userName: message.writer.name,
            uploadDate: message.createTime,
            fileTitle: message.content.title,
            fileUrl: message.content.fileUrl
          });
        }
      }
    }

    function _pushItem(type, messageId, data) {
      if (_imageList.indexOf(messageId) < 0) {
        if (type === INIT) {
          _imageList.push(messageId);
        } else {
          type === PREV ? _imageList.unshift(messageId) : _imageList.push(messageId);
        }

        _imageMap[messageId] = data;

        // $(that.options.preloadContainer).append('<img src="' + config.server_uploaded + data.fileUrl + '" style="width: 1px; height: 1px; visibility: false">');
      }
    }

    function _isMore(index) {
      var half = Math.ceil(that.options.count / 2);

      return index / half < 0.5;
    }

    function _load(messageId, pivot) {
      var fullFileUrl = config.server_uploaded + pivot.fileUrl;

      // carousel body의 position 초기화
      jqContent.children('img').remove();
      jqContent.css({marginLeft: MIN_WIDTH / 2 * -1, marginTop: MIN_HEIGHT / 2 * -1});

      that.options.onLookUp(pivot);
      that.options.messageId = messageId;

      jqContent.addClass('icon-loading loading');

      // loadImage 전역 변수
      loadImage(fullFileUrl, function(img) {
        // loadImage 호출시 img가 남아 있음
        jqContent.children('img').remove();

        // loadImage의 callback이 연속적으로 발생했을때 callback을 수행해야 하는 img 제어
        if (img.type && img.type === 'error') {
          // file이 존재하지 않음
          jqContent.removeClass('icon-loading loading');
          jqContent.prepend('<img src="assets/images/img-error-404.png" style="opacity: 1;" />');
        } else if (img.src === fullFileUrl) {
          jqContent.removeClass('icon-loading loading');

          // image의 size에 맞춰 carousel body를 repositioning
          _rePosition(img);

          jqContent.prepend(img);

          $(img).css('opacity', 1);
        }
      });
    }

    function _setButtonStatus() {
      var pivotIndex = _imageList.indexOf(that.options.messageId);

      that.options.onButtonStatus({
        hasPrev: _imageList[pivotIndex - 1] != null,
        hasNext: _imageList[pivotIndex + 1] != null
      });
    }
  }
}());
