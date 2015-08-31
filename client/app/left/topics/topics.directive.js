(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('topics', topics);

  function topics() {
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

      el.on('dragover', _onDragOver);
      el.on('drop', _onDrop);

      function _onDragOver(dragEvent) {
        console.log('onDragOver', dragEvent);
      }

      function _onDrop(dragEvent) {
        console.log('onDrop', dragEvent);
      }
    }


  }
})();