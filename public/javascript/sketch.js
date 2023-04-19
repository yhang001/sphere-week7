/*This project is about using the rrate parameters of the phone to control the rotation of each
each sphere. It is a trial for communicating the gryosc app and VScode via OSC. 
Also, the mouse is used as an interactive way to provide another perspective with different visuals as well.
Reference: Rebecca's code example in week7
Collaborators: Jing Wang & Yifan Hang
*/

// Create connection to Node.JS Server
const socket = io();

let radius = 1100;
let positions = [],
    sizes = [],
    numBoxes = 80,
    positionsLine = [];

let canvas;
let roll = 0;
let pitch = 0;
let yaw = 0;

function setup() {
  canvas = createCanvas(windowWidth, windowHeight, WEBGL);
  canvas.parent("sketch-container");
  background(255);
 
  createEasyCam();
   for(let i = 0 ; i < numBoxes ; i++){

    //s = size =raduis of sphere
    let s = createVector(random(5,10));
    //p = position;
    let p = createVector(random(-radius/2,radius/2),random(-radius/2,radius/2), random(-radius/2,radius/2) );
    positions.push(p);
    sizes.push(s);
  }

}

function draw() {
   randomSeed(400);
   drawGrid(20, 20, 100);
  
   //add lights to the sphere
   lights();
   pointLight(241, 203, 99, pitch*400, roll*400, yaw*400);

   //rotate the sphere
   push();
    for(let i = 1 ; i < numBoxes; i++){
      push();
      let _sz = sizes[i].copy();
      let ps = positions[i-1].copy();
      rotateZ(pitch);
      rotateX(roll);
      rotateY(yaw); 

      MyLine(ps,positions[i]); 
      Sphere(_sz, positions[i]);
      pop();
    }
  pop();
}

//connecting each sphere with lines to make it a whole
function MyLine(ps,s){
  push();
  strokeWeight(3);
  stroke(255,240,0);
  beginShape();
  translate(0,0, radius/2);
  
  vertex(ps.x,ps.y,ps.z);
  vertex(s.x,s.y,s.z);
  endShape();
  pop();
}

function Sphere(sr, pos){
  push();
  translate(pos.x, pos.y, pos.z + radius/2);
  push();
  rotateZ(pitch);
  rotateX(roll);
  rotateY(yaw); 
  stroke(183,253,185);
  fill(183,253,185);
  sphere(sr.r,20,20);
  pop();
  pop();
}

//draw a grid with variable width height and size
function drawGrid(rows, cols, sz){
  push();
  stroke(255);

  // move to negative edge of the grid
  translate(-rows*0.5*sz,-cols*0.5*sz );

  // draw the rows
  for(let i = 0; i < rows+1; i++){
    line(i *sz, 0 ,i*sz, cols*sz);
  }
  // draw the columns
  for(let j = 0; j < cols+1; j++){
    line(0,j *sz, rows*sz ,j*sz);
  }

  pop();
}

//process the incoming OSC message and use them for our sketch
function unpackOSC(message){

  //uses the rotation rate to keep rotating in a certain direction
  if(message.address == "/gyrosc/rrate"){
    roll += map(message.args[0],-3,3,-0.1,0.1);
    pitch += map(message.args[1],-3,3,-0.1,0.1);
    yaw += map(message.args[2],-3,3,-0.1,0.1);
  }
}

//Events we are listening for
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

}

// Connect to Node.JS Server
socket.on("connect", () => {
  console.log(socket.id);
});

// Callback function on the event we disconnect
socket.on("disconnect", () => {
  console.log(socket.id);
});

// Callback function to recieve message from Node.JS
socket.on("message", (_message) => {

  console.log(_message);

  unpackOSC(_message);

});