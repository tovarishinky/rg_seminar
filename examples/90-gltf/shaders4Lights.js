const vertex = `#version 300 es

layout (location = 0) in vec4 aPosition;
layout (location = 1) in vec2 aTexCoord;
layout (location = 2) in vec3 aNormal;

uniform mat4 uViewMatrix;
uniform mat4 uProjection;
uniform mat4 uModelMatrix;

out vec3 vVertexPosition;
out vec3 vNormal;
out vec2 vTexCoord;

void main() {
    vVertexPosition = (uModelMatrix*aPosition).xyz;
    vNormal = aNormal;
    vTexCoord = aTexCoord;
    gl_Position = uProjection * uViewMatrix * aPosition;
}
`;

const fragment = `#version 300 es
precision mediump float;



uniform mediump sampler2D uTexture;

uniform float uAmbient;
uniform float uDiffuse;
uniform float uSpecular;
uniform mat4 uligtMatrix;


uniform float uShininess;
uniform vec3 uLightColor[4];
uniform vec3 uLightPosition[4];
uniform vec3 uLightAttenuation;
in vec3 vVertexPosition;
in vec3 vNormal;
in vec2 vTexCoord;

out vec4 oColor;

void main() {
    for (int i = 0; i < 4; i++) {
        vec3 lightPosition = (vec4(uLightPosition[i], 1)).xyz;
        float d = distance(vVertexPosition, lightPosition);
        float attenuation = 1.0 / dot(uLightAttenuation, vec3(1, d, d * d));
            
        vec3 N = vec4(vNormal, 0).xyz;
        vec3 L = normalize(lightPosition - vVertexPosition);
        vec3 E = normalize(-vVertexPosition);
        vec3 R = normalize(reflect(-L, N));
        
        float lambert = max(0.0, dot(L, N));
        float phong = pow(max(0.0, dot(E, R)), uShininess);
        
        float ambient = uAmbient;
        float diffuse = uDiffuse * lambert;
        float specular = uSpecular * phong;
        
        vec3 Light = ((ambient + diffuse + specular) * attenuation) * uLightColor[i];
        oColor += texture(uTexture, vTexCoord) * vec4(Light, 1);
    }
}
`;

export const shaders = {
    simple: { vertex, fragment }
};
