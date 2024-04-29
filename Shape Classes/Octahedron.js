class Octahedron{
    constructor(){
        this.type = 'octahedron';
        this.color = [1.0,1.0,1.0,1.0];
        this.matrix = new Matrix4();
    }

    render(){
        var rgba = this.color;
        gl.uniform4f(u_FragColor, rgba[0],rgba[1],rgba[2],rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix,false, this.matrix.elements);
        
        // vertices
        let a = [-0.5,-0.5,0]
        let b = [-0.5,0,-0.5]
        let c = [-1,-0.5,-0.5]
        let d = [-0.5,-0.5,-1]
        let e = [-0.5,-1,-0.5]
        let f = [0,-0.5,-0.5]
        // I'm going to label this like the Octahedron die
        // 1 (a,b,c)
        drawTriangle3D([a[0],a[1],a[2], b[0],b[1],b[2], c[0],c[1],c[2]]);

        //2 (c,d,eb
        gl.uniform4f(u_FragColor, rgba[0]*.9,rgba[1]*.9,rgba[2]*.9,rgba[3])
        drawTriangle3D([c[0],c[1],c[2], d[0],d[1],d[2], e[0],e[1],e[2]]);

        //3 (c,b,d)
        gl.uniform4f(u_FragColor, rgba[0]*.8,rgba[1]*.8,rgba[2]*.8,rgba[3])
        drawTriangle3D([c[0],c[1],c[2], b[0],b[1],b[2], d[0],d[1],d[2]]);

        //4 (a,c,e)
        gl.uniform4f(u_FragColor, rgba[0]*.7,rgba[1]*.7,rgba[2]*.7,rgba[3])
        drawTriangle3D([a[0],a[1],a[2], c[0],c[1],c[2], e[0],e[1],e[2]]);

        //5 (d,b,f)
        gl.uniform4f(u_FragColor, rgba[0]*.6,rgba[1]*.6,rgba[2]*.6,rgba[3])
        drawTriangle3D([d[0],d[1],d[2], b[0],b[1],b[2], f[0],f[1],f[2]]);

        //6 (f,a,e)
        gl.uniform4f(u_FragColor, rgba[0]*.5,rgba[1]*.5,rgba[2]*.5,rgba[3])
        drawTriangle3D([f[0],f[1],f[2], a[0],a[1],a[2], e[0],e[1],e[2]]);

        //7 (f,b,a)
        gl.uniform4f(u_FragColor, rgba[0]*.4,rgba[1]*.4,rgba[2]*.4,rgba[3])
        drawTriangle3D([f[0],f[1],f[2], b[0],b[1],b[2], a[0],a[1],a[2]]);

        //8 (d,f,e)
        gl.uniform4f(u_FragColor, rgba[0]*.3,rgba[1]*.3,rgba[2]*.3,rgba[3])
        drawTriangle3D([d[0],d[1],d[2], f[0],f[1],f[2], e[0],e[1],e[2]]);
    }

}