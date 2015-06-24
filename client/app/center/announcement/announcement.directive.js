(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('announcement', announcement);

  function announcement() {
    return {
      restrict: 'E',
      scope: {},
      link: link,
      templateUrl: 'app/center/announcement/announcement.html',
      controller: 'AnnouncementCtrl'
    };

    function link(scope, element, attrs) {

    }
  }
})();
