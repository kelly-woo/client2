/**
 * @fileoverview 네트워크 오류로 인해 보내지 못한 text 메세지 directive
 * @author Young Park <young.park@tosslab.com>
 */

(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('stickerPanel', stickerPanel);

  function stickerPanel($position, jndKeyCode) {
    var DEFAULT_WIDTH = 355;
    var DEFAULT_HEIGHT = 300;

    return {
      restrict: 'E',
      scope: false,
      controller: 'StickerPanelCtrl',
      link: link,
      templateUrl: 'app/sticker/panel/sticker.panel.html'
    };

    function link(scope, el, attrs) {
      var jqStickerPanel = el.find('.sticker_panel');
      var jqStickerPanelContents = el.find('.sticker_panel_contents');

      _init();

      /**
       * init
       * @private
       */
      function _init() {
        jqStickerPanel.focus();

        scope.onCreateSticker = onCreateSticker;
        scope.autoScroll = autoScroll;

         _setStickerPanelSize();
        _on();
      }

      function _on() {
        jqStickerPanel.on('keydown', _onKeyDown);
      }

      function _onKeyDown(event) {
        var keyCode = event.keyCode;

        if (jndKeyCode.match('UP_ARROW', keyCode)) {
          scope.navActiveSticker(0, -1);
        } else if (jndKeyCode.match('RIGHT_ARROW', keyCode)) {
          scope.navActiveSticker(1, 0);
        } else if (jndKeyCode.match('DOWN_ARROW', keyCode)) {
          scope.navActiveSticker(0, 1);
        } else if (jndKeyCode.match('LEFT_ARROW', keyCode)) {
          scope.navActiveSticker(-1, 0);
        }
      }

      function _setStickerPanelSize() {
        var width = attrs.width || DEFAULT_WIDTH;
        var height = attrs.height || DEFAULT_HEIGHT;
        height -= el.find('.sticker_panel_tab').height();

        el.find('.sticker_panel').width(width);
        el.find('.sticker_panel_contents').width(width).height(height);
      }

      function onCreateSticker() {
        jqStickerPanel.focus();
      }

      function autoScroll(index) {
        var jqItem = el.find('.sticker_panel_ul').children().eq(index);
        var itemPosition;
        var contPosition;
        var scrollTop;
        var compare;

        if (jqItem[0]) {
          scrollTop = jqStickerPanelContents.scrollTop();

          itemPosition = $position.offset(jqItem);
          contPosition = $position.offset(jqStickerPanelContents);

          compare = itemPosition.top - contPosition.top;
          if (compare < 0) {
            jqStickerPanelContents.scrollTop(scrollTop + compare);
          } else if (compare + itemPosition.height > contPosition.height) {
            jqStickerPanelContents.scrollTop(scrollTop + compare - contPosition.height + itemPosition.height);
          }
        }
      }
    }
  }
})();
