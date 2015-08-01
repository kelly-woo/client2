/**
 * @fileoverview star-view 디렉티브
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('starView', starView);

  /**
   * star-view 디렉티브
   * attribute 설졍
   *
   *  star-view={Boolean}
   *  message-id="1000231"
   * [event-bubble='off']
   *
   * @example
   <span star-view="{{isStarred}}" message-id="123123"></span>
   <!--or-->
   <span star-view="{{isStarred}}" message-id="123123" team-id="11240124"></span>
   <span star-view="{{isStarred}}" message-id="123123" team-id="11240124" event-bubble="on"></span>


   */
  function starView(StarAPIService, memberService) {
    return {
      restrict: 'A',
      scope: {
        isStarred: '=starView',
        messageId: '@',
        teamId: '@',
        eventBubble: '@'
      },
      link: link
    };

    function link(scope, el, attrs) {
      var _hasStopPropagation;

      _init();

      /**
       * 초기화 메서드
       * @private
       */
      function _init() {
        _initScopVariables();
        _attachEvents();
        _attachDomEvents();
      }

      /**
       * scope variable 들을 초기화 한다.
       */
      function _initScopVariables() {
        scope.teamId = scope.teamId || memberService.getTeamId();
        _hasStopPropagation = scope.eventBubble !== 'on';
      }

      /**
       * scope 이벤트 바인딩
       * @private
       */
      function _attachEvents() {
        scope.$on('starred', _onStarred);
        scope.$on('unStarred', _onUnStarred);
        scope.$on('$destroy', _onDestroy);
      }

      /**
       * dom 이벤트 바인딩
       * @private
       */
      function _attachDomEvents() {
        el.on('click', _onClick);
      }

      /**
       * dom 이벤트 바인딩 해제
       * @private
       */
      function _detachDomEvents() {
        el.off('click', _onClick);
      }

      /**
       * click 이벤트 리스너
       * @param {Event} clickEvent
       * @private
       */
      function _onClick(clickEvent) {
        if (scope.isStarred) {
          StarAPIService.unStar(scope.messageId, scope.teamId);
        } else {
          StarAPIService.star(scope.messageId, scope.teamId);
        }
        scope.isStarred = !scope.isStarred;

        if (_hasStopPropagation) {
          clickEvent.stopPropagation();
        }
      }

      /**
       * socket 에서 starred 이벤트 발생시
       * @param {Object} event - angular 이벤트
       * @param {Object} param
       *     @param {Number|String} param.teamId - team id
       *     @param {Number|String} param.messageId - message id
       * @private
       */
      function _onStarred(event, param) {
        if (_isMyId(param)) {
          scope.isStarred = true;
        }
      }

      /**
       * socket 에서 un-starred 이벤트 발생시
       * @param {Object} event - angular 이벤트
       * @param {Object} param
       *     @param {Number|String} param.teamId - team id
       *     @param {Number|String} param.messageId - message id
       * @private
       */
      function _onUnStarred(event, param) {
        if (_isMyId(param)) {
          scope.isStarred = false;
        }
      }

      /**
       * 현재 directive 에 해당하는 id 인지 여부를 반환한다.
       * @param {Object} param
       * @param {Number|String} param.teamId - team id
       * @param {Number|String} param.messageId - message id
       * @returns {boolean}
       * @private
       */
      function _isMyId(param) {
        return (parseInt(scope.messageId, 10) === parseInt(param.messageId, 10) &&
        parseInt(scope.teamId, 10) === parseInt(param.teamId, 10));
      }

      /**
       * 소멸자
       * @private
       */
      function _onDestroy() {
        _detachDomEvents();
      }
    }
  }
})();
