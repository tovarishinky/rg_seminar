import { vec3, mat4 } from '../../lib/gl-matrix-module.js';

export class Physics {

    constructor(scene) {
        this.scene = scene;
        this.falling = false;
    }

    update(dt, player) {
        this.falling = true; // set falling, set to false in collision detection if necessary
        console.log(this.scene);
        this.scene.traverse(node => {
            if (node.mesh && player.velocity && player.feet) {
                vec3.scaleAndAdd(player.translation, player.translation, player.velocity, dt);
                player.updateMatrix();
                this.resolveCollision(player, node);
            }
        });
        this.updateFalling(player);
    }

    updateFalling(player) {
        player.falling = this.falling;
    }

    intervalIntersection(min1, max1, min2, max2) {
        return !(min1 > max2 || min2 > max1);
    }

    aabbIntersection(aabb1, aabb2) {
        return this.intervalIntersection(aabb1.min[0], aabb1.max[0], aabb2.min[0], aabb2.max[0])
            && this.intervalIntersection(aabb1.min[1], aabb1.max[1], aabb2.min[1], aabb2.max[1])
            && this.intervalIntersection(aabb1.min[2], aabb1.max[2], aabb2.min[2], aabb2.max[2]);
    }

    resolveCollision(a, b) {
        // Update bounding boxes with global translation.
        const ta = a.getGlobalTransform();
        const tb = b.getGlobalTransform();

        const posa = mat4.getTranslation(vec3.create(), ta);
        const posb = mat4.getTranslation(vec3.create(), tb);
        
        const mina = vec3.add(vec3.create(), posa, a.collisionMin);
        const maxa = vec3.add(vec3.create(), posa, a.collisionMax);

        console.log(b.mesh.primitives[0].attributes.POSITION.min);

        const mb = vec3.mul(vec3.create(), b.mesh.primitives[0].attributes.POSITION.min, b.scale);
        const mbb = vec3.mul(vec3.create(), b.mesh.primitives[0].attributes.POSITION.max, b.scale);

        console.log(mb);

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
        if (isCollidingFeet) {
            this.falling = false;
        }

        if (!isColliding) {
            return;
        }
        console.log('collision!');

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
