/**
 * @filevoerview 해더 -> 팀 메뉴 옆에 붙는 점의 유뮤를 확인하는 디렉티브
 */
(function() {
  'use strict' ;

  angular
    .module('jandiApp')
    .directive('otherTeamBadgeIndicator', otherTeamBadgeIndicator);

  /* @ngInject */
  function otherTeamBadgeIndicator(OtherTeamBadgeManager, $timeout) {
    return {
      restrict: 'A',
      controller: false,
      link: link
    };

    function link(scope, el, attrs) {
      var _jqDotElement;
      var _isDotAttached = false;

      _attachEvents();

      /**
       * 현재 스코프가 들어야 할 이벤트들을 추가한다.
       * @private
       */
      function _attachEvents() {
        scope.$on('accountLoaded', _onAccountLoaded);
        scope.$on('onOtherTeamNotification', _updateBadge);
        scope.$on('updateTeamBadgeCount', _updateBadge);
        scope.$on('blinkDotIndicator', _blinkDotIndicator);
      }


      /**
       * 현재 어카운트의 정보가 업데이트되었으니 팀 뱃지 메니져에게 알려준다.
       * @private
       */
      function _onAccountLoaded() {
        OtherTeamBadgeManager.updateTotalBadgeCount();
      }

      /**
       * badge count를 새로 불러와서 '점'을 보여줄지 안보여줄지 결정한다.
       * @private
       */
      function _updateBadge() {
        if (OtherTeamBadgeManager.hasBadgeInOtherTeams()) {
          _attachDotIndicator();
        } else {
          _detachDotIndicator();
        }
      }

      /**
       * '쩜' 엘레멘트를 생성한 후, 현재 엘레멘트에 추가한다.
       * @private
       */
      function _attachDotIndicator() {
        if (!_isDotAttached) {
          _jqDotElement = angular.element('<div class="dot blink"></div>');
          el.prepend(_jqDotElement);
          _isDotAttached = true;
        }
      }

      /**
       * '쩜' 엘레멘트를 제거한다.
       * @private
       */
      function _detachDotIndicator() {
        _jqDotElement && _jqDotElement.remove();
        _isDotAttached = false;
      }

      /**
       * '쩜' 엘레멘트를 점멸시킨다.
       * @private
       */
      function _blinkDotIndicator() {
        if (!_.isUndefined(_jqDotElement)) {
          _jqDotElement.removeClass('blink');
          $timeout(function() {
            _jqDotElement.addClass('blink');
          }, 10);
        }
      }
    }
  }
})();
