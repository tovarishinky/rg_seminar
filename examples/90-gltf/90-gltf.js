import { Application } from '../../common/engine/Application.js';
import { quat, vec3 } from '../../lib/gl-matrix-module.js';

import { GLTFLoader } from './GLTFLoader.js';
import { Node } from './Node.js';
import { PerspectiveCamera } from './PerspectiveCamera.js';
import { Player } from './Player.js';
import { Renderer } from './Renderer.js';
import { GUI } from '../../lib/dat.gui.module.js';
import { Physics } from './Physics.js';
import { Light } from "../90-gltf/Light.js";
import { BlockMover } from './BlockMover.js';
import { ParticleMover } from './ParticleMover.js';
import { PickupMover } from './PickupMover.js';
import { TrapMover } from './trapMover.js';


class App extends Application {

    async start() {
        // UI
        this.initDoor();
        this.coins = 0;

        this.gameSpeed = 1 * 0.001; // set gamespeed with first number
        this.loader = new GLTFLoader();
        await this.loader.load('../../common/models/map1_test/map1_test.gltf');

        const scenes = await this.loader.loadScene(this.loader.defaultScene);
        this.scene = await scenes[0];
        this.collisionScene = await scenes[1];

        this.player = new Player({"app": this});
        this.player.camera = new PerspectiveCamera({ node: this.player });
        this.player.updateMatrix();
        this.player.translation = vec3.fromValues(0,5,0); // -3,10,-55 end coords (lvl1) // 5,2,-45 lvl2

        this.trapMover = new TrapMover(this.scene, this.collisionScene);

        this.lights = this.scene.getLights();
        this.lights[0].color = [248, 141, 51];
        this.lights[1].color = [248, 141, 51];
        this.lights[2].color = [248, 141, 51];
        this.lights[3].color = [248, 141, 51];
        this.flame();

        this.physics = new Physics(this.collisionScene, this.scene, this);

        this.renderer = new Renderer(this.gl);
        this.renderer.prepareScene(this.scene);
        this.resize();

        this.pointerlockchangeHandler = this.pointerlockchangeHandler.bind(this);
        document.addEventListener('pointerlockchange', this.pointerlockchangeHandler);

        this.updateCollisionParams();
        // console.log(this.scene);
        // console.log(this.collisionScene);

        // block Mover

        //console.log(this.scene);
        //console.log(this.collisionScene);
        this.pm = new ParticleMover(this.scene);
        this.pickupM = new PickupMover(this.scene);
        this.svetlost=1.5;

    }

    async newLvl() {
        // UI
        this.player.lvl1 = false;
        this.initDoor();
        this.coins = 0;

        this.gameSpeed = 1 * 0.001; // set gamespeed with first number
        this.loader = new GLTFLoader();
        await this.loader.load('../../common/models/map2_test/map2_test.gltf');

        const scenes = await this.loader.loadScene(this.loader.defaultScene);
        this.scene = await scenes[0];
        this.collisionScene = await scenes[1];

        this.player.camera = new PerspectiveCamera({ node: this.player });

        this.player.translation = vec3.fromValues(0,5,0);
        this.player.updateMatrix();

        this.trapMover = new TrapMover(this.scene, this.collisionScene);

        this.lights = this.scene.getLights();
        this.light = this.lights[0];
        this.lights[0].color = [248, 141, 51];
        this.lights[1].color = [248, 141, 51];
        this.lights[2].color = [248, 141, 51];
        this.lights[3].color = [248, 141, 51];
        this.flame();

        this.physics = new Physics(this.collisionScene, this.scene, this);

        this.renderer = new Renderer(this.gl);
        this.renderer.prepareScene(this.scene);
        this.resize();

        this.updateCollisionParams();
        console.log(this.scene);
        console.log(this.collisionScene);

        // block Mover

        //console.log(this.scene);
        //console.log(this.collisionScene);
        this.pm = new ParticleMover(this.scene);
        this.pickupM = new PickupMover(this.scene);
    }

    async gameComplete() {
        document.getElementById("door").innerHTML = `Congratulations, you found the treasure. You are free to explore the level more, or select "Back" to return to the Main Menu.`;
    }


    updateCoins() {
        document.getElementById("coin").innerHTML = "COINS: " + this.coins;
    }

    initDoor() {
        document.getElementById("door").innerHTML = "";
    }

    alertDoor() {
        document.getElementById("door").innerHTML = "  You sense a door opening ...  ";
        setTimeout(()=> { this.initDoor() }, 6000);
    }




    updateCollisionParams() {
        this.collisionScene.traverse(node => {

            let mb = node.mesh.primitives[0].attributes.POSITION.min;
            let mbb = node.mesh.primitives[0].attributes.POSITION.max;


            vec3.mul(mb, mb, node.scale);
            vec3.mul(mbb, mbb, node.scale);
        });
    }

    incrLight(dt) {
        if (this.svetlost && this.svetlost < 10) {
            this.svetlost += 4 * dt;
            this.lights[0].ambientHand += 4 * dt;
        }
    }

    decrLight(dt) {
        if (this.svetlost && this.svetlost > 0.001) {
            this.svetlost -= 4 * dt;
            this.lights[0].ambientHand -= 4 * dt;
        }
    }

    render() {
        if (this.renderer && this.player) {
            this.renderer.render(this.scene, this.player, this.lights);
        }
    }

    update() {
        const t = this.time = Date.now();
        const dt = (this.time - this.startTime) * this.gameSpeed;
        this.startTime = this.time;

        if (this.player) {
            this.player.update(dt);
        }

        if (this.physics && this.player) {
            this.physics.update(dt, this.player);
        }
        if (this.lights) {
            for (let i = 0; i < this.lights.length; i++) {
                this.lights[i].updateMatrix();
            }
        }

        if (this.bm) {
            //this.bm.TestMove('CubeText.001', "aabb_004");
        }
        if (this.pm) {
            this.pm.update(dt);
        }
        if (this.pickupM) {
            this.pickupM.update(dt);
        }

        if (this.trapMover) {
            this.trapMover.update(dt);
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

    async flame(){
        //barva plamena
        let flameColor=[245,154,80];
        // r,g,b so za koliko se random spreminjajo barve rgb
        let r=40;
        let g=10;
        let b=10;
        //za koliko se spreminja svetlost
        let sprememba_svetlosti=0.5;
        //stalna svetlost
        let svetlost=1.5;

        for (let i = 0; i < this.lights.length; i++) {
            if(this.lights[i].name=="LightBrazier"){
                svetlost=10;
            }
            if(i==0&&this.svetlost!=undefined){
                svetlost=this.svetlost;
            }
            this.lights[i].diffuse=svetlost+(Math.random()*sprememba_svetlosti-sprememba_svetlosti/2);
            this.lights[i].color=[flameColor[0]+(Math.random()*r-r/2),flameColor[1]+(Math.random()*g-g/2),flameColor[2]+(Math.random()*b-b/2)];
            svetlost=1.5;
        }


        //zakasnitev
        let time=30
        //za koliko lahko čas naraste
        let time_change=150
        setTimeout(() => {this.flame();},time+Math.random()*time_change);

    }

}





document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.querySelector('canvas');
    const app = new App(canvas);
    const gui = new GUI();
    gui.add(app, 'enableCamera');
    // setTimeout(() => {
    //     gui.add(app.light, 'ambient', 0.0, 1.0);
    //     gui.add(app.light, 'diffuse', 0.0, 10.0);
    //     gui.add(app.light, 'specular', 0.0, 1.0);
    //     gui.add(app.light, 'shininess', 0.0, 1000.0);
    //     gui.addColor(app.light, 'color');
    //     gui.add(app.light.translation, 0, -5, 5.0);
    //     gui.add(app.light.translation, 1, 0, 10.0);
    //     gui.add(app.light.translation, 2, -5, 5);
    // }, 5000);
});