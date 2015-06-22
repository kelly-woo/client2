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
    var DEFAULT_WIDTH = 355;
    var DEFAULT_HEIGHT = 300;

    return {
      restrict: 'E',
      scope: false,
      controller: 'StickerPanelCtrl',
      link: link,
      templateUrl: 'app/sticker/panel/sticker.panel.html'
    };

    function link(scope, el, attrs, ctrl) {
      var width = attrs.width || DEFAULT_WIDTH;
      var height = attrs.height || DEFAULT_HEIGHT;
      height -= el.find('.sticker_panel_tab').height();

      el.find('.sticker_panel').width(width);
      el.find('.sticker_panel_contents').width(width).height(height);

    }
  }
})();
