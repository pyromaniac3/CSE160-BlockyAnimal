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
let g_globalAngle; 
let g_armAngle;
let g_wristAngle;
let g_armAnimation = false;
let g_wristAnimation = false;

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

    document.getElementById('ArmOn').onclick =  function(){g_armAnimation = true};
    document.getElementById('ArmOff').onclick =  function(){g_armAnimation = false};

    document.getElementById('WristOn').onclick =  function(){g_wristAnimation = true};
    document.getElementById('WristOff').onclick =  function(){g_wristAnimation = false};
    
    //#endregion

    //#region [[Slider Events]]
    let redSlider = document.getElementById('red');
    let greenSlider = document.getElementById('green');
    let blueSlider = document.getElementById('blue');
    let angleSlider = document.getElementById('angleSlider');
    let armSlider = document.getElementById('arm');
    let wristSlider = document.getElementById('wrist');

    // Add event listeners for slider input changes
    redSlider.addEventListener('mouseup', function() {g_selectedColor[0] = redSlider.value/255;});

    greenSlider.addEventListener('mouseup', function() {g_selectedColor[1] = greenSlider.value/255;});

    blueSlider.addEventListener('mouseup', function() {g_selectedColor[2] = blueSlider.value/255;});
    
    angleSlider.addEventListener('mousemove', function(){g_globalAngle = this.value; renderAllShapes();});

    armSlider.addEventListener('mousemove', function(){g_armAngle = this.value; renderAllShapes();});

    wristSlider.addEventListener('mousemove', function(){g_wristAngle = this.value; renderAllShapes();});
    
    //#endregion

    //#region [[Clear canvas]]
    document.getElementById('clearCanvas').onclick = function(){
        g_shapesList=[];
        renderAllShapes();
    };
    //#endregion 
}

 function main() {

    setupWebGL();
    connectVariablesToGLSL();
    addActionsForHtmlUI();

    // Set Canvas Color
    gl.clearColor(0,0,0, 1.0);
   
    // call anim fram
    requestAnimationFrame(tick);
 }

var g_shapesList = []

 function click(ev) {
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
   // console.log(x + "  "+ y)
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
    //console.log(x + "  "+ y)
    // create a point 
    let point;
    if(g_selectedType==POINT){
        point = new Point();
    }else if(g_selectedType==TRIANGLE){
        point = new Triangle();
    }else{
        point = new Circle();
        point.segments= g_segments;
    }
    point.color = g_selectedColor.slice();
    point.position = ([x,y]);
    point.size = g_selectedSize;
    g_shapesList.push(point);

    renderAllShapes();
 }

 var g_startTime = performance.now()/1000;
 var g_seconds = performance.now/1000-g_startTime;
 
 function tick(){
    g_seconds = performance.now()/1000-g_startTime;
    
    // Update Animation Angles;
    updateAnimationAngle();

    // Draw Everything
    renderAllShapes();
    
    // Call this function back to keep updating the anims
    requestAnimationFrame(tick);
 }

 function updateAnimationAngle(){
    if(g_armAnimation == true){
            g_armAngle = (45*Math.sin(g_seconds)); // makes dat smooth animations
    }
    if(g_wristAnimation == true){
        g_wristAngle = (45*Math.sin(3*g_seconds)); // makes dat smooth animations
}
 }

 function renderAllShapes(){
    // making the rotational matrix 
    var globalRotMat = new Matrix4().rotate(g_globalAngle,0,1,0); // turn the angle into a matrix
    gl.uniformMatrix4fv(u_GlobalRotateMatrix,false,globalRotMat.elements); // roate it based off that global rotate matrix

    // Clear Canvas
   // gl.clearColor(0,0,0,1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT);
    // Draw an Animal
    var body = new Cube();
    body.color = [1,0,0,1];// red
    // happens in reverse order
    body.matrix.translate(-0.25,-0.75,0);
    body.matrix.rotate(-5,1,0,0);
    body.matrix.scale(0.5,0.3,0.5) // happens first
    body.render();

    var leftArm = new Cube();
    leftArm.color = [1,1,0,1];// yellow
    // happens in reverse order
    leftArm.matrix.setTranslate(0,-0.5,0);
    leftArm.matrix.rotate(-5,1,0,0);
    leftArm.matrix.rotate(g_armAngle,0,0,1); // makes dat smooth animations
    var leftArmCoord = new Matrix4(leftArm.matrix);
    leftArm.matrix.scale(0.25,0.7,0.5) // happens first
    leftArm.matrix.translate(-0.5,0,0);
    leftArm.render();

    var box = new Cube();
    box.color = [1,0,1,1];// pink
    // happens in reverse order
    box.matrix = leftArmCoord;
    box.matrix.translate(0,0.6,0,0);
    box.matrix.rotate(g_wristAngle,0,0,1)
    box.matrix.scale(0.3,0.3,0.3) // happens first
    box.matrix.translate(-0.5,0,-1);
    box.render();
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