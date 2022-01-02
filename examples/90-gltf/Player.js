import { mat4, quat, vec3 } from "../../lib/gl-matrix-module.js";
import { Node } from "./Node.js";

export class Player extends Node {
    constructor(options = {}) {
        super(options);

        this.dims = { width: 0.6, height: 1.8, length: 0.6 }; // set collision box for player
        this.gravity = -5; // set gravity
        this.jumpHeight = 12; // set Jump
        this.walkSpeed = 6; // set max walking speed
        this.sprintSpeed = 8; // set max sprinting speed
        this.mvAcc = 15; // set move acceleration TODO not implemeted yet
        this.acceleration = 5; // set acceleration
        this.maxSpeed = this.walkSpeed;

        this.mousemoveHandler = this.mousemoveHandler.bind(this);
        this.keydownHandler = this.keydownHandler.bind(this);
        this.keyupHandler = this.keyupHandler.bind(this);
        this.keys = {};
        this.falling = false;
        this.waitForJump = false;
        this.sprint = false;
        this.player = null;

        this.autoJump = false;
        this.velocity = [0, 0, 0];
        this.mouseSensitivity = 0.002;
        this.friction = 0.2;
        this.airFriction = 0.02;
        this.collisionMin = [-this.dims.width / 2, -this.dims.height, -this.dims.length / 2]; // collisionbox
        this.collisionMax = [this.dims.width / 2, 0.2, this.dims.length / 2]; // collisionbox
        this.feet = {
            min: [
                this.collisionMin[0] + 0.2,
                this.collisionMin[1] - 0.1,
                this.collisionMin[2] + 0.2
            ],
            max: [
                this.collisionMax[0] - 0.2,
                this.collisionMax[1] + 0.1,
                this.collisionMax[2] - 0.2
            ]
        };

        setInterval(() => {
            console.log(
                'x: ', Math.round(this.translation[0]).toString(),
                '\ny: ', Math.round(this.translation[1]).toString(),
                '\nz: ', Math.round(this.translation[2]).toString(),
                '\nspeed: ', this.velocity)
        }, 500); // TODO remove - debug
    }

    setFeet(ft) {
        this.feet = ft;
        console.log(this.feet);
    }

    getPlayer() {
        this.player = this.children[0];
    }

    updateProjection() {
        mat4.perspective(this.projection, this.fov, this.aspect, this.near, this.far);
    }

    update(dt) {
        const c = this;
        // TODO falling boolean


        const forward = vec3.set(vec3.create(), -Math.sin(c.rotation[1]) * this.mvAcc, 0, -Math.cos(c.rotation[1]) * this.mvAcc);
        const right = vec3.set(vec3.create(),
            Math.cos(c.rotation[1]) * this.mvAcc, 0, -Math.sin(c.rotation[1]) * this.mvAcc);
        const up = vec3.set(vec3.create(), 0, c.jumpHeight, 0); // set jump height
        const down = vec3.set(vec3.create(), 0, c.gravity, 0);

        // 1: add movement acceleration
        let acc = vec3.create();
        if (this.keys['KeyW']) {
            vec3.add(acc, acc, forward);
        }
        if (this.keys['KeyS']) {
            vec3.sub(acc, acc, forward);
        }
        if (this.keys['KeyD']) {
            vec3.add(acc, acc, right);
        }
        if (this.keys['KeyA']) {
            vec3.sub(acc, acc, right);
        }
        if (this.keys['ShiftLeft']) {
            this.sprint = true;
            c.maxSpeed = c.sprintSpeed;
        }
        if (!this.keys['ShiftLeft']) {
            this.sprint = false;
            c.maxSpeed = c.walkSpeed;
        }

        // verti move
        if (!this.falling && !this.waitForJump && this.keys['Space']) {
            this.waitForJump = true;
            vec3.set(c.velocity, c.velocity[0], up[1], c.velocity[2]); // use add for jump dependend on landing (if you jump after landing you get a penalty)
            setTimeout(() => { this.waitForJump = false; }, 700); // wawit 0.7s for next jump
        }
        if (this.falling) { // gravity
            vec3.add(acc, acc, down);
        }
        //console.log(this.autoJump);
        if (this.autoJump) {
            //this.waitForJump = true;
            vec3.set(c.velocity, c.velocity[0], up[1] * 0.2, c.velocity[2]);
            this.autoJump = false;
        }



        // 2: update velocity
        vec3.scaleAndAdd(c.velocity, c.velocity, acc, dt * c.acceleration);

        // 3: if no movement and on ground(falling = false), apply friction
        if (!this.keys['KeyW'] &&
            !this.keys['KeyS'] &&
            !this.keys['KeyD'] &&
            !this.keys['KeyA'] &&
            !this.keys['Space']) {
            const yVelocity = c.velocity[1];
            if (this.falling) {
                vec3.scale(c.velocity, c.velocity, 1 - c.airFriction);

            } else {
                vec3.scale(c.velocity, c.velocity, 1 - c.friction);
            }
            c.velocity[1] = yVelocity;
        }

        if (!this.falling) {
            vec3.set(c.velocity, c.velocity[0], Math.max(c.velocity[1], -1), c.velocity[2]);
        }

        // 4: limit horizontal speed
        const len = vec3.len(vec3.set(vec3.create(), c.velocity[0], 0, c.velocity[2]));
        if (len > c.maxSpeed) {
            vec3.mul(c.velocity, c.velocity, vec3.set(vec3.create(), c.maxSpeed / len, 1, c.maxSpeed / len));
        }
    }

    enableCam() {
        document.addEventListener('mousemove', this.mousemoveHandler);
        document.addEventListener('keydown', this.keydownHandler);
        document.addEventListener('keyup', this.keyupHandler);
    }

    disableCam() {
        document.removeEventListener('mousemove', this.mousemoveHandler);
        document.removeEventListener('keydown', this.keydownHandler);
        document.removeEventListener('keyup', this.keyupHandler);

        for (let key in this.keys) {
            this.keys[key] = false;
        }
    }

    mousemoveHandler(e) {
        const p = this;
        const dx = e.movementX * p.mouseSensitivity;
        const dy = e.movementY * p.mouseSensitivity;

        p.rotation[0] -= dy;
        p.rotation[1] -= dx;
        //c.player.rotation[0] += dy * c.mouseSensitivity;  // dont turn player (unturn) if you look up, only about Y

        const pi = Math.PI;
        const twopi = pi * 2;
        const halfpi = pi / 2;
        if (p.rotation[0] > halfpi) {
            p.rotation[0] = halfpi;
        }
        if (p.rotation[0] < -halfpi) {
            p.rotation[0] = -halfpi;
        }

        p.rotation[1] = ((p.rotation[1] % twopi) + twopi) % twopi;
    }

    updateMatrix() {
        const degrees = this.rotation.map(x => x * 180 / Math.PI);
        const q = quat.fromEuler(quat.create(), ...degrees);
        mat4.fromRotationTranslationScale(
            this.matrix,
            q,
            this.translation,
            this.scale);
    }

    keydownHandler(e) {
        this.keys[e.code] = true;
    }

    keyupHandler(e) {
        this.keys[e.code] = false;
    }

}