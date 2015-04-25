(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('integrationService', integrationService);

  /* @ngInject */
  function integrationService($rootScope, $modal, $timeout, fileAPIservice, fileObjectService, analyticsService) {
    /**
     * integration service를 추가 하기를 원한다면 Integration object를 확장하여 구현해야 한다.
     */

    // object inherit model
    // object 상속 model 특정 namespace로 옮겨야 함..
    var Objecz = {
      create: function(prop) {
          var that = this,
              obj;

          obj = Object.create(that);

          return that.mixin(prop, obj);
      },
      mixin: function(prop, base) {
        var that = this,
            e,
            target;

        target = base || {};
        for (e in prop) {
          if (prop.hasOwnProperty(e)) {
            target[e] = prop[e];
          }
        }

        return target;
      }
    };

    /**
     * Integration
     */
    var Integration = Objecz.create({
      init: function(options) { return this; },
      uploadType: 'integration',
      open: function() {},
      /**
       * addEventListeners
       */
      on: function () {
        var that = this,
            buttonEle;

        buttonEle = that.options.buttonEle;
        if (buttonEle.length) {
          buttonEle
            .on('click', function() {
              that.open();
            });
        }
      },
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
          createFileObject: that._createFileObject.bind(that)
        });

        if (fileObject.size() > 0) {
          // direct upload user interface 사용
          $rootScope.supportHtml5 = angular.isDefined(FileAPI.support) ? !!FileAPI.support.html5 : fileObject.options.supportAllFileAPI;
          that._fileUploadSequence(fileObject);

          // upload modal user interface 사용
          // $rootScope.supportHtml5 = angular.isDefined(FileAPI.support) ? !!FileAPI.support.html5 : fileObject.options.supportAllFileAPI;
          // that.options.scope.fileObject = fileObject;
          // that.options.scope.openModal('file');
        }
      },
      /**
       * 연속된 file upload
       */
      _fileUploadSequence: function(files) {
        var that = this,
            file,
            it,
            len;

        it = files.iterator();
        len = files.size();
        that._upload(it.currentIndex(), len, it.next(), function callback() {
          that._upload(it.currentIndex(), len, it.next(), callback);
        });
      },
      /**
       * file upload
       */
      _upload: function(index, length, file, callback) {
        var that = this;

        if (file) {
          that._updateFileObject(file);
          // console.log("file ::: ", file);
          $rootScope.fileQueue = fileAPIservice.upload({
            fileInfo: file,
            supportHTML: that.options.scope.supportHtml5,
            uploadType: file.uploadType
          });
          $rootScope.fileQueue.then(   // success
            function(response) {
              if (response) {
                $rootScope.curUpload.status = 'done';
                // console.log("file upload success ::: ", index, length, file.name);

                // socket 사용으로 삭제 예정
                fileAPIservice.broadcastChangeShared();

                // analytics
                var share_target = "";
                switch (that.options.scope.currentEntity.type) {
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

                analyticsService.mixpanelTrack( "File Upload", upload_data );
              } else {
                that._uploadErrorHandler($rootScope);
              }

              // console.log('done', arguments);
              callback();         // upload success 후 callback 수행
            },
            function(error) {     // error
              that._uploadErrorHandler($rootScope);

              // console.log('error', arguments);
              callback();         // upload error 후 callback 수행
            },
            function(evt) {       // progress
              // center.html에 표현되는 progress bar의 상태 변경
              $rootScope.curUpload = {};

              $rootScope.curUpload.lFileIndex = length;
              $rootScope.curUpload.cFileIndex = index + 1;

              $rootScope.curUpload.title = file.title;
              $rootScope.curUpload.progress = parseInt(100.0 * evt.loaded / evt.total);
              $rootScope.curUpload.status = 'uploading';
            }
          );
        } else {
          that._closeProgressBar();
        }
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
        $timeout(function() {
          $('.file-upload-progress-container').animate( {'opacity': 0 }, 500, function() {
            fileAPIservice.clearCurUpload();
          });
        }, 2000);
      },
      /**
       * upload uri에 전달하는 data object create
       */
      _updateFileObject: function(file) {
        var that = this;

        file.isPrivateFile = false;
        file.currentEntity = that.options.scope.currentEntity;

        if (file.isPrivateFile) {   // privategroups
          file.permission = that.PRIVATE_FILE;
          file.share = '';
        } else {                        // channel
          file.permission = that.PUBLIC_FILE;
          file.share = file.currentEntity.id;
        }
      },
      _openIntegrationModal: function() {
        var that = this,
            scope;

        scope = that.options.scope;

        $modal.open({
          scope:   scope,
          templateUrl: 'app/modal/integration/integration.html',
          controller: 'fileIntegrationModalCtrl',
          size: 'lg',
          windowClass: 'integration-modal'
        });
      },
      _closeIntegrationModal: function() {
        $modal.dismiss('close');
      },
      PRIVATE_FILE: 740,   // PRIVATE_FILE code
      PUBLIC_FILE: 744     // PUBLIC_FILE code
    });

    /**
     * GoogleDrive Integration
     */
    var GoogleDriveIntegration = Integration.create({
      init: function(options) {
        Integration.init.call(this, options);

        this.options = {
          apiKey: '',
          clientId: '',
          multiple: true
        };

        angular.extend(this.options, options);
        this.options.buttonEle = $(this.options.buttonEle);

        if (this.options.apiKey == null) {
          console.log('put api key');
        }

        if (this.options.clientId == null) {
          console.log('put client id');
        }

        Integration.on.call(this);

        // Load the drive API
        gapi.client.setApiKey(this.options.apiKey);
        gapi.client.load('drive', 'v2', this._driveApiLoaded.bind(this) );
        google.load('picker', '1', { callback: this._pickerApiLoaded.bind(this) });

        return this;
      },
      service: 'google', // server에 전달하는 service type
      /**
       * google drive picker open
       * token이 존재한다면 picker를 바로 출력하고, 아니면 인증완료후 picker 호출
       */
      open: function () {
        Integration.open.call(this);

        var that = this,
            token;

        if (token = gapi.auth.getToken()) {
          that._showPicker();
        } else {
          that._openIntegrationModal();

          that._doAuth(false, function(token) {
            console.log('do auth callback arguments ::: ', arguments);
            that._showPicker();
          }.bind(that));
        }
      },
      /**
       * picker object 생성 & 출력
       * picker object 생성시 options 수정 가능함.
       */
      _showPicker: function() {
        var that = this,
            accessToken,
            view,
            picker;

        that._closeIntegrationModal();

        accessToken = gapi.auth.getToken().access_token;
        view = new google.picker.DocsView();
        view.setIncludeFolders(true);
        picker = that.picker = new google.picker.PickerBuilder();

        // multiple file upload
        that.options.multiple && picker.enableFeature(google.picker.Feature.MULTISELECT_ENABLED);

        picker
          .enableFeature(google.picker.Feature.NAV_HIDDEN)
          .setAppId(that.options.clientId)
          .setDeveloperKey(that.options.apiKey)
          .setOAuthToken(accessToken)
          .addView(view)
          .setCallback(that._pickerCallback.bind(that))
          // .setRelayUrl('http://www.jandi.io:4000/rpc_relay.html')
          .build()
          .setVisible(true);
      },
      /**
       * picker의 상태 변경 callback
       */
      _pickerCallback: function(data) {
        var that = this;

        // console.log('data ::: ', data);
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
        gapi.auth.setToken(token);
        this._showPicker();
      },
      _doAuth: function(immediate, callback) {
        var params = {
          client_id: this.options.clientId,
          scope: 'https://www.googleapis.com/auth/drive.readonly',
          immediate: immediate,
          redirect_uri: 'http://www.jandi.io:4000/oauth2/google',  // todo: local, dev, pro 한경에 맞추어 설정 가능하도록 조정
          response_type: 'code'
        };

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
          size: file.sizeBytes,

          uploadType: this.uploadType
        };
      },
      _openIntegrationModal: function() {
        Integration._openIntegrationModal.call(this);

        var that = this;

        // console.log(options.scope);
      }
    });

    /**
     * DropBox Integration
     */
    var DropBoxIntegration = Integration.create({
      init: function(options) {
        Integration.init.call(this, options);

        this.options = {
          multiple: true
        };

        angular.extend(this.options, options);
        this.options.buttonEle = $(this.options.buttonEle);

        Integration.on.call(this);

        return this;
      },
      service: 'bropbox',
      /**
       * dropbox choose object 생성 & 출력
       * choose object 생성시 options 수정 가능함.
       */
      open: function() {
        Integration.open.call(this);

        var that = this;

        that._closeIntegrationModal();

        Dropbox.choose({
          success: that._fileGetCallback.bind(that),
          cancel: function() {},
          linkType: "preview",
          multiselect: that.options.multiple,
          extenstion: ['.*']
        });
      },
      /**
       * file upload시 server로 전달하는 data object 생성
       */
      _createFileObject: function(file) {
        return {
          title: file.name,
          link: file.link,
          service: this.service,
          size: file.bytes,

          uploadType: this.uploadType
        };
      }
    });

    // google drive picker docs: https://developers.google.com/picker/docs/
    function createGoogleDrive($scope, ele, options) {
      var apiKey = 'AIzaSyAuCfgO2Q-GbGtjWitgBKkaSBTqT2XAjPs',
          clientId = '720371329165-sripefi3is5k3vlvrjgn5d3onn9na2es.apps.googleusercontent.com';

      !window.google && $.getScript('https://www.google.com/jsapi?key=' + apiKey);
      !window.gapi && $.getScript('https://apis.google.com/js/client.js?onload=_createGDPicker');

      window._createGDPicker = function() {
        (window.googleDriveIntegration = Object.create(GoogleDriveIntegration).init({
          scope: $scope,                          // 필수, 종속 scope
          buttonEle: ele,                         // 필수, button element
          apiKey: apiKey,                         // 필수, google dirve api key
          clientId: clientId,                     // 필수, goggle dirve client id
          multiple: options.multiple || true      // multiple file upload
        })).open();
      };
    }

    // dropbox chooser docs: https://www.dropbox.com/developers/dropins/chooser/js
    function createDropBox($scope, ele, options) {
      var apiKey = '4hbb9l5wu46okhp';

      !window.Dropbox && $.getScript('https://www.dropbox.com/static/api/2/dropins.js', function() {
        Dropbox.appKey = apiKey;

        Object.create(DropBoxIntegration).init({
          scope: $scope,                          // 필수, 종속 scope
          buttonEle: ele,                         // 필수, button element
          multiple: options.multiple || true
        }).open();
      });
    }

    return {
      createGoogleDrive: createGoogleDrive,
      createDropBox: createDropBox
    };
  }
}());
