import * as THREE from 'three';
import { setupCamera } from './camera.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';  
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'; 


function createSkybox(scene) {
    const loader = new THREE.TextureLoader();

    const skyTexture = loader.load('resources/textures/sky.jpg');
    const groundTexture = loader.load('resources/textures/grass.jpg');
    const farmBackground = loader.load('resources/textures/farm_background1.jpg');
    const farmBackground2 = loader.load('resources/textures/farm_background2.jpg');
    const farmBackground3 = loader.load('resources/textures/farm_background3.jpg');
    const farmBackground4 = loader.load('resources/textures/farm_background4.jpg');
    skyTexture.colorSpace = THREE.SRGBColorSpace;
    groundTexture.colorSpace = THREE.SRGBColorSpace;
    farmBackground.colorSpace = THREE.SRGColorSpace;
    farmBackground2.colorSpace = THREE.SRGColorSpace;
    farmBackground3.colorSpace = THREE.SRGColorSpace;
    farmBackground4.colorSpace = THREE.SRGColorSpace;
    const materials = [
        new THREE.MeshBasicMaterial({ map: farmBackground3, side: THREE.BackSide }), 
        new THREE.MeshBasicMaterial({ map: farmBackground2, side: THREE.BackSide }), 
        new THREE.MeshBasicMaterial({ map: skyTexture, side: THREE.BackSide }), 
        new THREE.MeshBasicMaterial({ map: groundTexture, side: THREE.BackSide }), 
        new THREE.MeshBasicMaterial({ map: farmBackground, side: THREE.BackSide }), 
        new THREE.MeshBasicMaterial({ map: farmBackground4, side: THREE.BackSide }), 
    ];

    const skyboxGeometry = new THREE.BoxGeometry(20, 10, 20);
    const skybox = new THREE.Mesh(skyboxGeometry, materials);
    scene.add(skybox);
}

// from meshyAI
function loadWindmill(scene) {
    const mtlLoader = new MTLLoader();
    mtlLoader.load('resources/models/windmill/windmill.mtl', (materials) => {
        materials.preload();

        const objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.load('resources/models/windmill/windmill.obj', (object) => {
            object.position.set(4, -4, 4); 
            object.scale.set(1.5, 1.5, 1.5);
            scene.add(object);

            const windmill2 = object.clone(true);
            windmill2.position.set(8, -4, 4);
            scene.add(windmill2);

            const windmill3 = object.clone(true);
            windmill3.position.set(4, -4, 7);
            scene.add(windmill3);

            const windmill4 = object.clone(true);
            windmill4.position.set(8, -4, 7);
            scene.add(windmill4);
        });
    });
}

// from SketchFab
function loadCows(scene) {
    const loader = new GLTFLoader();
    loader.load(
        'resources/models/Cow/cow.glb', 
        function (gltf) {
            gltf.scene.scale.set(0.08, 0.08, 0.08); 
            const cow1 = gltf.scene;
            cow1.position.set(-5.5, -5, -4);
            scene.add(cow1);
            const cow2 = cow1.clone();
            cow2.rotation.y = Math.PI/2;
            cow2.position.set(-7, -5, -2);
            scene.add(cow2);
            const cow3 = cow1.clone();
            cow3.rotation.y = Math.PI;
            cow3.position.set(-3, -5, -4.7);
            scene.add(cow3);
            
        },
        function ( xhr ) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
            console.log("An error occured");
        }
    );
}

// house from fab.com
function loadHouse(scene) {  
    const loader = new GLTFLoader();
    loader.load(
        'resources/models/farmhouse/farm_house.glb', 
        function( gltf ) {
            gltf.scene.scale.set(0.15, 0.15, 0.15); 
            const house = gltf.scene;
            house.position.set(0, -5, 0);
            scene.add(house);
        },
        function ( xhr ) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
            console.log("An error occured");
        }
    );
}

// from Sketchfab
function loadExcavator(scene) {
    const loader = new GLTFLoader();
    loader.load(
        'resources/models/Excavator/excavator_1.glb',
        function( gltf ) {
            gltf.scene.scale.set(0.1, 0.1, 0.1); 
            gltf.scene.rotation.y = Math.PI/2;
            const excavator = gltf.scene;
            excavator.position.set(7, -4.5, -4);
            scene.add(excavator);
        },
        function ( xhr ) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        }, 
        function (error) {
            console.log("An error occured");
        }
    );
}

// from Sketchfab
function loadCar(scene) {
    const loader = new GLTFLoader();

    loader.load(
        'resources/models/Car/suv.glb',
        function (gltf) {
            gltf.scene.scale.set(0.05, 0.05, 0.05);
            gltf.scene.rotation.y = 1.3 * Math.PI;
            const suv = gltf.scene;
            suv.position.set(6, -4.5, 0.1);
            scene.add(suv);
        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
            console.log("An error occurred:", error);
        }
    );
}


function resizeRendererToDisplaySize(renderer) {
	const canvas = renderer.domElement;
	const width = canvas.clientWidth;
	const height = canvas.clientHeight;
	const needResize = canvas.width !== width || canvas.height !== height;
	if (needResize) {
		renderer.setSize(width, height, false);
	}
	return needResize;
}


function main() {
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
    const { camera, controls } = setupCamera(canvas);



    const scene = new THREE.Scene();
    const sphereRadius = 1.5;
    const sphereWidthDivisions = 32;
    const sphereHeightDivisions = 16;
    const sphereGeo = new THREE.SphereGeometry( sphereRadius, sphereWidthDivisions, sphereHeightDivisions );
    const sphereMat = new THREE.MeshPhongMaterial( { color: 0xFFD700, emissive: 0xFF8C00, emissiveIntensity: 1.0 } );
    const mesh = new THREE.Mesh( sphereGeo, sphereMat );
    mesh.position.set(-2, 3, -15);

    scene.add(mesh);
    const pathMaterial = new THREE.MeshPhongMaterial({ color: 0x808080 });
    const pathWidth = 0.5;
    const pathHeight = 0.05;
    const pathLength = 8;

    const path1 = new THREE.BoxGeometry(pathWidth, pathHeight, pathLength);
    const leftPath = new THREE.Mesh(path1, pathMaterial);
    leftPath.position.set(-1, -5, 6);  
    scene.add(leftPath);
    const path2 = new THREE.BoxGeometry(pathWidth, pathHeight, pathLength);
    const rightPath = new THREE.Mesh(path2, pathMaterial);
    rightPath.position.set(1, -5, 6); 
    scene.add(rightPath);    
    const path3 = new THREE.BoxGeometry(pathWidth, pathHeight, pathLength);
    const topLeftPath = new THREE.Mesh(path3, pathMaterial);
    topLeftPath.position.set(-1, -5, -6);  
    scene.add(topLeftPath);
    const path4 = new THREE.BoxGeometry(pathWidth, pathHeight, pathLength);
    const topRightPath = new THREE.Mesh(path4, pathMaterial);
    topRightPath.position.set(1, -5, -6);  
    scene.add(topRightPath);

    const pathMaterial2 = new THREE.MeshPhongMaterial({color : 0x808080});
    const pathWidth2 = 8;
    const pathHeight2 = 0.05;
    const pathLength2 = 0.5;
    const path5 = new THREE.BoxGeometry(pathWidth2, pathHeight2, pathLength2);
    const botPath = new THREE.Mesh(path5, pathMaterial2);
    botPath.position.set(-6, -5, -1);  
    scene.add(botPath);
    const path6 = new THREE.BoxGeometry(pathWidth2, pathHeight2, pathLength2);
    const upPath = new THREE.Mesh(path6, pathMaterial2);
    upPath.position.set(-6, -5, 1);  
    scene.add(upPath);
    const path7 = new THREE.BoxGeometry(pathWidth2, pathHeight2, pathLength2);
    const upPath2 = new THREE.Mesh(path7, pathMaterial2);
    upPath2.position.set(6, -5, -1);  
    scene.add(upPath2);
    const path8 = new THREE.BoxGeometry(pathWidth2, pathHeight2, pathLength2);
    const botPath2 = new THREE.Mesh(path8, pathMaterial2);
    botPath2.position.set(6, -5, 1);  
    scene.add(botPath2);

    const radiusTop = 0.75;
    const radiusBottom = 0.75;  
    const height = 3; 
    const radialSegments = 16;  
    const textureLoader = new THREE.TextureLoader();
    const ironTexture = textureLoader.load('resources/textures/iron.jpg');

    // cylinder storage silos
    const cylinderGeometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments);
    const cylinderMaterial = new THREE.MeshStandardMaterial({ map: ironTexture });
    const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    cylinder.position.set(-7, -3.5, 7);
    scene.add(cylinder);
    const cylinder2 = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    cylinder2.position.set(-4, -3.5, 7);
    scene.add(cylinder2);

    const dirtTexture = textureLoader.load('resources/textures/dirt.jpg');
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const dirtMaterial = new THREE.MeshBasicMaterial({ map: dirtTexture }); 
    const cube = new THREE.Mesh(cubeGeometry, dirtMaterial);
    cube.position.set(4, -4.5, -3);
    scene.add(cube);
    const cube1 = new THREE.Mesh(cubeGeometry, dirtMaterial);
    cube1.position.set(4, -4.5, -4.5);
    scene.add(cube1);


    createSkybox(scene);
    loadWindmill(scene);
    loadCows(scene);
    loadHouse(scene);
    loadExcavator(scene);
    loadCar(scene);
    const light = new THREE.DirectionalLight(0xFFFFFF, 3);
    light.position.set(-1, 2, 4);
    scene.add(light);
    
    const sunLight = new THREE.PointLight(0xFFA500, 1.5, 50);
    sunLight.position.copy(mesh.position); 
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    function render(time) {
        time *= 0.001;
        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }
        const radius = 5;
        const sunX = Math.sin(time) * 1.8 *radius;
        const sunY = Math.cos(time) * 1.4 *radius;
        const sunZ = -8; 

        mesh.position.set(sunX, sunY, sunZ);
        sunLight.position.copy(mesh.position);
 
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

main();
