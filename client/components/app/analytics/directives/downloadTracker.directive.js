(function() {
  'use strict';

  /**
  * @desc File Download Event Tracker. Donwload시 Log를 수집한다.
  * @example <a download-file file-url="{{file_detail.content.fileUrl}}" 
  * file-title="{{file_detail.content.name}}" download-tracker="{{test2(file_detail)}}" 
  * ng-click="onClickDownload(file_detail);">
  */

  angular
    .module('app.analytics')
    .directive('downloadTracker', downloadTracker);

  downloadTracker.$inject = ['GAHelper', 'analyticsHelper']

  function downloadTracker(GAHelper, analyticsHelper){
    return {
      restrict: 'A',
      link: linkFunc
    };


    function linkFunc(scope, element, attributes) {
      
      var fileId;

      scope.track = function(fileInfo) {
        fileId = fileInfo.id;
      };

      element.on('click', function() {
        if (fileId) {
          var property = {};
          property[analyticsHelper.PROPERTY.FILE_ID] = fileId; 
          analyticsHelper.track(analyticsHelper.EVENT.FILE_DOWNLOAD, property);
        }
      });
      
    }
  }
})();
