/**
 * @fileoverview 각 토픽마다 생성되는 announcement directive
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
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
