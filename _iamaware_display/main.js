var config = {
  apiKey: "AIzaSyC9hyquwKLSLks3UYBkVxkf6mya2eNAV5w",
  authDomain: "project-2569167554904200855.firebaseapp.com",
  databaseURL: "https://project-2569167554904200855.firebaseio.com",
  storageBucket: "project-2569167554904200855.appspot.com",

};
firebase.initializeApp(config);

var pointsData = firebase.database().ref().child("awareUsersList");;
var points = [];
var count = 0;
var incr = false;
var decr = false;
//const ctx;
var canvas;
var canwd = 400;
var canht = 400;

function setup() {
  canvas = createCanvas(400, 400);
  console.log("in here");
  background(0);
  //fill(255);
  stroke(255);
  strokeWeight(5);

  //---authenticate anon
  firebase.auth().signInAnonymously().catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log("--auth error");
    console.log(errorCode + " : " + errorMessage);
  });
  var self=this;
  firebase.auth().onAuthStateChanged(function(user) {
    console.log("** auth state changed");
    console.log(user.uid);
    self.loggedIn(user);
  });      

  //---handle add/remove of touches
  pointsData.on("child_added", function (point) {
    //points.push(point.val());
    points.push(1);
    console.log("adding child:" + points.length);
    incr = true;
    count = 1;
  });

  pointsData.on("child_removed", function () {
    //points = [];
    points.pop();
    console.log(points.length);
    stroke(0);
    strokeWeight(5);
    decr=true;
    count=9;
  });

  pointsData.on("value", function(snapshot) {
    console.log("There are "+snapshot.numChildren()+" messages");
  });


  //canvas.mousePressed(drawPoint);
  //canvas.mouseMoved(drawPointIfMousePressed);
}

function draw() {
//  background(0);

  // for (var i = 0; i < points.length; i++) {
  //   var point = points[i];
  //   ellipse(getRandomArbitrary(0,400), getRandomArbitrary(0,400), 5, 5);
  // }

  if(incr)
  {

    //stroke(255);
    //strokeWeight(5);
    if(points.length == 1 || points.length == 0)
    {
      background(0);
      writeText("off");
    }
    else
    {
      if(count>0 && count < 10)
      {
        background(255);
        //noFill();
        //ellipse(200, 200, count, count);  
        count++;      
      }
      else
      {
        count=0;
        incr=false;
        background(255,0,0);
        writeText("on");
      }
    }
  }

  if(decr)
  {
    // stroke(255);
    // strokeWeight(5);

    if(count>0 && count < 10)
    {
      background(0);
      //noFill();
      //ellipse(200, 200, count, count);  
      count--;      
    }
    else
    {
      count=0;
      decr=false;

      if(points.length == 1 || points.length == 0)
      {
        background(0);
        writeText("off");
      }
      else
      {
        background(255,0,0);
        writeText("on");
      }
    }
  }
}

// var fontRegular, fontItalic, fontBold;
// function preload() {
//    fontRegular = loadFont("assets/Regular.otf");
//    fontItalic = loadFont("assets/Italic.ttf");
//    fontBold = loadFont("assets/Bold.ttf");
// }

function writeText(type)
{
  if(type == "off")
  {
    var txtxt = "waiting for touch";
    fill(255);
    textSize(20);
    textFont("Helvetica");
    strokeWeight(1);
    noStroke();
    var tw = textWidth(txtxt);
    text(txtxt , (canwd/2) - (tw / 2), canht/2);
  }
  else if(type == "on")
  {
    var txtxt = "aware now";
    fill(255);
    textSize(20);
    textFont("Helvetica");
    strokeWeight(1);
    noStroke();
    var tw = textWidth(txtxt);
    text(txtxt , (canwd/2) - (tw / 2), canht/2);
  }
}

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

// function drawPoint() {
//   pointsData.push({x: mouseX, y: mouseY});
// }

// function drawPointIfMousePressed() {
//   if (mouseIsPressed) {
//     drawPoint();
//   }
// }

// $("#saveDrawing").on("click", saveDrawing);

// function saveDrawing() {
//   saveCanvas();
// }

// $("#clearDrawing").on("click", clearDrawing);

// function clearDrawing() {
//   pointsData.remove();
//   points = [];
// }