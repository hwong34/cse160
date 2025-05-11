class Cube {
    constructor() {
      this.type = 'cube';
      //this.position = [0.0, 0.0, 0.0];
      this.color = [1.0, 1.0, 1.0, 1.0];
      //this.size = 5.0;
      //this.segments = 10;
      this.matrix = new Matrix4();
      this.textureNum = -1;

      if (!Cube.vertexArray) {
      Cube.vertexArray = new Float32Array([
        0, 0, 0,  1, 1, 0,  1, 0, 0,
        0, 0, 0,  0, 1, 0,  1, 1, 0,

        0, 0, -1,  1, 1, -1,  1, 0, -1,
        0, 0, -1,  0, 1, -1,  1, 1, -1,

        1, 0, 0,  1, 1, 0,  1, 1, -1,
        1, 0, 0,  1, 0, -1,  1, 1, -1,

        0, 0, 0,  0, 1, 0,  0, 1, -1,
        0, 0, 0,  0, 0, -1,  0, 1, -1,

        0, 1, 0,  0, 1, -1,  1, 1, -1,
        0, 1, 0,  1, 1, -1,  1, 1, 0,

        0, 0, 0,  1, 0, 0,  1, 0, -1,
        0, 0, 0,  0, 0, -1,  1, 0, -1,
      ]);

      Cube.uvArray = new Float32Array([
        1, 0,  0, 1,  1, 1,
        0, 0,  0, 1,  1, 1,

        1, 0,  0, 1,  1, 1,
        0, 0,  0, 1,  1, 1,

        1, 0,  0, 1,  1, 1,
        0, 0,  0, 1,  1, 1,

        1, 0,  0, 1,  1, 1,
        0, 0,  0, 1,  1, 1,

        1, 0,  0, 1,  1, 1,
        0, 0,  1, 1,  1, 0,

        0, 0,  1, 0,  1, 1,
        0, 0,  0, 1,  1, 1,
      ]);
    }
    
    }
  
    //render this shape
    render() {
      var rgba = this.color;
      gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);


      if (this.textureNum == null || this.textureNum === -999) {
        gl.uniform1i(u_whichTexture, -999); // or any unused value
        gl.uniform1f(u_TexColorWeight, 0.0); // base color only
      } else {
        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform1f(u_TexColorWeight, 1.0); // texture only
      }
      drawTriangles3DUV( [0,0,0,  1,1,0, 1,0,0], [1,0, 0, 1, 1,1]);
      drawTriangles3DUV( [0,0,0,  0,1,0,  1,1,0], [0,0, 0,1, 1,1]);



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
      
      drawTriangles3D([0.0, 1.0, 0.0,  0.0, 1.0, -1.0,  1.0, 1.0, -1.0]);
      drawTriangles3D([0.0, 1.0, 0.0,  1.0, 1.0, -1.0,  1.0, 1.0, 0.0]);

      // Bottom face
      drawTriangles3D([0.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, -1.0]);
      drawTriangles3D([0.0, 0.0, 0.0,  0.0, 0.0, -1.0,  1.0, 0.0, -1.0]);


      
    }
    
    renderFast() {
      const rgba = this.color;
      gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

      if (this.textureNum == null || this.textureNum === -999) {
        gl.uniform1i(u_whichTexture, -999);
        gl.uniform1f(u_TexColorWeight, 0.0); // base color only
      } else {
        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform1f(u_TexColorWeight, 1.0); // texture only
      }

      let AllVerts = [];
      let AllUVs = [];

      AllVerts = AllVerts.concat([
        0, 0, 0,  1, 1, 0,  1, 0, 0,
        0, 0, 0,  0, 1, 0,  1, 1, 0
      ]);
      AllUVs = AllUVs.concat([
        1, 0,  0, 1,  1, 1,
        0, 0,  0, 1,  1, 1
      ]);

      AllVerts = AllVerts.concat([
        0, 0, -1,  1, 1, -1,  1, 0, -1,
        0, 0, -1,  0, 1, -1,  1, 1, -1
      ]);
      AllUVs = AllUVs.concat([
        1, 0,  0, 1,  1, 1,
        0, 0,  0, 1,  1, 1
      ]);

      AllVerts = AllVerts.concat([
        1, 0, 0,  1, 1, 0,  1, 1, -1,
        1, 0, 0,  1, 0, -1,  1, 1, -1
      ]);
      AllUVs = AllUVs.concat([
        1, 0,  0, 1,  1, 1,
        0, 0,  0, 1,  1, 1
      ]);
      AllVerts = AllVerts.concat([
        0, 0, 0,  0, 1, 0,  0, 1, -1,
        0, 0, 0,  0, 0, -1,  0, 1, -1
      ]);
      AllUVs = AllUVs.concat([
        1, 0,  0, 1,  1, 1,
        0, 0,  0, 1,  1, 1
      ]);

  
      AllVerts = AllVerts.concat([
        0, 1, 0,  0, 1, -1,  1, 1, -1,
        0, 1, 0,  1, 1, -1,  1, 1, 0
      ]);
      AllUVs = AllUVs.concat([
        1, 0,  0, 1,  1, 1,
        0, 0,  1, 1,  1, 0
      ]);

      AllVerts = AllVerts.concat([
        0, 0, 0,  1, 0, 0,  1, 0, -1,
        0, 0, 0,  0, 0, -1,  1, 0, -1
      ]);
      AllUVs = AllUVs.concat([
        0, 0,  1, 0,  1, 1,
        0, 0,  0, 1,  1, 1
      ]);
      drawTriangles3DUV(AllVerts, AllUVs);
    }

    renderFaster() {
      const rgba = this.color;
      gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

      if (this.textureNum == null || this.textureNum === -999) {
        gl.uniform1i(u_whichTexture, -999);
        gl.uniform1f(u_TexColorWeight, 0.0); // base color only
      } else {
        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform1f(u_TexColorWeight, 1.0); // texture only
      }
      drawTriangles3DUV(Cube.vertexArray, Cube.uvArray);
    }


}





