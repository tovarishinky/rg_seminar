import { mat4 } from '../../lib/gl-matrix-module.js';

import { Camera } from './Camera.js';

export class PerspectiveCamera extends Camera {

    constructor(options = {}) {
        super(options);

        this.aspect = options.aspect || 1.5;
        this.fov = options.fov || 1.5;
        this.near = options.near || 0.01;
        this.far = options.far || 1000;

        this.updateMatrix();
    }

    updateMatrix() {
        mat4.perspective(this.matrix,
            this.fov, this.aspect,
            this.near, this.far);
    }

}
