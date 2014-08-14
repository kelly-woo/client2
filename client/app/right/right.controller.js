'use strict';

var app = angular.module('jandiApp');

app.controller('rightpanelController', function($scope, $rootScope, $modal, $timeout, $state, entityheaderAPIservice, fileAPIservice) {

    console.info('[enter] rightpanelController');

    $scope.fileTypeQuery    = 'All';
    $scope.tabIndicator     = 'everyone';
    $scope.fileUploader     = 'everyone';

    $scope.fileList = [];

    $rootScope.$on('updateFileTypeQuery', function(event, type) {
        if (type == 'you') {
            // when 'Your Files' is clicked on 'cpanel-search__dropdown'
            $scope.fileUploader = 'you';
            $scope.fileTypeQuery = 'All';
            $scope.tabIndicator = 'notEveryone';
        }
        else {
            if (type == 'All') {
                // when 'All Files' is clicked oon 'cpanel-search__dropdown'
                $scope.fileUploader = 'everyone';
                $scope.tabIndicator = 'everyone';
            }

            $scope.fileTypeQuery = type;
        }
    });

    $scope.onFileFilterWriterIdClick = function(writerId) {
        $scope.fileUploader = writerId;
        $scope.tabIndicator = 'notEveryone';
    }

    $scope.getfileUploaderId = function() {
        if ($scope.fileUploader == 'you')
            return $scope.user.id;
        else
            return $scope.fileUploader;
    };
    getFileList();

    // Functions outside of this controller or from html template can call this function in order to update file list.
    $scope.$on('onChangeShared', function() {
        getFileList();
    });

    function getFileList() {
        fileAPIservice.getFileList()
            .success(function(response) {
                var fileList = [];
                angular.forEach(response.files, function(entity, index) {

                    var file = entity;
                    file.shared = fileAPIservice.getSharedEntities(file);
                    this.push(file);

                }, fileList);

                $scope.fileList = fileList;

//                console.log("[$scope.fileLists] ", $scope.fileList);
            })
            .error(function(response) {
                console.log(response.msg);
            })
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
                controller  : fileUploadModalCtrl,
                size        : 'lg'
            });
        }
        else if (selector == 'share') {
            $modal.open({
                scope       : $scope,
                templateUrl : 'app/modal/share.html',
                controller  : fileShareModalCtrl,
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
