import { Application } from '../../common/engine/Application.js';
import { quat, vec3 } from '../../lib/gl-matrix-module.js';

import { GLTFLoader } from './GLTFLoader.js';
import { Node } from './Node.js';
import { PerspectiveCamera } from './PerspectiveCamera.js';
import { Player } from './Player.js';
import { Renderer } from './Renderer.js';
import { GUI } from '../../lib/dat.gui.module.js';
import { Physics } from './Physics.js';


class App extends Application {

    async start() {
        this.loader = new GLTFLoader();
        await this.loader.load('../../common/models/testmap/testmap.gltf');

        const scenes = await this.loader.loadScene(this.loader.defaultScene);
        this.scene = await scenes[0];
        this.collisionScene = await scenes[1];

        this.player = new Player();
        this.player.camera = new PerspectiveCamera({node: this.player});
        this.player.updateMatrix();
        this.player.translation = vec3.fromValues(4, 10, 4);
        
        this.physics = new Physics(this.collisionScene);

        this.renderer = new Renderer(this.gl);
        this.renderer.prepareScene(this.scene);
        this.resize();

        this.pointerlockchangeHandler = this.pointerlockchangeHandler.bind(this);
        document.addEventListener('pointerlockchange', this.pointerlockchangeHandler);
    }

    render() {
        if (this.renderer && this.player) {
            this.renderer.render(this.scene, this.player);
        }
    }

    update() {
        const t = this.time = Date.now();
        const dt = (this.time - this.startTime) * 0.001;
        this.startTime = this.time;

        if(this.player) {
            this.player.update(dt);
        }

        if (this.physics && this.player) {
            this.physics.update(dt, this.player);
        }
    }

    resize() {
        const w = this.canvas.clientWidth;
        const h = this.canvas.clientHeight;
        const aspectRatio = w / h;

        if (this.player) {
            this.player.camera.aspect = aspectRatio;
            this.player.camera.updateMatrix();
        }
    }

    enableCamera() {
        this.canvas.requestPointerLock();
    }  
    
    pointerlockchangeHandler() {
        if (!this.player) {
            return;
        }

        if (document.pointerLockElement === this.canvas) {
            this.player.enableCam();
        } else {
            this.player.disableCam();
        }
    }

}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.querySelector('canvas');
    const app = new App(canvas);
    const gui = new GUI();
    gui.add(app, 'enableCamera');
});
