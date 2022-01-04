import { vec3 } from "../../lib/gl-matrix-module.js";
import { Node } from "./Node.js";

export class Drop extends Node {
    constructor(options = {}) {
        super(options);
        this.startPos = vec3.clone(this.translation);
        this.velocity = vec3.fromValues(0, -10, 0);
    }

    update() {
        if (this.translation[1] < 0) {
            vec3.copy(this.translation, this.startPos);
        }
    }
}