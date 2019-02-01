class MusicVisualiser {

  constructor(){
    this._audioInputElement;             //The <input> which the user loads a music file with.
    this._audioPlayerElement;            //The <audio> which plays the music.
    this._soundFileURL;                  //Location of where the music file is stored.
    this._numberOfBars = 256;            //How many bars in the music visualisation.
    this._fftSize = 1024;                //The "definition" of music analysis. Higher value = more individual bars.
    this._smoothingConstant = 0.8;       //Determines how smooth the music visualiser moves (0 -> 1)
    this._paused = true;                 //Whether music is playing or not.
    this._waitingAnimation = true;       //When the music is paused a sine wave plays.
    
    this.bars = [];                      //The height of the music visualiser bars. 
    this.soundDataArray = undefined;     //The binary Uint output for WebAudioApi
    this.MAX_SOUND_VALUE = 256;          //The max value that you can get in soundDataArray
    this.updateRequests = 0;             //Used to animate the waiting animation.
    
    this.audioContext = this.getAudioContext();
    this.analyser = this.audioContext.createAnalyser();
    this.webAudioContextNotSupported = false;
  }
  
  /* --- GETTERS & SETTERS --- */
  
  set numberOfBars(numberOfBars) {
    
    try {
      if (typeof numberOfBars !== "number"){
        throw `bars.js : Number of bars should be of type number. Instead, it's ${typeof numberOfBars}`;
      } 
      
      numberOfBars = Math.ceil(numberOfBars);
      
      if (numberOfBars <= 0){ 
        throw `bars.js : The number of bars (${numberOfBars}) isn't greater than 0.`;
      }
      
      if (numberOfBars > this._fftSize/4){
        console.warn(`bars.js : Reduced the number of bars to the max possible size (${this._fftSize/4}) for the current fftSize.`);
        numberOfBars =  this._fftSize/4;
      }
      
      this._numberOfBars = numberOfBars;
      
    } catch(error){
      console.error("bars.js : Error while attempting to set number of bars.");
      console.error(error);
    }
    
    //Update the bars array with the correct size.
    this.bars = Array(this._numberOfBars).fill(0);
  }
  
  get numberOfBars(){
    return this._numberOfBars;
  }
  
  set audioPlayer(Id){
    try {
      if (typeof Id !== "string"){
        throw `bars.js : The id should be a string. Instead, it's ${typeof Id}`;
      }
      
      let elementWithId = document.getElementById(Id);
      
      if (elementWithId == undefined){
        throw `bars.js : No input elements with the id ${Id} were found.`;
      }
      
      if (elementWithId.tagName.toLowerCase() !== "audio"){
        throw `bars.js : The id is of an element which isn't <audio>, its tag is <${elementWithId.tagName.toLowerCase()}>.`;
      }
      
      this._audioPlayerElement = elementWithId;
    } catch(error){
      console.error("bars.js : Error while attempting to set audio player element.");
      console.error(error);
    }
  }
  
  get audioPlayer(){
    return this._audioPlayerElement;
  }
  
  set audioFileInput(Id){
    try {
      if (typeof Id !== "string"){
        throw `bars.js : The id should be a string. Instead, it's ${typeof Id}`;
      }
      
      let elementWithId = document.getElementById(Id);
      
      if (elementWithId == undefined){
        throw `bars.js : No input elements with the id ${Id} were found.`;
      }
      
      //https://stackoverflow.com/questions/4727919/get-selected-element-type
      if (elementWithId.tagName.toLowerCase() !== "input"){
        throw `bars.js : The id is of an element which isn't <input>, its tag is <${elementWithId.tagName.toLowerCase()}>.`;
      }
      
      if (elementWithId.getAttribute("type") !== "file"){
        throw `bars.js : The type of the input isn't file. It's ${elementWithId.getAttribute("type")}.`;
      }
      
      this._audioInputElement = elementWithId;
    } catch(error){
      console.error("bars.js : Error while attempting to set audio input element.");
      console.error(error);
    }
  }
  
  get audioFileInput(){
    this._audioInputElement;
  }
  
  set soundFileURL(soundFileURL){
    try {
      if (typeof soundFileURL !== "string"){
        throw `bars.js : The URL should be a string. Instead, it's ${typeof soundFileURL}`;
      }
      this._soundFileURL = soundFileURL;
    } catch(error) {
      console.error("bars.js : Error while attempting to set the sound file URL.");
      console.error(error);
    }
  }
  
  get soundFileURL(){
    return this._soundFileURL;
  }
  
  set fftSize(fftSize){
    let validfftSizeValues = [128, 256, 512, 1024, 2048]; //Has to be a power of 2
    
    try {
      if (typeof fftSize !== "number") {
        throw `bars.js : The fftsize should be a number, either 128, 256, 512, 1024 or 2048. Instead, it's a ${typeof fftSize}`;
      }
      
      if (validfftSizeValues.includes(fftSize) === false){
        throw `bars.js : The fftsize should be a number, either 128, 256, 512, 1024 or 2048.`;
      }
      
      if (this._numberOfBars > fftSize / 4){
        this._numberOfBars = fftSize / 4;
        console.warn(`bars.js : Reduced the number of bars to the max possible size for the current fftSize (numberOfBars now equals ${this._numberOfBars}. The largest number of bars possible is equal to the fftSize / 4.`);
      }
      
      this._fftSize = fftSize;
      
      if ((this.analyser === undefined) === false){
        this.analyser.fftSize = this._fftSize;
      }
    } catch(error) {
      console.error(`bars.js : An error occurred while trying to set the Fast Fourier Transform (fft) size.`);
      console.error(error);
    }
  }
  
  get fftSize(){
    return this._fftSize;
  }

  set smoothingConstant(smoothingConstant){
    
    try {
      if (typeof smoothingConstant !== "number") {
        throw `bars.js : The smoothing constant should be a number in the range 0 to 1. Instead, it's a ${typeof smoothingConstant}.`;
      }
      
      if (smoothingConstant < 0 || smoothingConstant > 1){
        throw `bars.js : The smoothing constant should be a number in the range 0 to 1. It is currently ${smoothingConstant}.`;
      }
      
      this._smoothingConstant = smoothingConstant;
      
      if ((this.analyser === undefined) === false){
        this.analyser.smoothingTimeConstant = this._smoothingConstant;
      }
      
    } catch (error) {
      console.error(`bars.js : An error occured while setting the smoothing constant.`);
      console.error(error);
    }
  }
  
  get smoothingConstant(){
    return this._smoothingConstant;
  }
  
  set waitingAnimation(activateWaitingAnimation){
    this._waitingAnimation = Boolean(activateWaitingAnimation);
  }
  
  get waitingAnimation(){
    return this._waitingAnimation;
  }
  
  set paused(pauseMusicVisualisation){
    if (pauseMusicVisualisation) {
      this._audioPlayerElement.pause();
      this._paused = true;
    } else {
      this._audioPlayerElement.play();
      this._paused = false;
    }
  }
  
  get paused(){
    return this._paused;
  }
    
  /* --- LOADING AND INITIALIZING --- */
  
  /**
   * Returns the Web Audio Context if it exists, else logs an error in the console
   * and sets the variable webAudioContextNotSupported to true.
   */ 
  getAudioContext(){
    try {
      return new (window.AudioContext || window.webkitAudioContext)();
    }
    catch(e) {
      console.error('bars.js : The Web Audio API is not supported in this browser.');
      this.webAudioContextNotSupported = true;
    }
  }

  /**
   * User loads a sound file from their system, which is loaded into the website. 
   * Then creates the audio objects for music visualisation and plays the music.
   */
  loadAndPlaySoundFile(){
    let audioElement = this._audioPlayerElement;
    let inputElement = this._audioInputElement;
    let reader = new FileReader(); 
    
    reader.onload = function(e) { //When we've loaded the file...
      audioElement.src = this.result; //Link up the sound element with it.
      audioElement.controls = true; //Displays default audio controls to the user.
      audioElement.play();
    };   
    
    reader.readAsDataURL(inputElement.files[0]); //Files is an array of all the files selected, we just take the first one.
    this.createAudioObjects();
  }
  
  /**
   * Loads a sound file from soundFileURL. 
   * Then creates the audio objects for music visualisation and plays the music.
   */
  playSoundFileFromURL(soundFileURL){
    let audioPlayerElement = this._audioPlayerElement;
    let fileURL = (arguments.length === 1) ? soundFileURL : this._soundFileURL;
    
    try {
      if (fileURL == undefined){
        throw "bars.js : The URL to the sound file is undefined.";
      }
      
      audioPlayerElement.src = fileURL;
      audioPlayerElement.crossOrigin = 'anonymous'; 
      audioPlayerElement.controls = true;
      audioPlayerElement.play();
      
    } catch(error) {
      console.error("bars.js : Error when attempting to play a sound file from a URL.");
      console.error(error);
    }

    this.createAudioObjects();
  }
  
  /**
   * Connects all the WebAudioAPI objects together.
   * Configures the settings of the audio analyser.
   */
  createAudioObjects(){
    let audioElement = this._audioPlayerElement;
    
    let context = this.audioContext;
    let analyser = this.analyser;
    let source = context.createMediaElementSource(audioElement);
    
    source.connect(analyser);
    
    analyser.fftSize = this._fftSize; 
    analyser.smoothingTimeConstant = this._smoothingConstant;
    analyser.connect(context.destination); 
    
    let bufferLength = analyser.frequencyBinCount;
    this.soundDataArray = new Uint8Array(bufferLength);
    
    this._paused = false;
  }
  
  /* --- GETTING DATA FROM THE SOUND DATA ARRAY --- */
  
  /**
   * Returns the average of a small sample of the soundDataArray.
   * Index declares which sample you want, the numSampleSections is
   * how many sections you've split the array up into.
   */
  getSampleOfSoundData(index, numSampleSections){
    let sampleSize = Math.floor((this.soundDataArray.length/2) / numSampleSections); 

    let minBound = index * sampleSize; 
    let maxBound = (index + 1) * sampleSize;
    let sum = 0;

    for (let i = minBound; i < maxBound; i++){
      sum += this.soundDataArray[i];
    }
    
    let average = sum / sampleSize;

    return average / this.MAX_SOUND_VALUE;
  }
  
  /**
   * Returns the overall amplitude of the soundDataArray.
   * The result is normalized between 0 and 1, where 0 is min, 1 is max.
   */
  getAmplitude(){
    if((this.soundDataArray === undefined) === false){
      let sum = 0;
      
      for (let i = 0; i < this.soundDataArray.length; i++){
        sum += this.soundDataArray[i];
      }
      
      let average = sum / this.soundDataArray.length;
      
      return average / this.MAX_SOUND_VALUE; //Reduces result to between 0 and 1.
    } else {
      return 0;
    }
  }
  
  /* Returns the average of the lowest 12th of the soundDataArray. */
  getBass() {
    if((this.soundDataArray === undefined) === false){
      return this.getSampleOfSoundData(0,12); 
    } else {
      return 0;
    }
  }
  
  /* Returns the middle third of the soundDataArray. */
  getMidrange() {
    if((this.soundDataArray === undefined) === false){
      return this.getSampleOfSoundData(1,3);
    } else {
      return 0;
    }
  }
  
  /* Returns the upper third of the soundDataArray. */
  getTreble() {
    if((this.soundDataArray === undefined) === false){
      return this.getSampleOfSoundData(2,3);
    } else {
      return 0;
    }
  }
  
  /* --- UPDATE THE SOUND DATA AND BAR ARRAYS --- */
  
  /**
   * Gets the latest frequency data into the soundDataArray.
   * Calls updateBars to update the contents of the bars array.
   * Updates whether the music visualiser is paused, 
   * if the user has manually paused using the audio element control UI.
   */
  updateVisualiser(){
    if((this.soundDataArray === undefined) === false){
      this.analyser.getByteFrequencyData(this.soundDataArray);
    }
    
    this.updateBarHeights();
    
    this.updateRequests++;

    if (this._audioPlayerElement != undefined){
      this._paused = this._audioPlayerElement.paused;
    }
  }
  
  /**
   * Takes the frequency data from the soundDataArray and processes it into bars.
   * If the music is paused and waitingAnimation is true, bars is updated accordingly.
   */ 
  updateBarHeights(){
    let soundLevel = 0;
    
    for (let i = 0; i < this._numberOfBars; i++){
      if((this.soundDataArray === undefined) === false){
        
        soundLevel = this.getSampleOfSoundData(i, this._numberOfBars); 
        
        this.bars[i] = soundLevel;
      } else {
        this.bars[i] = 0;
      }
      
      if (this._paused === true && this._waitingAnimation === true){
        this.bars[i] = 0.5 + Math.sin((this.updateRequests+i*4*Math.PI)/this._numberOfBars)/4;
      }
    }
  }
}
