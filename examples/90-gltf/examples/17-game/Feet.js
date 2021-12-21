import { Node } from './Node.js';

export class Feet extends Node {

    constructor(mesh, image, options) {
        super(options);
        this.mesh = mesh;
        this.image = image;

    }
}
