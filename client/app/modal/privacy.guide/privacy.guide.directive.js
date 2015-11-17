/**
 * @fileoverview file 커스텀 셀렉트박스 디렉티브
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('privacyGuide', privacyGuide);

  function privacyGuide() {
    return {
      restrict: 'E',
      link: link,
      replace: true,
      scope: {},
      templateUrl: 'app/modal/privacy.guide/privacy.guide.html'
    };

    function link(scope, el, attrs) {
      el.hide();
      scope.$on('privacy:set', _onPrivacySet);
      scope.$on('privacy:unset', _onPrivacyUnSet);

      function _onPrivacySet() {
        $('body').addClass('blurred');
        el.show();
      }

      function _onPrivacyUnSet() {
        $('body').removeClass('blurred');
        el.hide();
      }
    }
  }
})();
