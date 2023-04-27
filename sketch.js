// Crappy Blink Detector using p5.js + handsfree.js
//
// HOW IT WORKS, USING RUDIMENTARY STATISTICS:
// The amount of eye-opening is measured each frame,
// by measuring the distance between several eye landmarks.
// We compute the running average of this amount.
// When the amount of eye-opening drops below a certain
// threshold (based on the standard deviation of the
// measurement), it's a blink.
//
// https://unpkg.com/handsfree@8.5.1/build/lib/handsfree.js
// Note: this downloads large models the first time it's run.
// Your mileage may vary. Go close to camera, use good lighting.

let handsfree; // The handsfree.js tracker
let webcam; // A webcam video (for display only)
let cache = [];

let fr = 24;
let margin = 12;
let counter = 0;

let eyeBlinkHistory = [];
const historyLen = 320;
let runningAvg = 0;
var blinkActivation = 0;
let flag = 0;
let flagPole = 0;
let buttonFlag = 0;
var button, startButton;
let imgFlag = 0;
let imgNew, img;
let startFace;
let firstTime = 0;
let multFactor = 1;

function preload() {
  // preload() runs once
  img = loadImage("https://cdn.glitch.global/e7aa4ced-6d06-4d83-ab36-4d2e76147807/face200.png?v=1671364585328https://cdn.glitch.global/e7aa4ced-6d06-4d83-ab36-4d2e76147807/face_Start.jpg?v=1671363420628face_Start.jpg");
  
  // imgNew = loadImage("face200.jpg");
}

//------------------------------------------
function setup() {
  createCanvas((640/2)*multFactor, 480*multFactor);
  frameRate(fr);
angleMode(DEGREES);
  // startSketch();
  // button = createButton("blink");
  // button.mousePressed(takesnap);

  eyeBlinkHistory = new Array(historyLen);
  for (var i = 0; i < historyLen; i++) {
    eyeBlinkHistory[i] = 0.1; // guess
  }

  // Create a webcam object. It's just for show.
  webcam = createCapture(VIDEO);
  webcam.size(640*.75*multFactor, 480*.75*multFactor);
  webcam.hide();

  // Configure handsfree.js to track hands, body, and/or face.
  handsfree = new Handsfree({
    showDebug: false /* shows or hides the camera */,
    hands: false /* acquire hand data? */,
    pose: false /* acquire body data? */,
    facemesh: true /* acquire face data? */,
  });
  handsfree.start();

  // RESET SKETCH
  resetSketch();
}

//------------------------------------------
function resetSketch() {
  startButton = createButton("My eyes are ready!");
  startButton.position(0, height);
  startButton.size(width, height/8);
  
  startButton.mousePressed(buttonFlagChange);

  // if (flagPole == 1) {
  //   // saveCanvas('face200', 'jpg');
  //   // image(webcam, 0, 0);
  //   imgNew = loadImage(image(webcam, 0, 0));
  //   flagPole = 0;
  // }

  // THE FIRST TIME
  if (blinkActivation == 0) {
    // setup() waits until preload() is done
    // img.loadPixels();
    image(img, 0, 0, width, height);
    // imgFlag++;
  } else if (blinkActivation == 1) {
    // AFTER THE FIRST TIME
    console.log("BLINK");
    // imgNew.loadPixels();
    // console.log(imgNew)
    image(imgNew, 0, 0, width, height);
    // image(cache[0], 0, 0, width, height);
    blinkActivation = 0;
    
    
    // TEXT RESULTS
    push();
    translate(0, -height/28)
   textSize(width / 18);
  textAlign(LEFT, LEFT);
    
  text('Your eyes lasted', width/8, height-54);
    textSize(width / 12);
  textAlign(LEFT, LEFT);
   
    text(str(counter)+' seconds', width/8, height-24);
    pop();
    counter=0;
    
//     textSize(width / 24);
//   textAlign(CENTER, CENTER);
    
//   text('Your eyes lasted', width/2, height/2-24);
//     textSize(width / 16);
//   textAlign(CENTER, CENTER);
   
//     text(str(counter)+' seconds', width/2, height/2);
//     counter=0;
    
    // image(imgNew, 0, 0, width, height);
    
    
  }
  draw();
}

//------------------------------------------
function buttonFlagChange() {
  buttonFlag = 1;
}

//------------------------------------------
function takesnap() {
  image(webcam, 0, 0);
}

//------------------------------------------
function draw() {
  
  textSize(width / 18);
  textAlign(CENTER, CENTER);
    fill('white');
  text('Staring Faces', width/2, height/16);
  
  // drawFaceBackground();
  if (buttonFlag == 1) {
  //   if(firstTime=0){
  //     firstTime++;
  //   } else
  //     image(imgNew, 0, 0, 640, 480);
    // background('white');
    // drawFaceBackground();
    // drawVideoBackground();
    // drawFaceLandmarks();
    // if(flag>200)
    // text(millis)
    detectBlinking();
    flag++;

  
    // console.log(flag);
    // BAD CHECK FOR TIME (SHOULD CHANGE TO MILLIS LATER)
//     if (flag == 20) {
     
//     }
    if (flag == 20) {
      // saveCanvas('face200', 'jpg');
      // image(webcam, 0, 0);
console.log("1 second image saved")
      // imgNew = loadImage(webcam);
      // imgNew = image(webcam,0,0);
      // image(webcam,0,0);

      // cache[0].push(webcam.get());
      
      imgNew = createImage(webcam.width, webcam.height);
      imgNew.copy(webcam, 0, 0, webcam.width, webcam.height, 0, 0, imgNew.width, imgNew.height);
      
      // console.log(imgNew)
      
      //  flagPole = 1;
      // flag = 0;
    }
  }
  if (blinkActivation == 1) {
    // console.log("do we get to blink activation 1")
    resetSketch();
  }
}

//------------------------------------------
function drawFaceBackground() {
  push();
  translate(width*2.5, -height/640);
  // rotate(10);
  scale(-1, 1);
  // tint(255, 255, 255, 160);
  image(webcam, 480, 360, width/4, height/4);
  tint(255);
  pop();

}

//------------------------------------------
function drawVideoBackground() {
  push();
  translate(width, 0);
  scale(-1, 1);
  tint(255, 255, 255, 160);
  image(webcam, 0, 0, width, height);
  tint(255);
  pop();
}

//------------------------------------------
function drawFaceLandmarks() {
  // Draw the 468 2D face landmarks
  if (handsfree.data.facemesh) {
    if (handsfree.data.facemesh.multiFaceLandmarks) {
      var faceLandmarks = handsfree.data.facemesh.multiFaceLandmarks;
      var nFaces = faceLandmarks.length;
      if (nFaces > 0) {
        var whichFace = 0;

        stroke("black");
        strokeWeight(1);
        var nFaceLandmarks = faceLandmarks[whichFace].length;
        for (var i = 0; i < nFaceLandmarks; i++) {
          var px = faceLandmarks[whichFace][i].x;
          var py = faceLandmarks[whichFace][i].y;
          px = map(px, 0, 1, width, 0);
          py = map(py, 0, 1, 0, height);
          circle(px, py, 0.5);
        }
      }
    }
  }
}

//------------------------------------------
function detectBlinking() {
  //   noStroke();
  // fill('white');
  // rect(0, height-24, 36, 24);
  //     fill('salmon');
  // text( str(counter) , margin, 480 - 8);
  if(frameCount % 24 == 0)
    counter++;
  if (handsfree.data.facemesh) {
    if (handsfree.data.facemesh.multiFaceLandmarks) {
      var faceLandmarks = handsfree.data.facemesh.multiFaceLandmarks;
      var nFaces = faceLandmarks.length;
      if (nFaces > 0) {
        var whichFace = 0;

        //----------------------
        // Vertices for the eyes
        var eyes = [
          [
            33,
            161,
            160,
            159,
            158,
            157,
            173,
            133,
            155,
            154,
            153,
            145,
            144,
            163,
            7,
          ],
          [
            362,
            384,
            385,
            386,
            387,
            388,
            466,
            263,
            249,
            390,
            373,
            374,
            380,
            381,
            382,
          ],
        ];

        //----------------------
        // Compute the centroid of the eye vertices.
        // This is purely for display purposes.
        var eyeAvgX = 0;
        var eyeAvgY = 0;
        var count = 0;
        for (var e = 0; e < 2; e++) {
          for (var j = 0; j < eyes[e].length; j++) {
            var px = faceLandmarks[whichFace][eyes[e][j]].x;
            var py = faceLandmarks[whichFace][eyes[e][j]].y;
            eyeAvgX += map(px, 0, 1, width, 0);
            eyeAvgY += map(py, 0, 1, 0, height);
            count++;
          }
        }
        eyeAvgX /= count;
        eyeAvgY /= count;

        //----------------------
        // Draw the eyes, isolated, on a white background:
       
        noStroke();
        fill("white");
        rect(0, height-120, width, 120);

        push();
        translate(width / 3, height-60);
        translate(-eyeAvgX, -eyeAvgY);
        fill("red");
        stroke(0);
        strokeWeight(1);
        for (var e = 0; e < 2; e++) {
          beginShape();
          for (var j = 0; j < eyes[e].length; j++) {
            var px = faceLandmarks[whichFace][eyes[e][j]].x;
            var py = faceLandmarks[whichFace][eyes[e][j]].y;
            px = map(px, 0, 1, width, 0);
            py = map(py, 0, 1, 0, height);
            vertex(px, py);
          }
          endShape(CLOSE);
        }
        pop();
        

        //----------------------
        // Measure the openness of the eyes. Your mileage may vary.
        var eyeBlinkMeasurementPairs = [
          [159, 154],
          [158, 145],
          [385, 374],
          [386, 373],
        ];
        var measurement = 0;
        for (var i = 0; i < eyeBlinkMeasurementPairs.length; i++) {
          var pa = faceLandmarks[whichFace][eyeBlinkMeasurementPairs[i][0]];
          var pb = faceLandmarks[whichFace][eyeBlinkMeasurementPairs[i][1]];
          measurement += dist(pa.x, pa.y, pb.x, pb.y);
        }
        // Add the data to the history;
        for (var i = 0; i < historyLen - 1; i++) {
          eyeBlinkHistory[i] = eyeBlinkHistory[i + 1];
        }
        eyeBlinkHistory[historyLen - 1] = measurement;

        //----------------------
        // Compute stats and Detect a blink!
        runningAvg = 0.95 * runningAvg + 0.05 * measurement;
        var stdv = 0;
        for (var i = 0; i < historyLen; i++) {
          stdv += sq(eyeBlinkHistory[i] - runningAvg);
        }
        stdv = sqrt(stdv / historyLen);

        var blink = false;
        blinkActivation = 0.9 * blinkActivation; // reduce activation
        var threshStdv = 1.0; // how many stdv's to detect a blink
        var threshVal = runningAvg - stdv * threshStdv;
        if (
          eyeBlinkHistory[historyLen - 1] < threshVal &&
          eyeBlinkHistory[historyLen - 2] >= threshVal
        ) {
          blink = true;
          blinkActivation = 1.0;
          rect(100, 100, 100, 100);
          print("Blink occurred at " + int(millis()) + " milliseconds");
          buttonFlag = 0;
          flag = 0;
          // resetSketch();
        }

        //----------------------
        // Render the blink history on a gray background
        /*
        var historyScale = 500;
        push();
        translate(0, 100);

        let myGray = color(200, 200, 200);
        let myRed = color(255, 0, 0);
        fill(lerpColor(myGray, myRed, blinkActivation));
        noStroke();
        rect(0, 0, width, 100);

        noFill();
        stroke(0);
        beginShape();
        for (var i = 0; i < historyLen - 1; i++) {
          var hx = i;
          var hy = eyeBlinkHistory[i] * historyScale;
          vertex(hx, hy);
        }
        endShape();
        stroke(0, 0, 0, 64);
        line(0, runningAvg * historyScale, width, runningAvg * historyScale);
        line(
          0,
          (runningAvg - stdv) * historyScale,
          width,
          (runningAvg - stdv) * historyScale
        );
        pop();
        */
      }
    }
  }
}
