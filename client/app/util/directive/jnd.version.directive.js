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

      scope.isStaging = name.indexOf('staging') !== -1;
      scope.isAlpha = version.indexOf('alpha') !== -1;
      scope.isShow = !scope.isStaging || scope.isAlpha;

      if (!scope.isStaging) {
        if (scope.isAlpha) {
          //QA 시 version 정보가 노출되면 혼선의 여지가 있으므로 development 라는 label 만 노출한다.
          if (name === 'development') {
            version = name;
          } else {
            version = version.split('-')[0] + '-' + name;
          }
        } else {
          version += '-' + name;
        }
      }

      scope.version = version;
    }
  }
})();
