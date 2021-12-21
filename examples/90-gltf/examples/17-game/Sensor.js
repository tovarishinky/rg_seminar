import { Node } from './Node.js';

export class Sensor extends Node {

    constructor(mesh, image, options) {
        super(options);
        this.mesh = mesh;
        this.image = image;

    }
}