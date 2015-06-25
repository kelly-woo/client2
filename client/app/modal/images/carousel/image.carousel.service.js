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

    that.init = init;

    that.show = show;
    that.hide = hide;

    _.each(['prev', 'next'], function(value) {
      that[value] = (function(value) {
        var isPrev = value === '';
        return function(messageId) {
          var that = this;
          var options = angular.extend({
            listCount: isPrev ? 1 : -1,
            sharedEntityId: that.options.sharedEntityId || entityId,
            keyword: that.options.keyword || '',

            startMessageId: messageId
          }, that.options);

          fileAPIservice
            .getFileList(options)
            .success(function(files) {
              console.log('get a files ::: ', files);
            })
            .error(function() {
              console.log('error for files ::: ');
            });
        };
      }(value));
    });

    function init(options) {
      var that = this;

      that.options = {
        pivot: {},  // 기준 message

        fileType: 'image',
        keyword: '',
        searchType: 'file',
        writerId: 'all',

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

        _load(that.options.pivot);
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

    function pivot(messageId) {
      var that = this;
      var options = that.options;

      var nextOptions = angular.extend({listCount: 1, sharedEntityId: entityId, startMessageId: messageId}, options);
      var prevOptions = angular.extend({listCount: -1, sharedEntityId: entityId, startMessageId: messageId}, options);

      // that.images = {
      //   prev: {},
      //   curr: {},
      //   next: {}
      // };
      $.when(fileAPIservice.getFileList(nextOptions), fileAPIservice.getFileList(prevOptions)).then(function(next, prev) {
        next.success(function(data) {
          console.log('next ::: ', data);
        });

        prev.success(function(data) {
          console.log('prev ::: ', data);
        });
      });
    }

    function _load(pivot) {
      jqContent.css({marginLeft: MIN_WIDTH / 2 * -1, marginTop: MIN_HEIGHT / 2 * -1});

      that.options.onLookUp(pivot);

      jqContent.addClass('icon-loading loading');
      loadImage(pivot.imageUrl, function(img) {
        jqContent.removeClass('icon-loading loading');

        if (img.type && img.type === 'error') {

        } else {
          _rePosition(img);

          jqContent.children('img').remove();
          jqContent.prepend(img);
        }
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

    function show() {
    }

    function hide() {
      $timeout(function() {
        that.options.onHide();
      });

      jqWindow.off('reisze.imageCarousel');
      jqModal.off('keydown.imageCarousel').off('click.imageCarousel');
    }
  }
}());
