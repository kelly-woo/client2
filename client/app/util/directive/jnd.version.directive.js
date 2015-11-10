/**
 * @fileoverview jandi version
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndVersion', jndVersion);


  function jndVersion(configuration) {
    return {
      restrict: 'E',
      scope: {},
      templateUrl: 'app/util/directive/jnd.version.html',
      link: link
    };
    function link(scope, el, attr) {
      var version = configuration.version;
      var name = configuration.name;

      scope.isAlpha = version.indexOf('alpha') !== -1;
      scope.isLive = name.indexOf('staging') !== -1;

      if (!scope.isLive) {
        if (scope.isAlpha) {
          version = version.split('-')[0] + '-' + name;
        } else {
          version += '-' + name;
        }
      }
      scope.version = version;
    }
  }
})();
