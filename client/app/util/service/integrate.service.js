(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('integrateService', integrateService);

  /* @ngInject */
  function integrateService($rootScope, $timeout, fileAPIservice, fileObjectService, analyticsService) {

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

    var Integration = Objecz.create({
      init: function(options) { return this; },
      open: function() {},
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

        if (that.onSelect) {
          that.onSelect(files);
        }
      },
      onSelect: function(files) {
        var that = this,
            fileObject;

        fileObject = Object.create(fileObjectService).init(files, {
          createFileObject: that._createFileObject
        });

        if (fileObject.size() > 0) {
          $rootScope.supportHtml5 = angular.isDefined(FileAPI.support) ? !!FileAPI.support.html5 : fileObject.options.supportAllFileAPI;
          that._fileUploadSequence(fileObject);

          // upload modal user interface 사용
          // $rootScope.supportHtml5 = angular.isDefined(FileAPI.support) ? !!FileAPI.support.html5 : fileObject.options.supportAllFileAPI;
          // that.options.scope.fileObject = fileObject;
          // that.options.scope.openModal('file');
        }
      },
      _fileUploadSequence: function(files) {
        var that = this,
            i, len;

        i = 0;
        len = files.size();
        that._upload(i, len, files.getFiles(i), function callback() {
          ++i;
          console.log('callback call ::: ', i, len, i < len);
          i < len ? that._upload(i, len, files.getFiles(i), callback) : that._closeProgressBar();
        });
      },
      _upload: function(index, length, file, callback) {
        var that = this

        that._updateFileObject(file);
        console.log("file ::: ", file);
        $rootScope.fileQueue = fileAPIservice.upload({
          fileInfo: file,
          supportHTML: that.options.scope.supportHtml5,
          uploadType: file.uploadType
        });
        $rootScope.fileQueue.then(   // success
          function(response) {
            if (response == null) {
              uploadErrorHandler($rootScope);
            } else {
              $rootScope.curUpload.status = 'done';
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
            // $rootScope.curUpload.lFileIndex = $cScope.lastIndex;
            // $rootScope.curUpload.cFileIndex = currentIndex;

            $rootScope.curUpload.lFileIndex = length;
            $rootScope.curUpload.cFileIndex = index + 1;

            $rootScope.curUpload.title = file.title;
            $rootScope.curUpload.progress = parseInt(100.0 * evt.loaded / evt.total);
            $rootScope.curUpload.status = 'uploading';
          }
        );
      },
      _uploadErrorHandler: function($scope) {
        $scope.curUpload.status = 'error';
        $scope.curUpload.hasError = true;
        $scope.curUpload.progress = 0;
      },
      _closeProgressBar: function() {
        $timeout(function() {
          $('.file-upload-progress-container').animate( {'opacity': 0 }, 500, function() {
            fileAPIservice.clearCurUpload();
          });
        }, 2000);
      },
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
      PRIVATE_FILE: 740,   // PRIVATE_FILE code
      PUBLIC_FILE: 744     // PUBLIC_FILE code
    });

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
      serviceType: 'google', // server에 전달하는 service type
      open: function () {
        Integration.open.call(this);

        var that = this,
            token;

        if (token = gapi.auth.getToken()) {
          that._showPicker();
        } else {
          that._doAuth(false, function() {
            that._showPicker();
          }.bind(that));
        }
      },
      _showPicker: function() {
        var that = this,
            accessToken,
            view,
            picker;

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
          .build()
          .setVisible(true);
      },
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
      _doAuth: function(immediate, callback) {
        gapi.auth.authorize({
          client_id: this.options.clientId,
          scope: 'https://www.googleapis.com/auth/drive.readonly',
          immediate: immediate
        }, callback);
      },
      _createFileObject: function(file) {
        return {
          title: file.name,
          link: file.url,
          mimeType: file.mimeType,
          serviceType: 'google',
          size: file.sizeBytes || 0,

          uploadType: 'integration'
        };
      }
    });


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
      open: function() {
        Integration.open.call(this);

        var that = this;

        Dropbox.choose({
          // Required. Called when a user selects an item in the Chooser.
          success: that._fileGetCallback.bind(that),
          // Optional. Called when the user closes the dialog without selecting a file
          // and does not include any parameters.
          cancel: function() {},
          // Optional. "preview" (default) is a preview link to the document for sharing,
          // "direct" is an expiring link to download the contents of the file. For more
          // information about link types, see Link types below.
          linkType: "preview",
          // Optional. A value of false (default) limits selection to a single file, while
          // true enables multiple file selection.
          multiselect: that.options.multiple,
          // Optional. This is a list of file extensions. If specified, the user will
          // only be able to select files with these extensions. You may also specify
          // file types, such as "video" or "images" in the list. For more information,
          // see File types below. By default, all extensions are allowed.
          extenstion: ['.*']
        });
      },
      _createFileObject: function(file) {
        return {
          title: file.name,
          link: file.link,
          mimeType: file.name,
          serviceType: 'dropbox',
          size: file.bytes || 0,

          uploadType: 'integration'
        };
      }
    });


    function createGoogleDrive($scope, ele) {
      var apiKey = 'AIzaSyAuCfgO2Q-GbGtjWitgBKkaSBTqT2XAjPs',
          clientId = '720371329165-sripefi3is5k3vlvrjgn5d3onn9na2es.apps.googleusercontent.com';

      !window.google && $.getScript('https://www.google.com/jsapi?key=' + apiKey);
      !window.gapi && $.getScript('https://apis.google.com/js/client.js?onload=_createGDPicker');

      window._createGDPicker = function() {
        Object.create(GoogleDriveIntegration).init({
          // $rootScope: $$rootScope,                  // 필수,
          scope: $scope,                          // 필수, 종속 scope
          // fileAPIservice: fileAPIservice,         // 필수, file api
          // fileObjectService: fileObjectService,   // 필수, file object 생성 함수
          buttonEle: ele,                         // 필수, button element
          apiKey: apiKey,                         // 필수, google dirve api key
          clientId: clientId,                     // 필수, goggle dirve client id
          multiple: true                          // multiple file upload
        }).open();
      };
    }

    function createDropBox($scope, ele) {
      var apiKey = '4hbb9l5wu46okhp';

      !window.Dropbox && $.getScript('https://www.dropbox.com/static/api/2/dropins.js', function() {
        Dropbox.appKey = apiKey;

        Object.create(DropBoxIntegration).init({
          // $rootScope: $$rootScope,                  // 필수
          scope: $scope,                          // 필수, 종속 scope
          // fileAPIservice: fileAPIservice,         // 필수, file api
          // fileObjectService: fileObjectService,   // 필수, file object 생성 함수
          buttonEle: ele,                         // 필수, button element
          multiple: true
        }).open();
      });
    }

    return {
      createGoogleDrive: createGoogleDrive,
      createDropBox: createDropBox
    };
  }
}());
