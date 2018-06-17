# Effortless Music Visualiser

To get started, add the javascript file `music-visualiser.js` to your project. Using codepen as an unoffical CDN, you can also use `<script src="https://codepen.io/jhancock532/pen/aKVmvr"></script>`.

### HTML to use with the Music Visualiser
Within your HTML, you will need an `audio` element, and if you want the user to be able to select their own audio file, an `input` element.
```html
<audio controls id="soundElement"></audio>

<label for="audioInput" id="audioInputLabel">Load a sound file from your computer. </label>
<input type="file" id="audioInput"/>
```

### Creating the Music Visualiser
Where including `controls` allows the user to control how the music plays (pause/play and volume).
Onto the javascript, to create the music visualiser object, start with
```js
let mV = new MusicVisualiser(100,"soundElement");
//The first arguement is the number of bars for the resulting visualiser (This is the size of the bars array).
//The second arguement is the id of the audio element that will playing the music you want to visualise.
```

### Loading audio
```js
//You can specify the input element to load the sound file.
mV.setAudioFileInputElementID("audioInput");
//Or you can provide a URL to a sound file you want to load.
mV.setAudioFileURL("https://s3-us-west-2.amazonaws.com/s.cdpn.io/9473/ivan-ibarra_-_cultos-personales.ogg");

//Control how smooth your visualisation moves through this function, between 0 and 1.
mV.setSmoothingTimeConstant(0.8);

mV.setNumberOfBars(200);
```
