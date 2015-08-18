/**
 * @fileoverview member item directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('memberItem', memberItem);

  function memberItem() {
    return {
      restrict: 'E',
      replace: true,
      scope: false,
      link: link,
      templateUrl: 'app/modal/members/member_list/member_item/member.item.html',
      controller: 'MemberItemCtrl'
    };

    function link(scope, el, attrs) {
    }
  }
})();
