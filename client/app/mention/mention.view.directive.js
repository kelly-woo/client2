/**
 * @fileoverview 멘션 view 디렉티브
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('mentionView', mentionView);

  /**
   *
   * @example

   <a mention-view="{{id}}" mention-type="member"
   */
  function mentionView(EntityHandler, memberService, jndPubSub) {

    return {
      restrict: 'A',
      link: link
    };

    function link(scope, el, attrs) {
      var _id;
      var _type;
      var _isActive;

      _init();

      /**
       * 초기화
       * @private
       */
      function _init() {
        _type = attrs.mentionType;
        _id = attrs.mentionView;
        _isActive = attrs.mentionActive === 'on';

        _initElement();
        _attachEvents();

        if (_isActive) {
          _attachDomEvents();
        }
      }

      /**
       * 엘리먼트를 초기화 한다
       * @private
       */
      function _initElement() {
        var myId = memberService.getMemberId();

        el.addClass('mention');

        if (_isActive) {
          el.addClass('cursor_pointer');
        } else {
          el.addClass('inactive');
        }

        if (parseInt(_id, 10) === parseInt(myId, 10)) {
          el.addClass('me');
        } else if (_type === 'room') {
          el.addClass('all');
        }
      }

      /**
       * 이벤트를 바인딩한다.
       * @private
       */
      function _attachEvents() {
        scope.$on('$destroy', _onDestroy);
      }

      /**
       * dom 이벤트 바인딩한다.
       * @private
       */
      function _attachDomEvents() {
        el.on('click', _onClick);
      }

      /**
       * dom 이벤트 바인딩 해제 한다.
       * @private
       */
      function _detachDomEvents() {
        el.off('click', _onClick);
      }

      /**
       * 소멸자
       * @private
       */
      function _onDestroy() {
        _detachDomEvents();
      }

      /**
       * 클릭 이벤트 핸들러
       * @private
       */
      function _onClick() {
        var entity;
        if (_type === 'member') {
          entity = EntityHandler.get(_id);
          jndPubSub.pub('onMemberClick', entity);
        } else if (_type === 'room') {
          //entity = entityAPIservice.getTopicEntity(_id);
        }
      }
    }
  }
})();
