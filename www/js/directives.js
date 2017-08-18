angular.module('directives', ['pascalprecht.translate', 'jett.ionic.filter.bar'])

.directive('headerBar', function(){
  return {
    restrict: 'E',
    templateUrl: 'templates/header-bar.html'
  };
})
.directive('infoOrganization', function(){
  return {
    restrict: 'E',
    templateUrl: 'templates/info-organization.html'
  };
})
.directive('infoTeacher', function(){
  return {
    restrict: 'E',
    templateUrl: 'templates/info-teacher.html'
  };
})
.directive('infoLicense', function(){
  return {
    restrict: 'E',
    templateUrl: 'templates/info-license.html'
  };
})
.directive('nothingHere', function(){
  return {
    restrict: 'E',
    templateUrl: 'templates/nothing-here.html'
  };
})
.directive('videogularPlayer', function(){
  return {
    restrict: 'E',
    templateUrl: 'templates/videogular-player.html'
  };
})
.directive('dwnButton', ["$rootScope", "$cordovaFileTransfer", "$cordovaFileOpener2", "downloadService", "$window", "$cordovaFile", "$timeout", "$filter", "$ionicPopup", "$state", "$translate", "$http", 'message',
                                              function($rootScope, $cordovaFileTransfer, $cordovaFileOpener2, downloadService, $window, $cordovaFile, $timeout, $filter, $ionicPopup, $state, $translate, $http, message){
  return {
    restrict: 'AE',
    template: '<i ng-click="download()" class="icon ion-android-download"></i>',
    link: function(scope, iElement, iAttrs) {
      function showAlert(title, bodyMsg) {
          var alertPopup = $ionicPopup.alert({
            title: title,
            template: bodyMsg
          });
          alertPopup.then(function(res) {
            
          });
        };
      function countHit(id,type) {
        if(type == "sermons") {
          hitURL = 'http://146.148.29.150/fonte/api/html/web/teaching/dhit?id=';
        } else if(type == "resources") {
          hitURL = 'http://146.148.29.150/fonte/api/html/web/resource/dhit?id=';
        } else {
          message.error("Hit counter", "incorrect type variable");
        }

        $http.get(hitURL + id).success(function(data) {
          message.console("download hit added, ID = ", id);
        }).error(function(error) {
          message.error("Hit counter", error);
        });
      }

      //If directory does not exist, create it
      function checkDirExists(androidPath, folder){
        $cordovaFile.checkDir(androidPath, folder)
        .then(function (success) {
          // success
          message.console("Directory Exists: ", androidPath, folder, success);
          return true
        }, function (error) {
          // If it doesn't exist, create
          message.console("Directory does not exist: creating...", androidPath, folder);
          $cordovaFile.createDir(androidPath, folder, true)
          .then(function (success) {
            message.console("Success", "Success creating directory: directives.js:145", success);
            return true;
          }, function (error) {
            message.alert('FOLDER_CREATE_FAIL');
            message.console("Error creating directory: directives.js:155", error);
            return false;
          });
        });
      }

      scope.download = function() { 
        
        scope.value = JSON.parse(iAttrs.value);
        scope.caseCompare = iAttrs.caseCompare;
        var exists = 0;
        
        message.console("scope from download directive: ", scope.value);
          
        switch(scope.caseCompare) {
          case "bible":
            scope.title = scope.value.title;
            scope.fileUrl = scope.value.fileUrl; 
            scope.fileFolder = scope.value.fileFolder;
            scope.fileName = scope.value.fileName;
            existing = $filter('filter')(downloadService.downloads.bible, {fileName: scope.fileName});
            message.console("already downloaded?: ", existing);
            console.log("Case is Bible, title, url, folder, name: ", scope.title, scope.fileUrl, scope.filefolder, scope.fileName);
            if(existing.length) {
              message.console("already exists: do not download");
              exists = 1;
            }
            break;
          case "sermons":
            countHit(scope.value.id, "sermons");

            if ($rootScope.settings.lang == "en"){
              scope.title = scope.value.en_title;
            } else if ($rootScope.settings.lang == "pt") {
              scope.title = scope.value.pt_title;
            }
            //Count hit as dhit

            scope.fileUrl = scope.value.teaching_url; 
            scope.fileFolder = scope.caseCompare;
            var file = scope.value.teaching_url.split("/");
            scope.fileName = file[file.length-1];
            existing = $filter('filter')(downloadService.downloads.teaching, {fileName: scope.fileName});
            message.console("already downloaded?: ", existing);
            if(existing.length) {
              message.console("already exists: do not download");
              exists = 1;
            }
            break;
          case "resources":
            countHit(scope.value.id, "resources");

            if ($rootScope.settings.lang == "en"){
              scope.title = scope.value.en_name;
            } else if ($rootScope.settings.lang == "pt") {
              scope.title = scope.value.pt_name;
            }
            scope.fileUrl = scope.value.resource_url; 
            scope.fileFolder = scope.caseCompare;
            var file = scope.value.resource_url.split("/");
            scope.fileName = file[file.length-1];
            existing = $filter('filter')(downloadService.downloads.resource, {fileName: scope.fileName});
            message.console("already downloaded?: ", existing);
            if(existing.length) {
              message.console("already exists: do not download");
              exists = 1;
            }

            break;
          }    
          //If using a web browser, download. Otherwise, use the system dialog
          if (typeof cordova === "undefined"){
            //browser;
            window.open(scope.fileUrl, '_blank');
          } else if(exists) {
            $translate('FILE_DOWNLOADED').then(function(downloaded) {
              alert(downloaded);
            });
          } else {

            //Where are we saving to?
            scope.androidPath = cordova.file.externalRootDirectory;


            scope.mainFolder = "FonteDaVida";
            if(checkDirExists(scope.androidPath, scope.mainFolder)) {
              message.console("Directory creation error 1st block");
              $translate('ERROR_FOLDER').then(function(downloaded) {
                alert(downloaded);
              });
              return false;
            };

            scope.folder = scope.mainFolder + "/" + scope.fileFolder;
            if(checkDirExists(scope.androidPath + "/" + scope.mainFolder, scope.fileFolder)) {
              message.console("Directory creation error 2nd block");
              $translate('ERROR_FOLDER').then(function(downloaded) {
                alert(downloaded);
              });
              return false;
            };

            fileurl = scope.fileUrl;
            scope.options = {};
            //--PASSED INFORMATION            
            scope.dir = scope.androidPath + scope.folder +"/";
            scope.targetPath = scope.dir + scope.fileName;         
            message.console("Download scope: ", scope.fileName);
            

            
            $state.go('tab.download');
            //If there's another download in progress, watch
            //calling unbind will unbind the watcher after this particular download has started.
            queueNumber = $rootScope.inProgress + 1;
            $rootScope.downloadsCompleted;
            var unbind = $rootScope.$watch("downloadsCompleted", function() {
              if (queueNumber == 1) {
                message.console("no other download in progress. Will start now");
                downloadft(fileurl, scope.targetPath, scope.options, true, scope.value);
                unbind();
                } else {
                  queueNumber--;
                  message.console("download detected. No download started. # in line: ", queueNumber);
                }
              });

            //initial download
            //if($rootScope.inProgress == 0) downloadft(fileurl, scope.targetPath, scope.options, true, scope.value);
            $rootScope.inProgress++;
          }//end scope.download()

          function downloadft(url, targetPath, options, trustHosts, values) {
            console.log("downloadft called: targetPath: ", targetPath);
            onSuccess = function () {
              switch(scope.caseCompare) {
                    case "bible":
                      
                    //var result = $filter('filter')(rootScope.settings.bible, {id: scope.value.book_id, damId: scope.value.damId, data: scope.value})[0].data.find(x => x.chapter_id === scope.value.chapter_id);
                    var result = scope.value;
                    result.fileUrlLocalPath = targetPath;
                    //result.fileUrl2 = window.appRootDir.toInternalUrl() + "/" scope.folder + "/" _ scope.fileName;
                    downloadService.downloads.bible.push(result);
                    message.console("Download Bible result pushed: ", result);
                    break;
                  case "sermons":
                    
                    var result = $filter('filter')($rootScope.settings.teachings, {id: scope.value.id})[0];
                    result.fileUrlLocalPath = targetPath;
                    downloadService.downloads.teaching.push(result);
                    break;
                  case "resources":
                    $translate('DOWNLOAD_OPEN').then( function(open) {
                      if(confirm(open) ){
                      $cordovaFileOpener2.open(targetPath, 'application/*')
                      .then(function() {
                        message.console('success');
                      }, function(err) {
                        message.error("Resource", JSON.stringify(err));
                      });
                      }
                    })
                    
                    var result = $filter('filter')($rootScope.settings.resourceList, {id: scope.value.id})[0];
                    result.fileUrlLocalPath = targetPath;
                    downloadService.downloads.resource.push(result);
                    message.console("Download result pushed: ", result);
                    break;
                }
              $rootScope.inProgress--;
              $rootScope.downloadsCompleted++;
              scope.$broadcast("DOWNLOAD_CHANGE");
              scope.$apply();
              deregister();
            }
            inProgress = 1;
            var downloadProgress = 0;
            var abort_active = 0;
            var ft = new FileTransfer();
            //FileTransfer takes 4(+2) inputs: source, target, successCallback, errorCallback, trustAllHosts, options
            ft.onprogress = function(progress) {
                
                  scope.downloadProgress = (progress.loaded / progress.total) * 100;
                  scope.loaded = progress.loaded;
                  scope.total = progress.total;
                  if (document.getElementById("file-name")) document.getElementById("file-name").innerHTML = scope.title;
                  
                  //Updates progress bar. Also, the comparision to downloadProgress prevents a bug where the total loading percentage is all over the map.
                  if (document.getElementById("download-progress") && (downloadProgress < scope.downloadProgress )) {
                    document.getElementById("download-progress").innerHTML = Math.round(scope.downloadProgress);
                    if (document.getElementById("ft-prog")) document.getElementById("ft-prog").value = scope.downloadProgress;
                    downloadProgress = scope.downloadProgress;
                  }

              };
            //Cancel download button behavior
            var deregister = scope.$on('ABORT_DOWNLOAD', function(event, args) {
              message.console("Abort Caught");
              $translate('CANCEL_DOWNLOAD').then(function(cancel) {
                if(confirm(cancel)) {
                  ft.abort();
                  document.getElementById("ft-prog").value = 0;
                  document.getElementById("download-progress").innerHTML = 0;
                  deregister();
                }
              });
               
            });

            ft.download(
              url, 
              targetPath, 
              function(result) {
                onSuccess();
              },
              function(err) {
                message.console("on error before: ", $rootScope.inProgress, $rootScope.downloadsCompleted, err);
                $rootScope.inProgress--;
                $rootScope.downloadsCompleted++;
                scope.$broadcast("DOWNLOAD_CHANGE");
                scope.$apply();
                message.console("on error after: ", $rootScope.inProgress, $rootScope.downloadsCompleted);
                //If error is canceled download:
                if(err.code == 4) {
                 message.console("file canceled"); 
                } else {
                  $translate(['ERROR_DOWNLOAD', 'CHECK_NETWORK']).then(function(translations) {
                    showAlert(translations.ERROR_DOWNLOAD , translations.CHECK_NETWORK);
                    message.console("Download abort", err);
                  });
                  message.error("Download", err);
                  deregister();
                }
                document.getElementById("ft-prog").value = 0;
                document.getElementById("download-progress").innerHTML = 0;
                  
              }, 
              trustHosts,
              options);


            } //End function downloadft

          }
       }//end link
     }
}]);