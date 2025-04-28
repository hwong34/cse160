class Cube {
    constructor() {
      this.type = 'cube';
      //this.position = [0.0, 0.0, 0.0];
      this.color = [1.0, 1.0, 1.0, 1.0];
      //this.size = 5.0;
      //this.segments = 10;
      this.matrix = new Matrix4();
    }
  
    //render this shape
    render() {

      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
      drawCube(this.matrix, this.color);
      

      
    }
}


function drawCube(M, color) {
  // Pass the matrix to the vertex shader
  gl.uniformMatrix4fv(u_ModelMatrix, false, M.elements);

  gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);
  // Define all six faces of the cube

  // Front face
  drawTriangles3D([0.0, 0.0, 0.0,  1.0, 1.0, 0.0,  1.0, 0.0, 0.0]);
  drawTriangles3D([0.0, 0.0, 0.0,  0.0, 1.0, 0.0,  1.0, 1.0, 0.0]);

  // Back face
  drawTriangles3D([0.0, 0.0, -1.0,  1.0, 1.0, -1.0,  1.0, 0.0, -1.0]);
  drawTriangles3D([0.0, 0.0, -1.0,  0.0, 1.0, -1.0,  1.0, 1.0, -1.0]);

  // Right face
  drawTriangles3D([1.0, 0.0, 0.0,  1.0, 1.0, 0.0,  1.0, 1.0, -1.0]);
  drawTriangles3D([1.0, 0.0, 0.0,  1.0, 0.0, -1.0,  1.0, 1.0, -1.0]);

  // Left face
  drawTriangles3D([0.0, 0.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, -1.0]);
  drawTriangles3D([0.0, 0.0, 0.0,  0.0, 0.0, -1.0,  0.0, 1.0, -1.0]);

  // Top face
  drawTriangles3D([0.0, 1.0, 0.0,  1.0, 1.0, 0.0,  1.0, 1.0, -1.0]);
  drawTriangles3D([0.0, 1.0, 0.0,  0.0, 1.0, -1.0,  1.0, 1.0, -1.0]);

  // Bottom face
  drawTriangles3D([0.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, -1.0]);
  drawTriangles3D([0.0, 0.0, 0.0,  0.0, 0.0, -1.0,  1.0, 0.0, -1.0]);
}



