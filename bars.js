//This work is licensed under the Creative Commons Attribution 4.0 International License. To view a copy of this license, visit http://creativecommons.org/licenses/by/4.0/ or send a letter to Creative Commons, PO Box 1866, Mountain View, CA 94042, USA.

function MusicVisualiser(numberOfBars, soundElementName){
  this.barHeights = [];
  this.updateRequests = 0;
  this.history = 0;
  this.beat = false;
  this.beatThreshold = 0.4;
  this.mediaURL = "";
  this.audioFileInputName = "";
  this.soundElementName = soundElementName;
  this.waiting = true;
  this.waitingAnimation = true;
  this.fftSize = 1024;
  this.smoothingConstant = 0.8;
  this.soundDataArray = undefined;
  this.MAX_SOUND_VALUE = 256; 
  
  this.checkNumSamplesAndFFTSize = function(){
    if (numberOfBars < this.fftSize/4){
      return numberOfBars;
    } else {
      console.warn("EMV Warning : Reduced the number of bars to the max possible size for the current fftSize.");
      return this.fftSize/4;
    }
  };
  
  this.numberOfBars = this.checkNumSamplesAndFFTSize();
  
  this.checkContextIsAvailible = function(){
    try {
      return new (window.AudioContext || window.webkitAudioContext)();
    }
    catch(e) {
      alert('Web Audio API is not supported in this browser');
    }
  }
  this.context = this.checkContextIsAvailible();
  this.analyser = this.context.createAnalyser();

  //Loads a sound file from the users system, using a FileReader. Starts playing the music, and calls createAudioObjects.
  this.loadUserSelectedSoundFile = function(){
    let sound = document.getElementById(this.soundElementName);
    let reader = new FileReader(); 
    reader.onload = function(e) { 
      sound.src = this.result;
      sound.controls = true; 
      sound.play();
    };   
    reader.readAsDataURL(document.getElementById(this.audioFileInputName).files[0]);
    this.createAudioObjects();
  };
  
  //Loads a sound file from the prespecified URL of the audio file (stored in this.mediaURL). Starts playing the music, and calls createAudioObjects.
  this.loadDefaultSoundFile = function(){
    let mediaUrl = this.mediaURL; 
    let sound = document.getElementById(this.soundElementName);
    sound.crossOrigin = 'anonymous'; 
    sound.src = mediaUrl;
    sound.controls = true;
    sound.play();
    this.createAudioObjects();
  };
  
  //Connects all the WebAudioAPI objects together, and sets the settings of the analyser object.
  this.createAudioObjects = function(){
    let source = this.context.createMediaElementSource(document.getElementById(this.soundElementName));
    source.connect(this.analyser);
    this.analyser.connect(this.context.destination); 
    this.analyser.fftSize = this.fftSize; 
    this.analyser.smoothingTimeConstant = this.smoothingConstant;
    let bufferLength = this.analyser.frequencyBinCount;
    this.soundDataArray = new Uint8Array(bufferLength);
    this.waiting = false;
  };
  
  /* --- GET DATA FROM THE SOUND DATA ARRAY --- */
  //Returns the average of a small sample of the array. Index declares which sample you want, ideal for iteration.
  this.getSampleOfSoundData = function(index, noSampleSections){
    let sampleSize = Math.floor((this.soundDataArray.length/2) / noSampleSections); 

    let minBound = index * sampleSize; 
    let maxBound = (index + 1) * sampleSize;
    let sum = 0;

    for (let i = minBound; i < maxBound; i++){
      sum += this.soundDataArray[i];
    }
    let average = sum / sampleSize;

    return average / this.MAX_SOUND_VALUE;
  };
  
  //Returns the overall average sound of the soundDataArray, normalized between 0 and 1;
  this.getAverageOfDataArray = function(){
    if((this.soundDataArray === undefined) === false){
      let sum = 0;
      for (let i = 0; i < this.soundDataArray.length; i++){
        sum += this.soundDataArray[i];
      }
      let average = sum / this.soundDataArray.length;
      return average / this.MAX_SOUND_VALUE; 
    } else {
      return 0;
    }
  };
  
  //Returns the average of the lowest 12th of the soundDataArray
  this.getBass = function() {
    if((this.soundDataArray === undefined) === false){
      return this.getSampleOfSoundData(0,12); 
    } else {
      return 0;
    }
  };
  
  //Returns the middle third of the soundDataArray
  this.getMidrange = function() {
    if((this.soundDataArray === undefined) === false){
      return this.getSampleOfSoundData(1,3);
    } else {
      return 0;
    }
  };
  
  //Returns the upper third of the soundDataArray
  this.getTreble = function() {
    if((this.soundDataArray === undefined) === false){
      return this.getSampleOfSoundData(2,3);
    } else {
      return 0;
    }
  };
  
  /* --- UPDATE THE SOUND DATA AND BAR ARRAYS --- */
  //Gets the latest frequency data into the soundDataArray and calls updateBars();
  this.updateFrequencyData = function(){
    this.updateRequests += 1;
    //Be careful with trying to access an undefined array before music starts playing.
    if((this.soundDataArray === undefined) === false){
      this.analyser.getByteFrequencyData(this.soundDataArray);
    }
    
    this.updateBeatDetection();
    this.updateBarHeights();
    
    if(document.getElementById(this.soundElementName).paused){
      this.waiting = true;
    } else {
      this.waiting = false;
    }
  };
  
  //Takes the data from soundDataArray and processes it into the bars array.
  this.updateBarHeights = function(){
    let soundLevel = 0;
    for (let i = 0; i < this.numberOfBars; i++){
      if((this.soundDataArray === undefined) === false){
        soundLevel = this.getSampleOfSoundData(i, this.numberOfBars); 
        this.barHeights[i] = soundLevel;
      } else {
        this.barHeights[i] = 0;
      }
      if (this.waiting === true && this.waitingAnimation === true){
        this.barHeights[i] = 0.5 + Math.sin((this.updateRequests+i*4*Math.PI)/this.numberOfBars)/4;
      }
    }
  };
  
  this.updateBeatDetection = function(){
    //Check that the difference of average and function and history is greater than some specified value.
    let currentVolume = this.getAverageOfDataArray();
    if (currentVolume - this.history > this.beatThreshold/10){
      this.beat = true;
    } else {
      this.beat = false;
    }
    //Update the history to the new average.
    this.history = currentVolume;
  }
  
  /* --- SET THE MUSIC VIS OPTIONS --- */
  //Updates the size of the bars array.
  this.setNumberOfBars = function(numBars) {
    numBars = Math.ceil(numBars);
    if (numBars > 0){
      this.numberOfBars = numBars;
    } else {
      throw new Error("EMV - The number of bars must be greater than 0");
    }
    
    if (this.numberOfBars > this.fftSize / 4){
      this.numberOfBars = this.fftSize / 4;
      console.warn("EMV Warning : Reduced the number of bars to the max possible size for the current fftSize. (numberOfBars now equals " + this.numberOfBars + ")");
    }
    
    this.bars = Array(numBars).fill(0);
  };
  
  //Updates the ID of what input element will be used to load the sound file.
  this.setAudioFileInputElementID = function(audioFileInputName){
    this.audioFileInputName = audioFileInputName;
  };
  
  //Updates what audio file will be loaded by default, according to the URL of the file.
  this.setAudioFileURL = function(audioFileURL){
    this.mediaURL = audioFileURL;
  };
  
  this.setBeatThreshold = function(threshold){
    //Error catching is off work today.
    this.beatThreshold = threshold;
  }
  
  //Sets the fftSize (A power of 2) and verfies numberOfSamples is ok.
  this.setFFTSize = function(fftSize){
    let validfftSizeValues = [128, 256, 512, 1024, 2048];
    if (validfftSizeValues.includes(fftSize)){
      
      if (this.numberOfBars > fftSize / 4){
        this.numberOfBars = fftSize / 4;
        console.warn("EMV Warning : Reduced the number of bars to the max possible size for the current fftSize. (numberOfBars now equals " + this.numberOfBars + ")");
      }
      
      this.fftSize = fftSize;
      if ((this.analyser === undefined) === false){
         this.analyser.fftSize = this.fftSize;
      }
    } else {
      throw new Error("EMV - Valid fftSize values are 128, 256, 512, 1024, 2048. No change has been made to the original fftSize, " + this.fftSize);
    }
  };
  
  //Sets the smoothing factor of the analyser, checks that it is between 0 and 1.
  this.setSmoothingTimeConstant = function(smoothingConstant){
    if (smoothingConstant >= 0 && smoothingConstant <= 1){
      this.smoothingConstant = smoothingConstant;
      if ((this.analyser === undefined) === false){
        this.analyser.smoothingTimeConstant = this.smoothingConstant;
      }
    }
    else
      throw new Error("EMV - The smoothing constant should be a double between 0 and 1. No change has been made to the original smoothing constant, " +this.smoothingConstant);
  };
  
  this.pause = function(){
    document.getElementById(this.soundElementName).pause();
    this.waiting = true;
  }
  
  this.play = function(){
    document.getElementById(this.soundElementName).play();
    this.waiting = false;
  }
}
