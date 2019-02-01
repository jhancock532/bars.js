# bars.js

A lightweight JavaScript library which handles all the audio processing for a web music visualiser.

It's called `bars.js` as the library converts audio into its frequency spectrum representation: This frequency spectrum representation is sampled at even intervals, which is displayed as bars in many music visualisers.

The `MusicVisualiser` object has a property called `bars` - this is an array of bar heights, which is the primary data source for creating a music visualisation. 

**Full documentation of the library can be found on the [wiki](https://github.com/jhancock532/bars.js/wiki) for this GitHub repository.**

It includes the following sections:

* [Best Practice](https://github.com/jhancock532/bars.js/wiki/Best-Practice)
* [Control How the Audio is Processed](https://github.com/jhancock532/bars.js/wiki/Control-How-the-Audio-is-Processed)
* [Getting Data from the Music Visualiser](https://github.com/jhancock532/bars.js/wiki/Getting-Data-from-the-Music-Visualiser)
* [Letting the User Upload Their Own Sound File](https://github.com/jhancock532/bars.js/wiki/Letting-the-User-Upload-Their-Own-Sound-File)
* [Pause and Play the Audio](https://github.com/jhancock532/bars.js/wiki/Pause-and-Play-the-Audio)
* [Setting the Audio Element, File Input Element and Audio URL](https://github.com/jhancock532/bars.js/wiki/Setting-the-Audio-Element%2C-File-Input-Element-and-Audio-URL)

## Example Use of bars.js
HTML 
```html
<audio controls id="audioElementId"></audio>
```
JavaScript
```js
let mV = new MusicVisualiser();

mV.audioPlayer = "audioElementId"; // Specifying where the audio is coming from.
mV.soundFileURL = "music.ogg";
mV.numberOfBars = 128;

function playSoundFile() {
  mV.playSoundFileFromURL();
}

// Any function that is called every frame.
function animate() { 
  mV.updateVisualiser(); // Updates the contents of the bars array.
  
  for (let i = 0; i < mV.bars.length; i++) {
    drawBar(i, mV.bars[i], mV.bars.length); // The bars are drawn to the screen.           
  }
}
```

A live demo with interactive code can be found on [CodePen](https://codepen.io/jhancock532/pen/PVZoWO).
