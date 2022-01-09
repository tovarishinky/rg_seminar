import { vec3 } from "../../lib/gl-matrix-module.js";
import { Drop } from "./Drop.js";

export class ParticleMover {

    constructor(scene) {
        this.scene = scene;
    }

    update(dt) {
        this.scene.traverse(node => {
            if (node instanceof Drop) {
                vec3.scaleAndAdd(node.translation, node.translation, node.velocity, dt);
                node.updateMatrix();
                node.update();
            }
        });
    }
}