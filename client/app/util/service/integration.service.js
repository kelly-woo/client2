(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('integrationService', integrationService);

  /* @ngInject */
  function integrationService($rootScope, $modal, $timeout, configuration, fileAPIservice, fileObjectService,
                              accountService, storageAPIservice, analyticsService, FilesUploadCreator,
                              currentSessionHelper) {
    /**
     * integration service를 추가 하기를 원한다면 Integration object를 확장하여 구현해야 한다.
     */

    /**
     * Integration
     */
    var Integration = jnd.Object.create({
      init: function(options) {
        var that = this;

        // file upload object
        that.filesUpload = FilesUploadCreator.createInstance({
          straight: true,
          uploadType: 'integration',
          supportFileAPI: true,
          convertFileInfo: function(file) {
            that._updateFileObject(file);

            return file;
          },
          onSuccess: function(response) {
            $rootScope.curUpload.status = 'done';
            _successAnalytics(response);
          },
          onError: function() {
            that._uploadErrorHandler($rootScope);
          },
          onProgress: function(evt, file, index, length) {
            // center.html에 표현되는 progress bar의 상태 변경
            $rootScope.curUpload = {};

            $rootScope.curUpload.lFileIndex = length;
            $rootScope.curUpload.cFileIndex = index + 1;

            $rootScope.curUpload.title = file.title;
            $rootScope.curUpload.progress = parseInt(100.0 * evt.loaded / evt.total);
            $rootScope.curUpload.status = 'uploading';
          },
          onEnd: function() {
            that._closeProgressBar();
          }
        });

        return that;
      },
      open: function(scope) {
        var that = this;

        that.options.scope = scope;
      },
      /**
       * addEventListeners
       */
      _fileGetCallback: function(files) {
        var that = this;

        // file select callback
        if (that.onSelect) {
          that.onSelect(files);
        }
      },
      onSelect: function(files) {
        var that = this,
            fileObject;

        // jandi file object
        fileObject = Object.create(fileObjectService).init(files, {
          validateFileSize: false,
          createFileObject: that._createFileObject.bind(that)
        });

        fileObject.promise.then(function() {
          if (fileObject.size() > 0) {
            // direct upload user interface 사용
            $rootScope.supportHtml5 = angular.isDefined(FileAPI.support) ? !!FileAPI.support.html5 : fileObject.options.supportAllFileAPI;
            that._fileUploadSequence(fileObject);
          }
        });
      },
      /**
       * 연속된 file upload
       */
      _fileUploadSequence: function(files) {
        var that = this;

        that.filesUpload.setFileObject(files);
        that.filesUpload.resetProgressIndex();
        that.filesUpload.upload();
      },
      /**
       * file upload시 error 처리
       */
      _uploadErrorHandler: function($scope) {
        $scope.curUpload.status = 'error';
        $scope.curUpload.hasError = true;
        $scope.curUpload.progress = 0;
      },
      /**
       * center.html에 표현되는 progress bar close
       */
      _closeProgressBar: function() {
        fileAPIservice.clearCurUpload();
      },
      /**
       * upload uri에 전달하는 data object create
       */
      _updateFileObject: function(file) {
        var that = this;

        file.isPrivateFile = false;

        if (file.isPrivateFile) {   // privategroups
          file.permission = that.PRIVATE_FILE;
          file.share = '';
        } else {                        // channel
          file.permission = that.PUBLIC_FILE;
          file.share = _getFileShareId(that.options.scope);
        }
      },
      /**
       * integration modal open
       */
      _openIntegrationModal: function(data) {
        var that = this;
        var modal;

        // modal이 이미 open된 상태라면 cancel
        that.modal && that.modal.dismiss('cancel');

        that.modal = $modal.open({
          scope: that.options.scope,
          templateUrl: 'app/modal/files/integration/integration.html',
          controller: 'fileIntegrationModalCtrl',
          size: 'lg',
          windowClass: 'integration-modal',
          resolve: {
            data: function() {
              return data;
            }
          }
        });

        //modalHelper.openFileIntegrationModal(that.options.scope, data);
      },
      /**
       * modal close
       */
      _closeIntegrationModal: function(fn) {
        var that = this;

        fn && fn();

        $timeout(function() {
          that.modal && that.modal.dismiss('cancel');
        });
      },
      PRIVATE_FILE: 740,   // PRIVATE_FILE code
      PUBLIC_FILE: 744     // PUBLIC_FILE code
    });


    /**
     * GoogleDrive Integration
     */
    var GoogleDriveIntegration = Integration.create({
      init: function(options) {
        var that = this;

        Integration.init.call(that, options);

        that.localeMap = {
          'ko': 'ko',
          'zh-cn': 'zh-CN',
          'zh-tw': 'zh-TW',
          'ja': 'ja',
          'en': 'en'
        };

        that.options = {
          apiKey: '',
          clientId: '',
          multiple: true
        };

        angular.extend(that.options, options);
        that.options.buttonEle = $(that.options.buttonEle);

        // Load the drive API
        gapi.client.setApiKey(that.options.apiKey);
        gapi.client.load('drive', 'v2', that._driveApiLoaded.bind(that) );
        google.load('picker', '1', { callback: that._pickerApiLoaded.bind(that) });

        return that;
      },
      cInterface: 'alert',
      service: 'google', // server에 전달하는 service type
      /**
       * google drive picker open
       * token이 존재한다면 picker를 바로 출력하고, 아니면 인증완료후 picker 호출
       */
      open: function(scope) {
        var that = this;
        var token;

        Integration.open.call(that, scope);

        if (token = gapi.auth.getToken()) {
          that._showPicker();
        } else {
          if (that.cInterface === 'alert') {
            that._openIntegrationModal();
            that._open();
          } else {
            storageAPIservice.getCookie('integration', 'google') !== true ? that._openIntegrationModal() : that._open();
          }
        }
      },
      /**
       * google drive modal open
       */
      _open: function() {
        var that = this;

        that._doAuth(false, function(token) {
          that._showPicker();
        }.bind(that));
      },
      /**
       * picker object 생성 & 출력
       * picker object 생성시 options 수정 가능함.
       */
      _showPicker: function() {
        var that = this;
        var accessToken = gapi.auth.getToken().access_token;
        var view = new google.picker.DocsView();
        var picker = that.picker = new google.picker.PickerBuilder();
        var lang = accountService.getAccountLanguage();

        that._closeIntegrationModal();

        view.setIncludeFolders(true);

        // multiple file upload
        that.options.multiple && picker.enableFeature(google.picker.Feature.MULTISELECT_ENABLED);

        picker
          .enableFeature(google.picker.Feature.NAV_HIDDEN)
          .setAppId(that.options.clientId)
          .setDeveloperKey(that.options.apiKey)
          .setOAuthToken(accessToken)
          .addView(view)
          .setOrigin(window.location.protocol + '//' + window.location.host)
          .setLocale(that.localeMap[lang])
          .setCallback(that._pickerCallback.bind(that))
          .build()
          .setVisible(true);
      },
      /**
       * picker의 상태 변경 callback
       */
      _pickerCallback: function(data) {
        var that = this;

        if (data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
          // Get metadata of file
          // var file = data[google.picker.Response.DOCUMENTS][0],
          //   id = file[google.picker.Document.ID],
          //   request = gapi.client.drive.files.get({
          //     fileId: id
          //   });
          // request.execute(that._fileGetCallback.bind(that));

          that._fileGetCallback(data.docs);
        }
      },
      _pickerApiLoaded: function() {
        var that = this,
            buttonEle = that.options.buttonEle;

        buttonEle && buttonEle.length > 0 && this.options.buttonEle.attr('disabled', false);
      },
      _driveApiLoaded: function() {
        this._doAuth(true);
      },
      doAuth: function(token) {
        var that = this;

        gapi.auth.setToken(token);
        that._showPicker();
      },
      _doAuth: function(immediate, callback) {
        var params = {
          client_id: this.options.clientId,
          scope: 'https://www.googleapis.com/auth/drive.readonly',
          immediate: immediate,
          response_type: 'code'
        };

        !immediate && (params.redirect_uri = configuration.integration.google_drive.redirect + 'oauth2/google');

        gapi.auth.authorize(params, callback);
      },
      /**
       * file upload시 server로 전달하는 data object 생성
       */
      _createFileObject: function(file) {
        return {
          title: file.name,
          link: file.url,
          service: this.service,
          mimeType: file.mimeType,
          size: file.sizeBytes
        };
      },
      /**
       * google drive integration modal open
       */
      _openIntegrationModal: function() {
        var that = this;
        var originalDomain = window.document.domain;

        Integration._openIntegrationModal.call(that,
          {
            title: '@integration-title-google-drive',   // modal title
            descs: [                                    // modal description
              {
                className: 'integration-desc-google-drive-1',
                txt: '@integration-desc-google-drive-1',
              },
              {
                className: 'integration-desc-google-drive-2',
                txt: '@integration-desc-google-drive-2'
              },
              {
                className: 'integration-desc-google-drive-3',
                txt: '@integration-desc-3'
              }
            ],
            startIntegration: function() {    // 연동 시작 버튼 핸들러
              storageAPIservice.setCookie('integration', 'google', true);

              that._open();
            },
            closeIntegration: function() {
              that._closeIntegrationModal();
            },
            cInterface: that.cInterface             // modal의 확인 interface 명
          }
        );

        // google drive popup 연동을 위해 domain 일시적 수정함
        // modal close될때 original domain으로 변경함
        window.document.domain = 'jandi.' + /.([a-zA-Z]+)$/.exec(window.document.domain)[1];
        that.modal.result.then(
          function() {},
          function() {
            window.document.domain = originalDomain;
          }
        );
      }
    });

    /**
     * DropBox Integration
     */
    var DropBoxIntegration = Integration.create({
      init: function(options) {
        var that = this;

        Integration.init.call(that, options);

        that.options = {
          multiple: true
        };

        angular.extend(that.options, options);
        that.options.buttonEle = $(that.options.buttonEle);

        // DropboxIntegration object 생성시 cookie에 dropbox integrate cookie가 있다면 바로 Dropbox listener를 button에 등록함.
        if (that.cInterface !== 'alert') {
          storageAPIservice.getCookie('integration', 'dropbox') === true && that._open();
        }

        return that;
      },
      cInterface: 'alert',
      service: 'dropbox',
      /**
       * dropbox choose object 생성 & 출력
       * choose object 생성시 options 수정 가능함.
       */
      open: function(scope) {
        var that = this;

        Integration.open.call(that, scope);

        if (that.cInterface === 'alert') {
          that._openIntegrationModal();
          that._open();
        } else {
          storageAPIservice.getCookie('integration', 'dropbox') !== true ? that._openIntegrationModal() : that._open();
        }
      },
      /**
       * dropbox의 modal open
       */
      _open: function() {
        var that = this;

        Dropbox.choose({
          success: that._success.bind(that),
          cancel: that._cancel.bind(that),
          linkType: "preview",
          multiselect: that.options.multiple,
          extenstion: ['.*']
        });
      },
      _success: function(files) {
        var that = this;

        if (!that._successLock) {
          that._successLock = true;
          that._closeIntegrationModal();
          that._fileGetCallback(files);
        }
      },
      _cancel: function() {
        var that = this;

        that._closeIntegrationModal();
      },
      /**
       * Dropbox.choose를 수행한 만큼 _success callback 이 수행되므로 _success callback을 한번만
       * 수행하도록 처리해야 함. 처리 방법으로 _success 수행시 lock을 걸고 _closeProgressBar이 수행될때
       * lock을 해제 하도록 함.
       */
      _closeProgressBar: function() {
        var that = this;

        Integration._closeProgressBar.call(that);

        that._successLock = false;
      },
      /**
       * file upload시 server로 전달하는 data object 생성
       */
      _createFileObject: function(file) {
        return {
          title: file.name,
          link: file.link,
          service: this.service,
          size: file.bytes
        };
      },
      /**
       * dropbox modal integration open
       */
      _openIntegrationModal: function() {
        var that = this;

        Integration._openIntegrationModal.call(that,
          {
            title: '@integration-title-dropbox',    // modal title
            descs: [                                // modal description
              {
                className: 'integration-desc-dropbox-1',
                txt: '@integration-desc-dropbox-1',
              },
              {
                className: 'integration-desc-dropbox-2',
                txt: '@integration-desc-dropbox-2'
              },
              {
                className: 'integration-desc-dropbox-3',
                txt: '@integration-desc-3'
              }
            ],
            startIntegration: function() {    // 연동 시작 버튼 핸들러
              storageAPIservice.setCookie('integration', 'dropbox', true);

              that._open();
            },
            closeIntegration: function() {
              that._cancel();
            },
            cInterface: that.cInterface   // modal의 확인 interface 명
          }
        );
      }
    });

    // google drive picker docs: https://developers.google.com/picker/docs/
    var googleDriveIntegration;
    var googleDriveIntegrationLock;
    function createGoogleDrive($scope, options) {
      var apiKey = configuration.integration.google_drive.api_key;
      var clientId = configuration.integration.google_drive.client_id;

      if (!googleDriveIntegrationLock) {
        if (!googleDriveIntegration) {
          googleDriveIntegrationLock = true;
          $.getScript('https://www.google.com/jsapi?key=' + apiKey)
            .done(function() {
              $.getScript('https://apis.google.com/js/client.js?onload=_createGDPicker')
                .fail(function() {
                  googleDriveIntegrationLock = false;
                });
            })
            .fail(function(evt) {
              googleDriveIntegrationLock = false;
              console.error('google dirve integrate error', evt);
            });

          window._createGDPicker = function() {
            googleDriveIntegrationLock = false;

            (googleDriveIntegration = window.googleDriveIntegration = Object.create(GoogleDriveIntegration).init({
              apiKey: apiKey,                         // 필수, google dirve api key
              clientId: clientId,                     // 필수, goggle dirve client id
              multiple: options.multiple || true      // multiple file upload
            })).open($scope);
          };
        } else {
          googleDriveIntegration && googleDriveIntegration.open($scope);
        }
      }
    }

    // dropbox chooser docs: https://www.dropbox.com/developers/dropins/chooser/js
    var dropboxIntegration;
    var dropboxIntegrationLock;
    function createDropBox($scope, options) {
      var apiKey = configuration.integration.dropbox;

      if (!dropboxIntegrationLock) {
        if (!dropboxIntegration) {
          dropboxIntegrationLock = true;
          $.getScript('https://www.dropbox.com/static/api/2/dropins.js', function() {
            Dropbox.appKey = apiKey;
            dropboxIntegrationLock = false;

            (dropboxIntegration = Object.create(DropBoxIntegration).init({
              multiple: options.multiple || true,
              event: options.event
            })).open($scope);
          })
          .fail(function() {
            dropboxIntegrationLock = false;
          });
        } else {
          dropboxIntegration && dropboxIntegration.open($scope);
        }
      }
    }

    /**
     * 파일 공유할 id를 전달함.
     * @param {object} scope - center controller의 scope
     * @returns {*}
     * @private
     */
    function _getFileShareId(scope) {
      return scope.entityId != null ? scope.entityId : currentSessionHelper.getCurrentEntity().id;
    }

    /**
     * file upload success analytics
     * @private
     */
    function _successAnalytics(response) {
      // analytics
      var currentEntity = currentSessionHelper.getCurrentEntity();
      var share_target = "";

      switch (currentEntity.type) {
        case 'channel':
          share_target = "topic";
          break;
        case 'privateGroup':
          share_target = "private group";
          break;
        case 'user':
          share_target = "direct message";
          break;
        default:
          share_target = "invalid";
          break;
      }

      var file_meta = (response.data.fileInfo.type).split("/");

      var upload_data = {
        "entity type"   : share_target,
        "category"      : file_meta[0],
        "extension"     : response.data.fileInfo.ext,
        "mime type"     : response.data.fileInfo.type,
        "size"          : response.data.fileInfo.size
      };

      analyticsService.mixpanelTrack("File Upload", upload_data);
    }

    return {
      createGoogleDrive: createGoogleDrive,
      createDropBox: createDropBox
    };
  }
}());
