'use strict';

var app = angular.module('jandiApp');

app.controller('rightpanelController', function($scope, $rootScope, $modal, $timeout, $state, entityheaderAPIservice, fileAPIservice) {

    $scope.isLoading = true;
    $scope.isScrollLoading = false;

    console.info('[enter] rightpanelController');

    $scope.tabIndicator     = 'everyone';
    $scope.fileTitleQuery   = '';

    $scope.fileRequest      = {};
    $scope.fileRequest.searchType       = 'file';
    $scope.fileRequest.writerId         = 'all';
    $scope.fileRequest.sharedEntityId   = -1;
    $scope.fileRequest.fileType         = 'all';
    $scope.fileRequest.startMessageId   = -1;
    $scope.fileRequest.listCount        = 10;
    $scope.fileRequest.keyword          = '';


    var startMessageId   = -1;

    $scope.fileList = [];

    $rootScope.$on('updateFileTypeQuery', function(event, type) {
        if (type === 'you') {
            // when 'Your Files' is clicked on 'cpanel-search__dropdown'
            $scope.fileRequest.writerId = 'mine';
            $scope.fileRequest.fileType = 'all';
            $scope.tabIndicator = 'notEveryone';
        }
        else {
            if (type === 'all') {
                // when 'All Files' is clicked oon 'cpanel-search__dropdown'
                $scope.fileRequest.writerId = 'all';
                $scope.tabIndicator = 'everyone';
            }
            $scope.fileRequest.fileType = type;
        }
    });

    //  From profileViewerCtrl
    $rootScope.$on('updateFileWriterId', function(event, userId) {
        $scope.fileRequest.writerId = userId;
        $scope.tabIndicator = 'notEveryone';
    });

    $scope.$watch('[fileRequest.writerId, fileRequest.sharedEntityId, fileRequest.fileType, fileRequest.keyword]',
        function(newValue, oldValue) {
            preLoadingSetup();
            getFileList();
    }, true);

    // Functions outside of this controller or from html template can call this function in order to update file list.
    $scope.$on('onChangeShared', function() {
        preLoadingSetup();
        getFileList();
    });

    function preLoadingSetup() {
        $scope.fileRequest.startMessageId   = -1;
        isEndOfList = false;
        $scope.isLoading = true;
    }

    $scope.onFileFilterWriterIdClick = function(writerId) {
        $scope.fileRequest.writerId = writerId;
        $scope.tabIndicator = 'notEveryone';
    };

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
                console.log(response)

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
            $('.file-list__item').addClass('opac_out');
            $scope.fileList = fileList;
            console.log('replacing');

        }
        else {
            //  Loading more.
            //  Append fileList to current fileList
            console.log('appending')
            _.forEach(fileList, function(item) {
                $scope.fileList.push(item);
            });

        }
        $scope.isScrollLoading = false;
        $scope.isLoading = false;
    }

    // Watching joinEntities in parent scope so that currentEntity can be automatically updated.
    $scope.$watch('currentEntity', function(newValue, oldValue) {
        if (newValue != oldValue) updateSharedList();
    });

    // loop through list of files and update shared list of each file.
    function updateSharedList() {
        _.each($scope.fileList, function(file) {
            file.shared = fileAPIservice.getSharedEntities(file);
        });
    }

    // Callback function from file finder(navigation) for uploading a file.
    $scope.onFileSelect = function($files) {
        $scope.selectedFiles = $files;
        $scope.dataUrls = [];
        for ( var i = 0; i < $files.length; i++) {
            var file = $files[i];
            if (window.FileReader && file.type.indexOf('image') > -1) {
                var fileReader = new FileReader();
                fileReader.readAsDataURL(file);
                var loadFile = function(fileReader, index) {
                    fileReader.onload = function(e) {
                        $timeout(function() {
                            $scope.dataUrls[index] = e.target.result;
                        });
                    }
                }(fileReader, i);
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

    $scope.isToggled = false;

    $scope.toggleDropdown = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.isToggled = !$scope.isToggled;
    };

    $scope.onClickShare = function(file) {
        $scope.fileToShare = file;
        this.openModal('share');
    };

    $scope.onClickUnshare = function(messageId, entityId) {
        fileAPIservice.unShareEntity(messageId, entityId)
            .success(function(response) {
                fileAPIservice.broadcastChangeShared(messageId);
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

});
