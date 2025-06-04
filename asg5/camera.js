import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

export function setupCamera(canvas) {
    const fov = 40;
    const aspect = canvas.clientWidth / canvas.clientHeight;
    const near = 0.1;
    const far = 90;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 1.5, 20);

    class MinMaxGUIHelper {
        constructor(obj, minProp, maxProp, minDif) {
            this.obj = obj;
            this.minProp = minProp;
            this.maxProp = maxProp;
            this.minDif = minDif;
        }
        get min() {
            return this.obj[this.minProp];
        }
        set min(v) {
            this.obj[this.minProp] = v;
            this.obj[this.maxProp] = Math.max(this.obj[this.maxProp], v + this.minDif);
        }
        get max() {
            return this.obj[this.maxProp];
        }
        set max(v) {
            this.obj[this.maxProp] = v;
            this.min = this.min;
        }
    }

    const gui = new GUI();
    gui.add(camera, 'fov', 1, 180).onChange(() => camera.updateProjectionMatrix());
    const minMaxGUIHelper = new MinMaxGUIHelper(camera, 'near', 'far', 0.1);
    gui.add(minMaxGUIHelper, 'min', 0.1, 50, 0.1).name('near').onChange(() => camera.updateProjectionMatrix());
    gui.add(minMaxGUIHelper, 'max', 0.1, 50, 0.1).name('far').onChange(() => camera.updateProjectionMatrix());

    const controls = new OrbitControls(camera, canvas);

    controls.target.set(0, -3, 0);
    controls.update();


    return { camera, controls };
}
