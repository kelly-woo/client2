/**
 * @fileoverview member list directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('memberList', memberList);

  function memberList($timeout, $position, $compile, jndKeyCode) {
    return {
      restrict: 'E',
      replace: true,
      scope: false,
      link: link,
      templateUrl: 'app/modal/members/member_list/member.list.html',
      controller: 'MemberListCtrl'
    };

    function link(scope, el, attrs) {
      var list = attrs.list;
      var repeat = attrs.repeat;
      var target;
      var originOnSelect;
      var jqMemberItem;

      _init();

      function _init() {
        target = $(attrs.selector);

        if (target.length) {
          scope.list = list;
          originOnSelect = scope.$eval(attrs.onSelect);

          $timeout(function () {
            target.focus();
          });

          _on();

          scope.repeatDone = repeatDone;
          scope.onSelect = onSelect;
          scope.focusItem = focusItem;

          _createMemberList();
        }
      }

      /**
       * create repeat member item
       * @private
       */
      function _createMemberList() {
        jqMemberItem = angular.element('<member-item></member-item>');
        jqMemberItem.attr({
          'ng-repeat': repeat
        });
        jqMemberItem = $compile(jqMemberItem)(scope);

        el.prepend(jqMemberItem);
      }

      /**
       * add event listener
       * @private
       */
      function _on() {
        target
          .on('keydown', function (event) {
            var which = event.which;
            var members = scope[list];

            if (!scope.$eval(attrs.disabled)) {
              if (jndKeyCode.match('UP_ARROW', which)) {
                event.preventDefault();
                scope.focusItem((scope.activeIndex > 0 ? scope.activeIndex : members.length) - 1);
                scope.$digest();
              } else if (jndKeyCode.match('DOWN_ARROW', which)) {
                event.preventDefault();
                scope.focusItem((scope.activeIndex + 1) % members.length);
                scope.$digest();
              } else if (jndKeyCode.match('ENTER', which)) {
                scope.select(scope.activeIndex);
                target.val('').focus();
              } else {
                scope.focusItem(0);
              }
            }
          })
          .on('keyup', function() {
            scope.isNoResult = scope[scope.list] && scope[scope.list].length > 0 ? false: true;
          });
      }

      /**
       * repeat done event handler
       */
      function repeatDone() {
        if (!target.val()) {
          // target의 value가 존재하지 않는다면 첫번째 item을 focus
          scope.focusItem(0);
        }
      }

      /**
       * item select event handler
       * @param {object} member
       */
      function onSelect(member) {
        originOnSelect(member);
        target.focus();
      }

      /**
       * focus item
       * list에서 item이 focus된 상태를 표현함. focus된 item이 list에서
       * 보여지지 않는다면 보이도록 list의 scoll을 조정함.
       * @param {number} matchIndex
       */
      function focusItem(matchIndex) {
        var jqMentionItem;
        var itemPosition;
        var contPosition;
        var scrollTop;
        var compare;

        jqMentionItem = el.children().eq(matchIndex);
        if (jqMentionItem.length) {
          scrollTop = el.scrollTop();

          itemPosition = $position.offset(jqMentionItem);
          contPosition = $position.offset(el);

          compare = itemPosition.top - contPosition.top;
          if (compare < 0) {
            el.scrollTop(scrollTop + compare);
          } else if (compare + itemPosition.height > contPosition.height) {
            el.scrollTop(scrollTop + compare - contPosition.height + itemPosition.height);
          }

          scope.setActiveIndex(matchIndex);
        }
      }
    }
  }
})();
