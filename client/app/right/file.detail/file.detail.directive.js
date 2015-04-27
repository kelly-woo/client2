(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('fileDetailPreview', fileDetailPreview);

  function fileDetailPreview($filter) {
    /**
     * file detail에서 integraiton preview로 들어갈 image map
     */
    var integrationPreviewMap = {
      google: '../assets/images/integration/preview/web_preview_google.png',
      dropbox: '../assets/images/integration/preview/web_preview_dropbox.png'
    };

    return {
      restrict: 'A',
      link: link
    };

    function link(scope, element, attrs) {
      var content = scope.file_detail.content;
      var src;

      // file detail에서 preview image 설정
      src = $filter('hasPreview')(content) ? scope.server_uploaded + content.extraInfo.largeThumbnailUrl : integrationPreviewMap[content.serverUrl];
      src ? element.show().children('img').attr('src', src) : element.hide();
    }
  }
})();