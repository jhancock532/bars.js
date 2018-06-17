function MusicVisualiser(numberOfBars, soundElementName){
  this.bars = [];
  this.mediaURL = "";
  this.audioFileInputName = "";
  this.soundElementName = soundElementName;
  this.fftSize = 1024;
  this.warnNumSamplesAndFFTSizeAreInappropriate = function(fallthrough){
    console.warn("EMV Warning : Reduced the number of bars to the max possible size for the current fftSize. (numberOfBars now equals "+fallthrough + ")");
    return fallthrough;
  }
  this.numberOfBars = (numberOfBars < this.fftSize/4) ? numberOfBars : this.warnNumSamplesAndFFTSizeAreInappropriate(this.fftSize/4);
  
  this.context = new (window.AudioContext || window.webkitAudioContext)();
  this.analyser = this.context.createAnalyser();
  
  this.smoothingConstant = 0.8;
  this.soundDataArray;
  this.MAX_SOUND_VALUE = 256; 
  

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
  }
  
  this.loadDefaultSoundFile = function(){
    let mediaUrl = this.mediaURL; 
    let sound = document.getElementById(this.soundElementName);
    sound.crossOrigin = 'anonymous'; 
    sound.src = mediaUrl;
    sound.controls = true;
    sound.play();
    this.createAudioObjects();
  }
  
  this.createAudioObjects = function(){
    let source = this.context.createMediaElementSource(document.getElementById(this.soundElementName));
    source.connect(this.analyser);
    this.analyser.connect(this.context.destination); 
    this.analyser.fftSize = this.fftSize; 
    this.analyser.smoothingTimeConstant = this.smoothingConstant;
    let bufferLength = this.analyser.frequencyBinCount;
    this.soundDataArray = new Uint8Array(bufferLength);
  }
  
  //Returns the average of a small sample of the array. Index declares which sample you want, ideal for iteration.
  //How to use this function is best described through example - see how I use it in the p5js code below.
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
  }
  
  //Returns the overall average sound of the soundDataArray, normalized between 0 and 1;
  this.getAverageOfDataArray = function(){
    if((this.soundDataArray === undefined) == false){
      let sum = 0;
      for (let i = 0; i < this.soundDataArray.length; i++){
        sum += this.soundDataArray[i];
      }
      let average = sum / this.soundDataArray.length;
      return average / this.MAX_SOUND_VALUE; 
    } else {
      return 0;
    }
  }
  
  this.updateFrequencyData = function(){
    //Be careful with trying to access an undefined array before music starts playing.
    if((this.soundDataArray === undefined) == false){
      this.analyser.getByteFrequencyData(this.soundDataArray);
    }
    
    this.updateBars();
  }
  
  this.updateBars = function(){
    let soundLevel = 0;
    for (let i = 0; i < this.numberOfBars; i++){
      if((mV.soundDataArray === undefined) == false){
        soundLevel = mV.getSampleOfSoundData(i, this.numberOfBars); 
        this.bars[i] = soundLevel;
      } else {
        this.bars[i] = 0;
      }
    }
  }
  
  this.setNumberOfBars = function(numBars) {
    if (numBars > 0){
      this.numberOfBars = numBars;
    } else {
      throw new Error("EMV - The number of bars must be greater than 0");
      return null;
    }
    
    if (this.numberOfBars > this.fftSize / 4){
      this.numberOfBars = this.fftSize / 4;
      console.warn("EMV Warning : Reduced the number of bars to the max possible size for the current fftSize. (numberOfBars now equals " + this.numberOfBars + ")");
    }
    
    this.bars = Array(numBars).fill(0);
  }
  
  this.setAudioFileInputElementID = function(audioFileInputName){
    this.audioFileInputName = audioFileInputName;
  }
  
  this.setAudioFileURL = function(audioFileURL){
    this.mediaURL = audioFileURL;
  }
  
  this.setFFTSize = function(fftSize){
    let validfftSizeValues = [128, 256, 512, 1024, 2048];
    if (validfftSizeValues.includes(fftSize)){
      
      if (this.numberOfBars > fftSize / 4){
        this.numberOfBars = fftSize / 4;
        console.warn("EMV Warning : Reduced the number of bars to the max possible size for the current fftSize. (numberOfBars now equals " + this.numberOfBars + ")");
      }
      
      this.fftSize = fftSize;
      if ((this.analyser === undefined) == false){
         this.analyser.fftSize = this.fftSize;
      }
    } else {
      throw new Error("EMV - Valid fftSize values are 128, 256, 512, 1024, 2048. No change has been made to the original fftSize, " + this.fftSize);
    }

  }
  
  this.setSmoothingTimeConstant = function(smoothingConstant){
    if (smoothingConstant >= 0 && smoothingConstant <= 1){
      this.smoothingConstant = smoothingConstant;
      if ((this.analyser === undefined) == false){
        this.analyser.smoothingTimeConstant = this.smoothingConstant;
      }
    }
    else
      throw new Error("EMV - The smoothing constant should be a double between 0 and 1. No change has been made to the original smoothing constant, " +this.smoothingConstant);
  }
}
