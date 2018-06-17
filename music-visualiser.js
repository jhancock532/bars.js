function MusicVisualiser(numberOfBars, soundElementName){
  this.bars = [];
  this.mediaURL = "";
  this.soundElementName = soundElementName;
  this.numberOfBars = numberOfBars;
  this.audioFileInputName = "";
  
  this.context = new (window.AudioContext || window.webkitAudioContext)();
  this.analyser = this.context.createAnalyser();
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
    this.analyser.fftSize = 1024; //128, 256, 512, 1024 and 2048 are valid values.
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
  
  this.updateFrequencyData = function(){
    //Be careful with trying to access an undefined array before music starts playing.
    if((this.soundDataArray === undefined) == false){
      this.analyser.getByteFrequencyData(this.soundDataArray);
    }
    
    this.updateBars();
  }
  
  this.setNumberOfBars = function(numBars) {
    this.numberOfBars = numBars;
    this.bars = Array(numBars).fill(0);
  }
  
  this.setAudioFileInputElementID = function(audioFileInputName){
    this.audioFileInputName = audioFileInputName;
  }
  
  this.setAudioFileURL = function(audioFileURL){
    this.mediaURL = audioFileURL;
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
}
