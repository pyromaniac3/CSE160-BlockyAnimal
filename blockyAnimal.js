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
    let angleSlider = document.getElementById('angleSlider');
    let armSlider = document.getElementById('arm');
    let wristSlider = document.getElementById('wrist');

    // Add event listeners for slider input changes
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

    // [[ SET UP FUNCTIONS ]]
    setupWebGL();
    connectVariablesToGLSL();
    addActionsForHtmlUI();

    // Set Canvas Color
    gl.clearColor(0,0,0, 1.0);
   
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
    var startTime = performance.now();
    // making the rotational matrix 
    var globalRotMat = new Matrix4().rotate(g_globalAngle,0,1,0); // turn the angle into a matrix
    gl.uniformMatrix4fv(u_GlobalRotateMatrix,false,globalRotMat.elements); // roate it based off that global rotate matrix

    // Clear Canvas
   // gl.clearColor(0,0,0,1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Draw an Animal 

    //#region [[ LEGS ]]
    // Front R leg
    var frThigh = new Cube();
    frThigh.color = [43/255, 39/255, 39/255,1]; // dark brown
    frThigh.matrix.translate(-0.05,-.5,0.15);
    frThigh.matrix.rotate(90,1,0,0);
    frThigh.matrix.scale(0.15,0.15,0.25);
    frThigh.render();

    var frLeg = new Cube();
    frLeg.color = [43/255, 39/255, 39/255,1]; // dark brown
    frLeg.matrix.translate(0,-.75,0.2);
    frLeg.matrix.rotate(90,1,0,0);
    frLeg.matrix.scale(0.05,0.05,0.25);
    frLeg.render();

    var frFoot = new Cube();
    frFoot.color = [43/255, 39/255, 39/255,1]; // dark brown
    frFoot.matrix.translate(0,-0.75,0.185);
    frFoot.matrix.rotate(90,1,0,0);
    frFoot.matrix.scale(0.1,0.08,.05);
    frFoot.render();
    // -----------------------------------------------------
    // Back L leg
    var blThigh = new Cube();
    blThigh.color = [0,1,1,1]; //teal 
    blThigh.matrix.translate(-1,-.5,0.58);
    //var blThighZ = blThigh.matrix.elements[2];
    blThigh.matrix.rotate(90,1,0,0);
    blThigh.matrix.scale(0.15,0.15,0.25);
    blThigh.render();

    var blLeg = new Cube();
    blLeg.color = [0,1,1,1]; //teal 
    blLeg.matrix.translate(-0.95,-0.75,0.6);
    blLeg.matrix.rotate(90,1,0,0);
    blLeg.matrix.scale(0.05,0.05,0.25);
    blLeg.render();

    var blFoot = new Cube();
    blFoot.color = [0,1,1,1]; //teal 
    blFoot.matrix.translate(-0.95,-0.75,0.585);
    blFoot.matrix.rotate(90,1,0,0);
    blFoot.matrix.scale(0.1,0.08,0.05);
    blFoot.render();
    // -----------------------------------------------------
    // Front L leg
    var flThigh = new Cube();
    flThigh.color = [1,1,0,1]; // yellow
    flThigh.matrix.translate(-0.05,-.5,0.35);
    flThigh.matrix.rotate(90,1,0,0);
    flThigh.matrix.scale(0.15,0.15,0.25);
    flThigh.render();

    var flLeg = new Cube();
    flLeg.color = [1,1,0,1]; // yellow
    flLeg.matrix.translate(0,-.75,0.4);
    flLeg.matrix.rotate(90,1,0,0);
    flLeg.matrix.scale(0.05,0.05,0.25);
    flLeg.render();

    var flFoot = new Cube();
    flFoot.color = [1,1,0,1]; // yellow
    flFoot.matrix.translate(0,-0.75,0.385);
    flFoot.matrix.rotate(90,1,0,0);
    flFoot.matrix.scale(0.1,0.08,0.05);
    flFoot.render();
    // -----------------------------------------------------
    // Back R Leg
    var brThigh = new Cube();
    brThigh.color = [1,0,0,1]; // red
    brThigh.matrix.translate(-1,-.5,-0.08);
    brThigh.matrix.rotate(90,1,0,0);
    brThigh.matrix.scale(0.15,0.15,0.25);
    brThigh.render();

    var brLeg = new Cube();
    brLeg.color = [1,0,0,1]; // red
    brLeg.matrix.translate(-0.95,-.75,0);
    brLeg.matrix.rotate(90,1,0,0);
    brLeg.matrix.scale(0.05,0.05,0.25);
    brLeg.render();

    var brFoot = new Cube();
    brFoot.color = [1,0,0,1]; // red
    brFoot.matrix.translate(-0.95,-0.75,-0.015);
    brFoot.matrix.rotate(90,1,0,0);
    brFoot.matrix.scale(0.1,0.08,0.05);
    brFoot.render();
    // -----------------------------------------------------
    //#endregion

    // #region [[ BODY ]]
    var bBody = new Octahedron();;
    // var bBody = new Cube();
    bBody.color = [1,1,1,1];// red
    bBody.matrix.translate(-0.15,0.5,0.4);
    bBody.matrix.rotate(-45,1,0,0.40);
    bBody.matrix.scale(0.55,0.75,0.75) // happens first
    bBody.render();

    var fBody = new Octahedron();;
    // var bBody = new Cube();
    fBody.color = [1,1,1,1];// red
    fBody.matrix.translate(0.15,0.5,0.4);
    fBody.matrix.rotate(45,1,0,0.40);
    fBody.matrix.scale(0.55,0.75,0.75) // happens first
    fBody.render();
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