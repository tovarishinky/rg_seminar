import { vec3 } from "../../lib/gl-matrix-module.js";

export class TrapMover {
    constructor (scene, collisionScene) {
        this.scene = scene;
        this.collisionScene = collisionScene;
        this.l3 = [];
        this.l3c = [];
        this.getBlocks();
    }

    getBlocks() {
        // Render scene
        this.scene.traverse(node => {
            if (node.name == "PushWall" || node.name == "PushWall.002" || node.name == "PushWall.004") {
                this.l3.push(node);
            }
        });
        // Collision scene
        this.collisionScene.traverse(node => {
            if (node.name == "aabb_PushWall" || node.name == "aabb_PushWall.002" || node.name == "aabb_PushWall.004") {
                this.l3c.push(node);
            }
        });
    }

    update(dt) {
        for (const block of this.l3) {
            block.translation
            vec3.add(block.translation, block.translation, vec3.fromValues(-0.2 *dt,0,0));    
            block.updateMatrix();
        }
        for (const collision of this.l3c) {
            vec3.add(collision.translation, collision.translation, vec3.fromValues(-0.2 *dt,0,0));
            collision.updateMatrix();

        }
        
    }
}