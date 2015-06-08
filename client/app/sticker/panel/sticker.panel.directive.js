/**
 * @fileoverview 네트워크 오류로 인해 보내지 못한 text 메세지 directive
 * @author Young Park <young.park@tosslab.com>
 */

(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('stickerPanel', stickerPanel);

  function stickerPanel() {
    return {
      restrict: 'E',
      scope: false,
      controller: 'StickerPanelCtrl',
      link: link,
      templateUrl: 'app/sticker/panel/sticker.panel.html'
    };

    function link(scope, el, attrs, ctrl) {
      if (attrs.width) {
        el.find('.sticker_panel').width(attrs.width);
      }
      if (attrs.height) {
        el.find('.sticker_panel_contents').height(attrs.height - el.find('.sticker_panel_tab').height());
      }
    }
  }
})();