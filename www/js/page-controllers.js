//File: page-controllers.js
angular.module('page.controllers', ['pascalprecht.translate', 'jett.ionic.filter.bar'])

.controller('SermonsCtrl', ['$scope', '$sce', '$rootScope', 'playlistService', 'message', function($scope, $sce, $rootScope, playlistService, message) {
  //Teaching page controller
  //fonteFns
  message.gaView("Teachings");
  $(".waiting").hide();

  $scope.trustSrc = function(src) {
    return $sce.trustAsResourceUrl(src);
  }

  $scope.playNow = function(main, data){
    //message.console("playNow called from SermonsCtrl", main, data);
    if(data != null || data != undefined){

      var title, subtitle;
      
      switch($rootScope.settings.lang) {
        case "en":
            title = main.en_name;
            subtitle = data.en_title;
            break;
        case "pt":
            title = main.pt_name;
            subtitle = data.pt_title;
            break;
        default:
            title = main.en_name;
            subtitle = data.en_title;
      }

      var playList = {
        title: title,
        subtitle: subtitle,
        image: main.photo,
        sources: [
          { src: $sce.trustAsResourceUrl(data.fileUrlLocalPath ? data.fileUrlLocalPaths:data.teaching_url), type: "audio/mpeg" },
        ]
      };
    
      playlistService.setAudioPlayList([playList]);
      $rootScope.$broadcast('AUDIO_SOURCE_DATA');  
    }
  };//fonteFns.playNow;
  $scope.download = function(){};
  $scope.sortingBy = "hits";
  
  $scope.clearSearch = function() {
    message.console("Function clearSearch called");
    $scope.search_query = "";
  }

}])

.controller('CountryCtrl', ['$scope', '$rootScope', 'ApiServe', 'message', function($scope, $rootScope, ApiServe, message) {
    if($rootScope.settings.countries) {
      //message.console("countries already exists");
      $scope.countries = $rootScope.settings.countries;
    } else {
      ApiServe.getLocal('country').then(function(response) {
        $scope.countries = response.data;
        message.console("country API local data returned", response.data);
        $rootScope.settings.countries = response.data;
      });

      ApiServe.getAPIS('country').then(function(response) {
        $scope.countries = response.data;
        message.console("country API remote data returned", response.data);
        $rootScope.settings.countries = response.data;
      });
    }

    $scope.countryChange = function(countryId) {
      $rootScope.settings.country = countryId;
      message.console("Country settings changed: ", countryId);
      $rootScope.$broadcast('countryChange');
      //message.subscribeToTopic("ctry" + countryId);

      $scope.next(2);
    }
}])

.controller('NothingCtrl', ['$scope', '$location', function($scope, $location) {
  $scope.go = function ( path ) {
    $location.path( path );
  };
}])

.controller('AboutTeamCtrl', ['$scope', '$http', 'message', function($scope, $http, message) {
  message.console("TeamCtrl called");
  $http.get('http://web.fontedavida.org/ajax/team.php').success(function(data) {
    $scope.team = data;
    message.console("Team pull success", data);
  }).error(function(error) {
    message.error("Team pull error", error);
  });
}])


.controller('RLangCtrl', ['$scope', '$rootScope', '$filter', 'message', 'ApiServe', function($scope, $rootScope, $filter, message, ApiServe) {
  
  //Limits the number of languages getting piped through to the rlanguage selector
  function languageFilter() {
    var languageList;
    if($rootScope.settings.countries != undefined) {
      languageList = $filter('filter')($rootScope.settings.countries, {id: $rootScope.settings.country})[0].resource_languages;
    } else {
      languageList = [];
    }

    message.console("languageList: ", languageList, languageList.length);

    //For each ID, find the language that is associated
    output = [];
    for (var i = 0; i < languageList.length; i++) {
      out = $filter('filter')($rootScope.settings.languages, {id: languageList[i]})[0];
      output.push(out);
    }

    //If Language List is non-existent, we pull all languages - otherwise we pull the language we need and apply to the title attribute
    if(languageList.length) {
      message.console("output: ", output);
      for (var i = 0; i < output.length; i++) {
        if($rootScope.settings.lang == "pt") {
          output[i].title = output[i].pt_language;
        } else {
          output[i].title = output[i].en_language;
        }
      }
      $scope.languages = output;
    } else {
      for (var i = 0; i < $rootScope.settings.languages.length; i++) {
        if($rootScope.settings.lang == "pt") {
          $rootScope.settings.languages[i].title = $rootScope.settings.languages[i].pt_language;
        } else {
          $rootScope.settings.languages[i].title = $rootScope.settings.languages[i].en_language;
        }
      }
      $scope.languages = $rootScope.settings.languages;
    }

    //If old resource language doesn't exist in new country, default to Portuguese
    if($rootScope.settings.rLanguage != undefined) {
      if($filter('filter')($scope.languages, {id: $rootScope.settings.rLanguageid}, true)[0] != undefined) {
        message.console("Language exists in new country; we are fine");
      } else {
        message.console("potential language issues: $scope.languages: ", $scope.languages);
        $rootScope.settings.rLanguageid = $scope.languages[0].id;
        $rootScope.settings.rLanguage = $scope.languages[0];
        //message.console("Language does not exist in new country; changing");
      }
    }
  }

  $rootScope.$on('countryChange', function() {
    languageFilter();
  
  });

  if($rootScope.settings.country != "") {
    languageFilter();
  }


  
  // $scope.$watch("$root.settings.country", function(){
  //   console.log("Country Changed yo");
  //   languageFilter();
  //   if($rootScope.settings.country != "") {
  //     message.subscribeToTopic("ctry" + $rootScope.settings.country);
  //   }
  
  // });
  
  oldRLanguage = "";
  $scope.$watch("settings.rLanguageid", function(){
    if(oldRLanguage == $rootScope.settings.rLanguageid) return;
    $rootScope.settings.rLanguage = $filter('filter')($rootScope.settings.languages, {id: $rootScope.settings.rLanguageid})[0];
    message.console("rLanguageid changed. New rLanguage: ", $rootScope.settings.rLanguage);
    message.subscribeToTopic("rLang" + $rootScope.settings.rLanguageid);
    oldRLanguage = $rootScope.settings.rLanguageid;
    getAPI('teaching', 'rlang=' + $rootScope.settings.rLanguageid);

    // ApiServe.getAPIS('video', 'rlang=' + $rootScope.settings.rLanguageid + '&applang=' + $rootScope.settings.lang).then(function(response){
    //   message.console("videos called from rlanguage change: ", $rootScope.settings.rLanguageid + response.data.length);
    //   $rootScope.settings.videos = response.data;
    //  if($rootScope.settings.videos.length > 0) {
    //     $(".video-tab").show();
    //     } else {
    //     $(".video-tab").hide();
    //   };
    //   filteredResources = $filter('filter')($rootScope.settings.resourceList, {primary_language_id: $rootScope.settings.rLanguageid});
    //  if(filteredResources.length > 0) {
    //     $(".resource-tab").show();
    //     } else {
    //     $(".resource-tab").hide();
    //   };
    // });

  });

  function getAPI(url, variables) {
    ApiServe.getAPIS(url, variables).then(function(response) {
      switch(url) {
        case 'teaching':
        $rootScope.settings.teachings = response.data;
        break;
      }
    });
  }
}])



.controller('BibleCardCtrl', ['$scope', '$rootScope', function($scope, $rootScope) {
  $scope.chapter.rLanguage = $rootScope.settings.rLanguage;
  $scope.chapter.title = $scope.bookName + " " + $scope.chapter.chapter_id;
}])

//A card here would be a specific sermon to listen to
.controller('SermonCardCtrl', ['$scope', '$filter', '$rootScope', 'message', function($scope, $filter, $rootScope, message) {

  //randomization formula, greatest to least
  $scope.teaching.jonOrder = $scope.teaching.id + 500 * Math.random();

  if( angular.isUndefined($scope.teaching) ) {
    //message.console("$scope.teaching is undefined");
    $scope.teaching = {};
    $scope.teaching.teacher_id = 7;
    $scope.teaching.photo = 0;
    $scope.org = {};
    $scope.org.photo = 0;
    $scope.teacher = {};
  }

  $scope.teacher = $filter('filter')($rootScope.settings.speakerList, {id: $scope.teaching.teacher_id})[0];
  $scope.org = $filter('filter')($rootScope.settings.orgList, {id: $scope.teaching.organization_id})[0];
  $scope.license = $filter('filter')($rootScope.settings.licenses, {id: $scope.org.license_type_id})[0];
  if( angular.isUndefined($scope.teacher) ) {
    //message.console("$scope.teaching is undefined");
    message.error("Sermon page", "$scope.teaching is undefined");
    $scope.teaching = {};
    $scope.teaching.teacher_id = 7;
    $scope.teaching.photo = 0;
    $scope.org = {};
    $scope.org.photo = 0;
    $scope.teacher = {};
  }
  //If the teaching photos are the same, omit one.
  if(($scope.org.photo === $scope.teacher.photo) || ($scope.teacher.id === 3)) {
    $scope.teacher_photo = $scope.org.photo;
    $scope.org_photo = "";
  } 
  else {
    $scope.org_photo = $scope.org.photo;
    $scope.teacher_photo = $scope.teacher.photo;
  }

  //Prep for playNow() function
  $scope.teaching.photo = $scope.teacher_photo;
  if($rootScope.settings.lang == "en") {
    $scope.teaching.organization = $scope.org.en_name;
    $scope.teaching.title = $scope.teaching.en_title;
  } else {
    $scope.teaching.organization = $scope.org.pt_name;
    $scope.teaching.title = $scope.teaching.pt_title;
  }

  $scope.teaching.created_at =  Date.parse($scope.teaching.created_at); // for conversion to string
  //message.console("Teachings: ", $scope.teaching);
}])

.controller('ResourceCardCtrl', ['$scope', '$filter', '$rootScope', 'message', function($scope, $filter, $rootScope, message) {
  //randomization formula, greatest to least
  $scope.resourceList.jonOrder = $scope.resourceList.id + 500 * Math.random();

  $scope.teacher = $filter('filter')($rootScope.settings.speakerList, {id: $scope.resource.teacher_id})[0];
  $scope.org = $filter('filter')($rootScope.settings.orgList, {id: $scope.resource.organization_id})[0];
  $scope.license = $filter('filter')($rootScope.settings.licenses, {id: $scope.org.license_type_id})[0];

  if((($scope.teacher.id === 3) && ($scope.org.id != 4))) {
    message.console("ResouceCardCtrl is called");
    $scope.teacher_photo = $scope.org.photo;
    $scope.org_photo = "";
  } 
  else {
    $scope.org_photo = $scope.org.photo;
    $scope.teacher_photo = $scope.teacher.photo;
  }
}])

.controller('ResourceCtrl', ['$scope', '$rootScope', '$sce', '$http', '$cordovaFileOpener2', 'message', function($scope, $rootScope, $sce, $http, $cordovaFileOpener2, message){
  message.gaView("Resources");
  message.console("ResourceCtrl called");
  $(".waiting").show();
  $http.get('http://api.fontedavida.org/resource/api').success(function(data) {
        $rootScope.settings.resourceList = data;
        $(".waiting").hide();
        $scope.resourceList = $rootScope.settings.resourceList;
        //message.console("Resource API called with success", data);
        //message.console("resourceList: ", $rootScope.settings.resourceList);
      }).error(function(error) {
        alert("resource API unable to be called", error);
      });
  $scope.clearSearch = function() {
    //message.console("Function clearSearch called");
    $scope.search_query = "";
  }
}])
.controller('OrganizationCtrl', ['$scope', '$rootScope', 'message', function($scope, $rootScope, message){

  message.gaView("Organizations");
  message.console("OrganizationCtrl called");

  $scope.orgList = $rootScope.settings.orgList;
  $scope.orgList = $rootScope.settings.orgList;
  //message.console("Orglist moved to Scope:", $scope.orgList);

  $scope.clearSearch = function() {
    //message.console("Function clearSearch called");
    $scope.search_query = "";
  }
}])

.controller('DetailPageCtrl', ['$state', '$scope', function($state, $scope) {
  $scope.whichOrg = $state.params.orgId;
  $scope.whichSpeaker = $state.params.speakerId;
}])

//Sermon Details
.controller('SDetailCtrl', ['$sce', '$scope', '$http', 'playlistService', '$state', 'getId', '$rootScope', 'message', 'fonteFns',
  function($sce, $scope, $http, playlistService, $state, getId, $rootScope, message, fonteFns){
  message.gaView("Teaching page " + $state.params.teachingId);
  var teachingId = $state.params.teachingId;
  $('.waiting').show();
  src = [];
  teaching = [];
  
  src.teaching = teaching;

  //Is our teaching in the db?
  if($rootScope.settings.teachings != undefined) {
    message.console("teachings called, looking for exact match");
    teaching = getId.findD($rootScope.settings.teachings, teachingId);

    if(teaching == undefined) {
      message.console("match not found. Drawing from API");
      teaching = getId.oneID('teaching', teachingId);
      message.console("teaching:", teaching);
      
    } else {
      message.console("match found. teaching:", teaching);
      src = getId.getV(teaching.teacher_id, teaching.organization_id);
      src.teaching = teaching;
      $('.waiting').hide();
      message.console("src:", src);
    }

  };

  $rootScope.$on("vReturned", function(event, data) {
    src = data;
    src.teaching = teaching;
    message.console("vReturned: v and src: ", data, src);
    $('.waiting').hide();
    $scope.src = src; 
  });


   $scope.src = src; 


  $scope.playNow = function(teaching, teacher){
    //message.console("playNow called from SDetailCtrl: ", teaching, teacher);
    if(teaching != null || teaching != undefined){

      var title, subtitle;
      
      switch($rootScope.settings.lang) {
            case "en":
                title = teacher.en_name;
                subtitle = teaching.en_title;
                break;
            case "pt":
                title = teacher.pt_name;
                subtitle = teaching.pt_title;
                break;
            default:
                title = teacher.en_name;
                subtitle = teaching.en_title;
        }

      var playList = {
        title: title,
        subtitle: subtitle,
        image: teacher.photo,
        sources: [
          { src: $sce.trustAsResourceUrl(teaching.fileUrlLocalPath ? teaching.fileUrlLocalPaths:teaching.teaching_url), type: "audio/mpeg" },
        ]
      };
    
      playlistService.setAudioPlayList([playList]);
      playlistService.setChapter(1);
      fonteFns.countHit('teaching', teaching.id);
      $rootScope.$broadcast('AUDIO_SOURCE_DATA');  
    }
  };//fonteFns.playNow;
  $scope.wordLength = window.innerWidth - 220;
  $scope.page = 'teaching';



}])

//Resource Details
.controller('RDetailCtrl', ['$scope', '$parse', '$state', '$window', 'getId', '$sce', '$http', '$cordovaFileOpener2', '$cordovaSocialSharing', '$rootScope', '$translate' , 'message', 
  function($scope, $parse, $state, $window, getId, $sce, $http, $cordovaFileOpener2, $cordovaSocialSharing, $rootScope, $translate, message){
  message.console("Resource page called", $rootScope.settings.resourceList);
  message.gaView("Resource page " + $state.params.resourceId);
  $('waiting').show();
  var resourceId = $state.params.resourceId;
  var open = $state.params.open;
  $scope.wordLength = window.innerWidth - 220;
  $scope.page = 'resource';
  src = [];
  resource = [];


  src.resource = resource;

  //Is our resource in the db?
  if($rootScope.settings.resourceList != undefined) {
    message.console("resources called, looking for exact match");
    resource = getId.findD($rootScope.settings.resourceList, resourceId);

    if(resource == undefined) {
      message.console("match not found. Drawing from API");
      src.resource = getId.oneID('resource', resourceId);
      message.console("src:", src);
      
    } else {
      message.console("match found. resource:", resource);
      src = getId.getV(resource.teacher_id, resource.organization_id);
      src.resource = resource;
      $('.waiting').hide();
      message.console("src:", src);
    }

  } else {
      message.console("match not found. Drawing from API");
      resource = getId.oneID('resource', resourceId);
      message.console("src:449", resource);
    };

  $rootScope.$on("vReturned", function(event, data) {
    src = data;
    src.resource = getId.result;
    message.console("vReturned:456 v and src: ", data, src, resource);
    $('.waiting').hide();
    $scope.src = src; 
  });

    $scope.src = src;

  // src = getId.all(resourceId, 'resource');
  // if(typeof src != 'undefined') {
  //   $scope.src = src;
  //   $('.waiting').hide();
  // } else {
  //     $http.get('http://api.fontedavida.org/resource/api?id=' + resourceId).success(function(data) {
  //       $scope.src = data;
  //       $scope.src = getId.all(resourceId, 'resource');
  //       console.log("$scope.src: ", $scope.src);
  //       $(".waiting").hide();
  //       // if ($rootScope.play == true) {
  //       //     $scope.playNow($scope.src.teaching,$scope.src.teacher);
  //       // }
  //       //message.console("Resource API called with success", data);
  //       //message.console("resourceList: ", $rootScope.settings.resourceList);
  //     }).error(function(error) {
  //       alert("resource API unable to be called", error);
  //     });
  // }





  $('.waiting').hide();
  

  $scope.resourceDownload = function(resource) {
    $window.open(resource.resource_url, '_blank');
    //message.console("resourceDownload called");      
  }
  
  $scope.resourceOpen = function(resource) {
    var _file = resource.fileUrlLocalPath? resource.fileUrlLocalPath:resource.resource_url;
    var trustedURL = $sce.trustAsResourceUrl(_file);
    message.gaEvent("Click", "Print Resource Open: ", resource.en_name);
    //message.console("resource URL: ", resource.resource_url);
      $(".waiting").show();
      window.open(_file, '_system', 'location=yes');
      $(".waiting").hide();
    
    $http.get('http://api.fontedavida.org/resource/hit?id=' + resource.id).success(function(data) {
      //message.console("hit added, ID = ", resource.id);
      message.gaEvent("Hit", "Resource", resource.id);
    }).error(function(error) {
      message.error("Unable to count hit", resource.id);
      });
  }

  if ($state.params.open != undefined) {
    message.console("open called");
    $scope.resourceOpen($scope.src.resource);
  }
}])

//Any page that has a form is controlled here. Ex: sending email, organization signup, etc.
.controller('FormCtrl', [ '$http', '$scope', '$window', '$translate', 'message', '$rootScope', function($http, $scope, $window, $translate, message, $rootScope){
  //message.console("FormCtrl called");
  $scope.save = function() {
    console.log($scope.partnership);
    if ($('form').$valid) {      
      //form is valid
    }
    else {
        //if form is not valid set $scope.addContact.submitted to true     
        console.log("Invalid Form");
        $('form').addClass("submitted");    
    }};

  this.sendMail = function(emailInfo, formType) {

    //message.console('SendMail called:');
    message.gaEvent("Mail", "Sent", formType);


    if (formType == 'copyright') {
      var email = {
        method: 'POST',
        url: 'http://api.fontedavida.org/postmail.php',
        headers: {
         'Content-Type': 'application/x-www-form-urlencoded'
        },
        data:$.param({
          'resources' : $('input[name=resources]').val(),
          'idioma' : $('input[name=idioma]').val(),
          
          'name' : $('input[name=nome]').val(),
          'email' : $('input[name=email]').val(),
          'telefone' : $('input[name=telefone]').val(),
          'pais' : $('input[name=pais]').val(),
          'organizacao' : $('input[name=organizacao]').val(),
          
          'lideranca' : $('select[name=lideranca]').val()
        })
      }
    }



    else if (formType == 'partnership') {
      //collect the values of checkboxes.
      var recursos = $('input[name=resources]');

      //initializing the values of checkboxes as empty.
       var recurso1 = ''; var recurso2 = '';  var recurso3 = '';

      //verify if the checkboxes were CHECKED by the user. if cheched: set new values for variables. 
       if(recursos[0].checked) var recurso1 = "Sermoes";
       if(recursos[1].checked) var recurso2 = "Livros";
       if(recursos[2].checked) var recurso3 = "Biblia(Audio)";
       
       //join the values of checked resources.
       var todos_recursos = recurso1+' '+recurso2+' '+recurso3;

      var email = {
        method: 'POST',
        url: 'http://api.fontedavida.org/postmail_02.php',
        headers: {
         'Content-Type': 'application/x-www-form-urlencoded'
        },
        data:$.param({
          'resources' : todos_recursos,
          'idioma' : $('input[name=idioma]').val(),
          'idiomadeform' : $rootScope.settings.lang,
          'name' : $('input[name=nome]').val(),
          'email' : $('input[name=email]').val(),
          'telefone' : $('input[name=telefone]').val(),
          'pais' : $('input[name=pais]').val(),
          'organizacao' : $('input[name=organizacao]').val(),
          'lideranca' : $('select[name=lideranca]').val(),
       })
      }
    }

    $http(email).then(function(data){
      //message.console("email success", email);
      $window.location.href = '#/tab/dash';
      message.alert('EMAIL_SUCCESS');
    }, 
    function(){
      message.alert('EMAIL_FAIL' + data);
    });
  }
}])

.controller('VideosCtrl', ['$scope', '$rootScope', 'playlistService', function($scope, $rootScope, playlistService) {
    $scope.runVideo = function(url){
      playlistService.setVideoPlayList(url);
      $rootScope.$broadcast('VIDEO_SOURCE_DATA');
    };
    $scope.grnVideos = [];
  var getUrl = function(input){
    var video = [];
    video.gp_url = "http://files.globalrecordings.net/audio/s" + input + "/3gp/S"+input+".3gp";
    video.mp4_url = "http://files.globalrecordings.net/audio/s" + input + "/mp4/S"+ input +".mp4";
    video.title = "Test, yo";

    //We need the title, picture, etc working on here.

    $scope.grnVideos.push(video);
  };
  getUrl($rootScope.settings.rLanguage.grn_number);
  console.log("rLanguage on Video Screen: ", $rootScope.settings.rLanguage);
    // $scope.$watch('$rootScope.settings.videos', function(){
    //   console.log("$rootScope.settings.videos changed");
    // });
}])


//Controls the books of the bible
.controller('BibleCtrl', ['$scope', '$http', '$rootScope', '$translate', 'playlistService', 'message', function($scope, $http, $rootScope, $translate, playlistService, message) {

  message.console("BibleCtrl called");
  message.gaView("Bible");
  message.console("page-controllers 481 rLanguage: ", JSON.stringify($rootScope.settings.rLanguage));
  
  listBooks = function(testament, damid){
    //Determine bookURL based on type of DAM: normal or proprietary
    message.console("listbooks called with the following variables: ", testament, damid);
    if(damid.substring(0,3)=="FDV") {
      message.console("Fonte DAM recognized from ListBooks");
      bookURL = 'http://api.fontedavida.org/bibleapi-booklist.php?damid='  + damid;
      getBooksAjax(bookURL);
    } else {
      if(testament == 'IDNT') {
        bookURL = 'ajax/nt_books.json';
      } else {
        bookURL = 'ajax/ot_books.json';
      }
      getBooksAjax(bookURL);

    }

    $(".waiting").show();
    
    

  };

  //Depending on the testament, pass different variables  to listBooks
  listBookSet = function() {
      if($rootScope.settings.rLanguage != undefined) {
        if($rootScope.settings.testament == "IDOT") {
          listBooks($rootScope.settings.testament, $rootScope.settings.rLanguage.IDOT);
        } else if ($rootScope.settings.testament == "IDNT"){
          listBooks($rootScope.settings.testament, $rootScope.settings.rLanguage.IDNT);
        } else {
          message.console("error: settings.testament improper value");
        }
      } else {
        listBooks("IDNT", '1234567890');
      }
  }

  getBooksAjax = function(URL) {
    $http.get(URL).then(function(results) {
      message.console("http.get success: ", bookURL, results.data);
      $scope.books = results.data;
      playlistService.setMain(results.data);
      $(".waiting").hide();
    });
  }

  $scope.$watch('settings.testament', listBookSet);
  $scope.$watch('settings.rLanguage', function(){
    if($rootScope.settings.rLanguage != undefined && $rootScope.settings.rLanguage.IDOT == 0) {
      $rootScope.settings.testament = "IDNT";
    } 
    listBookSet;
  });
  $scope.clearSearch = function() {
    message.console("Function clearSearch called");
    $scope.search_query = "";
  }    
}])

//Controls the specific chapters within a Bible book.
.controller('BibleBookCtrl', ['$scope', '$sce', '$rootScope', '$http', '$translate', '$state', '$filter', 'playlistService', 'message',
  function($scope, $sce, $rootScope, $http, $translate, $state, $filter, playlistService, message) {

  message.console("BibleBookCtrl called");
  //$ionicLoading.show();
  //, 'fonteFns'
  settings = $rootScope.settings;

  settings.bibleBookId = $state.params.bookId;
  $scope.bookName = $state.params.bookName;
  message.console("page-controllers 552 rLanguage: ", JSON.stringify(settings.rLanguage), JSON.stringify($rootScope.settings.rLanguage));
  message.gaEvent('Bible', settings.testament + settings.bibleBookId, settings.rLanguage.en_language);
  message.console('Click', 'Book Click', settings.rLanguage.en_language);

  $scope.trustSrc = function(src) {
    return $sce.trustAsResourceUrl(src);
  }  
  bookCode = $state.params.bookCode;
  if (settings.testament == "IDOT"){
    damId = $rootScope.settings.rLanguage.IDOT;
  } else {
    damId = $rootScope.settings.rLanguage.IDNT;
  }

  //Most ridiculous code ever. See Xmap of what the heck is going on.
  if(!settings.bible)
    settings.bible = [];
  
  //This code is to get the book listing.
  //If we already have the books (from another language or because already downloaded to phone), use that
  var book_info_downloaded = $filter('filter')(settings.bible, {id: bookCode, damId: damId})[0]; 
  message.console("Book info already downloaded? ", book_info_downloaded);
  if(!book_info_downloaded){
    //For FONTE APIs, use the different URL
    if(damId.substring(0,3)=="FDV") {
      api_url = 'http://api.fontedavida.org/bibleapi.php?damid=' + damId + '&bookid=' + bookCode;
          } else {
      api_url = 'http://dbt.io/audio/path?v=2&key=' + $rootScope.settings.dbtKey + '&dam_id=' + damId + '&book_id=' + bookCode;
    }
    message.console("API URL: ", api_url);
    $http({
      method: 'GET',
      url: api_url
    }).then(function successCallback(data){
        //Sometimes we get an error message back instead of the number of books like we want
        message.console("URL: ", api_url);

        //Unfortunately some of the APIs give a correct callback with an array of 0 if nothing was found.
        if (angular.isArray(data.data) && data.data.length ) {
          message.console("api success!", bookCode, data);
        
          angular.forEach(data.data, function(item){
            item.damId = damId; 
            item.fileFolder = "Bible/" + $rootScope.settings.rLanguage.en_language + "/" + bookCode;
            item.fileName = item.path.split("/");
            item.fileName = item.fileName[item.fileName.length -1 ];
            message.console("item.fileName: ", item.fileName);

            //If Fonte, omit rootURL
            if(damId.substring(0,3)=="FDV") {
              item.fileUrl = item.path;
            } else {
              item.fileUrl = $rootScope.settings.rootURL + item.path;
            }
            
          });
          
          $scope.api = data;
          settings.bible.push({
            id: bookCode,
            damId: damId,
            data: data.data
          });
        } else {
          //If the API returns nothing or 0, run the API according to an EN-based language we know.
          message.error("API of book returning unexpected info", data.data);
          if (!data.length && ((damId == 'NDCBSZN2DA') || (damId == 'KDNBSZN2DA') || (damId =='YAOBSMN2DA') || (damId =='SWKBSMN2DA'))) {
            message.error("http not working - using Jon's EN hack", data.length);
            $http({
              method: 'GET',
              url: 'http://dbt.io/audio/path?v=2&key=' + $rootScope.settings.dbtKey + '&dam_id=' + 'ENGESVN2DA' + '&book_id=' + bookCode
              }).then(function successCallback(engResults){
                var data = engResults.data;
                message.console("Jon EN hack data: ", data);
                var bookNum = data[0].path.substring(12, 14);
                var bookName = data[0].path.substring(20, 32);
                if (data) {
                  var zero = "0";
                  for (var i = 0 ; i < data.length ; ++i) {
                    data[i].fileFolder = damId;
                    data[i].fileName = "/B" + bookNum + "___" + zero + (i+1) + "_" + bookName + damId + ".mp3";
                    data[i].path = damId + "/B" + bookNum + "___" + zero + (i+1) + "_" + bookName + damId + ".mp3";
                    data[i].fileUrl = $rootScope.settings.rootURL + data[i].path;                
                    if (i == 8) {
                      zero="";
                    }}
                    
                    message.console("EN API returned successfully. Data: ", data);
                    var results = [];
                    results.data = data;
                    $scope.api = results;
                    message.console("results: ", results);
                    settings.bible.push({
                      id: bookCode,
                      damId: damId,
                      data: results
                    });
                }
              });
          } 
          else if (!data.length) {
            message.error("http not working - using Jon's PT hack", data.length);
            $http({
              method: 'GET',
              url: 'http://dbt.io/audio/path?v=2&key=' + $rootScope.settings.dbtKey + '&dam_id=' + 'PORNLHN2DA' + '&book_id=' + bookCode
              }).then(function successCallback(engResults){
                var data = engResults.data;
                message.console("Jon PT hack data: ", data);
                if (angular.isArray(data)) {
                  var bookNum = data[0].path.substring(12, 14);
                  var bookName = data[0].path.substring(20, 32);
                  if (data) {
                    var zero = "0";
                    for (var i = 0 ; i < data.length ; ++i) {
                      data[i].fileFolder = damId;
                      data[i].fileName = "/B" + bookNum + "___" + zero + (i+1) + "_" + bookName + damId + ".mp3";
                      data[i].path = damId + "/B" + bookNum + "___" + zero + (i+1) + "_" + bookName + damId + ".mp3";
                      data[i].fileUrl = $rootScope.settings.rootURL + data[i].path;
                      if (i == 8) {
                        zero="";
                    }

                    $scope.api = data;
                    settings.bible.push({
                      id: bookCode,
                      damId: damId,
                      data: data
                    });
                      
                    }
                  }
                } else {
                  message.error('Bible API', damId + " " + bookCode);  
                }
              });
          }
        }
        $(".waiting").hide();
    });

  } else{
    if(!$scope.api) $scope.api = [];  
    $scope.api.data =  book_info_downloaded.data;
    $(".waiting").hide();
  }//end else

  //Narrator's List if we have one
  $http.get('ajax/speakers.json').success(function(data) {
    message.console("Bible speakers.json called with success", data);
    angular.forEach(data[0], function(value, key) {
      if((key == 'dam') && (value == damId)) {
        $scope.speakers = data[0]['names'];
        message.console("$scope.speakers called: ", $scope.speakers);
      }});

  $http({
    method: 'GET',
    url: '  http://dbt.io/library/metadata?v=2&key=' + $rootScope.settings.dbtKey + '&dam_id=' + damId
  }).then(function successCallback(data){
    message.console("Bible audio copyright pull success!", data);
    $scope.copyright = data.data[0];
    message.console("$scope.copyright: ", $scope.copyright);
    if($scope.speakers != null)
      if(!$scope.speakers.length) {
        $('.bible-org-info').hide();
      }
    }, function errorCallback(error) {
      $('.bible-org-info').hide();
      message.error('Failed copyright pull info', data);  
    });

  });

  $scope.playNow = function(data){
    message.console("playNow called from BibleBookCtrl :", data);
    /* I think this is the wrong event track so I made a new one right below this. Delete this if this is true - Gideon
    if(typeof analytics !== "undefined") {
      analytics.trackEvent('Error', 'Bible API', damId + " " + bookCode);  
    };
    */
    message.gaEvent("Bible", "Play", settings.bibleBookId, $scope.bookName);
    playlistService.setClicked(data);
    //playlistService.setAudioPlayList($scope.api.data);
    var playList = [];
    if($scope.api.data!=null || $scope.api.data!=undefined){
        var $translate = $filter('translate');
        var title, subtitle = $translate('BOOK_CHAPTER');
        var filterData = $filter('filter')(playlistService.getMain(), {bookCode: data.book_id})[0]; 
        switch($rootScope.settings.lang) {
            case "en":
                title = filterData.bookEN;
                break;
            case "pt":
                title = filterData.bookPT;
                break;
            default:
                title = filterData.bookEN;
        }
       
        angular.forEach($scope.api.data, function(item){
          var itemToPush = {
            title: title,
            subtitle: subtitle +" "+item.chapter_id,
            image:'images/speakers/bible.png',
            sources: [
              { src: $sce.trustAsResourceUrl(item.fileUrlLocalPath ? item.fileUrlLocalPath:item.fileUrl), type: "audio/mpeg" },
            ]
          };
         
          playList.push(itemToPush);
        });
        playlistService.setAudioPlayList(playList);
        $rootScope.$broadcast('AUDIO_SOURCE_DATA');
      }

  };//fonteFns.playNow;


}])