(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('topics', topics);

  function topics(TopicFolderModel) {
    return {
      restrict: 'EA',
      scope: false,
      controller: 'topicsCtrl',
      link: link,
      transclude: true,
      replace: true,
      templateUrl: 'app/left/topics/topics.html'
    };

    function link(scope, el, attrs) {
      scope.folderData = TopicFolderModel.getFolderData();
      scope.$on('topic-folder:update', function(e, folderData) {
        scope.folderData = folderData;
      });
      //console.log('scope.folderData', scope.folderData);
    }
  }
})();