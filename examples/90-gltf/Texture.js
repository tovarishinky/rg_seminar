import { Sampler } from './Sampler.js';

export class Texture {

    constructor(options = {}) {
        this.image = options.image || null;
        this.sampler = options.sampler || new Sampler();
        this.hasMipmaps = false;
        this.hasTransparency = false;
        this.useFakeLights=0.1;
        this.isParticle=0.1;
        this.lampa=0.1;
        this.timeVec2=[0,0];
    }

    async setTimeVec2() {
        this.timeVec2=[(Math.random() * 0.05) - 0.025, Math.random() * 0.5];
        setTimeout(() => {this.setTimeVec2();},20+Math.random()*50);

    }
}
