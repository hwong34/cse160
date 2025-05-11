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
        // Front face
        0, 0, 0,  1, 1, 0,  1, 0, 0,
        0, 0, 0,  0, 1, 0,  1, 1, 0,

        // Back face
        0, 0, -1,  1, 1, -1,  1, 0, -1,
        0, 0, -1,  0, 1, -1,  1, 1, -1,

        // Right face
        1, 0, 0,  1, 1, 0,  1, 1, -1,
        1, 0, 0,  1, 0, -1,  1, 1, -1,

        // Left face
        0, 0, 0,  0, 1, 0,  0, 1, -1,
        0, 0, 0,  0, 0, -1,  0, 1, -1,

        // Top face
        0, 1, 0,  0, 1, -1,  1, 1, -1,
        0, 1, 0,  1, 1, -1,  1, 1, 0,

        // Bottom face
        0, 0, 0,  1, 0, 0,  1, 0, -1,
        0, 0, 0,  0, 0, -1,  1, 0, -1,
      ]);

      Cube.uvArray = new Float32Array([
        // Front
        1, 0,  0, 1,  1, 1,
        0, 0,  0, 1,  1, 1,

        // Back
        1, 0,  0, 1,  1, 1,
        0, 0,  0, 1,  1, 1,

        // Right
        1, 0,  0, 1,  1, 1,
        0, 0,  0, 1,  1, 1,

        // Left
        1, 0,  0, 1,  1, 1,
        0, 0,  0, 1,  1, 1,

        // Top
        1, 0,  0, 1,  1, 1,
        0, 0,  1, 1,  1, 0,

        // Bottom
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

      // Texture setup
      if (this.textureNum == null || this.textureNum === -999) {
        gl.uniform1i(u_whichTexture, -999);
        gl.uniform1f(u_TexColorWeight, 0.0); // base color only
      } else {
        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform1f(u_TexColorWeight, 1.0); // texture only
      }

      let AllVerts = [];
      let AllUVs = [];

      // Define 6 cube faces — 2 triangles per face

      // Front face (z = 0)
      AllVerts = AllVerts.concat([
        0, 0, 0,  1, 1, 0,  1, 0, 0,
        0, 0, 0,  0, 1, 0,  1, 1, 0
      ]);
      AllUVs = AllUVs.concat([
        1, 0,  0, 1,  1, 1,
        0, 0,  0, 1,  1, 1
      ]);

      // Back face (z = -1)
      AllVerts = AllVerts.concat([
        0, 0, -1,  1, 1, -1,  1, 0, -1,
        0, 0, -1,  0, 1, -1,  1, 1, -1
      ]);
      AllUVs = AllUVs.concat([
        1, 0,  0, 1,  1, 1,
        0, 0,  0, 1,  1, 1
      ]);

      // Right face (x = 1)
      AllVerts = AllVerts.concat([
        1, 0, 0,  1, 1, 0,  1, 1, -1,
        1, 0, 0,  1, 0, -1,  1, 1, -1
      ]);
      AllUVs = AllUVs.concat([
        1, 0,  0, 1,  1, 1,
        0, 0,  0, 1,  1, 1
      ]);

      // Left face (x = 0)
      AllVerts = AllVerts.concat([
        0, 0, 0,  0, 1, 0,  0, 1, -1,
        0, 0, 0,  0, 0, -1,  0, 1, -1
      ]);
      AllUVs = AllUVs.concat([
        1, 0,  0, 1,  1, 1,
        0, 0,  0, 1,  1, 1
      ]);

      // Top face (y = 1)
      AllVerts = AllVerts.concat([
        0, 1, 0,  0, 1, -1,  1, 1, -1,
        0, 1, 0,  1, 1, -1,  1, 1, 0
      ]);
      AllUVs = AllUVs.concat([
        1, 0,  0, 1,  1, 1,
        0, 0,  1, 1,  1, 0
      ]);

      // Bottom face (y = 0)
      AllVerts = AllVerts.concat([
        0, 0, 0,  1, 0, 0,  1, 0, -1,
        0, 0, 0,  0, 0, -1,  1, 0, -1
      ]);
      AllUVs = AllUVs.concat([
        0, 0,  1, 0,  1, 1,
        0, 0,  0, 1,  1, 1
      ]);

      // Single draw call
      drawTriangles3DUV(AllVerts, AllUVs);
    }

    renderFaster() {
      const rgba = this.color;
      gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

      // Texture setup
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

/*
var g_eye = [0, 0, 3];
var g_at = [0, 0, 100];
var g_up = [0, 1, 0];
document.onkeydown = keydown;

function keydown(ev) {
  if (ev.keyCode == 39) {
    g_eye[0] += 0.2;
  } else 
  if (ev.keyCode == 37) {
    g_eye[0] -= 0.2;
  }
  renderScene();
  console.log(ev.keyCode);
}
ViewMat.setLookAt(g_eye[0], g_eye[1], g_eye[2], g_at[0], g_at[1], g_at[2], g_up[0], g_up[1], g_up[2]);

  var floor = new Cube();
  floor.color = [1.0, 1.0, 1.0, 1.0];
  floor.textureNum = 0;
  floor.translate(0, -.75, 0);
  floor.scale(10, 0, 10);
*/





