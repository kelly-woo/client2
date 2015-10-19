/**
 * @fileoverview compile 시 { } syntax 를 무시하는 디렉티브
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndSelectboxTopic', jndSelectboxTopic);

  function jndSelectboxTopic(EntityMapManager, TopicFolderModel, publicService) {
    return {
      restrict: 'AE',
      link: link,
      replace: true,
      scope: {},
      templateUrl: 'app/util/directive/jnd.selectbox.topic.html'
    };

    function link(scope, element, attrs) {
      var _jqInput = element.find('input');
      scope.onKeyUp = onKeyUp;

      _init();

      function _init() {
        scope.folderData = TopicFolderModel.getFolderData();
        scope.memberData = _getMemberData();
        scope.searchList = [];
        _jqInput.focus();
      }
      function _getMemberData() {
        var memberMap = EntityMapManager.getMap('member');
        var enabledList = [];
        var disabledList = [];
        _.each(memberMap, function(member) {

          if (publicService.isDisabledMember(member)) {
            disabledList.push(member);
          } else {
            enabledList.push(member)
          }
        });
        return {
          enabledList: enabledList,
          disabledList: disabledList
        };
      }
      function onKeyUp() {
        _search(_jqInput.val());
      }

      function _search(keyword) {
        var start;
        var result = [];
        keyword = _.trim(keyword);
        if (keyword) {
          keyword = keyword.toLowerCase();

          _.each(EntityMapManager.getMap('joined'), function (entity) {
            start = entity.name.toLowerCase().search(keyword);
            if (start !== -1) {
              result.push({
                entity: entity,
                name: _highlight(entity.name, start, keyword.length),
              });
            }
          });
          _.each(EntityMapManager.getMap('member'), function (entity) {
            start = entity.name.toLowerCase().search(keyword);
            if (start !== -1) {
              result.push({
                entity: entity,
                name: _highlight(entity.name, start, keyword.length),
              });
            }
          });
        }
        scope.searchList = result;
      }

      function _highlight(string, start, length) {
        var strArr = [
          string.substring(0, start),
          '<b>',
          string.substring(start, start + length),
          '</b>',
          string.substring(start + length)
        ];
        return strArr.join('');
      }
    }
  }
})();
