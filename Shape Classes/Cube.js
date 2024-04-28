class Cube{
    constructor(){
        this.type = 'cube';
        this.color = [1.0,1.0,1.0,1.0];
        this.matrix = new Matrix4();
    }

    render(){
        var rgba = this.color;
        gl.uniform4f(u_FragColor, rgba[0],rgba[1],rgba[2],rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix,false, this.matrix.elements);
        //vertices:
            //a (0,0,0),  b (1,0,0),  c (1,1,0),  d (0,1,0), 
            //e (0,0,-1), f (1,0,-1), g (1,1,-1), h (0,1,-1),

        //Front of Cube 
        drawTriangle3D([0.0,0.0,0.0 , 1.0,1.0,0.0 , 1.0,0.0,0.0]);
        drawTriangle3D([0.0,0.0,0.0 , 0.0,1.0,0.0 , 1.0,1.0,0.0]);

        //Back of Cube
        drawTriangle3D([0.0,0.0,-1.0 , 1.0,1.0,-1.0 , 1.0,0.0,-1.0]);
        drawTriangle3D([0.0,0.0,-1.0 , 0.0,1.0,-1.0 , 1.0,1.0,-1.0]);

        //Top of Cube
        gl.uniform4f(u_FragColor, rgba[0]*.9,rgba[1]*.9,rgba[2]*.9,rgba[3])
        drawTriangle3D([0.0,1.0,0.0 , 1.0,1.0,-1.0 , 1.0,1.0, 0.0]);
        drawTriangle3D([0.0,1.0,0.0 , 0.0,1.0,-1.0 , 1.0,1.0,-1.0]);

        //Bottom of Cube
        gl.uniform4f(u_FragColor, rgba[0]*.8,rgba[1]*.8,rgba[2]*.8,rgba[3])
        drawTriangle3D([0.0,0.0,0.0 , 1.0,0.0,-1.0 , 1.0,0.0, 0.0]);
        drawTriangle3D([0.0,0.0,0.0 , 0.0,0.0,-1.0 , 1.0,0.0,-1.0]);

        //R Side of Cube 
        gl.uniform4f(u_FragColor, rgba[0]*.7,rgba[1]*.7,rgba[2]*.7,rgba[3])
        drawTriangle3D([0.0,0.0,0.0 , 0.0,1.0,-1.0 , 0.0,1.0, 0.0]);
        drawTriangle3D([0.0,0.0,0.0 , 0.0,0.0,-1.0 , 0.0,1.0,-1.0]);

        //L Side of Cube
        gl.uniform4f(u_FragColor, rgba[0]*.6,rgba[1]*.6,rgba[2]*.6,rgba[3])
        drawTriangle3D([1.0,0.0,0.0 , 1.0,1.0,-1.0 , 1.0,1.0, 0.0]);
        drawTriangle3D([1.0,0.0,0.0 , 1.0,0.0,-1.0 , 1.0,1.0,-1.0]);
    }

}