(function() {
  'use strict';

  angular
    .module('jandiApp')
    .factory('imagePaste', imagePaste);

  function imagePaste() {
    var KEY_V = 86;
    var CTRL_KEY_NAME = /win/ig.test(navigator.platform) ? 'ctrlKey' : 'metaKey';
    var TYPE = 'image/png';

    var regxImage = /image/;
    var regxHTMLImage = /^(?:|<meta (?:[^>]+)>)<img src="([^"]+)"(?:[^\/^>]+)(?:[^>]+)(?:|\/)>(?:|.)$/;
    var array = [];
    var slice = array.slice;

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

    var PasteImageTarget = {
      init: function($$ele, wrapper, options) {
        var that = this;

        that.$$ele = $$ele;
        that.options = {
            onImageLoading: function() {},
            onImageLoaded: function() {},
            onImageLoad: function() {}
        };

        wrapper.addTarget($$ele.data('pasteImageTarget', that));

        jQuery.extend(that.options, options);

        return that;
      },
      _imageLoad: function(evt) {
        var that = this;
        var cData;
        var items;

        if (evt) {
          that.options.onImageLoad(evt.target.result);
        } else {
          cData = that.$$editContent;
          items = cData.children('img');
          // console.log(items.length);
          if (items.length) {
            that.options.onImageLoad(items[0].src);
          }
        }

        that.removeClipboardContent();

        that.options.onImageLoaded();
      },
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
      getClipboardText: function() {
        var that = this;
        var value = that.$$ele.val();
        var clipText = that.$$editContent.text();
        var start = that.contentEditableEvent.start;
        var end = that.contentEditableEvent.end;

        // console.log('clipboard text ::: ', that.contentEditableEvent);
        // console.log(value.substr(0, start), clipText, value.substr(end, value.length - 1));
        // console.log( that.$$ele.val(), start, clipText.length);

        that.$$ele.val(value.substr(0, start) + clipText + value.substr(end, value.length - 1));

        that.removeClipboardContent(function() {
          setSelection(that.$$ele[0], start + clipText.length);
        });
      },
      createClipboardContent: function(evt) {
        var that = this;
        var options = that.options;
        var $$ele = that.$$ele;
        var $$editContent;
        var eventLock = false;

        that.$$editContent = $$editContent = $('<div contentEditable="true" style="position: fixed; top: -50000px; width: 1px; height: 1px;" ></div>').appendTo('body');
        $$editContent.focus();


        $$editContent[0].addEventListener("load", function() {
          if (!eventLock) {
            eventLock = true;

            that.onImageLoading();
            that._imageLoad();
          }
        }, true);

        if ($$ele.is(':focus')) {
          setTimeout(function() {
            $$editContent.focus();
          });
        }
      },
      onImageLoading: function() {
        var that = this;

        if (!that.contentEditableEvent.isCalledImageLoading) {
          that.options.onImageLoading();
          that.contentEditableEvent.isCalledImageLoading = true;
        }
      },
      removeClipboardContent: function(callback) {
        var that = this;

        that.$$editContent && that.$$editContent.remove();
        that.$$ele.focus();

        callback && callback();
      },
      initContentEditableEvent: function() {
        var that = this;
        var selection = getSelection(that.$$ele[0]);

        that.contentEditableEvent = {
          start: selection.start,
          end: selection.end,
          isCalledImageLoading: false
        };
      }
    };

    var PasteImage = {
      init: function(options) {
        var that = this;

        that.$$window = $(window);
        that.targets = [];

        that.options = {};

        jQuery.extend(that.options, options);

        that._on();

        return that;
      },
      addTarget: function($$target) {
        var that = this;

        that.targets.push($$target);
      },
      _on: function() {
        var that = this;
        var pasteImageTargets = [];
        var pasteImageTarget;

        that.$$window.on('keydown', function keydown(evt) {
          if ((!document.documentMode || document.documentMode > 10) && that._isPaste(evt)) {
            if (pasteImageTarget = $(evt.target).data('pasteImageTarget')) {
              pasteImageTargets.push(pasteImageTarget);

              // console.log('is keydown paste', evt);
              pasteImageTarget.initContentEditableEvent();
              pasteImageTarget.createClipboardContent(evt);
            }
          }
        });

        that.$$window.on('paste', function paste(evt) {
          evt = evt.originalEvent;

          if (pasteImageTarget = pasteImageTargets.shift()) {
            if (that._hasClipboardData(evt)) {
              if (that._isImagePaste(evt)) {
                pasteImageTarget.getClipboardImage(evt);
              } else {
                pasteImageTarget.removeClipboardContent();
              }
            } else {
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
      _hasClipboardData: function(evt) {
        return !!(evt.clipboardData && evt.clipboardData.items);
      },
      _isPaste: function(evt) {
        return evt[CTRL_KEY_NAME] && evt.which === KEY_V;
      },
      /**
       * image data paste
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
       * image element paste
       */
      _isHTMLImagePaste: function(evt) {
        var that = this;

        return !!that._getHTMLImagePaste(evt);
      },
      _getHTMLImagePaste: function(evt) {
        var cData;
        var img;

        cData = evt.clipboardData;
        if (cData && cData.types && slice.call(cData.types).some(function(type) { return type === 'text/html'; })) {
          img = (regxHTMLImage.exec(cData.getData('text/html')) || [])[1];
        }

        return img;
      },
      _isContentEditableImagePaste: function(pasteImageTarget) {
        return !pasteImageTarget.$$editContent.text();
      },
      _isContentEditableTextPaste: function(pasteImageTarget) {
        return !!pasteImageTarget.$$editContent.text();
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
