(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('rPanelFileTab', rPanelFileTab)
    .directive('infiniteScrollBottom', infiniteScrollBottom);
    // .directive('downloadFile', downloadFile);

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

  function infiniteScrollBottom() {
    return function(scope, element, attrs) {

      var rpanelBody = element;
      var list = element.children('.infinite-scroll-bottom-list');

      element.bind('mousewheel', function(event) {
        if (scope.isScrollLoading) return;

        if (list.height() <= rpanelBody.height()) {
          scope.$apply(attrs.infiniteScrollBottom);
        }
      });

      element.bind('scroll', function(event) {

        if (scope.isScrollLoading) return;

        var currentScrollPosition = element.scrollTop() + element.height();
        var elementHeight = list.height();

        if (elementHeight - currentScrollPosition < 20) {
          scope.$apply(attrs.infiniteScrollBottom);
        }

      });
    };
  }

  function downloadFile() {
    var rHTTP = /^[http|https]/;

    return {
      restrict: 'A',
      link: link
    };

    function link(scope, element) {
      // var file = scope.file

      // console.log('download file ::: ', element, scope);
      // // file download or href(integration file은 href)
      // element.attr(
      //   rHTTP.test(file.content.fileUrl) ?
      //     {href: file.content.fileUrl, target: '_blank'} :
      //     {href: scope.server_uploaded + 'download/' + file.content.fileUrl, download: file.content.name}
      // );
    }
  }

})();