(function() {
  'use strict';

  angular
    .module('jandiApp')
    .factory('clipboard', clipboard);

  var hasWinClipData = !!(window.clipboardData && clipboardData.setData);   // window
  var hasFlash = detectFlash();

  function errorMsg() {
    console.error('No Flash installed. Please copy manually');
  }

  // browser에서 flash 지원하는지 여부
  function detectFlash() {
      var hasFlash = false;
      try {
          var fo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
          if (fo) {
              hasFlash = true;
          }
      } catch (e) {
          if (navigator.mimeTypes && navigator.mimeTypes['application/x-shockwave-flash'] !== undefined &&
              navigator.mimeTypes['application/x-shockwave-flash'].enabledPlugin) {
              hasFlash = true;
          }
      }
      return hasFlash;
  }

  function clipboard() {
    var Clipboard = {
      init: function(ele, options) {
        this.ele = ele;
        this.options = {
          getText: function() {},           // clipboard에 text 설정시 text return 함수
          onClipAfter: function() {}        // clipboard에 text 설정 후 event callback
        };

        angular.extend(this.options, options);

        if (hasWinClipData) {
          this._winClip();
        } else if (hasFlash) {
          this._flashClip();
        } else {
          errorMsg();
        }
      },
      /**
       * win clipboard
       */
      _winClip: function() {
        var that = this;
        that.ele
          .on('click', function() {
            var text;

            if (text  = that.options.getText()) {
              window.clipboardData.setData('Text', text);
              that.options.onClipAfter();
            }
          });
      },
      /**
       * flash clipboard
       */
      _flashClip: function(text) {
        var that = this;
        var client;

        ZeroClipboard.config({
          swfPath:'../bower_components/zeroclipboard/dist/ZeroClipboard.swf'
        });

        client = new ZeroClipboard(that.ele);
        client.on('ready', function(event) {
            client.on('copy', function(event) {
                var text;

                if (text = that.options.getText()) {
                    event.clipboardData.setData('text/plain', text);
                }
            });

            client.on('aftercopy', function(event) {
                if (event.data["text/plain"]) {
                    that.options.onClipAfter();
                }
            });
        });

        client.on('error', function(event) {
            ZeroClipboard.destroy();
        });
      }
    };

    return {
      createInstance: function(ele, options) {
        return Object.create(Clipboard).init(ele, options);
      },
      // clipboard 지원여부
      support: (hasWinClipData || hasFlash) ? true : false
    };
  }
}());
