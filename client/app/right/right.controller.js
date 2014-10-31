'use strict';

var app = angular.module('jandiApp');

app.controller('rightpanelController', function($scope, $rootScope, $modal, $timeout, $state, entityheaderAPIservice, fileAPIservice, analyticsService, $filter) {

    $scope.isLoading = true;
    $scope.isScrollLoading = true;

    //console.info('[enter] rightpanelController');

    var startMessageId   = -1;

    $scope.fileTitleQuery   = '';

    $scope.fileRequest      = {};
    $scope.fileRequest.searchType       = 'file';
    $scope.fileRequest.writerId         = 'all';
    $scope.fileRequest.sharedEntityId   = $state.params.entityId;
    $scope.fileRequest.fileType         = 'all';
    $scope.fileRequest.startMessageId   = -1;
    $scope.fileRequest.listCount        = 10;
    $scope.fileRequest.keyword          = '';

    $scope.sharedEntitySearchQuery  = $scope.currentEntity;
    $scope.selectOptions            = fileAPIservice.getShareOptions($scope.joinedChannelList, $scope.userList, $scope.privateGroupList);

    $scope.selectOptionsUsers       = [$scope.user];
    $scope.selectOptionsUsers       = $scope.selectOptionsUsers.concat($scope.userList);

    $scope.fileTypeList = ['all', 'image', 'pdf', 'audio', 'video'];

    $scope.fileList = [];

    $rootScope.$on('updateFileTypeQuery', function(event, type) {
        if (type === 'you') {
            // when 'Your Files' is clicked on 'cpanel-search__dropdown'
            $scope.fileRequest.writerId = $scope.user.id;
            $scope.fileRequest.fileType = 'all';
        }
        else {
            if (type === 'all') {
                // when 'All Files' is clicked oon 'cpanel-search__dropdown'
                $scope.fileRequest.writerId = 'all';

                //  Question.
                //  when 'All Files' is clicked,
                //  Should I search from all sharedEntity or current channel?
                $scope.sharedEntitySearchQuery = null;
            }
            $scope.fileRequest.fileType = type;
        }
    });

    //  when file was uploaded from center panel,
    //  fileAPI broadcasts 'onChangeShared' to rootScope.
    //  right controller is listening to 'onChangeShared' and update file list.
    $rootScope.$on('onChangeShared', function() {
        preLoadingSetup();
        getFileList();
    });

    //  From profileViewerCtrl
    $rootScope.$on('updateFileWriterId', function(event, userId) {
        $scope.fileRequest.writerId = userId;
    });

    //  when sharedEntitySearchQuery is changed,
    //  1. check if value is null
    //      if null -> meaning searching for all chat rooms.
    //          else -> set to selected value.
    $scope.$watch('sharedEntitySearchQuery', function() {
        if ($scope.sharedEntitySearchQuery === null) {
            $scope.fileRequest.sharedEntityId = -1;
        }
        else {
            $scope.fileRequest.sharedEntityId = $scope.sharedEntitySearchQuery.id;
        }

//        console.log('sharedEntitySearchQuery chagned to  ' + $scope.sharedEntitySearchQuery.id + '/' + $filter('getFirstLastNameOfUser')($scope.sharedEntitySearchQuery));

        preLoadingSetup();
        getFileList();
    });

    //  fileRequest.writerId => 작성자
    $scope.$watch('fileRequest.writerId', function() {
        if ($scope.fileRequest.writerId === null) {
            $scope.fileRequest.writerId = 'all';
        }

//        console.log('fileRequest.writerId changed!!! to ' + $scope.fileRequest.writerId);

        preLoadingSetup();
        getFileList();
    });

    //  fileRequest.fileType => 파일 타입
    //  fileRequest.keyword  => text input box
    //  한가지라도 바뀌면 알아서 다시 api call을 한다.
    $scope.$watch('[fileRequest.fileType, fileRequest.keyword]',
        function(newValue, oldValue) {
            preLoadingSetup();
            getFileList();
    }, true);


    // Watching joinEntities in parent scope so that currentEntity can be automatically updated.
    //  advanced search option 중 'Shared in'/ 을 변경하는 부분.
    $scope.$watch('currentEntity', function(newValue, oldValue) {
        if (newValue != oldValue) {
            updateSharedList();

//            console.log('this is updateSharedList in right.controller')
//            console.log($scope.currentEntity)

            //  channel could be removed/created/left
            //  update selectOptions for data syncrhonization issue.
            $scope.selectOptions            = fileAPIservice.getShareOptions($scope.joinedChannelList, $scope.userList, $scope.privateGroupList);
            $scope.sharedEntitySearchQuery = $scope.currentEntity;
        }
    });

    // loop through list of files and update shared list of each file.
    function updateSharedList() {
        _.each($scope.fileList, function(file) {
            file.shared = fileAPIservice.getSharedEntities(file);
        });
    }

    function preLoadingSetup() {
        $scope.fileRequest.startMessageId   = -1;
        isEndOfList = false;
        $scope.isLoading = true;
    }

    var isEndOfList = false;

    $scope.loadMore = function() {
        if (isEndOfList) return;

        $scope.isScrollLoading = true;
        $scope.fileRequest.startMessageId = startMessageId;

        getFileList();
    };

    function getFileList() {

        fileAPIservice.getFileList($scope.fileRequest)
            .success(function(response) {
                var fileList = [];
                angular.forEach(response.files, function(entity, index) {

                    var file = entity;
                    file.shared = fileAPIservice.getSharedEntities(file);
                    this.push(file);

                }, fileList);

                generateFileList(fileList, response.fileCount, response.firstIdOfReceivedList);
            })
            .error(function(response) {
                console.log(response.msg);
            });
    }

    function generateFileList(fileList, fileCount, firstIdOfReceivedList) {
        if (fileCount === 0 && $scope.isScrollLoading) {
            $('.file-list__item.loading').addClass('opac_out');

            $scope.isScrollLoading = false;
            isEndOfList = true;
            return;
        }

        startMessageId = firstIdOfReceivedList;

        if($scope.fileRequest.startMessageId === -1) {
            //  Not loading more.
            //  Replace current fileList with new fileList.
//            $('.file-list__item').addClass('opac_out');
            $scope.fileList = fileList;

        }
        else {
            //  Loading more.
            //  Append fileList to current fileList
            _.forEach(fileList, function(item) {
                $scope.fileList.push(item);
            });
        }
        $scope.isScrollLoading = false;
        $scope.isLoading = false;

        //  when user typed title in for search, expand advanced search option panel.
        if ($scope.fileRequest.keyword != '') {
            $scope.isAdvancedOptionCollapsed = false;
        }
    }


    // Callback function from file finder(navigation) for uploading a file.
    $scope.onFileSelect = function($files) {
        $scope.selectedFiles = $files;
        $scope.dataUrls = [];

        for ( var i = 0; i < $files.length; i++) {
            var file = $files[i];

            if (angular.isDefined(FileAPI.support) && !FileAPI.support.html5) {
                $scope.supportHtml5 = FileAPI.support.html5;
            }
            else {
                $scope.supportHtml5 = true;

                if (window.FileReader && file.type.indexOf('image') > -1) {
                }
            }
        }
        this.openModal('file');
    };


    $scope.openModal = function(selector) {
        // OPENING JOIN MODAL VIEW
        if (selector == 'file') {
            $modal.open({
                scope       : $scope,
                templateUrl : 'app/modal/upload.html',
                controller  : 'fileUploadModalCtrl',
                size        : 'lg'
            });
        }
        else if (selector == 'share') {
            $modal.open({
                scope       : $scope,
                templateUrl : 'app/modal/share.html',
                controller  : 'fileShareModalCtrl',
                size        : 'lg'
            });
        }
    };

    $scope.$on('openFileShare', function(event, file) {
        $scope.onClickShare(file);
    });

    $scope.onClickShare = function(file) {
        $scope.fileToShare = file;
        this.openModal('share');
    };

    $scope.onClickUnshare = function(message, entity) {
        fileAPIservice.unShareEntity(message.id, entity.id)
            .success(function() {
                // analytics
                var share_target = "";
                switch (entity.type) {
                    case 'channel':
                        share_target = "channel";
                        break;
                    case 'privateGroup':
                        share_target = "private";
                        break;
                    case 'user':
                        share_target = "direct message";
                        break;
                    default:
                        share_target = "invalid";
                        break;
                }
                var file_meta = (message.content.type).split("/");
                var share_data = {
                    "entity type"   : share_target,
                    "category"      : file_meta[0],
                    "extension"     : message.content.ext,
                    "mime type"     : message.content.type,
                    "size"          : message.content.size
                };
                analyticsService.mixpanelTrack( "File Unshare", share_data );

                fileAPIservice.broadcastChangeShared(message.id);
            })
            .error(function(err) {
                alert(err.msg);
            });
    };
    
    $scope.onClickSharedEntity = function(entityId) {
        var targetEntity = fileAPIservice.getEntityById($scope.totalEntities, entityId);
        if (fileAPIservice.isMember(targetEntity, $scope.user)) {
            $state.go('archives', { entityType: targetEntity.type + 's', entityId: targetEntity.id });
        } else {
            entityheaderAPIservice.joinChannel(targetEntity.id)
                .success(function(response) {
                    $rootScope.$emit('updateLeftPanelCaller');
                    $state.go('archives', {entityType:targetEntity.type + 's',  entityId:targetEntity.id});
                })
                .error(function(err) {
                    alert(err.msg);
                });
        }
    };

    $scope.setCommentFocus = function(file) {
        if ($state.params.itemId != file.id) {
            $rootScope.setFileDetailCommentFocus = true;

            $state.go('files', {
                userName    : file.writer.name,
                itemId      : file.id
            });
        }
        else {
            fileAPIservice.broadcastCommentFocus();
        }
    };
});
