import { Application } from '../../common/engine/Application.js';
import { quat, vec3 } from '../../lib/gl-matrix-module.js';

import { GLTFLoader } from './GLTFLoader.js';
import { Node } from './Node.js';
import { PerspectiveCamera } from './PerspectiveCamera.js';
import { Player } from './Player.js';
import { Renderer } from './Renderer.js';
import { GUI } from '../../lib/dat.gui.module.js';
import { Physics } from './Physics.js';
import {Light} from "../90-gltf/Light.js";


class App extends Application {

    async start() {
        this.gameSpeed = 1      * 0.001; // set gamespeed with first number
        this.loader = new GLTFLoader();
        await this.loader.load('../../common/models/map_base_test_prescale/map_base_test_prescale.gltf');

        const scenes = await this.loader.loadScene(this.loader.defaultScene);
        this.scene = await scenes[0];
        console.log((this.scene.nodes[6]));
        this.collisionScene = await scenes[1];

        this.player = new Player();
        this.player.camera = new PerspectiveCamera({node: this.player});
        this.player.updateMatrix();
        this.player.translation = vec3.fromValues(0, 5, 0);

        this.lights = this.scene.getLights();
        this.light = this.lights[0];
        console.log(this.lights);
        this.light.translation = vec3.fromValues(0, 5, 0);
        this.light.updateMatrix();
        this.scene.addNode(this.light);

        this.physics = new Physics(this.collisionScene);

        this.renderer = new Renderer(this.gl);
        this.renderer.prepareScene(this.scene);
        this.resize();

        this.pointerlockchangeHandler = this.pointerlockchangeHandler.bind(this);
        document.addEventListener('pointerlockchange', this.pointerlockchangeHandler);

        this.updateCollisionParams();
    }

    updateCollisionParams() {
        this.collisionScene.traverse(node => {
            /*
            let mb = node.mesh.primitives[0].attributes.POSITION.min;
            let mbb = node.mesh.primitives[0].attributes.POSITION.max;
            
            vec3.transformMat4(mb, mb, b.matrix);
            vec3.transformMat4(mbb, mbb, b.matrix);
            
            node.mesh.primitives[0].attributes.POSITION.min = mb;
            node.mesh.primitives[0].attributes.POSITION.max = mbb;
            */
            let mb = node.mesh.primitives[0].attributes.POSITION.min;
            let mbb = node.mesh.primitives[0].attributes.POSITION.max;
            
    
            vec3.mul(mb, mb, node.scale);
            vec3.mul(mbb, mbb, node.scale); 
        });
    }

    render() {
        if (this.renderer && this.player) {
            this.renderer.render(this.scene, this.player, this.light);
        }
    }

    update() {
        const t = this.time = Date.now();
        const dt = (this.time - this.startTime) * this.gameSpeed;
        this.startTime = this.time;

        if(this.player) {
            this.player.update(dt);
        }

        if (this.physics && this.player) {
            this.physics.update(dt, this.player);
        }
        if(this.light)
            this.light.updateMatrix();
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
    setTimeout(() => {gui.add(app.light, 'ambient', 0.0, 1.0);
        gui.add(app.light, 'diffuse', 0.0, 10.0);
        gui.add(app.light, 'specular', 0.0, 1.0);
        gui.add(app.light, 'shininess', 0.0, 1000.0);
        gui.addColor(app.light, 'color');
        gui.add(app.light.translation, 0, -5, 5.0);
        gui.add(app.light.translation, 1, 0, 10.0);
        gui.add(app.light.translation, 2, -5, 5);
    }, 1000);
});
