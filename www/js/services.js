
var services = angular.module('services',[]);

services.service( 'HardwareBackButtonManager', function($ionicPlatform){
  this.deregister = undefined;

  this.disable = function(){
    this.deregister = $ionicPlatform.registerBackButtonAction(function(e){
  e.preventDefault();
  return false;
    }, 101);
  }

  this.enable = function(){
    if( this.deregister !== undefined ){
      this.deregister();
      this.deregister = undefined;
    }
  }
  return this;
})



services.service('gameService', ['$http','$ionicPopup','$state', function($http, $ionicPopup, $state){

  this.game = {};
  this.game.alphabet =  ['A','Ą','B','C','Č','D','E','Ę','Ė','F','G','H','I','Į','Y','J','K','L','M','N','O','P','R','S','Š','T','U','Ų','Ū','V','Z','Ž'];
  this.game.word = { visible:'',hidden:[]};
  this.game.category = {};
  this.game.statistics = { mistakes:0, correct:0, points:0 };
  this.game.hangman = { animations:[true, true, true, true, true, true, true] };


  this.loadCategoryList = function(){

    return $http.get('data/categories.json').then(function successCallback(response){
      return response.data;
    });
  }

  this.loadCategory = function(category_id){

    return $http.get("data/"+category_id+".json").then(function successCallback(response){
      return response.data;
    });
  }

  this.initGame = function(categoryObject){
    this.game.category = categoryObject;
    this.getRandomWord();

    return this.game;
  }

  this.getRandomWord = function(){
    this.game.word.visible = this.game.category.wordlist[Math.floor(Math.random() * this.game.category.wordlist.length)];

    for (var i = 0; i < this.game.word.visible.length; i++){
      this.game.word.hidden.push({letter:'_', answered :false});
    }
  }

  this.checkLetter = function(index){

    var guessedLetter = this.game.alphabet[index];
    this.game.alphabet.splice(index, 1);
    this.game.statistics.mistake = true;

    for (var i = this.game.word.visible.length - 1; i >= 0; i--){
      if(this.game.word.visible[i] == guessedLetter){

          this.game.word.hidden[i] = { letter : guessedLetter, answered : true };
          this.game.statistics.mistake = false;
          this.game.statistics.correct++;
        }
    }
  }

  this.hasMistake = function(){

    if(this.game.statistics.mistake == true){
      this.game.statistics.mistakes++;

      return true;
    }
    else{
      this.game.statistics.points = this.game.statistics.points + 5;
    }
    return false;
  }

  this.drawHangman = function(){
    var vivus = new Vivus("svg_"+this.game.statistics.mistakes.toString(), { type: 'delayed', duration: 50});

    this.game.hangman.animations[this.game.statistics.mistakes - 1] = false;
  }

  this.gameIsLost = function(){
    
    if(this.game.statistics.mistakes >= 7){
      return true;
    }

    return false;
  }

  this.gameLostPopUp = function(){

    var gameLostPopUp = $ionicPopup.show({        
              title:'<h4>Žaidimas baigtas !</h4>',
              subTitle:'<h6>Surinkti taškai - <b>'+this.game.statistics.points+'</b></h6>',
              template:'<center><h4>'+this.game.word.visible+'</h4></center>',
              buttons:[
                {
                  text:'Pradėti iš naujo',
                  type:'button-positive button-outline',
                  onTap: function(){
                    $state.go('home');
                  }
                }
              ]});

    return this.restartGame();
  }

  this.wordIsCompleted = function(){

    if(this.game.word.visible.length == this.game.statistics.correct){
      return true;
    }

    return false;
  }

  this.wordCompletedPopUp = function(){


    var completedPopUp = $ionicPopup.show(
            {
              title:'Teisingas atsakymas !',
              subTitle:'Turimi taškai - <b>'+this.game.statistics.points+'</b>',
              template:'<center><h4>'+this.game.word.visible+'</h4></center>',
              buttons:[
                {
                  text:'Tęsti',
                  type:'button-positive button-outline',
                  onTap: function(e) {
                   return true;
                   //$state.go($state.current, {category_id : 1}, {reload: true});
                  }
                },
                {
                  text:'Užbaigti',
                  type:'button-energized button-outline',
                  onTap: function(e) {
                    $state.go('home');
                  }
                }

              ]
            });
  }

  this.restartGame = function(){
      this.game = {};
      this.game.alphabet =  ['A','Ą','B','C','Č','D','E','Ę','Ė','F','G','H','I','Į','Y','J','K','L','M','N','O','P','R','S','Š','T','U','Ų','Ū','V','Z','Ž'];
      this.game.word = { visible:'',hidden:[]};
      this.game.category = {};
      this.game.statistics = { mistakes:0, correct:0, points:0 };
      this.game.hangman = { animations:[true, true, true, true, true, true, true] };
  }



}])