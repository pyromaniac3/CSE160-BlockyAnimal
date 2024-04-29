 // Draw a shape when mouse is clicked
 // ColoredPoints.js
 // Vertex shader program
 var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotateMatrix; 
    void main(){
        gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    }`

 // Fragment shader program -- chaning the colors?
 var FSHADER_SOURCE = `
    precision mediump float;
    uniform vec4 u_FragColor; 
    void main(){
    gl_FragColor = u_FragColor;
    }`

//#region [[Global Variables]]
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let g_globalAngle = 0; 
let g_tail1Angle = 15;
let g_tail2Angle = 27;
let g_tail3Angle = 27;
let g_tail1Sway = 0;
let g_IdleAnim = false;
let g_dance = false;
let g_brLeg = 90;
let g_frLeg = 90;
let g_blLeg = 90;
let g_flLeg = 90;
let g_head = 0;
let g_body = 0;

// drawing
var berryList = [];
//#endregion

function setupWebGL(){
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = canvas.getContext('webgl' , {preserveDrawingBuffer:true});
    // a fun little trick to help with lag
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
    return;
    }

    gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL(){

    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to initialize shaders.');
        return;
    }

     // Get the storage location of attribute variable
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }
    // Get the storage location of u_FragColor variable
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if(a_Position <0){
        console.log("failed to get the storage location locqtion of u_FragColor");
        return;
    }
    
    // Get storage location for Model Matrix from our Vertex Shader
    u_ModelMatrix = gl.getUniformLocation(gl.program,'u_ModelMatrix');
    if(!u_ModelMatrix){
        console.log("Failed to get the storage location of u_ModelMatrix");
        return;
    }

    // Get storage location for our Rotate Matrix from our Vertex Shader
    // This dictates the camera angle
    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program,'u_GlobalRotateMatrix');
    if(!u_GlobalRotateMatrix){
        console.log("Failed to get the storage location of u_GlobalRotateMatrix");
        return;
    }

    // Set an initial value for this matrix to identity
    var indentityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, indentityM.elements);
}

function addActionsForHtmlUI(){
    //#region [[Buttons]] 

    document.getElementById('IdleOn').onclick =  function(){g_IdleAnim = true; g_dance = false;};
    document.getElementById('IdleOff').onclick =  function(){g_IdleAnim = false;};
    //#endregion

    //#region [[Slider Events]]
    let angleSlider = document.getElementById('angleSlider');
    let tail1Slider = document.getElementById('tail1');
    let tail2Slider = document.getElementById('tail2');
    let tail3Slider = document.getElementById('tail3');

    // Add event listeners for slider input changes
    angleSlider.addEventListener('mousemove', function(){g_globalAngle = this.value; renderAllShapes();});

    tail1Slider.addEventListener('mousemove', function(){g_tail1Angle = this.value; renderAllShapes();});

    tail2Slider.addEventListener('mousemove', function(){g_tail2Angle = this.value; renderAllShapes();});

    tail3Slider.addEventListener('mousemove', function(){g_tail3Angle = this.value; renderAllShapes();});
    
    
    //#endregion
}

 function main() {

    // [[ SET UP FUNCTIONS ]]
    setupWebGL();
    connectVariablesToGLSL();
    addActionsForHtmlUI();

    // Set Canvas Color
    gl.clearColor(75/255, 97/255, 84/255, 1.0);
    
    // call anim fram
    requestAnimationFrame(tick);
 }

 function click(ev) {
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
   // console.log(x + "  "+ y)
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
    //console.log(x + "  "+ y)
    // rotate angle based on mouse position

    // g_globalAngle = 

    renderAllShapes();
 }

 var g_startTime = performance.now()/1000;
 var g_seconds = performance.now/1000-g_startTime;
 
 function tick(){
    g_seconds = performance.now()/1000-g_startTime;

    // Update Animation Angles;
    updateAnimationAngle();

    //#region [[ NEW ANIM ]]
    // Check for Shift + Click
    document.addEventListener("click", function(event) {
        // Check if the shift key is pressed
        if (event.shiftKey) {
            // Execute your code here for shift + click
            g_IdleAnim = false;
            g_dance = true;
        }
    });

    // Check for End Dance w/ ESC
    document.addEventListener("keydown", function(event) {
        // Check if the shift key is pressed
        if(event.key === "Escape") {
            // Execute your code here for shift + click
            g_dance = false;
        }
    });
    //#endregion

    // Draw Everything
    renderAllShapes();
    
    // Call this function back to keep updating the anims
    requestAnimationFrame(tick);
 }

 function updateAnimationAngle(){

    if(g_IdleAnim == true){

        var frequency = 5; // adjust this value to change the speed of the movement
        var magnitude = 2; // adjust this value to change the extent of the movement

        g_tail1Sway = magnitude * Math.cos(frequency * g_seconds); 
        
        g_body = (Math.cos(frequency* g_seconds))/100;
    }

    if(g_dance == true){
        // Adjust the frequency and magnitude to control the motion
        var frequency = 10; // adjust this value to change the speed of the movement
        var magnitude = 2; // adjust this value to change the extent of the movement

        g_brLeg = magnitude * Math.cos(frequency * g_seconds); 
        g_blLeg = -magnitude * Math.cos(frequency * g_seconds); 
        g_frLeg = magnitude * Math.cos(frequency * g_seconds); 
        g_flLeg = -magnitude * Math.cos(frequency * g_seconds); 
        g_head = 1 * Math.cos(frequency * g_seconds); 
        g_tail1Sway = magnitude * Math.cos(frequency * g_seconds); 
        
        // So the Angle is right for the legs
        var verticalAngle = 270
        g_brLeg -= verticalAngle;
        g_blLeg -= verticalAngle;
        g_frLeg -= verticalAngle;
        g_flLeg -= verticalAngle;
    }
 }

 function renderAllShapes(){
    var startTime = performance.now();
    // making the rotational matrix 
    var globalRotMat = new Matrix4().rotate(g_globalAngle,0,1,0); // turn the angle into a matrix
    gl.uniformMatrix4fv(u_GlobalRotateMatrix,false,globalRotMat.elements); // roate it based off that global rotate matrix

    // Clear Canvas
   // gl.clearColor(0,0,0,1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Draw an Animal 
    // [[ animal colors ]]
    let darkBrown = [43/255, 39/255, 39/255,1]; // dark brown
    let tan = [217/255, 193/255, 182/255,1]; //tan
    let white = [1,1,1,1];

    // [[ base animal translations ]]
    // legs 
    var thighF = [0.25,-.5,-0.15];  // adjusting values will move both front legs uniformly
    var thighB = [-0.25,-.5,0.15]; // adjusting values will move both back legs uniformly

    // body base
    var body = [0.15,0.25+g_body,0.025];

    // head base
    var headB = [.3,-.3+g_body,.25];

    // tail base
    var tailB = [-0.035,-0.15+g_body,0.38];

    //#region [[ LEGS ]]
    // Front R leg
    var frThigh = new Cube();
    frThigh.color = darkBrown; // dark brown
    frThigh.matrix.translate(thighF[0],thighF[1]-0.05,thighF[2]);
    frThigh.matrix.rotate(g_frLeg,1,0,0);
    var frThighMat = new Matrix4(frThigh.matrix);
    frThigh.matrix.scale(0.15,0.15,0.25);
    frThigh.render();

    var frLeg = new Cube();
    frLeg.color = darkBrown; // dark brown
    frLeg.matrix = frThighMat;
    frLeg.matrix.translate(thighF[0]-0.2,thighF[1]+0.55,thighF[2]+0.33);
    //frLeg.matrix.rotate(90,1,0,0);
    var frLegMat = new Matrix4(frLeg.matrix);
    frLeg.matrix.scale(0.05,0.05,0.25);
    frLeg.render();

    var frFoot = new Cube();
    frFoot.color = darkBrown; // dark brown
    frFoot.matrix = frLegMat;
    frFoot.matrix.translate(thighF[0]-0.25,thighF[1]+0.48,thighF[2]+0.17);
    //frFoot.matrix.rotate(90,1,0,0);
    frFoot.matrix.scale(0.1,0.08,.05);
    frFoot.render();
    // -----------------------------------------------------
    // Back L leg
    var blThigh = new Cube();
    blThigh.color = tan; //teal 
    blThigh.matrix.translate(thighB[0],thighB[1]-0.08,thighB[2]+0.04);
    blThigh.matrix.rotate(g_blLeg,1,0,0);
    blThigh.matrix.rotate(-1,1,0,0);
    blThigh.matrix.rotate(-5,0,1,0);
    var blThighMat = new Matrix4(blThigh.matrix);
    blThigh.matrix.scale(1.5,1,1);
    blThigh.matrix.scale(0.15,0.15,0.3);
    blThigh.render();

    var blLeg = new Cube();
    blLeg.color = darkBrown; // dark brown
    blLeg.matrix = blThighMat;
    blLeg.matrix.translate(thighB[0]+0.32,thighB[1]+0.55,thighB[2]-0.05);
    var blLegMat = new Matrix4(blLeg.matrix);
    blLeg.matrix.scale(0.05,0.05,0.25);
    blLeg.render();

    var blFoot = new Cube();
    blFoot.color = darkBrown; // dark brown
    blFoot.matrix = blLegMat;
    blFoot.matrix.translate(thighB[0]+0.25,thighB[1]+0.5,thighB[2]-0.1);
    blFoot.matrix.scale(0.1,0.08,0.05);
    blFoot.render();
    // -----------------------------------------------------
    // Front L leg
    var flThigh = new Cube();
    flThigh.color = darkBrown; // dark brown
    flThigh.matrix.translate(thighF[0],thighF[1]-0.05,thighF[2]+0.20);
    flThigh.matrix.rotate(g_flLeg,1,0,0);
    var flThighMat = new Matrix4(flThigh.matrix);
    flThigh.matrix.scale(0.15,0.15,0.25);
    flThigh.render();

    var flLeg = new Cube();
    flLeg.color = darkBrown; // dark brown
    flLeg.matrix = flThighMat;
    flLeg.matrix.translate(thighF[0]-0.2,thighF[1]+0.55,thighF[2]+0.33);
    //flLeg.matrix.rotate(90,1,0,0);
    var flLegMat = new Matrix4(flLeg.matrix);
    flLeg.matrix.scale(0.05,0.05,0.25);
    flLeg.render();

    var flFoot = new Cube();
    flFoot.color = darkBrown; // dark brown
    flFoot.matrix = flLegMat;
    flFoot.matrix.translate(thighF[0]-0.25,thighF[1]+0.48,thighF[2]+0.17);
    //flFoot.matrix.rotate(90,1,0,0);
    flFoot.matrix.scale(0.1,0.08,0.05);
    flFoot.render();
    // -----------------------------------------------------
    // Back R Leg
    var brThigh = new Cube();
    brThigh.color = tan; // red
    brThigh.matrix.translate(thighB[0],thighB[1]-0.08,thighB[2]-0.45);
    brThigh.matrix.rotate(g_brLeg,1,0,0);
    brThigh.matrix.rotate(-1,1,0,0);
    brThigh.matrix.rotate(-5,0,1,0);
    var brThighMat = new Matrix4(brThigh.matrix);
    brThigh.matrix.scale(1.5,1,1);
    brThigh.matrix.scale(0.15,0.15,0.3);
    brThigh.render();

    var brLeg = new Cube();
    brLeg.color = darkBrown; // dark brown
    brLeg.matrix = brThighMat;
    brLeg.matrix.translate(thighB[0]+0.32,thighB[1]+0.55,thighB[2]-0.05);
    var brLegMat = new Matrix4(brLeg.matrix);
    brLeg.matrix.scale(0.05,0.05,0.25);
    brLeg.render();

    var brFoot = new Cube();
    brFoot.color = darkBrown; // dark brown
    brFoot.matrix = brLegMat;
    brFoot.matrix.translate(thighB[0]+0.25,thighB[1]+0.5,thighB[2]-0.1);
    brFoot.matrix.scale(0.1,0.08,0.05);
    brFoot.render();
    // -----------------------------------------------------
    //#endregion

    // #region [[ BODY ]]
    var bBody = new Octahedron();;
    // var bBody = new Cube();
    bBody.color = tan;
    bBody.matrix.translate(0.15,0.25,0.025);
    bBody.matrix.rotate(-45,1,0,0);
    bBody.matrix.scale(0.55,0.75,0.75) // happens first
    bBody.render();

    var fBody = new Cube();
    // var bBody = new Cube();
    fBody.color = tan; 
    fBody.matrix.translate(body[0]-.305,body[1]-0.3,body[2]-0.22);
    fBody.matrix.rotate(90,1,0,0);
    fBody.matrix.rotate(-90,0,1,0);
    fBody.matrix.scale(1,.75,1);
    fBody.matrix.scale(1.5,1,1);
    fBody.matrix.scale(0.25,0.55,0.55); // happens first
    fBody.render();

    var chest = new Cube();
    chest.color = darkBrown;
    chest.matrix.translate(body[0]+0.25,body[1]-0.72,body[2]+0.15);
    chest.matrix.rotate(60,0,0,1);
    chest.matrix.scale(1,1,1.2) // happens first
    chest.matrix.scale(0.25,0.25,0.25) // happens first
    chest.render();
    //#endregion

    //#region [[ HEAD ]]
    var head = new Cube();
    head.color = tan;
    head.matrix.translate(headB[0],headB[1],headB[2]);
    head.matrix.rotate(g_head,1,0,0,0);
    head.matrix.scale(1,1.2,1);
    head.matrix.scale(1,1,1.8);
    head.matrix.scale(.25,.25,.25);
    head.render();

    var snout = new Cube();
    snout.color = tan;
    snout.matrix.translate(headB[0]+0.2,headB[1],headB[2]-0.1);
    snout.matrix.scale(.75,.75,1);
    snout.matrix.scale(0.2,0.2,0.2);
    snout.render();

    var nose = new Cube();
    nose.color = darkBrown;
    nose.matrix.translate(headB[0]+0.35,headB[1]+0.05,headB[2]-0.17);
    nose.matrix.scale(0.05,0.05,0.05);
    nose.render();

    var eye1 = new Cube();
    eye1.color = darkBrown;
    eye1.matrix.translate(headB[0]+0.158,headB[1]+0.1,headB[2]-0.02);
    eye1.matrix.scale(0.1,0.15,0.15);
    eye1.render();

    var pupil1 = new Cube();
    pupil1.color = white;
    pupil1.matrix.translate(headB[0]+0.16,headB[1]+0.15,headB[2]-0.09);
    pupil1.matrix.scale(0.1,0.05,0.05);
    pupil1.render();

    var eye2= new Cube();
    eye2.color = darkBrown;
    eye2.matrix.translate(headB[0]+0.158,headB[1]+0.1,headB[2]-0.25);
    eye2.matrix.scale(0.1,0.15,0.15);
    eye2.render();
    
    var pupil2= new Cube();
    pupil2.color = white;
    pupil2.matrix.translate(headB[0]+0.16,headB[1]+0.15,headB[2]-0.28);
    pupil2.matrix.scale(0.1,0.05,0.05);
    pupil2.render();

    var earL = new Octahedron();
    earL.color = tan;
    earL.matrix.translate(headB[0]+.25,headB[1]+.38,headB[2]);
    earL.matrix.rotate(-15,0,0,1);
    earL.matrix.scale(0.15,0.25,0.15);
    earL.render();

    var earR = new Octahedron();
    earR.color = tan;
    earR.matrix.translate(headB[0]+.25,headB[1]+.38,headB[2]-.3);
    earR.matrix.rotate(-15,0,0,1);
    earR.matrix.scale(0.15,0.25,0.15);
    earR.render();
    //#endregion 

    //#region [[ TAIL ]]
    var tail1 = new Octahedron();
    tail1.color = tan;
    tail1.matrix.translate(tailB[0],tailB[1],tailB[2]);
    tail1.matrix.rotate(g_tail1Angle,0,0,1);
    tail1.matrix.rotate(g_tail1Sway,1,0,0);
    var tail1Mat = new Matrix4(tail1.matrix);
    tail1.matrix.rotate(45,1,0,0);
    tail1.matrix.scale(0.5,0.5,0.5);
    tail1.render();

    var tail2 = new Octahedron();
    tail2.color = darkBrown;
    tail2.matrix = tail1Mat;
    tail2.matrix.translate(tailB[0]-0.15,tailB[1]+0.15,tailB[2]-0.38);
    tail2.matrix.rotate(g_tail2Angle,0,0,1);
    var tail2Mat = new Matrix4(tail2.matrix);
    tail2.matrix.rotate(45,1,0,0);
    tail2.matrix.scale(0.5,0.5,0.5);
    tail2.render();

    var tail3 = new Octahedron();
    tail3.color = tan;
    tail3.matrix = tail2Mat;
    tail3.matrix.translate(tailB[0]-0.15,tailB[1]+0.15,tailB[2]-0.38);
    tail3.matrix.rotate(g_tail3Angle,0,0,1);
    tail3.matrix.rotate(45,1,0,0);
    tail3.matrix.scale(0.5,0.5,0.5);
    tail3.render();

    //#endregion

    // Check trhe time at the end of the function, and show on webpage
    var duration = performance.now() - startTime;
    sendTextToHTML('ms: '+ Math.floor(duration) + ' fps: ' + Math.floor(10000/duration)/10, 'fps');
}

function renderBerry(){
    // Clear <canvas>
    // Set the color for clearing <canvas>
    gl.clearColor(242/255, 230/255, 157/255, 1.0);
    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    var len = berryList.length;
    //console.log("Len berryList = "+len);
    for(var i = 0; i < len; i++) {
       // console.log(berryList[i]);
        berryList[i].render();
    }
}

function sendTextToHTML(text,htmlID){
    var htmlElm = document.getElementById(htmlID);
    if(!htmlElm){
        console.log('Failed to get ' + htmlID + ' from HTML');
        return;
    }
    htmlElm.innerHTML = text;
}