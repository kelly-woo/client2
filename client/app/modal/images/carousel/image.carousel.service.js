/**
 * @fileoverview image carousel service
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('ImageCarousel', ImageCarousel);

  /* @ngInject */
  function ImageCarousel($rootScope, $compile, $timeout, Preloader, jndKeyCode, config) {
    var that = this;

    var MIN_WIDTH = 400;
    var MIN_HEIGHT = 400;

    var INIT = 'init';
    var PREV = 'prev';
    var NEXT = 'next';

    var jqWindow;
    var jqModal;
    var jqViewerBody;
    var jqImageList;

    var jqPrevBtn;
    var jqNextBtn;

    var timerImageLoad;

    var lockerGetList;

    var pivot;
    var imageList;
    var imageMap;

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

          index = imageList.indexOf(currentMessageId) + offset;

          if (index > -1 && imageList[index] != null) {
            that.options.messageId = messageId = imageList[index];

            if (currentMessageId != null) {
              imageMap[currentMessageId].jqElement && imageMap[currentMessageId].jqElement.hide();
            }

            if (timerImageLoad != null) {
              $timeout.cancel(timerImageLoad);
              timerImageLoad = null;
            }

            timerImageLoad = $timeout((function(messageId) {
              return function() {
                _load(messageId, imageMap[messageId]);
              };
            }(messageId)), timerImageLoad == null ? 0 : 500);
          }

          _setButtonStatus();

          if (_isMore(index, offset) && !lockerGetList) {
            // getList transaction begin
            lockerGetList = true;

            _getList(value, function(data) {
              var messageId = that.options.messageId;
              var index = imageList.indexOf(messageId) + offset;

              if (data.hasEndPoint) {
                _setButtonStatus();
              }

              // getList transaction end
              lockerGetList = false;
            });
          }
        };
      }(value));
    });

    function init(target, options) {
      var that = this;

      pivot = target;
      imageList = [];
      imageMap = {};

      that.options = {
        // message id보다 오래되거나 새로운 목록 대상 또는 양방향 item get
        type: '',
        // 한번 get시 load할 image item 수
        count: 20,

        // image api
        getImage: null,

        onHide: function() {}
      };
      angular.extend(that.options, options);

      jqWindow = $(window);
      jqViewerBody = $('.viewer-body');
      jqImageList = $('.image-list');

      jqPrevBtn = $('#viewer_prev_btn');
      jqNextBtn = $('#viewer_next_btn');

      $timeout(function() {
        jqModal = $('.image-carousel-modal').focus();

        _on();

        _pushImage(INIT, that.options.messageId, pivot);

        _getList(INIT, function() {
          _setButtonStatus();
        });

        _load(that.options.messageId, pivot);
      });
    }

    function hide() {
      $timeout(function() {
        that.options.onHide();
      });

      jqWindow.off('reisze.imageCarousel');
      jqModal
        .off('keydown.imageCarousel')
        .off('click.imageCarousel')
        .off('mouseleave.imageCarousel')
        .off('mouseenter.imageCarousel')
        .off('mouseover.imageCarousel');
    }

    function _on() {
      var keyHandlerMap = {};
      var timerResize;

      $timeout.cancel(timerResize);
      timerResize = $timeout(function() {
        jqWindow.on('resize.imageCarousel', function() {
          var jqImageItem;
          if (that.options.messageId != null && (jqImageItem = imageMap[that.options.messageId].jqElement)) {
            _rePosition(jqImageItem);
          }
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
        })
        .on('mouseleave.imageCarousel', '.image-item', function(event) {
          event.stopPropagation();
          $(event.currentTarget).children('.image-item-footer').css('opacity', 0);
        })
        .on('mouseenter.imageCarousel', '.image-item', function(event) {
          event.stopPropagation();
          $(event.currentTarget).children('.image-item-footer').css('opacity', 1);
        })
        .on('mouseover.imageCarousel', '.image-item', function(event) {
          event.stopPropagation();
          $(event.currentTarget).children('.image-item-footer').css('opacity', 1);
        });
    }

    function _rePosition(jqImageItem, img, maxWidth, maxHeight) {
      // image를 정중앙에 출력할때 필요로 하는 여백
      var ratio = [];

      var imageWidth;
      var imageHeight;

      if (img) {
        img = $(img);

        imageWidth = img[0].getAttribute('width');
        imageHeight = img[0].getAttribute('height');

        // img[0].removeAttribute('width');
        // img[0].removeAttribute('height');
      } else {
        img = jqImageItem.children('img');

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

      if (img instanceof jQuery && /img/i.test(img[0].nodeName)) {
        img[0].setAttribute('width', imageWidth);
        img[0].setAttribute('height', imageHeight);
      }

      jqImageItem.css({marginLeft: imageWidth / 2 * -1, marginTop: imageHeight / 2 * -1});

      img.css({
        maxWidth: maxWidth,
        maxHeight: maxHeight
      });
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
          type: searchType,
          count: count,
          q: that.options.keyword,
          writerId:that.options.writerId
        })
        .success(function(data) {
          data.records != null && (data = data.records);

          var messageId = that.options.messageId;
          var index = imageList.indexOf(messageId);
          var hasEndPoint = false;
          if (index === 0 || index === imageList.length - 1) {
            hasEndPoint = true;
          }

          _pushImages(messageId, type, data);
          success && success({
            hasEndPoint: hasEndPoint
          });
        });
    }

    function _pushImages(messageId, type, data) {
      var message;
      var imageItem;
      var i;
      var cal;

      if (data) {
        if (type === PREV) {
          i = data.length - 1;
          cal = -1;
        } else {
          i = 0;
          cal = 1;
        }

        for (; message = data[i += cal];) {
          if (type === INIT && message.id === messageId) {
            imageList.splice(imageList.indexOf(messageId), 1);
            imageItem = imageMap[messageId];
            imageMap[messageId] = undefined;
          } else {
            imageItem = {
              userName: message.writer.name,
              uploadDate: message.createTime,
              fileTitle: message.content.title,
              fileUrl: message.content.fileUrl
            };
          }

          _pushImage(type, message.id, imageItem);
        }
      }
    }

    function _pushImage(type, messageId, data) {
      if (imageMap[messageId] == null) {
        type === PREV ? imageList.unshift(messageId) : imageList.push(messageId);
        imageMap[messageId] = data;
      }
    }

    function _isMore(index, offset) {
      return (offset === -1 ? index : (imageList.length + index * -1)) < 4;
    }

    function _load(currMessageId, imageItem) {
      var jqImageItem;
      var fullFileUrl;
      var $scope;

      if (jqImageItem = imageItem.jqElement) {
        jqImageItem.show();
      } else {

        that.options.messageId = currMessageId;

        $scope = $rootScope.$new(true);

        that.options.onRender($scope, imageItem);
        jqImageItem = $($compile(that.options.imageItemTemplate)($scope));
        jqImageItem.css({marginLeft: MIN_WIDTH / 2 * -1, marginTop: MIN_HEIGHT / 2 * -1});

        jqImageList.append(jqImageItem[0]);

        jqImageItem.addClass('icon-loading loading');

        fullFileUrl = config.server_uploaded + imageItem.fileUrl;

        _imageLoad(jqImageItem, fullFileUrl);


        // jqImageItem cashing
        imageItem.jqElement = jqImageItem;
      }
    }

    function _setButtonStatus() {
      var pivotIndex = imageList.indexOf(that.options.messageId);

      that.options.onButtonStatus({
        hasPrev: imageList[pivotIndex - 1] != null,
        hasNext: imageList[pivotIndex + 1] != null
      });
    }

    function _imageLoad(jqImageItem, fullFileUrl) {
      // 이미지가 로드가 안되어 있을때만.
      var xhr = new XMLHttpRequest();

      xhr.open('GET', fullFileUrl, true);
      xhr.responseType = 'blob';
      xhr.onload = function() {
        var that = this;
        var blob = that.response;

        if (that.status === 200) {
          loadImage.parseMetaData(blob, function (data) {
            var margin = 56 * 2;
            var maxWidth = jqViewerBody.width() - margin;
            var maxHeight = jqViewerBody.height() - margin;
            var imageOptions = {
              maxWidth: maxWidth,
              maxHeight: maxHeight
            };

            if (!!data.exif) {
              // 필요한 정보가 있을 경우
              imageOptions['orientation'] = _getImageOrientation(data);
            }

            // 이미지옵션들과 함께 블랍이미지를 이용해서 canvas 를 만든다.
            loadImage(blob, function(img) {
              jqImageItem.removeClass('icon-loading loading');
              if (img.type === 'error') {
                jqImageItem.prepend('<img src="assets/images/img-error-404.png" style="opacity: 1;" />');
              } else {
                _rePosition(jqImageItem, img, imageOptions.maxWidth, imageOptions.maxHeight);

                jqImageItem.prepend(img);
                $(img).css('opacity', 1);
              }
            }, imageOptions);
          });
        }
      };

      xhr.send();
    }

    /**
     * data 가 들고 있는 정보중에서 orientation 정보다 추출한다.
     * @param {object} data - 'loadImage.parseMetaData'를 이용해서 추출해낸 데이터
     * @returns {*}
     */
    function _getImageOrientation(data) {
      return data.exif.get('Orientation');
    }
  }
}());
