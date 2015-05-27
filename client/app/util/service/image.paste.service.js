(function() {
  'use strict';

  angular
    .module('jandiApp')
    .factory('ImagePaste', ImagePaste);

  function ImagePaste() {
    var KEY_V = 86; // v key
    var CTRL_KEY_NAME = /win/ig.test(navigator.platform) ? 'ctrlKey' : 'metaKey';
    var TYPE = 'image/png';

    var regxImage = /image/;
    var regxHTMLImage = /^(?:|<meta (?:[^>]+)>)<img src="([^"]+)"(?:[^\/^>]+)(?:[^>]+)(?:|\/)>(?:|.)$/;
    var array = [];
    var slice = array.slice;

    /**
     * get selection
     */
    function getSelection(ele) {
      var start;
      var end;
      var selection;

      if ("setSelectionRange" in ele) {
        start = ele.selectionStart;
        end = ele.selectionEnd;
      } else if (document.selection && document.selection.createRange) {
        selection = document.selection.createRange();

        start = 0 - selection.duplicate().moveStart( "character", -100000 );
        end = start + selection.text.length;
      }

      return {
        start: start,
        end: end
      };
    }

    /**
     * set selection
     */
    function setSelection(ele, begin, end) {
      var selection;

      end == null && (end = begin);

      if ("setSelectionRange" in ele) {
        ele.setSelectionRange(begin, end);
      } else {
        selection = ele.createTextRange();
        selection.collapse();
        selection.moveStart("character", begin);
        selection.moveEnd("character", (end - begin));

        selection.select();
      }
    }

    /**
     * image 붙여넣기 command가 수행될 dom element에 대한 처리
     */
    var PasteImageTarget = {
      /**
       * @contstructor
       * @param {element} jqEle                     - image 붙여넣기 command 대상 dom element
       * @param {PasteImage} wrapper                - dom element의 window object의 event를 처리하는 wrapper object
       * @param {function} options
       * @param {function} options.onImageLoading   - image loading event handler
       * @param {function} options.onImageLoad      - image load event handler
       * @param {function} options.onImageLoaded    - image loaded event handler
       */
      init: function(jqEle, wrapper, options) {
        var that = this;

        that.jqEle = jqEle;
        that.options = {
            onImageLoading: function() {},
            onImageLoad: function() {},
            onImageLoaded: function() {}
        };

        wrapper.addTarget(jqEle.data('pasteImageTarget', that));

        jQuery.extend(that.options, options);

        return that;
      },
      /**
       * clipboard data에서 image object를 get하거나 contentEditable에서 image element가 load되었을때 호출되어
       * contentEditable element를 초기화 하고 onImageLoad와 onImageLoaded event callback을 수행함
       * @param {object} evt  - FileReader object의 onload event handler에서 전달한 event object
       */
      _imageLoad: function(evt) {
        var that = this;
        var cData;
        var items;

        if (evt) {
          that.options.onImageLoad(evt.target.result);
        } else {
          cData = that.jqEditContent;
          items = cData.children('img');
          // console.log(items.length);
          if (items.length) {
            that.options.onImageLoad(items[0].src);
          }
        }

        // os clipboard 대신 사용된 content 초기화
        that.removeClipboardContent();

        that.options.onImageLoaded();
      },
      /**
       * clipboard에서 image data를 read하고 onImageLoading event handler를 수행함
       * @param {object} evt - clipboard event object
       */
      getClipboardImage: function(evt) {
        var that = this;
        var cData;
        var items;
        var item;
        var reader;
        var i;
        var len;

        that.onImageLoading();

        if (evt) {
          cData = evt.clipboardData;
          if (items = cData.items) {
            for (i = 0, len = items.length; i < len && !reader; ++i) {
              item = items[i];
              if (regxImage.test(item.type)) {
                reader = new FileReader();
                reader.onload = function(evt) {
                  that._imageLoad(evt);
                };
                reader.readAsDataURL(item.getAsFile());
              }
            }
          }
        }
      },
      /**
       * contentEditable element를 clipboard로 사용하는 경우 text 붙여넣기 할때에 contentEditable element에
       * 붙여넣기된 text를 대상 element로 붙여넣기 되는 것 처럼 처리함
       */
      getClipboardText: function() {
        var that = this;
        var value = that.jqEle.val();
        var clipText = that.jqEditContent.text();
        var start = that.contentEditableEvent.start;
        var end = that.contentEditableEvent.end;

        // console.log('clipboard text ::: ', that.contentEditableEvent);
        // console.log(value.substr(0, start), clipText, value.substr(end, value.length - 1));
        // console.log( that.jqEle.val(), start, clipText.length);

        that.jqEle.val(value.substr(0, start) + clipText + value.substr(end, value.length - 1));

        that.removeClipboardContent(function() {
          // default 붙여넣기 한 것 처럼 text selection을 수정함
          setSelection(that.jqEle[0], start + clipText.length);
        });
      },
      /**
       * paste event에서 clipboard data에 접근할 수 없는 browser를 위해 구라 clipboard인 contentEditalbe element를 생성하고
       * 대상 element에 붙여넣기 시 contentEditable에 os clipboard data가 붙여넣기 되도록 처리함
       */
      createClipboardContent: function() {
        var that = this;
        var options = that.options;
        var jqEle = that.jqEle;
        var jqEditContent;
        var eventLock = false;

        that.jqEditContent = jqEditContent = $('<div contentEditable="true" style="position: fixed; top: -50000px; width: 1px; height: 1px;" ></div>').appendTo('body');
        jqEditContent.focus();

        // event capture하여 img element 생성 여부 판단
        jqEditContent[0].addEventListener("load", function() {
          if (!eventLock) {
            eventLock = true;

            that.onImageLoading();
            that._imageLoad();
          }
        }, true);

        if (jqEle.is(':focus')) {
          setTimeout(function() {
            jqEditContent.focus();
          });
        }
      },
      /**
       * browser(IE, firefox etc.) 마다 contentEditable element에 image가 load되는 순서가 달라 맞춰줌
       */
      onImageLoading: function() {
        var that = this;

        if (!that.contentEditableEvent.isCalledImageLoading) {
          that.options.onImageLoading();
          that.contentEditableEvent.isCalledImageLoading = true;
        }
      },
      /**
       * contentEditable element 삭제하고 대상 element에 focus 이동
       */
      removeClipboardContent: function(callback) {
        var that = this;

        that.jqEditContent && that.jqEditContent.remove();
        that.jqEle.focus();

        callback && callback();
      },
      /**
       * contentEditable 초기화
       */
      initContentEditableEvent: function() {
        var that = this;
        var selection = getSelection(that.jqEle[0]);

        that.contentEditableEvent = {
          // 붙여넣기 한 다음 text selection을 붙여넣기 전과 같이 맞추기 위함
          start: selection.start,
          end: selection.end,

          isCalledImageLoading: false
        };
      }
    };

    /**
     * image 붙여넣기가 수행된 dom element의 window에 대한 처리
     */
    var PasteImage = {
      /**
       * @constructor
       */
      init: function(options) {
        var that = this;

        that.jqWindow = $(window);
        that.targets = [];

        that.options = {};

        jQuery.extend(that.options, options);

        that._on();

        return that;
      },
      /**
       * window에서 붙여넣기 command가 사용되어 지는 대상 element 추가
       * @param {element} jqTarget - 대상 element
       */
      addTarget: function(jqTarget) {
        var that = this;

        that.targets.push(jqTarget);
      },
      /**
       * window에 붙여넣기 처리를 위한 event handler 설정함
       */
      _on: function() {
        var that = this;
        var pasteImageTargets = [];
        var pasteImageTarget;

        // paste event handler에서 clipboard data를 get 할 수 있다면 keydown handler에서 ctrl+v command인지 확인하지
        // 않아도 되지만 그렇지 않은 상황 처리를 위해 keydown event handler에서 ctrl+v command 인지 확인하여
        // 구라 clipboard인 contentEditable element를 생성함
        that.jqWindow.on('keydown', function keydown(evt) {
          if ((!document.documentMode || document.documentMode > 10) && that._isPaste(evt)) {
            if (pasteImageTarget = $(evt.target).data('pasteImageTarget')) {
              pasteImageTargets.push(pasteImageTarget);

              // console.log('is keydown paste', evt);
              pasteImageTarget.initContentEditableEvent();
              pasteImageTarget.createClipboardContent(evt);
            }
          }
        });

        that.jqWindow.on('paste', function paste(evt) {
          evt = evt.originalEvent;

          if (pasteImageTarget = pasteImageTargets.shift()) {
            if (that._hasClipboardData(evt)) {
              // clipboard에서 image data get 가능

              if (that._isImagePaste(evt)) {
                pasteImageTarget.getClipboardImage(evt);
              } else {
                pasteImageTarget.removeClipboardContent();
              }
            } else {
              // clipboard에서 image data get 가능하지 않아 contentEditable을 사용하여 image/text data get함

              // contentEditable element에 focus가 바로 이동하지 않으므로 setTime으로 contentEditable element에 focus가 간 상황 다음에 동작하도록 함
              setTimeout((function(pasteImageTarget) {
                return function() {
                  if (that._isContentEditableImagePaste(pasteImageTarget)) {
                    pasteImageTarget.getClipboardImage();
                  } else if (that._isContentEditableTextPaste(pasteImageTarget)) {
                    pasteImageTarget.getClipboardText();
                  }
                };
              }(pasteImageTarget)));
            }
          }
        });
      },
      /**
       * event object에서 clipboard data를 가지고 있는지 여부
       * @param {object} evt
       */
      _hasClipboardData: function(evt) {
        return !!(evt.clipboardData && evt.clipboardData.items);
      },
      /**
       * event 가 clipboard 붙여넣기 command 인지 여부
       * @param {object} evt
       */
      _isPaste: function(evt) {
        return evt[CTRL_KEY_NAME] && evt.which === KEY_V;
      },
      /**
       * image를 붙여넣기 하는지 여부
       * @param {object} evt
       */
      _isImagePaste: function(evt) {
        var that = this;
        var isImagePaste = false;
        var cData;
        var items;

        if (that._hasClipboardData(evt)) {
          cData = evt.clipboardData;
          items = slice.call(cData.items || cData.files);
          $.each(items, function(index, value) {
            if (regxImage.test(value.type)) {
              isImagePaste = true;
              return false;
            }
          });
        }

        return isImagePaste;
      },
      /**
       * img tag 붙여넣기 여부
       * @param {object} evt
       */
      _isHTMLImagePaste: function(evt) {
        var that = this;

        return !!that._getHTMLImagePaste(evt);
      },
      /**
       * get img tag
       * @param {object} evt
       */
      _getHTMLImagePaste: function(evt) {
        var cData;
        var img;

        cData = evt.clipboardData;
        if (cData && cData.types && slice.call(cData.types).some(function(type) { return type === 'text/html'; })) {
          img = (regxHTMLImage.exec(cData.getData('text/html')) || [])[1];
        }

        return img;
      },
      /**
       * contentEditable element에 image 붙여넣기 인지 여부
       * @param {PasteImageTarget} pasteImageTarget
       */
      _isContentEditableImagePaste: function(pasteImageTarget) {
        return !pasteImageTarget.jqEditContent.text();
      },
      /**
       * contentEditable element에 text 붙여넣기 인지 여부
       * @param {PasteImageTarget} pasteImageTarget
       */
      _isContentEditableTextPaste: function(pasteImageTarget) {
        return !!pasteImageTarget.jqEditContent.text();
      }
    };

    var pasteImage = Object.create(PasteImage).init();

    return {
      createInstance: function(ele, options) {
        return Object.create(PasteImageTarget).init(ele, pasteImage, options);
      }
    };
  }
}());
