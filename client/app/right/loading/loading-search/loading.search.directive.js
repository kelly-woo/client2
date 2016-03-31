/**
 * @fileoverview loading search dicrective
 */
(function() {
  'use strict';
  
  angular
    .module('jandiApp')
    .directive('rightLoadingSearch', rightLoadingSearch);
  
  function rightLoadingSearch($filter) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        status: '='
      },
      templateUrl : 'app/right/loading/loading-search/loading.search.html',
      link: link
    };

    function link(scope, el, attrs) {
      var _type = attrs.type;
      var _translate = $filter('translate');

      _init();

      /**
       * init
       * @private
       */
      function _init() {
        _setContents();
      }

      /**
       * 로딩 컨텐츠 설정
       * @private
       */
      function _setContents() {
        var imageURL;
        var helpMessageKey;

        switch(_type) {
          case 'mention':
            imageURL = 'assets/images/mention-empty.png';
            helpMessageKey = '@mention-empty';
            break;
          case 'starAll':
            imageURL = 'assets/images/star-message-empty.png';
            helpMessageKey = '@star-all-empty';
            break;
          case 'starFiles':
            imageURL = 'assets/images/star-file-empty.png';
            helpMessageKey = '@star-files-empty';
            break;
        }

        scope.imageURL = imageURL;
        scope.helpMessage = _translate(helpMessageKey);
      }
    }
  }
})();
