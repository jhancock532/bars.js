//Specify the number of bars you want, and what audio element id you wish to analyse.
let mV = new MusicVisualiser(50,"soundElement");

//You can specify the input element to load the sound file.
mV.setAudioFileInputElementID("audioInput");
//Or you can provide a URL to a sound file you want to load.
mV.setAudioFileURL("https://s3-us-west-2.amazonaws.com/s.cdpn.io/9473/ivan-ibarra_-_cultos-personales.ogg");

//Whenever the user selects a sound file from the audio input element (with id of audioInput).
audioInput.onchange = function() { 
  //This function will set up the music visualiser, and start playing the user's selected sound file.
  mV.loadUserSelectedSoundFile();
};

function loadDefaultSoundFile() {
  //This function will set up the music visualiser, and start playing the sound file specified by the audio file URL.
  mV.loadDefaultSoundFile();
}

//Here I am using p5js as an example of how this music visualiser object can be used.
function setup(){
  createCanvas(windowWidth, windowHeight);
  fill("#ff0000");
}

function draw(){
  background(0);
  //For each frame drawn, the music frequency data is updated (this updates the bars array).
  mV.updateFrequencyData();
  //You can then iterate through each frequency bar and display it however you like.
  //Note that the bars are normalised between 0 and 1, and hence need scaled up for display. (*200 in this case)
  for (let i = 0; i < mV.numberOfBars; i++){
    rect(300 + i*10, 200, 10,-mV.bars[i]*200);
  }
}
