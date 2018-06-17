# An Effortless Music Visualiser Javascript Library

The key idea behind this library is that you can simply iterate through the `barHeights` array, a property of your created `MusicVisualiser` object, and this contains the heights of conventional music visualiser bars. No messing with mathematics, just specify the audio element, load the file into it, and start animating.

## Example Use of the Music Visualiser

```js
let mV = new MusicVisualiser(100,"soundElement"); //Specify the number of bars you want and the audio element id.

mV.setAudioFileInputElementID("audioInput");      //Specify the input id with which the user loads their sound file.

audioInput.onchange = function() {                //When the user chooses a sound file,
  mV.loadUserSelectedSoundFile();                 //process it, and begin playing it.
};

function animate() {
  mV.updateFrequencyData();                       //Update the bar heights for the current frame.
  for (let i = 0; i < mV.numberOfBars; i++){      //For each bar in the music visualisation,
    displayBar(i, mV.barHeights[i]);              //Draw that bar to the screen by some function.
  }
  animate();
}
```
A further example, which includes drawing the bars to the screen, can be found in the examples folder under P5JS. This example can be seen on codepen [here](https://codepen.io/jhancock532/pen/qKVayb). 

# Walkthrough
You should be able to use the library to do something like this, click on the picture to see the video in action.

[![Watch the video](https://img.youtube.com/vi/QBXrhgg9s0c/0.jpg)](https://www.youtube.com/watch?v=QBXrhgg9s0c)

To get started, add the javascript file `music-visualiser.js` to your project. Using codepen as an unoffical CDN, you can also use `<script src="https://codepen.io/jhancock532/pen/aKVmvr"></script>`.

## HTML to use with the Music Visualiser
Within your HTML, you will need an `audio` element, and if you want the user to be able to select their own audio file, an `input` element.
```html
<audio controls id="soundElement"></audio>

<label for="audioInput" id="audioInputLabel">Load a sound file from your computer.</label>
<input type="file" id="audioInput"/>
```
Where including `controls` allows the user to control how the music plays (pause/play and volume).


## Creating the Music Visualiser
To create the music visualiser object
```js
let mV = new MusicVisualiser(100,"soundElement");
//The first arguement is the number of bars for the resulting visualiser (This is the size of the bars array).
//The second arguement is the id of the audio element that will playing the music you want to visualise.
```


## Loading and Playing Audio
If the user is loading a music file from their system, specify which input element will load your sound file with
```js
mV.setAudioFileInputElementID("audioInput");
```
Or provide a URL to the sound file you want to load.
```js
mV.setAudioFileURL("https://s3-us-west-2.amazonaws.com/s.cdpn.io/9473/ivan-ibarra_-_cultos-personales.ogg");
```
When the user selects a file, the following function will start playing the sound file automatically.
```js
//Whenever the user selects a sound file from the audio input element (with id of audioInput).
audioInput.onchange = function() { 
  //This function will set up the music visualiser, and start playing the user's selected sound file.
  mV.loadUserSelectedSoundFile();
};
```
Or whenever you want to start playing your own sound file, call the below function.
```js
function loadDefaultSoundFile() {
  //This function will set up the music visualiser, and start playing the sound file specified by the audio file URL.
  mV.loadDefaultSoundFile();
}
```

## Controlling the Music Visualiser
```js
//Control how smooth your visualisation moves through this function, between 0 and 1.
mV.setSmoothingTimeConstant(0.8);
//Set the size of the bars array.
mV.setNumberOfBars(200);
```
More to come.
