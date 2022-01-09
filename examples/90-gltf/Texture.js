import { Sampler } from './Sampler.js';

export class Texture {

    constructor(options = {}) {
        this.image = options.image || null;
        this.sampler = options.sampler || new Sampler();
        this.hasMipmaps = false;
        this.hasTransparency = false;
        this.useFakeLights=0.1;
    }

}
