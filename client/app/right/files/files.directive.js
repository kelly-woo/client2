(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('rPanelFileTab', rPanelFileTab);

  function rPanelFileTab() {
    return {
      restrict: 'EA',
      scope: true,
      link: link,
      templateUrl : 'app/right/files/files.html',
      controller: 'rPanelFileTabCtrl'
    };

    function link(scope, element, attrs) {
    }
  }
})();
