import { vec3 } from "../../lib/gl-matrix-module.js";

export class TrapMover {
    constructor (scene, collisionScene) {
        this.scene = scene;
        this.collisionScene = collisionScene;
        


        this.l3 = [];
        this.l3c = [];
        this.l3End = 0; // start
        this.l3F = true;

        this.r3 = [];
        this.r3c = [];
        this.r3End = 0;
        this.r3F = true;

        this.l1 = [];
        this.l1c = [];
        this.l1End = 0;
        this.l1F = true;

        this.b1 = [];
        this.b1c = [];
        this.b1End = 0;
        this.b1F = true;

        this.r1 = [];
        this.r1c = [];
        this.r1End = 0;
        this.r1F = true;

        this.getBlocks();
    }

    getBlocks() {
        // Render scene
        this.scene.traverse(node => {
            if (node.name == "PushWall" || node.name == "PushWall.002" || node.name == "PushWall.004") {
                this.l3.push(node);
            }
            if (node.name == "PushWall.001" || node.name == "PushWall.003" || node.name == "PushWall.005") {
                this.r3.push(node);
            }
            if (node.name == "PushWall.006" || node.name == "PushWall.007" || node.name == "PushWall.008") {
                this.l1.push(node);
            }
            if (node.name == "PushWall.009" || node.name == "PushWall.010" || node.name == "PushWall.011") {
                this.b1.push(node);
            }
            if (node.name == "PushWall.012" || node.name == "PushWall.013" || node.name == "PushWall.014") {
                this.r1.push(node);
            }
        });
        // Collision scene
        this.collisionScene.traverse(node => {
            if (node.name == "aabb_PushWall" || node.name == "aabb_PushWall.002" || node.name == "aabb_PushWall.004") {
                this.l3c.push(node);
            }
            if (node.name == "aabb_PushWall.001" || node.name == "aabb_PushWall.003" || node.name == "aabb_PushWall.005") {
                this.r3c.push(node);
            }
            if (node.name == "aabb_PushWall.006" || node.name == "aabb_PushWall.007" || node.name == "aabb_PushWall.008") {
                this.l1c.push(node);
            }
            if (node.name == "aabb_PushWall.009" || node.name == "aabb_PushWall.010" || node.name == "aabb_PushWall.011") {
                this.b1c.push(node);
            }
            if (node.name == "aabb_PushWall.012" || node.name == "aabb_PushWall.013" || node.name == "aabb_PushWall.014") {
                this.r1c.push(node);
            }

        });
    }

    update(dt) {
        // l3
        if (this.l3End > 8) { //turn
            this.l3F = false;
        } else if (this.l3End < 3) { // 2nd turn
            this.l3F = true;
        }
        const l3move = (this.l3F) ? -2 *dt : 2 *dt;

        for (const block of this.l3) {
            vec3.add(block.translation, block.translation, vec3.fromValues(l3move,0,0));    
            block.updateMatrix();
        }
        for (const collision of this.l3c) {
            vec3.add(collision.translation, collision.translation, vec3.fromValues(l3move,0,0));
            collision.updateMatrix();

        }
        this.l3End -= l3move;


        // L1
        if (this.l1End > 2) { //turn
            this.l1F = false;
        } else if (this.l1End < 0) { // 2nd turn
            this.l1F = true;
        }
        const l1move = (this.l1F) ? -0.5 *dt : 0.5 *dt;

        for (const block of this.l1) {
            vec3.add(block.translation, block.translation, vec3.fromValues(l1move,0,0));    
            block.updateMatrix();
        }
        for (const collision of this.l1c) {
            vec3.add(collision.translation, collision.translation, vec3.fromValues(l1move,0,0));
            collision.updateMatrix();

        }
        this.l1End -= l1move;

        // B1
        if (this.b1End > 2) { //turn
            this.b1F = false;
        } else if (this.b1End < 0) { // 2nd turn
            this.b1F = true;
        }
        const b1move = (this.b1F) ? -0.5 *dt : 0.5 *dt;

        for (const block of this.b1) {
            vec3.add(block.translation, block.translation, vec3.fromValues(0,0,-b1move));    
            block.updateMatrix();
        }
        for (const collision of this.b1c) {
            vec3.add(collision.translation, collision.translation, vec3.fromValues(0,0,-b1move));
            collision.updateMatrix();

        }
        this.b1End -= b1move;

        // R1
        if (this.r1End > 2.5) {
            this.r1F = false;
        } else if (this.r1End < -1) { // end
            this.r1F = true;
        }
        const r1move = (this.r1F) ? 0.5 *dt : -0.5 *dt; // 1.5

        for (const block of this.r1) {
            vec3.add(block.translation, block.translation, vec3.fromValues(r1move,0,0));    
            block.updateMatrix();
        }
        for (const collision of this.r1c) {
            vec3.add(collision.translation, collision.translation, vec3.fromValues(r1move,0,0));
            collision.updateMatrix();

        }
        this.r1End += r1move;

        // R3
        if (this.r3End > 6) {
            this.r3F = false;
        } else if (this.r3End < 2) { // end
            this.r3F = true;
        }
        const r3move = (this.r3F) ? 0.5 *dt : -0.5 *dt; // 1.5

        for (const block of this.r3) {
            vec3.add(block.translation, block.translation, vec3.fromValues(r3move,0,0));    
            block.updateMatrix();
        }
        for (const collision of this.r3c) {
            vec3.add(collision.translation, collision.translation, vec3.fromValues(r3move,0,0));
            collision.updateMatrix();

        }
        this.r3End += r3move;
    }
}

// Levo 3krat:
// PushWall
// PushWall.002
// PushWall.004

// Desno 3krat:
// PushWall.001
// PushWall.003
// PushWall.005

// Levo 1krat:
// PushWall.006
// PushWall.007
// PushWall.008

// Proti starting pointu 1krat (nazaj i guess?):
// PushWall.009
// PushWall.010
// PushWall.011

// Desno 1krat: 
// PushWall.012
// PushWall.013
// PushWall.014