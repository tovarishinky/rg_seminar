import { vec3, mat4, quat } from '../../lib/gl-matrix-module.js';
import { BlockMover } from './BlockMover.js';
import { Pickup } from './Pickup.js';

export class Physics {

    constructor(scene, renderScene, app) {
        this.scene = scene;
        this.renderScene = renderScene;
        this.falling = false;
        this.bm = new BlockMover(renderScene, scene);
        this.mObjects = [];
        this.doorMoving = false;
        this.app = app;
    }

    update(dt, player) {
        this.falling = true; // set falling, set to false in collision detection if necessary
        vec3.scaleAndAdd(player.translation, player.translation, player.velocity, dt);
        player.updateMatrix();
        this.scene.traverse(node => {
            if (node.mesh && player.velocity && player.feet) {
                this.resolveCollision(player, node, dt);
            }
        });
        this.updateFalling(player);
        this.moveObjects(dt);
    }

    moveObjects(dt) {
        for (const o of this.mObjects) {
            this.bm.Move(o.mesh, o.coll, dt);
        }
    }

    updateFalling(player) {
        player.falling = this.falling;
    }

    intervalIntersection(min1, max1, min2, max2) {
        return !(min1 > max2 || min2 > max1);
    }

    aabbIntersection(aabb1, aabb2) {
        return this.intervalIntersection(aabb1.min[0], aabb1.max[0], aabb2.min[0], aabb2.max[0]) &&
            this.intervalIntersection(aabb1.min[1], aabb1.max[1], aabb2.min[1], aabb2.max[1]) &&
            this.intervalIntersection(aabb1.min[2], aabb1.max[2], aabb2.min[2], aabb2.max[2]);
    }

    resolveCollision(a, b, dt) {
        // Update bounding boxes with global translation.
        const ta = a.getGlobalTransform();
        const tb = b.getGlobalTransform();

        const posa = mat4.getTranslation(vec3.create(), ta);
        const posb = mat4.getTranslation(vec3.create(), tb);

        const mina = vec3.add(vec3.create(), posa, a.collisionMin);
        const maxa = vec3.add(vec3.create(), posa, a.collisionMax);

        let mb = vec3.clone(b.mesh.primitives[0].attributes.POSITION.min);
        let mbb = vec3.clone(b.mesh.primitives[0].attributes.POSITION.max);

        const minb = vec3.add(vec3.create(), posb, mb);
        const maxb = vec3.add(vec3.create(), posb, mbb);
        // feet
        const minaf = vec3.add(vec3.create(), posa, a.feet.min);
        const maxaf = vec3.add(vec3.create(), posa, a.feet.max);

        // Check if there is collision.
        const isColliding = this.aabbIntersection({
            min: mina,
            max: maxa
        }, {
            min: minb,
            max: maxb
        });

        // check for ground contact
        const isCollidingFeet = this.aabbIntersection({
            min: minaf,
            max: maxaf
        }, {
            min: minb,
            max: maxb
        });

        // set falling
        // if (isCollidingFeet) {
        //     this.falling = false;
        // }

        if (!isColliding) {
            return;
        }

        if (b.name.startsWith("aabb_Coin") || b.name.startsWith("aabb_FakeFloor")) {
            this.pickup(b);
        }
        else if (b.name.startsWith("aabb_ButtonTrigger")) {
            if (a.action) {
                if (!this.doorMoving) {
                    console.log('Pressed!');
                    this.pressButton();
                    this.doorMoving = true;
                }
            }
        }
        else if (b.name.startsWith("aabb_ExitTrigger")) {
            console.log("EXIT");
        }
        else if (b.name.startsWith("aabb_DeathFloor")) {
            a.die();
        }
         else {
            if (isCollidingFeet) {
                this.falling = false;
            }
            // Move node A minimally to avoid collision.
            const diffa = vec3.sub(vec3.create(), maxb, mina);
            const diffb = vec3.sub(vec3.create(), maxa, minb);

            let minDiff = Infinity;
            let minDirection = [0, 0, 0];
            if (diffa[0] >= 0 && diffa[0] < minDiff) {
                minDiff = diffa[0];
                minDirection = [minDiff, 0, 0];
            }
            if (diffa[1] >= 0 && diffa[1] < minDiff) {
                minDiff = diffa[1];
                minDirection = [0, minDiff, 0];
            }
            if (diffa[2] >= 0 && diffa[2] < minDiff) {
                minDiff = diffa[2];
                minDirection = [0, 0, minDiff];
            }
            if (diffb[0] >= 0 && diffb[0] < minDiff) {
                minDiff = diffb[0];
                minDirection = [-minDiff, 0, 0];
            }
            if (diffb[1] >= 0 && diffb[1] < minDiff) {
                minDiff = diffb[1];
                minDirection = [0, -minDiff, 0];
            }
            if (diffb[2] >= 0 && diffb[2] < minDiff) {
                minDiff = diffb[2];
                minDirection = [0, 0, -minDiff];
            }

            vec3.add(a.translation, a.translation, minDirection);
            a.updateMatrix();
        }
    }

    pickup(nod) {
        const name1 = nod.name.replace("aabb_Coin", "");
        const fakeFloor = nod.name.replace("aabb_FakeFloor", "");
        this.renderScene.traverse(node => {
            if (node.name.startsWith("Coin") && node.name.replace("Coin", "") == name1) {
                node.mesh = null;
            }
            if (node.name.startsWith("FakeFloor") && node.name.replace("FakeFloor", "") == fakeFloor) {
                node.mesh = null;
            }
        });
    }

    pressButton() {
        let mesh;
        let coll;
        this.renderScene.traverse(node => {
            if (node.name.startsWith("Door")) {
                mesh = node;
            }
        });
        this.scene.traverse(node => {
            if (node.name.startsWith("aabb_Door")) {
                coll = node;
            }
        });

        if (mesh && coll) {
            this.mObjects.push({'mesh': mesh, 'coll': coll});
        }

    }

}