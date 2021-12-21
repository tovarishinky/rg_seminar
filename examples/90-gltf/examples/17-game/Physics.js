import { vec3, mat4 } from '../../lib/gl-matrix-module.js';

export class Physics {

    constructor(scene) {
        this.scene = scene;
        this.falling = false;
        this.jump = false;
    }

    update(dt, cam) { // Change to node if you want to check for all collision not just with cam
        vec3.scaleAndAdd(cam.translation, cam.translation, cam.velocity, dt);
        cam.updateTransform();
        cam.player.updateTransform();
        vec3.scaleAndAdd(cam.feet.translation, cam.feet.translation, cam.feet.velocity, dt);
        cam.feet.updateTransform();
        this.falling = true; // set falling to TRUE
        this.jump = false;
        this.scene.traverse(other => {
            if (cam !== other && other !== cam.feet && other.parent !== cam.feet) {
                this.resolveCollision(cam, other);
            }
            if (cam.feet != other && other !== cam && other.parent !== cam.feet) {
                if (this.collisionTrigger(cam.feet, other) == 1) {
                    this.falling = false; // if at least one collision set falling to FALSE
                }
                if (this.collisionTrigger(cam.feet.children[0], other) == 1 && this.collisionTrigger(cam.feet.children[1], other) == 0) {
                    this.jump = true;
                }
            }
        });
        cam.autoJump = this.jump; // trigger autojump;
        return this.falling;
    }

    intervalIntersection(min1, max1, min2, max2) {
        return !(min1 > max2 || min2 > max1);
    }

    aabbIntersection(aabb1, aabb2) {
        return this.intervalIntersection(aabb1.min[0], aabb1.max[0], aabb2.min[0], aabb2.max[0]) &&
            this.intervalIntersection(aabb1.min[1], aabb1.max[1], aabb2.min[1], aabb2.max[1]) &&
            this.intervalIntersection(aabb1.min[2], aabb1.max[2], aabb2.min[2], aabb2.max[2]);
    }

    collisionTrigger(a, b) {
        // Update bounding boxes with global translation.
        const ta = a.getGlobalTransform();
        const tb = b.getGlobalTransform();

        const posa = mat4.getTranslation(vec3.create(), ta);
        const posb = mat4.getTranslation(vec3.create(), tb);

        const mina = vec3.add(vec3.create(), posa, a.aabb.min);
        const maxa = vec3.add(vec3.create(), posa, a.aabb.max);
        const minb = vec3.add(vec3.create(), posb, b.aabb.min);
        const maxb = vec3.add(vec3.create(), posb, b.aabb.max);

        // Check if there is collision.
        const isColliding = this.aabbIntersection({
            min: mina,
            max: maxa
        }, {
            min: minb,
            max: maxb
        });
        
        if (!isColliding) {
            return 0;
        } 
        return 1;
    }

    resolveCollision(a, b) {
        // Update bounding boxes with global translation.
        const ta = a.getGlobalTransform();
        const tb = b.getGlobalTransform();

        const posa = mat4.getTranslation(vec3.create(), ta);
        const posb = mat4.getTranslation(vec3.create(), tb);

        const mina = vec3.add(vec3.create(), posa, a.aabb.min);
        const maxa = vec3.add(vec3.create(), posa, a.aabb.max);
        const minb = vec3.add(vec3.create(), posb, b.aabb.min);
        const maxb = vec3.add(vec3.create(), posb, b.aabb.max);

        // Check if there is collision.
        const isColliding = this.aabbIntersection({
            min: mina,
            max: maxa
        }, {
            min: minb,
            max: maxb
        });
        
        if (!isColliding) {
            return 0;
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
        vec3.add(a.feet.translation, a.feet.translation, minDirection);
        a.updateTransform();
        a.feet.updateTransform;
        return 1;
    }

}