function drawVector(v, color) {
    var canvas = document.getElementById('example');
    if (!canvas) {
        console.log('Failed to retrieve the <canvas> element');
        return;
    }
    // Get the rendering context for 2DCG                          <- (2)
    var ctx = canvas.getContext('2d');
    var xpoint = 200;
    var ypoint = 200;
    var scale = 20;
    var scaledX = v.elements[0] * scale
    var scaledY = v.elements[1] * scale
    ctx.strokeStyle = color;

    ctx.beginPath();
    ctx.moveTo(xpoint, ypoint);
    ctx.lineTo(xpoint + scaledX, ypoint - scaledY);
    ctx.stroke();
}

function handleDrawEvent() {
    var canvas = document.getElementById('example');
    if (!canvas) {
        console.log('Failed to retrieve the <canvas> element');
        return;
    }
    // Get the rendering context for 2DCG                          <- (2)
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,400,400);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    var x = parseFloat(document.getElementById("xInput").value);
    var y = parseFloat(document.getElementById("yInput").value);
    var v1 = new Vector3([x, y, 0]);
    drawVector(v1, "red");
    var x1 = parseFloat(document.getElementById("xInput1").value);
    var y1 = parseFloat(document.getElementById("yInput1").value);
    var v2 = new Vector3([x1, y1, 0]);
    drawVector(v2, "blue");
}

function handleDrawOperationEvent() {
    var canvas = document.getElementById('example');
    if (!canvas) {
        console.log('Failed to retrieve the <canvas> element');
        return;
    }
    // Get the rendering context for 2DCG                          <- (2)
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,400,400);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    var x = parseFloat(document.getElementById("xInput").value);
    var y = parseFloat(document.getElementById("yInput").value);
    var v1 = new Vector3([x, y, 0]);
    drawVector(v1, "red");
    var x1 = parseFloat(document.getElementById("xInput1").value);
    var y1 = parseFloat(document.getElementById("yInput1").value);
    var v2 = new Vector3([x1, y1, 0]);
    drawVector(v2, "blue");

    var operation = document.getElementById("operation").value;
    var scalar = parseFloat(document.getElementById("scalarInput").value);

    if (operation === "add") {
        var v3 = new Vector3([...v1.elements]);
        v3.add(v2);  
        drawVector(v3, "green");
    } else if (operation === "sub") {
        var v3 = new Vector3([...v1.elements]);
        v3.sub(v2);  
        drawVector(v3, "green");
    } else if (operation === "mul") {
        var v3 = new Vector3([...v1.elements]);
        v3.mul(scalar); 
        drawVector(v3, "green");
        var v4 = new Vector3([...v2.elements]);
        v4.mul(scalar);  
        drawVector(v4, "green");
    } else if (operation === "div") {
        if (scalar !== 0) {
            var v3 = new Vector3([...v1.elements]);
            v3.div(scalar); 
            drawVector(v3, "green");
            var v4 = new Vector3([...v2.elements]);
            v4.div(scalar);  
            drawVector(v4, "green");
        } else {
            console.log("Cannot divide by zero.");
        }
    } else if (operation == "magnitude") {
        var v3 = new Vector3([...v1.elements]);
        console.log("Magnitude of v1:", v1.magnitude());
        console.log("Magnitude of v2:", v2.magnitude());
    } else if (operation == "normalize") {
        v1.normalize();
        v2.normalize();
        drawVector(v1, "green");
        drawVector(v2, "green");
    } else if (operation == "Angle Between") {
        console.log("Angle:", angleBetween(v1, v2));
    } else if (operation == "Area") {
        console.log("Area of a triangle:", areaTriangle(v1, v2));
    }
}

function angleBetween(v1, v2) {
    var dotProduct = Vector3.dot(v1, v2);
    var magV1 = v1.magnitude();
    var magV2 = v2.magnitude();
    var cosTheta = dotProduct / (magV1 * magV2);
    cosTheta = Math.max(-1, Math.min(1, cosTheta));
    var angle = Math.acos(cosTheta);
    var angleinDegrees = angle * (180 / Math.PI);
    return angleinDegrees;
}

function areaTriangle(v1, v2) {
    var cProduct = Vector3.cross(v1, v2);
    var magnitude = Math.sqrt(
        cProduct.elements[0]**2 +
        cProduct.elements[1]**2 + 
        cProduct.elements[2]**2
    );
    var area = magnitude / 2;
    return area;
}

function main() {
    // Retrieve <canvas> element                                  <- (1)
    var canvas = document.getElementById('example');
    if (!canvas) {
        console.log('Failed to retrieve the <canvas> element');
        return;
    }
    // Get the rendering context for 2DCG                          <- (2)
    var ctx = canvas.getContext('2d');
    var v1 = new Vector3([2.25,2.25,0]);
    // Draw a blue rectangle                                       <- (3)
    ctx.fillStyle = 'rgba(0, 0, 255, 1.0)'; // Set a blue color
    ctx.fillRect(120, 10, 150, 150); // Fill a rectangle with the color
    ctx.clearRect(0, 0, 400, 400);
    drawVector(v1, "red");
    handleDrawEvent();
    handleDrawOperationEvent();
}