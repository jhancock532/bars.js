
// Variables which the user can edit via dat.GUI
let springs = new function() {
  this.numSamples = 65;
  this.nodesPerLine = 150;
  this.springHeight = 14;
  this.springPhase = 13;
}

let spiral = new function() {
  this.inOutScale = 1.8;
  this.phase = 5.7;
}

let segments = {
  segBrightness: 34,
  segBaseRadius: 40
}

let visualiser = {
  smoothing: 0.8
}

let gui = new dat.GUI();
//{load: presetJSON,preset: 'Default'}

gui.remember(springs);
gui.remember(spiral);
gui.remember(segments);
gui.remember(visualiser);

//Creating the folder structure to display all the GUI elements.
let f1 = gui.addFolder('Springs');
let numSamplesController = f1.add(springs,'numSamples',0,256).name("Number");
let nodesPerLineController = f1.add(springs,'nodesPerLine',1,300).name("Smoothness");
f1.add(springs,'springPhase',0.1,100).name("Springiness");
f1.add(springs,'springHeight',1,100).name("Height");

let f2 = gui.addFolder('Spiral');
f2.add(spiral,'inOutScale',0.1,10).name("Move In/Out");
f2.add(spiral,'phase',1,50).name("Phase");

let f3 = gui.addFolder('Segments');
let segBrightnessController = f3.add(segments,'segBrightness',0,100).name("Brightness");
let segBaseRadiusController = f3.add(segments,'segBaseRadius',0,100).name("Radius");

let f4 = gui.addFolder('Movement');
let smoothingController = f4.add(visualiser,'smoothing',0,1).name("Smoothing");


//Declaring the controllers which trigger reset of the visualisers arrays.
numSamplesController.onChange(function(val) {
  resetArrays();
});
nodesPerLineController.onChange(function(val) {
  resetArrays();
});
segBrightnessController.onChange(function(val) {
  resetArrays();
});
segBaseRadiusController.onChange(function(val) {
  resetArrays();
});
//Declaring the controllers which trigger reset of the visualisers arrays.
numSamplesController.onChange(function(val) {
  resetArrays();
});
nodesPerLineController.onChange(function(val) {
  resetArrays();
});

smoothingController.onChange(function(val) {
  mV.setSmoothingTimeConstant(val);
});


let mV = new MusicVisualiser(65,"soundElement");

mV.setAudioFileURL("https://s3-us-west-2.amazonaws.com/s.cdpn.io/9473/ivan-ibarra_-_cultos-personales.ogg");
mV.setAudioFileInputElementID("audioInput");

mV.setSmoothingTimeConstant(0.8);
//mV.setNumberOfBars(100);
//mV.setBeatThreshold(0.3);
//mV.waitingAnimation = true;

//Whenever the user selects a sound file from the audio input element (with id of audioInput).
audioInput.onchange = function() { 
  //This function will set up the music visualiser, and start playing the user's selected sound file.
  mV.loadUserSelectedSoundFile();
};

function loadDefaultSoundFile() {
  //This function will set up the music visualiser, and start playing the sound file specified by the audio file URL.
  mV.loadDefaultSoundFile();
}


//Code begins for THREE js scene setup.
let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
let controls = new THREE.OrbitControls(camera); 
//Note that I use a customised THREE.OrbitControls class, which can be found at https://codepen.io/jhancock532/pen/VdLmvN
//I commented out the line event.preventDefault(); in the mouse down function, fixing select preset for the dat.GUI (See line 661)
controls.dampingFactor = 0.1;
controls.rotateSpeed = 0.005;
controls.target = new THREE.Vector3(0,10,0);
controls.enableDamping = true;
controls.enableKeys = false;
controls.enablePan = false;
controls.maxDistance = 400;

let renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

camera.position.z = 0;
camera.position.y = 60;
controls.update();

//Creation of the geometry, material and line arrays
let springMaterialArray = []; 
let springGeometryArray = [];
let springsArray = [];
let segmentGeometryArray = [];
let segmentMaterialArray = [];
let segmentsArray = [];
setUpAllArrays();
createSkybox();

//Makes a subtle grey background.
function createSkybox(){
  let sphereBox = new THREE.SphereGeometry( 500, 32, 32 );
  let sphereMaterial = new THREE.MeshBasicMaterial( {color: 0x111111, side: 2} );
  let sphere = new THREE.Mesh( sphereBox, sphereMaterial );
  scene.add( sphere );
}

//Creates all the geometries, materials and meshes, properties of which are animated later.
function setUpAllArrays() {
  for (let i = 0; i < springs.numSamples; i++){
    segmentGeometryArray.push(new THREE.CircleGeometry(segments.segBaseRadius, 64, i*2*Math.PI/springs.numSamples, 2*Math.PI/springs.numSamples));
    springGeometryArray.push(new THREE.Geometry()); //Vertices are added iteratively.
    
    springMaterialArray.push(new THREE.LineBasicMaterial({
	    color: getRainbowColour(i,springs.numSamples, 50)
    }));
    
    segmentMaterialArray.push(new THREE.MeshBasicMaterial( {
      color: getRainbowColour(i,springs.numSamples, segments.segBrightness), 
      side: 2
    }));
    
    let XBaseline = getSpiralPosition("X",i);
    let ZBaseline = getSpiralPosition("Z",i);
    //The height (y value) of the vertices is determined by audio data, so we don't have to worry about it here.
    for (let j = 0; j < springs.nodesPerLine; j++){
      springGeometryArray[i].vertices.push(new THREE.Vector3(XBaseline, 0, ZBaseline));
    }
    
    //Combine together the geometry and material to create the mesh, store this in the global array.
    springsArray.push(new THREE.Line( springGeometryArray[i], springMaterialArray[i]));
    segmentsArray.push(new THREE.Mesh(segmentGeometryArray[i], segmentMaterialArray[i]));
    segmentsArray[i].rotateX( Math.PI / 2 ); //A circle is initally created in the wrong plane, so we rotate it here.
    //We add the contents of the global arrays into the scene.
    scene.add(springsArray[i]); 
    scene.add(segmentsArray[i]);
  }
}

//A small mathematical function to give X and Z coords of a spiral.
function getSpiralPosition(axis, i){
  let t = 1.5 + i*Math.PI*spiral.phase/(springs.numSamples); 
  //1.5 is an offset to stop a spiral being created at 0,0.
  if (axis == "X"){
    return t * spiral.inOutScale * Math.cos(t);
  } else {
    return t * spiral.inOutScale * Math.sin(t);
  }
}

//Creates a clean slate and repopulates all arrays with new values. Resets the scene as well, while creating a new skybox.
function resetArrays() {
  springMaterialArray = [];
  springGeometryArray = [];
  springsArray = [];
  segmentGeometryArray = [];
  segmentMaterialArray = [];
  segmentsArray = [];
  
  //Code to remove all children from a scene.
  for(var i = scene.children.length - 1; i >= 0; i--){
     obj = scene.children[i];
     scene.remove(obj);
  }
  
  mV.setNumberOfBars(springs.numSamples);
  
  createSkybox();
  setUpAllArrays();
  
  
}

//Returns a rainbow spectrum when iterated through with i, going from 0 to maxValue, with brightness as specified.
function getRainbowColour(i, maxValue, brightness){
  return new THREE.Color("hsl("+(i*359)/maxValue+", 100%, "+String(Math.floor(brightness))+"%)");
}

//Code to animate the visualisation begins.
function updateMeshes(){
  //let volumeBoost = mV.getAverageOfDataArray();
  
  for (let i = 0; i < springs.numSamples; i++){
    let sampleLevel = mV.barHeights[i];
    
    //Update the springs. 
    for (let j = 0; j < springs.nodesPerLine; j++){
      //Wave factor is a simple trig representation of a circle. You could make this any lissajous figure.
      //It's the amount the line point is offset by from the center line in the middle in of the spring.
      let waveFactorOne = Math.sin(Math.PI*springs.springPhase*(j/springs.nodesPerLine)) - 0.5;
      let waveFactorTwo = Math.cos(Math.PI*springs.springPhase*(j/springs.nodesPerLine)) - 0.5;

      let XBaseline = getSpiralPosition("X",i);
      let ZBaseline = getSpiralPosition("Z",i);
      
      springsArray[i].geometry.vertices[j] = new THREE.Vector3( 
        XBaseline+waveFactorOne, 
        sampleLevel*springs.springHeight*(j/springs.nodesPerLine),
        ZBaseline+waveFactorTwo);
    }
    springsArray[i].geometry.verticesNeedUpdate = true; 
    //This line is vital for animation of updated geometries.
   
    //Update the segments.
    segmentsArray[i].scale.set(0.01+sampleLevel,0.01+sampleLevel,1);
    segmentsArray[i].rotateZ(0.003);
  }
}

function animate() {
	requestAnimationFrame(animate);
  controls.update();
  //Update the soundDataArray with the new wave frequency.
  mV.updateFrequencyData();
  
  updateMeshes();
	renderer.render(scene, camera);
}

animate();

