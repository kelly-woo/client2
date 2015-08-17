/**
 * @fileoverview member list directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('memberList', memberList);

  function memberList($timeout, $position, jndKeyCode) {
    return {
      restrict: 'E',
      replace: true,
      scope: false,
      link: link,
      templateUrl: 'app/modal/members/member_list/member.list.html',
      controller: 'MemberListCtrl'
    };

    function link(scope, el, attrs) {
      var target = $(attrs.selector);
      var memberList = scope.$eval(attrs.list);
      var onSelect = scope.$eval(attrs.onSelect);

      if (target.length) {
        scope._memberList = memberList;
        scope._onSelect = onSelect;

        $timeout(function() {
          target.focus();
        });

        scope.activeIndex = -1;
        target.on('keydown', function(event) {
          var which = event.which;

          if (jndKeyCode.match('UP_ARROW', which)) {
            event.preventDefault();
            scope.selectActive((scope.activeIndex > 0 ? scope.activeIndex : scope.selectingMembers.length) - 1);
            scope.$digest();
          } else if (jndKeyCode.match('DOWN_ARROW', which)) {
            event.preventDefault();
            scope.selectActive((scope.activeIndex + 1) % scope.selectingMembers.length);
            scope.$digest();
          } else if (jndKeyCode.match('ENTER', which)) {

          }
        });

        scope.selectActive = function(matchIndex) {
          var jqMentionItem;
          var itemPosition;
          var contPosition;
          var scrollTop;
          var compare;

          jqMentionItem = el.children().eq(matchIndex);
          scrollTop = el.scrollTop();

          itemPosition = $position.offset(jqMentionItem);
          contPosition = $position.offset(el);

          compare = itemPosition.top - contPosition.top;
          if (compare < 0) {
            el.scrollTop(scrollTop + compare);
          } else if ( compare + itemPosition.height > contPosition.height ) {
            el.scrollTop(scrollTop + compare - contPosition.height + itemPosition.height);
          }

          scope.activeIndex = matchIndex;
        };

        scope.isActive = function(matchIndex) {
          return scope.activeIndex == matchIndex;
        };
      }
    }
  }
})();
