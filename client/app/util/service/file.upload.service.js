(function() {
  'use strict';

  angular
      .module('jandiApp')
      .factory('FilesUpload', FilesUpload);

  /**
   * File upload service
   */
  /* @ngInject */
  function FilesUpload($rootScope, fileAPIservice, fileObjectService) {
    /**
     * fileAPIservice를 사용하여 file을 upload 함.
     * confirm 그리고 sequence type upload를 제공하기 위해 service로 구현함.
     */
    var FilesUpload = {
      /**
       * @constructor
       * @param {object} options
       * @param {boolean} [options.multiple=true]       - multiple upload 여부
       * @param {string} [options.uploadtype=file]      - fileAPIservice에 전달할 upload type[file, integraiton]
       * @param {boolean} [options.supportFileAPI=true] - browser에서 file API 제공 여부
       * @param {boolean} [options.straight=false]      - 순차 file upload 사용 여부(false일때 confirm file upload interface 사용)
       * @param {function} options.convertFile          - file object convert function
       * @param {function} options.convertFileInfo      - fileInfo object convert function
       * @param {function} options.onBegin              - 최초 file upload begin
       * @param {function} options.onEnd                - 모든 file upload end
       * @param {function} options.onConfirmEnd         - 모든 upload confirm end
       * @param {function} options.onUpload             - 하나의 file upload 시작
       * @param {function} options.onProgress           - 하나의 file upload 중
       * @param {function} options.onSuccess            - 하나의 file upload 완료
       * @param {function} options.onError              - 하나의 file upload error
       * @param {function} options.onConfirmDone        - 하나의 file upload confirm done
       */
      init: function(options) {
        var that = this;

        that.options = {
          multiple: true,
          uploadType: 'file',
          supportFileAPI: true,
          straight: false,
          convertFile: null,
          convertFileInfo: null,
          onBegin: function() {},
          onEnd: function() {},
          onUpload: function() {},
          onProgress: function() {},
          onSuccess: function() {},
          onError: function() {},
          onConfirmDone: function() {},
          onConfirmEnd: function() {}
        };

        options && that.setOptions(options);

        return that;
      },
      /**
       * fileUpload object의 options를 설정한다.
       * @param options
       * @returns {FilesUpload}
       */
      setOptions: function(options) {
        var that = this;

        _.extend(that.options, options);
        that._initUploadQueue();
        that.resetProgressIndex();

        if (!that.options.straight) {
          that._convertFileObjects(that._it.next());
        }

        return that;
      },
      /**
       * reset progress index
       */
      resetProgressIndex: function() {
        var that = this;

        that.lastProgressIndex = that.currentProgressIndex = 0;
      },
      /**
       * upload status를 갱신하여 file upload를 연속해서 가능하도록 한다.
       */
      updateUploadStatus: function() {
        this._fileUploadLock = true;
        this._convertFileObjects(this._it.next());
      },
      /**
       * upload queue, file object 반복자 초기화
       */
      _initUploadQueue: function() {
        var that = this;

        if (that.fileObject) {
          that._it = that.fileObject.iterator();
        }

        that._fileUploadQueue = [];
        that._fileUploadQueueIndex = 0;
        that._fileUploadLock = false;
      },
      /**
       * FileObject로 wrapping된 file object의 upload를 수행함.
       * @param {boolean} confirm - confirm upload시 현재 file의 upload 여부
       * @param {object} [options]
       * @param {boolean} [options.straight] - upload 방법을 straight로 설정함.
       */
      upload: function(confirm, options) {
        var that = this;
        var currentIndex = that._it.currentIndex();

        if (options) {
          if (options.straight) {
            that.options.straight = true;
          }
        }

        that.options.onBegin();

        if (that.options.straight) {
          that._uploadStraight(currentIndex);
        } else {
          that._uploadConfirm(confirm, currentIndex);
        }
      },
      /**
       * fileAPIservice 사용하여 upload request 수행함.
       * @param {object} file     - browser file object
       * @param {object} fileInfo - file이 공유될 entity 또는 file property가 추가적으로 가져야할 data
       * @param {number} index   - 현재 upload되는 file의 index
       * @param {function} invoke
       */
      _upload: function(file, fileInfo, index, invoke) {
        var that = this;

        that.options.onUpload(file, fileInfo);

        $rootScope.fileQueue = fileAPIservice.upload({
          files: file,
          fileInfo: fileInfo,
          supportHTML: that.options.supportFileAPI,
          uploadType: that.options.uploadType
        });

        return $rootScope.fileQueue.then(
          // success
          function(response) {
            if (response) {
              that.options.onSuccess(response, index, that.fileLength());
            } else {
              that.options.onError(response, index, that.fileLength());
            }

            invoke && invoke();
          },
          // error
          function(error) {
            that.options.onError(error, index, that.fileLength());

            invoke && invoke();
          },
          // progress
          function(evt) {
            that.options.onProgress(evt, file, index, that.fileLength());
          }
        );
      },
      /**
       * straight type upload
       * @param {number} currentIndex
       * @private
       */
      _uploadStraight: function(currentIndex) {
        var that = this;

        // TODO: file upload service에서 제공하는 메소드 해당
        // upload방법으로 confirm과 straight 방법을 제공한다. confirm 방법은 fileUploadQueue를 사용하여 upload가 진행되고
        // straight 방법은 fileUploadQueue와 invoke function으로 upload가 진행되므로 upload 진행상태 처리가 서로 다르다.
        // straight 방법도 fileUploadQueue 만을 사용하여 upload가 진행되도록 변경하여야 한다.
        // TODO: file upload component에 대한 해당
        // center에 존재하는 file upload에 대한 view를 특정 scope로 분리가 이루어져야 하며, file upload service는 factory가 아닌
        // 항상 존재하는 service의 형태로 제공되어 file upload만 수행하고 현재 처리하는 내용 대부분은 directive와 controller에서
        // 담당해야 한다.
        that._fileUploadQueue.push((function(file) {
          return function () {
            var currentIndex = that._it.currentIndex();

            if (file == null) {
              that._convertFileObjects(that._it.next());
            }

            that.currentProgressIndex++;
            that._upload(that._file, that._fileInfo, currentIndex)
              .then(function () {
                that._uploadSequence(that._it.currentIndex(), that._it.next(), function invoke() {
                  that._uploadSequence(that._it.currentIndex(), that._it.next(), invoke);
                });
              });
          };
        }(that._file)));
        that.options.onConfirmEnd(0, that.fileLength());

        if (!that._fileUploadLock) {
          // 더 이상 upload 중인 작업이 없으므로 바로 shift한다.
          that._fileUploadQueueShift();
        }

        // straight upload시 'lastProgressIndex'는 현재의 'lastProgressgeIndex'와 앞으로 업로드 해야할
        // 아이템의 총 갯수가 된다. 'currentIndex'는 현재 업로드 시도한 index의 다음 index를 가리키므로 현재
        // 업로드 시도한 index를 가리키기 위해 -1 한다.
        that.lastProgressIndex = that.lastProgressIndex + that.fileLength() - (currentIndex - 1);
      },
      /**
       * 순차적으로 file upload 수행함
       * @param {number} index   - upload file index
       * @param {object} file     - fileObject의 특정 file object
       * @param {function} invoke
       */
      _uploadSequence: function(index, file, invoke) {
        var that = this;

        if (file) {
          that.currentProgressIndex++;
          that._upload(
            that.options.convertFile ? that.options.convertFile(file) : file,
            that.options.convertFileInfo ? that.options.convertFileInfo(file) : file,
            index,
            invoke
          );
        } else {
          // upload할 file 존재하지 않음
          that.options.onEnd();
        }
      },
      /**
       * confirm type upload
       * @param {boolean} confirm   - 해당 index의 file upload 수행할지 여부
       * @param {number} index
       */
      _uploadConfirm: function(confirm, index) {
        var that = this;
        var file;

        // 갈기면 똑같은 file 중복해서 upload 방지
        if (that._prevFile !== that._file) {
          that._prevFile = that._file;

          if (confirm) {
            that.options.onConfirmDone();

            // file upload queue의 length
            that.lastProgressIndex++;

            // file upload 수행중에 confirm done 가능하므로 _fileUploadQueue에 file upload task를 넣음
            that._fileUploadQueue.push((function(file, fileInfo) {
              return function (invoke) {
                  that._prevFile = file;

                  that._fileUploadLock = true;

                  // file upload queue의 index
                  that.currentProgressIndex++;

                  if (that.fileObject.getFile(index - 1)) {
                    that._upload(file, fileInfo, index, invoke);
                  }
              };
            }(that._file, that._fileInfo)));

            // lock이 풀려 있다면 다음 file을 upload 시작
            if (!that._fileUploadLock) {
              that._fileUploadQueueShift();
            }
          } else {
            that._fileUploadQueueIndex++;

            // confirm cancel시 마지막 confirm 인지 여부
            if (that.fileLength() === that._fileUploadQueueIndex) {
              // that._initUploadQueue();
              that.options.onConfirmEnd(index, that.fileLength());
            }
          }

          file = that._it.next();
          if (file) {
            // 다음 file upload 위하여 fileAPIservice에서 사용가능하도록 file, fileInfo object를 convert함
            that._convertFileObjects(file);
          } else {
            // 더이상 다음 file이 존재하지 않음
            that.options.onConfirmEnd(index, that.fileLength());
          }
        }
      },
      /**
       * file upload queue shift 함
       */
      _fileUploadQueueShift: function() {
        var that = this;
        var fileUpload;

        if (fileUpload = that._fileUploadQueue.shift()) {
          // fileUploadQueue에 upload해야할 file이 존재한다면 file upload 시작
          fileUpload(function () {
            that._fileUploadQueueShift(that.fileLength()); // 다음 file upload 수행
            that._fileUploadLock = false;         // lock 풀기
            that._fileUploadQueueIndex++;    // fileUploadQueue index 증가

            // 모든 작업이 마무리 되었다면 progress bar 숨기기
            if (that.fileLength() === that._fileUploadQueueIndex) {
              that._initUploadQueue();
              that.options.onEnd();
            }
          });
        }
      },
      /**
       * fileAPIservice에 전달가능한 file, fileInfo를 생성하기 위해 특정 file object를 convert함
       * @param {object} file - fileObject의 특정 file object
       */
      _convertFileObjects: function(file) {
        var that = this;

        that._file = that.options.convertFile ? that.options.convertFile(file) : file;
        that._fileInfo = that.options.convertFileInfo ? that.options.convertFileInfo(file) : file;
      },
      /**
       * set fileObject
       * @param {FileObject} fileObject - upload할 file object를 wrapping한 object
       */
      setFileObject: function(fileObject) {
        var that = this;

        that.fileObject = fileObject;
        that._initUploadQueue();
        that._file = that._fileInfo = null;
      },
      /**
       * upload할 file object를 설정한다.
       * @param {object} files
       * @returns {*}
       */
      setFiles: function(files, options) {
        var that = this;

        if (that.fileObject) {
          that.fileObject.setFiles(files);
        } else {
          that.setFileObject(Object.create(fileObjectService).init(files, options));
        }

        return that.fileObject.promise;
      },
      /**
       * upload 중인지 상태를 전달한다.
       * @returns {boolean}
       */
      isUploadingStatus: function() {
        return !!this.lastProgressIndex;
      },
      /**
       * upload할 file 수를 전달한다.
       * @returns {*}
       */
      fileLength: function() {
        return this.fileObject ? this.fileObject.size() : 0;
      },
      /**
       * upload를 clear한다.
       * @returns {*}
       */
      clear: function() {
        return this.fileObject.empty();
      }
    };

    return {
      createInstance: function(fileObject, options) {
        return Object.create(FilesUpload).init(fileObject, options);
      }
    };
  }
}());
