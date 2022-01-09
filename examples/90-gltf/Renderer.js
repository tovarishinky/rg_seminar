import {mat4, vec3,vec2} from '../../lib/gl-matrix-module.js';

import { WebGL } from '../../common/engine/WebGL.js';

import { shaders } from './shaders4Lights.js';
import {Light} from "./Light.js";

// This class prepares all assets for use with WebGL
// and takes care of rendering.

export class Renderer {

    constructor(gl) {
        this.gl = gl;
        this.glObjects = new Map();
        this.programs = WebGL.buildPrograms(gl, shaders);

        gl.clearColor(0, 0, 0, 1);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
    }

    prepareBufferView(bufferView) {
        if (this.glObjects.has(bufferView)) {
            return this.glObjects.get(bufferView);
        }

        const buffer = new DataView(
            bufferView.buffer,
            bufferView.byteOffset,
            bufferView.byteLength);
        const glBuffer = WebGL.createBuffer(this.gl, {
            target : bufferView.target,
            data   : buffer
        });
        this.glObjects.set(bufferView, glBuffer);
        return glBuffer;
    }

    prepareSampler(sampler) {
        if (this.glObjects.has(sampler)) {
            return this.glObjects.get(sampler);
        }

        const glSampler = WebGL.createSampler(this.gl, sampler);
        this.glObjects.set(sampler, glSampler);
        return glSampler;
    }

    prepareImage(image) {
        if (this.glObjects.has(image)) {
            return this.glObjects.get(image);
        }

        const glTexture = WebGL.createTexture(this.gl, { image });
        this.glObjects.set(image, glTexture);
        return glTexture;
    }

    prepareTexture(texture) {
        const gl = this.gl;

        this.prepareSampler(texture.sampler);
        const glTexture = this.prepareImage(texture.image);

        const mipmapModes = [
            gl.NEAREST_MIPMAP_NEAREST,
            gl.NEAREST_MIPMAP_LINEAR,
            gl.LINEAR_MIPMAP_NEAREST,
            gl.LINEAR_MIPMAP_LINEAR,
        ];

        if (!texture.hasMipmaps && mipmapModes.includes(texture.sampler.min)) {
            gl.bindTexture(gl.TEXTURE_2D, glTexture);
            gl.generateMipmap(gl.TEXTURE_2D);
            texture.hasMipmaps = true;
        }
    }

    prepareMaterial(material) {
        if (material.baseColorTexture) {
            this.prepareTexture(material.baseColorTexture);
        }
        if (material.metallicRoughnessTexture) {
            this.prepareTexture(material.metallicRoughnessTexture);
        }
        if (material.normalTexture) {
            this.prepareTexture(material.normalTexture);
        }
        if (material.occlusionTexture) {
            this.prepareTexture(material.occlusionTexture);
        }
        if (material.emissiveTexture) {
            this.prepareTexture(material.emissiveTexture);
        }
    }

    preparePrimitive(primitive) {
        if (this.glObjects.has(primitive)) {
            return this.glObjects.get(primitive);
        }

        this.prepareMaterial(primitive.material);

        const gl = this.gl;
        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
        if (primitive.indices) {
            const bufferView = primitive.indices.bufferView;
            bufferView.target = gl.ELEMENT_ARRAY_BUFFER;
            const buffer = this.prepareBufferView(bufferView);
            gl.bindBuffer(bufferView.target, buffer);
        }

        // this is an application-scoped convention, matching the shader
        const attributeNameToIndexMap = {
            POSITION   : 0,
            TEXCOORD_0 : 1,
            NORMAL : 2,
        };

        for (const name in primitive.attributes) {
            const accessor = primitive.attributes[name];
            const bufferView = accessor.bufferView;
            const attributeIndex = attributeNameToIndexMap[name];

            if (attributeIndex !== undefined) {
                bufferView.target = gl.ARRAY_BUFFER;
                const buffer = this.prepareBufferView(bufferView);
                gl.bindBuffer(bufferView.target, buffer);
                gl.enableVertexAttribArray(attributeIndex);
                gl.vertexAttribPointer(
                    attributeIndex,
                    accessor.numComponents,
                    accessor.componentType,
                    accessor.normalized,
                    bufferView.byteStride,
                    accessor.byteOffset);
            }
        }

        this.glObjects.set(primitive, vao);
        return vao;
    }

    prepareMesh(mesh) {
        for (const primitive of mesh.primitives) {
            this.preparePrimitive(primitive);
        }
    }

    prepareNode(node) {
        if (node.mesh) {
            this.prepareMesh(node.mesh);
        }
        for (const child of node.children) {
            this.prepareNode(child);
        }
    }

    prepareScene(scene) {
        for (const node of scene.nodes) {
            this.prepareNode(node);
        }
    }

    render(scene, player, lights) {
        const gl = this.gl;
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        const program = this.programs.simple;
        gl.useProgram(program.program);

        this.connectHandAndLight(player, lights);
        this.setUniforms(gl, program, player, lights);
        const viewMatrix = this.getViewMatrix(player);

        for (const node of scene.nodes) {
            this.renderNode(node, viewMatrix,lights,program);
        }

        this.renderHand(lights[0],viewMatrix);
    }

    setUniforms(gl, program, player, lights) {
        gl.uniform1i(program.uniforms.uTexture, 0);
        gl.uniformMatrix4fv(program.uniforms.uProjection, false, player.camera.matrix);
        this.setLightsUniforms(gl, program, lights, player);
    }

    getViewMatrix(player) {
        const viewMatrix = player.getGlobalTransform();
        mat4.invert(viewMatrix, viewMatrix);
        return viewMatrix;
    }

    connectHandAndLight(player, lights) {
        const lightCords = vec3.create();
        mat4.getTranslation(lightCords, player.children[0].getGlobalTransform());
        lights[0].translation = lightCords;
        lights[0].rotation = player.rotation;
        lights[0].updateMatrix();
    }

    setLightsUniforms(gl, program, lights, player) {
        gl.uniform1f(program.uniforms.uAmbient, lights[0].ambient);
        gl.uniform1f(program.uniforms.uDiffuse, lights[0].diffuse);
        gl.uniform1f(program.uniforms.uSpecular, lights[0].specular);
        gl.uniform1f(program.uniforms.uShininess, lights[0].shininess);
        for (let i = 0; i < lights.length; i++) {
            gl.uniform3fv(program.uniforms['uLightPosition[' + i + ']'], lights[i].translation);
        }

        for (let i = 0; i < lights.length; i++) {
            let color = vec3.clone(lights[i].color);
            vec3.scale(color, color, 1.0 / 255.0);
            gl.uniform3fv(program.uniforms['uLightColor[' + i + ']'], color);
        }

        gl.uniform3fv(program.uniforms.uLightAttenuation, lights[0].attenuatuion);
        gl.uniformMatrix4fv(program.uniforms.uligtMatrix, false, lights[0].getGlobalTransform());
    }

    renderNode(node, mvpMatrix,lights,program) {
        const gl = this.gl;
        if(node.name=="Light1") {
            return;
        }
        if(node.name.startsWith('Drop')){
            this.setWaterLightUniforms(lights, gl, program);
        }else{
            for (let i = 0; i < lights.length; i++) {
                let color = vec3.clone(lights[i].color);
                vec3.scale(color, color, 1.0 / 255.0);
                gl.uniform3fv(program.uniforms['uLightColor[' + i + ']'], color);
            }
        }
        mvpMatrix = mat4.clone(mvpMatrix);
        mat4.mul(mvpMatrix, mvpMatrix, node.getGlobalTransform());
        if (node.mesh) {
            const program = this.programs.simple;
            gl.uniformMatrix4fv(program.uniforms.uViewMatrix, false, mvpMatrix);
            gl.uniformMatrix4fv(program.uniforms.uModelMatrix, false, node.getGlobalTransform());

            for (const primitive of node.mesh.primitives) {
                this.renderPrimitive(primitive,program);
            }
        }

        for (const child of node.children) {
            this.renderNode(child, mvpMatrix,program);
        }
    }

    setWaterLightUniforms(lights, gl, program) {
        for (let i = 0; i < lights.length; i++) {
            let color = vec3.clone([150, 150, 255]);
            vec3.scale(color, color, 1.0 / 255.0);
            gl.uniform3fv(program.uniforms['uLightColor[' + i + ']'], color);
        }
        gl.uniform1f(program.uniforms.uDiffuse, 0.3);//osvetljenost kapljic
        gl.uniform1f(program.uniforms.uSpecular, 1);//svetlost odboja na kapljici
    }

    enableCulling(gl){
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);
    }
    disableCulling(gl){
        gl.disable(gl.CULL_FACE);
    }

    renderHand(node, mvpMatrix,program) {
        const gl = this.gl;
        gl.clear(gl.DEPTH_BUFFER_BIT);
        mvpMatrix = mat4.clone(mvpMatrix);
        mat4.mul(mvpMatrix, mvpMatrix, node.getGlobalTransform());
        if (node.mesh) {
            const program = this.programs.simple;
            gl.uniformMatrix4fv(program.uniforms.uViewMatrix, false, mvpMatrix);
            gl.uniformMatrix4fv(program.uniforms.uModelMatrix, false, node.getGlobalTransform());

            for (const primitive of node.mesh.primitives) {
                this.renderPrimitive(primitive,program);
            }
        }

        for (const child of node.children) {
            this.renderHand(child, mvpMatrix,program);
        }
    }

    renderPrimitive(primitive,program) {
        const gl = this.gl;

        const vao = this.glObjects.get(primitive);
        const material = primitive.material;
        const texture = material.baseColorTexture;
        const glTexture = this.glObjects.get(texture.image);
        const glSampler = this.glObjects.get(texture.sampler);

        const d = new Date();
        let time = d.getTime();
        let  timevec = vec2.create();
        timevec=[(Math.random()*0.05)-0.025,Math.random()*0.5];
        gl.uniform2fv(program.uniforms.rand,timevec);
        gl.uniform1f(program.uniforms.uIsParticle, texture.isParticle);

        gl.uniform1f(program.uniforms.lampa, texture.lampa);
        gl.uniform1f(program.uniforms.uUseFakeLights, texture.useFakeLights);
        if(texture.hasTransparency){
            this.disableCulling(gl);
        }else{
            this.enableCulling(gl);
        }

        gl.bindVertexArray(vao);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, glTexture);
        gl.bindSampler(0, glSampler);

        if (primitive.indices) {
            const mode = primitive.mode;
            const count = primitive.indices.count;
            const type = primitive.indices.componentType;
            gl.drawElements(mode, count, type, 0);
        } else {
            const mode = primitive.mode;
            const count = primitive.attributes.POSITION.count;
            gl.drawArrays(mode, 0, count);
        }
    }

}
