import { vec3 } from "../../lib/gl-matrix-module.js";

export class BlockMover {
    constructor (scene, collisionScene) {
        this.scene = scene;
        this.collisionScene = collisionScene;
        this.forward = true;
        this.test = 0;
    }

    TestMove(blockName, collisionName) {
        this.scene.traverse(node => {
            if (node.name == blockName) {
                if (this.forward)
                vec3.add(node.translation, node.translation, vec3.fromValues(0,0,0.01));
                else
                vec3.sub(node.translation, node.translation, vec3.fromValues(0,0,0.01));
                node.updateMatrix();
            }
        });
        this.collisionScene.traverse(node => {
            if (node.name == collisionName) {
                if (this.forward)
                vec3.add(node.translation, node.translation, vec3.fromValues(0,0,0.01));
                else
                vec3.sub(node.translation, node.translation, vec3.fromValues(0,0,0.01));
                node.updateMatrix();
            }
        });
        this.test++;
        if (this.test >= 1000 && this.forward) {
            this.forward = false;
        }
        if (this.test > 0 && !this.forward) {
            this.test -= 2;
        }
        if (this.test <= 0) {
            this.forward = true;
        }
    }

    
}