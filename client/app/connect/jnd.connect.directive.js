/**
 * @fileoverview 잔디 컨넥트 디렉티브
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndConnect', jndConnect);

  function jndConnect($timeout) {
    return {
      restrict: 'E',
      scope: false,
      controller: 'JndConnectCtrl',
      link: link,
      replace: true,
      templateUrl: 'app/connect/jnd.connect.html'
    };

    function link(scope, el, attrs) {

      _init();

      /**
       * 생성자
       * @private
       */
      function _init() {
        $timeout(function() {
          _initializeElements();
          el.addClass('opac-in');
          _animateBanner();
          _animateCards();
        });
      }

      /**
       * animation 을 적용하기 위해 element 를 초기화 한다.
       * @private
       */
      function _initializeElements() {
        el.find('.connect-union-container').css('opacity', 0);
        el.find('.jnd-connect-banner').css('opacity', 0);
        el.find('.jnd-connect-header-navbar__topmenu.back-button').css('opacity', 0);
      }

      /**
       * 배너를 animate 한다
       * @private
       */
      function _animateBanner() {
        el.find('.jnd-connect-banner').css({
          marginTop: '30px'
        }).animate({
          marginTop: 0,
          opacity: 1
        }, 500);
      }

      /**
       * 카드를 animate 한다
       * @private
       */
      function _animateCards() {
        var jqCards = el.find('.connect-union-container');
        jqCards.each(function(count) {
          var callback = (count === 1) ? _animateBackButton : null;
          $(this).css({
            opacity: 0
          });
          setTimeout(_.bind(_slideUpAndFadeIn, this, $(this), callback), 100 * count);
        });
      }

      /**
       * back 버튼을 animate 한다.
       * @private
       */
      function _animateBackButton() {
        el.find('.jnd-connect-header-navbar__topmenu.back-button').css({
          marginLeft: '20px'
        }).animate({
          opacity: 1,
          marginLeft: 0
        }, 200);
      }

      /**
       * slide & fade in 하는 animation 함수
       * @param el
       * @param callback
       * @private
       */
      function _slideUpAndFadeIn(el, callback) {
        el.css({
          marginTop: '30px',
          opacity: 0
        }).animate({
          marginTop: 0,
          opacity: 1
        }, 500, callback);
      }

    }
  }
})();
