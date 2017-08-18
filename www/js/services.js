angular.module('starter.services', [])

.factory('ApiServe', ['$http', '$rootScope', '$translate', function($http, $rootScope, $translate) {
    var networkError = 0;
    var getAPIS = function(url, variables) {
      urlString = "";
      if( typeof variables !== 'undefined') {
        urlString = "?" + variables;
      }

      return $http.get('http://api.fontedavida.org/' + url + '/api' + urlString).success(function(data) {
          //console.log('http://api.fontedavida.org/' + url + '/api' + urlString + " API called with success", data);
          //saveData("settings.orgList", data);
        }).error(function(error) {
          // console.log(v + " API unable to be called");
          if (networkError < 20) {
            //alert("error", $translate('NETWORK_ERROR'));
            if (typeof analytics !== "undefined"){
            window.ga.trackEvent("Error", "Network", networkError);
            }
          }
          networkError += 1;
      });
    }
    
    var getLocal = function(v) {
      return $http.get('ajax/' + v + '.json').success(function(data) {
        $(".waiting").hide();
        // console.log(v + " local API called with success", data);
        return data;
      }).error(function(error) {
        // console.log(v + " local API unable to be called");
        if (typeof analytics !== "undefined"){
          window.ga.trackEvent("Error", "Local API", error);
        }
      });
    }

    return {
      getAPIS: getAPIS,
      getLocal: getLocal
    };
    

}])

.factory('getId', ['$rootScope', '$filter', '$http', '$interval', 
  function($rootScope, $filter, $http, $interval) {  
    //after finding out the specific ID's, return the proper license, org, and teacher information
    var getId = this;
    getId.result = {};

    getId.oneID = function(type, id) {
      console.log("oneID called");
      $http.get('http://api.fontedavida.org/' + type + '/api?id=' + id).success(function(data) {
        getId.result = data[0];
        
        //$rootScope.$broadcast("oneIDReturned");
        console.log("data", data, data.teacher_id, data.organization_id);
        result = getId.getV(data[0].teacher_id, data[0].organization_id);
        if(type == 'teaching') result.teaching = data[0];
        if(type == 'resource') result.resource = data[0];
        console.log("oneIDReturned", result);
        getId.getV(data[0].teacher_id, data[0].organization_id);
        return data[0];
      }).error(function(error) {
        console.log("problem with getId.one function");
      });
    };

    getId.getV = function(teacherId, orgId, resourceId, type) {
      console.log("function getV Called", $rootScope.settings.orgList.length, $rootScope.settings.speakerList.length);
      var v = [];
      if(!$rootScope.settings.orgList.length || !$rootScope.settings.speakerList.length) {
        console.log("calling all APIs", $rootScope.settings.orgList.length, $rootScope.settings.speakerList.length);
        $rootScope.$emit("callAllAPIs", {});
      }
      var promise = $interval(checkV, 1000, 10);

      function checkV() {
        console.log("function checkV called");
        if($rootScope.settings.orgList.length || $rootScope.settings.speakerList.length) {
          return finishV();
        } else {
          console.log("another interval: ", $rootScope.settings.orgList.length, $rootScope.settings.speakerList.length);
        }      
      }

      var finishV = function() {
        //console.log("function finishV called");
        v.organization = $filter('filter')($rootScope.settings.orgList, function (d) {return d.id == orgId;})[0];
        v.teacher = $filter('filter')($rootScope.settings.speakerList, function (d) {return d.id == teacherId;})[0];
        //console.log("v. org and teacher: ", v.organization, v.teacher, $rootScope.settings.speakerList);
        if(v.organization != undefined) v.license = $filter('filter')($rootScope.settings.licenses, function (d) {return d.id == v.organization.license_type_id;})[0]; 
        if(type == "resource") {
          v.resource = getId.findD($rootScope.settings.resourceList, resourceId)
          //console.log("getId returned: ", v);
        } else if(type == "teaching") {
          v.teaching = getId.findD($rootScope.settings.teachings, resourceId)
        } else if(type == undefined) {
          //console.log("getV called without a teaching or resource ID");
        }
        $interval.cancel(promise);
        //console.log("vReturned", v);
        return v;
      }
        $rootScope.$emit("vReturned", v);
        return v;

    };

    

    getId.all = function(v, type) {
      var teacherId = 0, orgId = 0, resourceId = 0;
      if(type == 'resource') {
        if($rootScope.settings.resourceList == undefined) {
          var source;
        } else {
          source = getId.findD($rootScope.settings.resourceList, v);
        };
        teacherId = source.teacher_id;
        orgId = source.organization_id;
        return getId.getV(teacherId, orgId, v, type); 
      } else if(type == 'teaching') {
        console.log("teaching called on services:70. teachingID: ", v);
        if($rootScope.settings.teachings == undefined) {
          var source;
        } else {
          source = getId.findD($rootScope.settings.teachings, v);
        }
        teacherId = source.teacher_id;
        orgId = source.organization_id;
        return getId.getV(teacherId, orgId, v, type);
        };
    };

    //Find ID = variable in the object location
    getId.findD = function(location, variable) {
      return $filter('filter')(location, function(d) {return d.id == variable;})[0];
    };

    return getId;

}])

.service('settingsFns', ['$cordovaFile', '$localStorage', '$rootScope', 'ApiServe', '$window', '$http', function($cordovaFile, $cordovaFileTransfer, $localStorage, $rootScope, ApiServe, $window, $http) {
    //Save data to persistent storage
    this.saveData = function(variable) {
      $localStorage.settings = variable;
      console.log("Data Save function called: ", JSON.stringify(variable));
    }
    
    //Load data from persistent storage
    this.loadData = function() {
      return $localStorage.settings;
      console.log("Data Load function called: ");
    }
    
}])
.factory('downloadService', function() {
    //Make the download lists: this are the files TO download; not the ones already done downloading!!!
    var downloads = {};
    downloads.teaching = [];
    downloads.resource = [];
    downloads.bible = [];

    downloadz = function(item, key){
      console.log("downloads.add called from the downloadService");
      //item.type = 0;
      item.type = key;
      if(key == "teaching") {
            downloads.teaching.push(item);
          }
          else if(key == "resource") {
            downloads.resource.push(item);
          }
          else if(key == "bible") {
            downloads.bible.push(item);
          };
      }
    return {
      downloadz: downloadz,
      downloads: downloads
    };
})
.service('fonteFns', ['$translate', '$http', '$rootScope', function($translate, $http, $rootScope) {
    //this.languages = settings.languages;
    settings = $rootScope.settings;
    

    this.playNow = function(selectedAudio){
      if(typeof analytics !== "undefined") {
        analytics.trackEvent('Player Started', selectedAudio.en_title, settings.rLanguage.en_language);
      };        
      //Testing statements
      // console.log("scope.playNow called");

      //count hits funtion
      countHit = function(id) {
        $http.get('http://146.148.29.150/fonte/api/html/web/teaching/hit?id=' + id).success(function(data) {
          // console.log("hit added, ID = ", id);
        }).error(function(error) {
          // console.log("unable to count hit: ", id);
          if (typeof analytics !== "undefined"){
            window.ga.trackEvent("Error", "Hit counter", error);
          }
        });
      }

      //count hit on the teaching and not the Bibles
      if(selectedAudio.id !== undefined) {
        countHit(selectedAudio.id);  
      } else {
        // console.log("ID'd as Bible: no hit counted");
      }
    }; //end playNow Function
}])

.service('playlistService', ['$sce', '$http', '$rootScope', function($sce, $http, $rootScope) {
  var playlistService = this;
  
  playlistService.audioPlayList = [];
  playlistService.videoPlayList = [];
  playlistService.main = undefined;
  playlistService.selected = undefined;

  playlistService.getClicked = function(){
    //console.log("getClicked called - .chapter_id", playlistService.selected.chapter_id);
     if (playlistService.selected != null && playlistService.selected.chapter_id != undefined) { 
        console.log("selected and chapter_id defined:" );
        return playlistService.selected.chapter_id - 1;
      } else {
        console.log("selected and chapter_id undefined:" );
        return 0;
        };
  };

  playlistService.setClicked = function(data){
    playlistService.selected = data;
  };

  playlistService.setChapter = function(data){
    if (playlistService.selected == undefined) {
      console.log("playlistService undefined");
      playlistService.selected = 0;
    };
    console.log("playlistService.selected: ", playlistService.selected);

    playlistService.selected.chapter_id = data;
  };

  playlistService.getMain = function(main){
    return playlistService.main;
  };

  playlistService.setMain = function(main){
    playlistService.main = main;
  };

  playlistService.getAudioPlayList = function(){

     return playlistService.audioPlayList;
  };

  playlistService.setAudioPlayList = function(value){
    console.log("Audio PlayList: ", JSON.stringify(value));

    playlistService.audioPlayList = value;
  };

  playlistService.getVideoPlayList = function(){
     return playlistService.videoPlayList;
  };

  playlistService.setVideoPlayList = function(value){
    //PREPARE videoPlayList
    playlistService.videoPlayList = value;
  };

}])

// Displays messages to the console, user (alerts / errors), and Google analytics

.service('message', ['$rootScope', '$translate', '$http', function($rootScope, $translate, $http){ // I only added rootScope so that we had something in the header to start
  var messageService = this;

  messageService.console = function(message, object1, object2){
    if (typeof object1 == "undefined"){
      console.log(message);
    }
    else if(typeof object2 == "undefined"){
      if($rootScope.settings.web){ // If we are using a computer, chrome console is fine
        console.log(message, object1);
      }
      else{ // If we are running the console on node, we need to stringifiy objects to see them
        console.log(message, JSON.stringify(object1));
      }
    }
    else{
      if($rootScope.settings.web){ // If we are using a computer, chrome console is fine
        console.log(message, object1, object2);
      }
      else{ // If we are running the console on node, we need to stringifiy objects to see them
        console.log(message, JSON.stringify(object1), JSON.stringify(object2));
      }
    }
  }

  messageService.gaEvent = function(category, thisEvent, message, counter){
    if (typeof analytics !== "undefined"){
      if (typeof thisEvent == "undefined"){
        window.ga.trackEvent(category);
      }
      else if (typeof message == "undefined"){
        window.ga.trackEvent(category, thisEvent);
      }
      else if (typeof counter == "undefined"){
        window.ga.trackEvent(category, thisEvent, message);
      }
      else{
        window.ga.trackEvent(category, thisEvent, message, counter);
      }
    }
    else if($rootScope.settings.web){
      console.log("gaEvent called");
    } else {
      console.log("GA is undefined.");
    }
  }

  messageService.gaView = function(category, thisEvent, message){
    if (typeof analytics !== "undefined"){
      if (typeof thisEvent == "undefined"){
        window.ga.trackView(category);
      }
      else if (typeof message == "undefined"){
        window.ga.trackView(category, thisEvent);
      }
      else{
        window.ga.trackView(category, thisEvent, message);
      }
    }
    else if($rootScope.settings.web){
      console.log("gaView called", category, thisEvent, message);
    } else {
      console.log("GA is undefined.");
    }
  }

  messageService.alert = function(message){
    $translate(message).then(function(headline){
      alert(headline);
    },
    function(translationId){
      alert(translationId);
    });
  }

  // This function is intended to be redefined for production. Instead of sending an error to console log,
  // this function should report errors to google analytics.
  messageService.error = function(thisEvent, thisError){
    // Development version
    messageService.console("Error!", thisEvent, thisError);
  }
  //subscribe to PUSH notifications with the given topic
  messageService.subscribeToTopic = function(topic) {
    var token = $rootScope.settings.token;
    console.log("subscribeTokenToTopic called: " + topic);
    $http.get('http://api.fontedavida.org:3000/subscribe/'+config.messagingSenderId+'/'+token+'/'+topic).then(function(data) {
      if(data.response < 200 || data.response >= 400) {
        console.log("error response: ", data.response);
      } else console.log('Subscribed to ' + topic);
    }, function(error) {
      console.error("Error subscribing: ", JSON.stringify(error));
    });
  }

  messageService.unsubscribeFromTopic = function(topic) {
    var token = $rootScope.settings.token;
    console.log("unsubscribeTokenToTopic called: ", topic);
    $http.get('http://fontedavida.org:3000/unsubscribe/'+config.messagingSenderId+'/'+token+'/'+topic).then(function(data) {
      if (data.status < 200 || data.status >= 400) {
        throw 'Error unsubscribing from topic: '+data.status + ' - ' + data.text();
      }
      console.log('unSubscribed from ' + topic);
    }, function(error) {
      console.error(JSON.stringify(error));
    });
  }


  // Not sure what to do with this one yet
  // messageService.error = function(message){
    // Production version
    // messageService.gaEvent("Error", thisEvent, thisError);
}]);