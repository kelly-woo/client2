/**
 * @fileoverview 사용자가 입력한 text를 수정하여 center chat에 출력함.
 */
(function() {
  'use strict';

  app.filter('parseAnchor', function(LinkText) {
    return function(text) {
      return LinkText.autoLink(text, {targetBlank: true});
    };
  });
})();
