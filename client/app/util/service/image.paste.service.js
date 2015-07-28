/**
 * @fileoverview clipboard의 image data를 web-front에서 get하는 service를 제공함.
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .factory('ImagePaste', ImagePaste);

  function ImagePaste($timeout, jndKeyCode, Browser) {
    var CTRL_KEY_NAME = /win/ig.test(navigator.platform) ? 'ctrlKey' : 'metaKey';

    var regxNewLine = /(<(\/h\d|\/?p|br.*?|\/div)>)/ig;
    var regxHasTag = /(<([^>]+)>)/i;
    var regxMultiSpace = /  +/g;
    var regxPlainText = /text\/plain/;
    var regxImage = /image/;
    var regxImageData = /^data:image\/(png|jpg|jpeg);base64,/;

    var regxMsOffice = /excel|powerpoint/i;
    var msOfficePasteHandlerMap = {
      excel: function() {
        return true;
      },
      powerpoint: function(hasImage, hasPlainText) {
        return hasPlainText ? false : hasImage;
      }
    };

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
    var PasteContentTarget = {
      /**
       * @contstructor
       * @param {element} jqEle                     - image 붙여넣기 command 대상 dom element
       * @param {PasteContent} wrapper              - dom element의 window object의 event를 처리하는 wrapper object
       * @param {object} options
       * @param {function} options.onContentLoading   - image loading event handler
       * @param {function} options.onContentLoad      - image load event handler
       * @param {function} options.onContentLoaded    - image loaded event handler
       */
      init: function(jqEle, wrapper, options) {
        var that = this;

        that.jqEle = jqEle;
        that.options = {
            onContentLoading: function() {},
            onContentLoad: function() {},
            onContentLoaded: function() {}
        };
        jQuery.extend(that.options, options);

        jqEle.data('pasteContentTarget', that);

        that.contentEditableEvent = {
          isCalledImageLoading: false
        };

        return that;
      },
      /**
       * clipboard data에서 image object를 get하거나 contentEditable에서 image element가 load되었을때 호출되어
       * contentEditable element를 초기화 하고 onContentLoad와 onContentLoaded event callback을 수행함
       * @param {string} type - content type
       * @param {object} obj  - FileReader object의 onload event handler에서 전달한 object
       */
      _contentLoad: function(type, obj) {
        var that = this;
        var items;

        if (type === 'text') {
          that.options.onContentLoad(type, obj);
        } else if (type === 'image') {
          if (obj instanceof jQuery) {
            items = obj;
            // console.log(items.length);
            if (items.length) {
              that.options.onContentLoad(type, items[0].src);
            }
          } else {
            that.options.onContentLoad(type, obj.target.result);
          }
        }

        // os clipboard 대신 사용된 content 초기화
        that.removeClipboardContent();

        that.options.onContentLoaded();
      },
      /**
       * clipboard에서 image data를 read하고 onContentLoading event handler를 수행함
       * @param {object} evt - clipboard event object
       */
      getClipboardContent: function(evt) {
        var that = this;
        var cData;
        var items;
        var item;
        var reader;
        var i;
        var len;

        if (evt) {
          cData = evt.clipboardData;
          if (items = cData.items) {
            for (i = 0, len = items.length; i < len && !reader; ++i) {
              item = items[i];

              if (regxImage.test(item.type)) {
                that.onContentLoading();

                reader = new FileReader();
                reader.onload = function(evt) {
                  that._contentLoad('image', evt);
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
      getClipboardText: function(data) {
        var that = this;
        var value = that.jqEle.val();
        var start = that.contentEditableEvent.start;
        var end = that.contentEditableEvent.end;
        var clipText = '';
        var texts;
        var text;
        var i;
        var len;

        if (data) {
          if (data.isPlainText) {
            // paste event object에서 plain/text type의 text를 get 한 경우 처리
            clipText = data.text + '\n';
          } else {
            // paste event object에서 text get 하였지만 plain/text가 아닌 경우
            // html등 tag가 섞여있으므로 plain/text type 처럼 변경하는 작업 필요함

            // new-line(\n)을 담당하는 tag 제거
            clipText = that.jqEditContent
              .html()
              .replace(regxNewLine, '\n');

            if (regxHasTag.test(clipText)) {
              // new-line(\n)을 담당하는 tag를 제외하고도 tag가 남아 있는경우
              // plain/text로 사용할 수 없는 text라고 보고 plain/text와 같이 변환
              clipText = [];
              texts = data.text.replace(regxMultiSpace, ' ').split('\n');
              for (i = 0, len = texts.length; i < len; ++i) {
                text = texts[i].trim();
                if (text !== '') {
                  clipText.push(text);
                }
              }
              clipText = clipText.join('\n');
              clipText += '\n';
            } else {
              clipText = data.text + '\n';
            }
          }
        }

        that.jqEle.val(value.substr(0, start) + clipText + value.substr(end, value.length - 1)).trigger('change');
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
        var jqEle = that.jqEle;
        var jqEditContent;

        that.jqEditContent = jqEditContent = $('<div contentEditable="true" style="position: fixed; top: -10000px; width: 1px; height: 1px;"></div>').appendTo('body');
        jqEditContent.focus();

        // event capture하여 img element 생성 여부 판단
        jqEditContent[0].addEventListener("load", function() {
          if (that.hasImageData()) {
            that.onContentLoading();
            that._contentLoad('image', jqEditContent.children('img'));
          }
        }, true);

        if (jqEle.is(':focus')) {
          $timeout(function() {
            jqEditContent.focus();
          });
        }
      },
      /**
       * browser(IE, firefox etc.) 마다 contentEditable element에 image가 load되는 순서가 달라 맞춰줌
       */
      onContentLoading: function() {
        var that = this;

        if (!that.contentEditableEvent.isCalledImageLoading) {
          that.options.onContentLoading();
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

        that.contentEditableEvent.isCalledImageLoading = false;

        // 붙여넣기 한 다음 text selection을 붙여넣기 전과 같이 맞추기 위함
        that.contentEditableEvent.start = selection.start;
        that.contentEditableEvent.end = selection.end;
      },
      /**
       * base64 format image data를 가지고 있는지 여부
       */
      hasImageData: function() {
        var that = this;
        var img = that.jqEditContent.children('img');

        return !!img.length && regxImageData.test(img[0].src);
      }
    };

    /**
     * image 붙여넣기가 수행된 dom element의 window에 대한 처리
     */
    var PasteContent = {
      /**
       * @constructor
       */
      init: function() {
        var that = this;

        that.jqWindow = $(window);

        that._on();

        return that;
      },
      /**
       * window에 붙여넣기 처리를 위한 event handler 설정함
       */
      _on: function() {
        var that = this;
        var pasteContentTargets = [];
        var pasteContentTarget;

        // tobe: cliboardData support object 필요함.
        if (!Browser.chrome) {
          // paste event handler에서 clipboard data를 get 할 수 있다면 keydown handler에서 ctrl+v command인지 확인하지
          // 않아도 되지만 그렇지 않은 상황 처리를 위해 keydown event handler에서 ctrl+v command 인지 확인하여
          // 구라 clipboard인 contentEditable element를 생성함
          that.jqWindow.on('keydown', function keydown(evt) {
            if ((!Browser.msie || Browser.version > 10) && that._isPaste(evt)) {
              if (pasteContentTarget = $(evt.target).data('pasteContentTarget')) {
                pasteContentTargets.push(pasteContentTarget);

                // console.log('is keydown paste', evt);
                pasteContentTarget.initContentEditableEvent();
                pasteContentTarget.createClipboardContent(evt);
              }
            }
          });
        }

        that.jqWindow.on('paste', function paste(evt) {
          evt = evt.originalEvent;

          pasteContentTarget = $(evt.target).data('pasteContentTarget') || pasteContentTargets.shift();
          if (pasteContentTarget) {
            if (that._hasClipboardData(evt)) {
              // clipboard에서 image data get 가능
              if (that._isImagePaste(evt)) {
                evt.preventDefault();
                pasteContentTarget.getClipboardContent(evt);
              }
            } else {
              // clipboard에서 image data get 가능하지 않아 contentEditable을 사용하여 image/text data get함

              // contentEditable element에 focus가 바로 이동하지 않으므로 setTime으로 contentEditable element에 focus가 간 상황 다음에 동작하도록 함
              $timeout((function(pasteContentTarget, data) {
                return function() {
                  if (that._isContentEditableImagePaste(pasteContentTarget)) {
                    pasteContentTarget.getClipboardContent();
                  } else if (that._isContentEditableTextPaste(pasteContentTarget)) {
                    pasteContentTarget.getClipboardText(data);
                  } else {
                    pasteContentTarget.removeClipboardContent();
                  }
                };
              }(pasteContentTarget, that._getTextData(evt)) ));
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
        return evt[CTRL_KEY_NAME] && jndKeyCode.match('CHAR_V', evt.which);
      },
      /**
       * image를 붙여넣기 하는지 여부
       * @param {object} evt
       */
      _isImagePaste: function(evt) {
        var isImagePaste;
        var hasImage = false;
        var hasPlainText = false;
        var cData;
        var items;
        var text;

        var regxMetaTag;
        var meta;
        var match;

          cData = evt.clipboardData;

        _.forEach(cData.items || cData.files, function(value) {
          if (regxImage.test(value.type)) {
            hasImage = true;
          } else if (regxPlainText.test(value.type)) {
            hasPlainText = true;
          }
        });

        // html에 있는 meta tag로 clipboard에 복사된 data 구분하여 처리함.
        text = cData.getData('text/html');
        if (hasImage && text) {
          regxMetaTag = /(<[\s]*meta[\s\S]+?>)/gi;

          while(regxMetaTag.exec(text)) {
            meta = RegExp.$1;

            if (match = regxMsOffice.exec(meta)) {
              match = match[0].toLowerCase();
              isImagePaste = msOfficePasteHandlerMap[match](hasImage, hasPlainText);
              break;
            }
          }
        }

        // plain text가 우선으로 paste 됨
        if (isImagePaste == null) {
          isImagePaste = hasPlainText ? false : hasImage;
        }

        return isImagePaste;
      },
      /**
       * contentEditable element에 image 붙여넣기 인지 여부
       * @param {PasteContentTarget} pasteContentTarget
       */
      _isContentEditableImagePaste: function(pasteContentTarget) {
        return pasteContentTarget.hasImageData();
      },
      /**
       * contentEditable element에 text 붙여넣기 인지 여부
       * @param {PasteContentTarget} pasteContentTarget
       */
      _isContentEditableTextPaste: function(pasteContentTarget) {
        return !!pasteContentTarget.jqEditContent.text();
      },
      _getTextData: function(evt) {
        var data;

        if (evt && evt.clipboardData && evt.clipboardData.getData) {
          data = {
            text: evt.clipboardData.getData('text/plain'),
            isPlainText: true
          };
        } else if (window.clipboardData) {
          data = {
            text: window.clipboardData.getData('Text'),
            isPlainText: false
          };
        } else {
          data = null;
        }

        return data;
      }
    };

    var pasteContent = Object.create(PasteContent).init();

    return {
      createInstance: function(ele, options) {
        return Object.create(PasteContentTarget).init(ele, pasteContent, options);
      }
    };
  }
}());
