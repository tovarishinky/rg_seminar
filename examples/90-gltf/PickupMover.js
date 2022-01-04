import { vec3 } from "../../lib/gl-matrix-module.js";
import { Pickup } from "./Pickup.js";

export class PickupMover {

    constructor(scene) {
        this.scene = scene;
    }

    update(dt) {
        this.scene.traverse(node => {
            if (node instanceof Pickup) {
                node.updateMatrix();
                node.update(dt);
            }
        });
    }
}