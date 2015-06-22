/**
 * @fileoverview image carousel service
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('ImageCarousel', ImageCarousel);

  /* @ngInject */
  function ImageCarousel($state, fileAPIservice) {
    var that = this;

    that.init = init;
    function init() {

    }

    var ImageCarousel = {
        init: function(options) {
            var that = this;

            that.options = {
                fileType: 'image',
                keyword: '',
                searchType: 'file',
                writerId: 'all'
            };
            angular.extend(that.options, options);

            return that;
        },
        _on: function() {

        },
        setStartMessageId: function(messageId) {
            this.messageId = messageId;
        }
    };

    _.each(['prev', 'next'], function(value) {
        ImageCarousel[value] = (function(value) {
            var isPrev = value === '';
            return function() {
                var that = this;
                var options = that.options;

                fileAPIservice
                    .getFileList(
                        angular.extend({
                            listCount: isPrev ? 1 : -1;,
                            sharedEntityId: parseInt($state.params.entityId),
                            startMessageId: that.messageId
                        }, options)
                    )
                    .success(function(files) {
                        console.log('get a files ::: ', files);
                    })
                    .error(function() {
                        console.log('error for files ::: ');
                    });
            };
        }(value));
    });


    this.getList = getList;
    this.getRecentList = getRecentList;

    fileAPIservice.getFileList({
        fileType: "image",       // image
        keyword: "",
        searchType: "file",      // searchType
        writerId: "all",         // writerId
        listCount: 10,           // options list count (+/-) preload
        sharedEntityId: 295,     // options
        startMessageId: -1,      // options image가 시작하는 id
        teamId: 279             // options
    });

    /**
     *
     * @param groupId
     * @returns {*}
     */
    function getList(groupId) {
      return $http({
        method  : 'GET',
        url     : server_address + 'stickers/groups/' + groupId
      });
    }

    /**
     *
     * @returns {*}
     */
    function getRecentList() {
      var teamId = memberService.getTeamId();
      return $http({
        method  : 'GET',
        url     : server_address + 'stickers/teams/' + teamId + '/recent'
      });
    }

    $(window).resize(function() {
        var jqViewerBody = $('.viewer-body')
        $('.content').children().css({
            maxWidth: jqViewerBody.width() - 56 * 2,
            maxHeight: jqViewerBody.height() -56 * 2
        });
    });
  }
})();
