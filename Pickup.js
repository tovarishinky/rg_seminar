import { quat, vec3 } from "../../lib/gl-matrix-module.js";
import { Node } from "./Node.js";

export class Pickup extends Node {
    constructor(options = {}) {
        super(options);
    }

    update(dt) {
        quat.rotateZ(this.rotation, this.rotation, 2 * dt);
    }
}