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

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Global Variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let g_globalAngle; 

// base variables for color and size
var g_selectedColor = [1.0, 1.0, 1.0, 1.0];
var g_selectedSize = 5;
var g_selectedType=POINT;
var g_segments = 10;

// drawing
var berryList = [];


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
    //#region [[Button to draw berry]]
    document.getElementById('berry').onclick =  function(){drawBerry()};
    //#endregion

    //#region [[Button Events Shape Type]]
    document.getElementById('square').onclick = function(){g_selectedType=POINT};
    document.getElementById('triangle').onclick = function(){g_selectedType=TRIANGLE};
    document.getElementById('circle').onclick = function(){g_selectedType=CIRCLE};
    //#endregion

    //#region [[Slider Events]]
    let redSlider = document.getElementById('red');
    let greenSlider = document.getElementById('green');
    let blueSlider = document.getElementById('blue');
    let angleSlider = document.getElementById('angleSlider');

    // Add event listeners for slider input changes
    redSlider.addEventListener('mouseup', function() {g_selectedColor[0] = redSlider.value/255;});

    greenSlider.addEventListener('mouseup', function() {g_selectedColor[1] = greenSlider.value/255;});

    blueSlider.addEventListener('mouseup', function() {g_selectedColor[2] = blueSlider.value/255;});

    circleSize.addEventListener('input', function(){g_segments = circleSize.value});
    
    angleSlider.addEventListener('mouseup', function(){g_globalAngle = this.value; renderAllShapes();});
    //#endregion

    //#region [[Clear canvas]]
    document.getElementById('clearCanvas').onclick = function(){
        g_shapesList=[];
        renderAllShapes();
    };
    //#endregion 

    //#region [[Change Point Size]]
    let sizeSlider = document.getElementById('size');

    sizeSlider.addEventListener('input', function() {g_selectedSize = sizeSlider.value;});
    //#endregion
}

 function main() {

    setupWebGL();
    connectVariablesToGLSL();
    addActionsForHtmlUI();

    // Register function (event handler) to be called on a mouse press
    // [[NO LONGER WAITING FOR CLICKS]]
    // canvas.onmousedown = click;
    // canvas.onmousemove = function(ev){if(ev.buttons == 1){click(ev)}};

    gl.clearColor(0,0,0, 1.0);
    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    // var colorPicker = document.getElementById("canvas-color");
    // colorPicker.addEventListener("input", function() {
    //     var rgb = hexToRgb(colorPicker.value);
    //     var clearColor = rgbToFloat(rgb.r, rgb.g, rgb.b);

    //     gl.clearColor(clearColor[0], clearColor[1], clearColor[2], 1.0);
    //     gl.clear(gl.COLOR_BUFFER_BIT);
    // });
    renderAllShapes();
 }
//  function rgbToFloat(r, g, b) {
//     return [r / 255, g / 255, b / 255];
// }
//  function hexToRgb(hex) {
//     var bigint = parseInt(hex.substring(1), 16);
//     var r = (bigint >> 16) & 255;
//     var g = (bigint >> 8) & 255;
//     var b = bigint & 255;
//     return { r, g, b };
// }

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

 function renderAllShapes(){
    // Clear <canvas>
    gl.clearColor(0,0,0,1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    var len = g_shapesList.length;

    var globalRotMat = new Matrix4().rotate(g_globalAngle,0,1,0); // turn the angle into a matrix
    gl.uniformMatrix4fv(u_GlobalRotateMatrix,false,globalRotMat.elements); // roate it based off that global rotate matrix

    // for(var i = 0; i < len; i++) {
    //     //console.log(g_shapesList[i]);
    //     g_shapesList[i].render();
    // }
    // Draw a Triangle
    drawTriangle3D([-1,0,0, -0.5,-1,0, 0,0,0]);

    // Draw an Animal
    var body = new Cube();
    body.color = [1,0,0,1];// red
    // happens in reverse order
    body.matrix.translate(-0.25,-0.5,0);
    body.matrix.scale(0.5,1,-0.5) // happens first
    body.render();

    var leftArm = new Cube();
    leftArm.color = [1,1,0,1];// yellow
    // happens in reverse order
    leftArm.matrix.translate(0.7,0,0);
    leftArm.matrix.rotate(45,0,0,1);
    leftArm.matrix.scale(0.25,0.7,0.5) // happens first
    leftArm.render();
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