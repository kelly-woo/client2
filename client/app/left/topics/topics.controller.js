/**
 * @fileoverview 토픽 리스트 컨트롤러
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('topicsCtrl', topicsCtrl);

  function topicsCtrl($scope, TopicFolderModel) {
    $scope.createTopicFolder = createTopicFolder;

    /**
     * Topic folder 를 생성한다.
     * @param {event} clickEvent
     */
    function createTopicFolder(clickEvent) {
      clickEvent.stopPropagation();
      TopicFolderModel.create(true);
    }
  }
})();
