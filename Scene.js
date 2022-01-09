import { Node } from './Node.js';
import {Light} from "../90-gltf/Light.js";

export class Scene {

    constructor(options = {}) {
        this.nodes = [...(options.nodes || [])];
    }

    addNode(node) {
        this.nodes.push(node);
    }

    traverse(before, after) {
        for (const node of this.nodes) {
            this.traverseNode(node, before, after);
        }
    }

    traverseNode(node, before, after) {
        if (before) {
            before(node);
        }
        for (const child of node.children) {
            this.traverseNode(child, before, after);
        }
        if (after) {
            after(node);
        }
    }

    clone() {
        return new Scene({
            ...this,
            nodes: this.nodes.map(node => node.clone()),
        });
    }

    getLights(){
        const lights = [];
        this.traverse(node => { if(node instanceof Light)lights.push(node)});
        return lights;
    }
}