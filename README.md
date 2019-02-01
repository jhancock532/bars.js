# bars.js

A lightweight JavaScript library which handles all the audio processing for a web music visualiser.

It's called `bars.js` as the library converts audio into its frequency spectrum representation: This frequency spectrum representation is sampled at even intervals, which is then displayed as bars in many music visualisers.

The `MusicVisualiser` object has a property called `bars` - this is an array of bar heights, which is used as a source to create music visualisation. 

## Example Use

```html
<audio controls id="audioElementId"></audio>
```

```js
let mV = new MusicVisualiser();

mV.audioPlayer = "audioElementId"; // Specifying where the audio is coming from.
mV.soundFileURL = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/9473/ivan-ibarra_-_cultos-personales.ogg";
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
