import { Mesh } from './Mesh.js';

import { Node } from './Node.js';
import { Model } from './Model.js';
import { Camera } from './Camera.js';
import { Feet } from './Feet.js';

import { Scene } from './Scene.js';
import { Sensor } from './Sensor.js';

export class SceneBuilder {

    constructor(spec) {
        this.spec = spec;
    }

    createNode(spec) {
        switch (spec.type) {
            case 'camera': return new Camera(spec);
            case 'feet': {
                const mesh = new Mesh(this.spec.meshes[spec.mesh]);
                const texture = this.spec.textures[spec.texture];
                return new Feet(mesh, texture, spec);

            }
            case 'sensor': {
                const mesh = new Mesh(this.spec.meshes[spec.mesh]);
                const texture = this.spec.textures[spec.texture];
                return new Sensor(mesh, texture, spec);
            }
            case 'player':
            case 'model': {
                const mesh = new Mesh(this.spec.meshes[spec.mesh]);
                const texture = this.spec.textures[spec.texture];
                return new Model(mesh, texture, spec);
            }
            default: return new Node(spec);
        }
    }

    build() {
        let scene = new Scene();
        this.spec.nodes.forEach(spec => {
            if (spec.type == 'player') {
                scene.traverse(node => {
                    if (node instanceof Camera) {
                        node.addChild(this.createNode(spec));                
                    }
                })
            } 
            else if (spec.type == 'sensor') {
                scene.traverse(node => {
                    if (node instanceof Feet) {
                        node.addChild(this.createNode(spec));                
                    }
                })
            }
            else {
                scene.addNode(this.createNode(spec));
            }    
        });
        return scene;
    }

}
