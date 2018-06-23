# Properties you should access

* `barHeights` - The height of the music visualiser bars. Double between 0 and 1.
* `beat` - States whether the current frame is identified as a beat or not. Boolean.

# Functions to Load and Play Music

`loadUserSelectedSoundFile()` - The user loads a sound file from their computer, and it begins playing. 
Warning! Requires having specified an audio input element, using
`setAudioFileInputElementID()` - Updates the ID of what input element will be used to load the users sound file.

*For example*
```js
mV.setAudioFileInputElementID("audioInput");
audioInput.onchange = function() { 
  mV.loadUserSelectedSoundFile();
};
```

`loadDefaultSoundFile()` - Load a sound file from a predetermined URL, set with
`setAudioFileURL()` - Be careful of cross origin requests if you are not hosting the file on your own server. (Nightmare)

*For example*
```js
mV.setAudioFileURL("https://s3-us-west-2.amazonaws.com/s.cdpn.io/9473/ivan-ibarra_-_cultos-personales.ogg");
function loadDefaultSoundFile() {
  mV.loadDefaultSoundFile();
}
```

`pause()`
`play()`

# Functions to Access Sound Data

`getAverageOfDataArray()` - Returns the average volume of the track. Double, from min of 0.0 to max of 1.0.
`getBass()` - Returns average volume of bass frequencies. Double, from min of 0.0 to max of 1.0.
`getMidrange()` - Returns average volume of midrange frequencies. Double, from min of 0.0 to max of 1.0.
`getTreble()` - Returns average volume of treble frequencies. Double, from min of 0.0 to max of 1.0.

`getSampleOfSoundData(index, noSampleSections)` - Returns the average of a small sample of the array. Double, from min of 0.0 to max of 1.0.
 Imagine the array sliced into equally sized noSampleSections. The index declares which sample you want, ideal for iteration.
 
 # Function to Update Sound Data
 
 `updateFrequencyData()` - Updates the contents of `barHeights` for the current frame.
 
 # Functions to Change Processing of Sound Data
 
 `setNumberOfBars(numBars)` - Updates the length of `barHeights` to the number of bars desired. > 0
 `setBeatThreshold(threshold)` - The larger this value, the less likely a beat is to be registered. 0.0 -> 1.0 (recommended)
 `setFFTSize(fftSize)` - Please set it to one of these values [128, 256, 512, 1024, 2048]
 `setSmoothingTimeConstant(smoothingConstant) - Determines how smooth the bar heights change. 0.0 -> 1.0 (strict!)
 
 
 
 
 
 
