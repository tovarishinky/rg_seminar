import { Node } from '../90-gltf/Node.js';

export class Light extends Node {

    constructor(options = {}) {
        super(options);
        // setInterval(() => {console.log(
        //     'x: ', Math.round(this.translation[0]).toString(),
        //     '\ny: ', Math.round(this.translation[1]).toString(),
        //     '\nz: ', Math.round(this.translation[2]).toString(),
        //     '\nspeed: ', this.velocity)}, 500); // TODO remove - debug
        Object.assign(this, {
            ambient          : 0.1,
            diffuse          : 1,
            specular         : 0.8,
            shininess        : 10,
            color            : [255, 255, 255],
            attenuatuion     : [1.0, 0, 0.09]
        });
    }

}