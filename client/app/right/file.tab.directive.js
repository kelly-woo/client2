(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('rPanelFileTab', rPanelFileTab)
    .directive('infiniteScrollBottom', infiniteScrollBottom);

  function rPanelFileTab() {
    return {
      restrict: 'EA',
      scope: true,
      link: link,
      templateUrl : 'app/right/file_tab/file.html',
      controller: 'rPanelFileTabCtrl'
    };

    function link(scope, element, attrs) {
    }
  }

  function infiniteScrollBottom() {
    return function(scope, element, attrs) {

      var fileList = $('.file-list');
      var rpanelBody = $('.rpanel-body-content');

      element.bind('mousewheel', function(event) {
        if (scope.isScrollLoading) return;

        if (fileList.height() <= rpanelBody.height()) {
          scope.$apply(attrs.infiniteScrollBottom);
        }
      });

      element.bind('scroll', function(event) {

        if (scope.isScrollLoading) return;

        var currentScrollPosition = element.scrollTop() + element.height();
        var elementHeight = $('.file-list').height();

        if (elementHeight - currentScrollPosition < 20) {
          scope.$apply(attrs.infiniteScrollBottom);
        }

      });
    };

  }

})();