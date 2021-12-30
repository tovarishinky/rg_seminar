const vertex = `#version 300 es

layout (location = 0) in vec4 aPosition;
layout (location = 1) in vec2 aTexCoord;
layout (location = 2) in vec3 aNormal;

uniform mat4 uViewMatrix;
uniform mat4 uProjection;

uniform vec3 uLightAttenuation;
uniform vec3 uLightPosition;


out vec2 vTexCoord;
out vec3 vEye;
out vec3 vLight;
out vec3 vNormal;
out float vAttenuation;
out float attenuation;

void main() {
    vec3 vertexPosition = (uViewMatrix * aPosition).xyz;
    vec3 lightPosition = (uViewMatrix * vec4(uLightPosition, 1)).xyz;
    float d = distance(vertexPosition, lightPosition);
    attenuation = 1.0 / dot(uLightAttenuation, vec3(1, d, d * d));
    
    vNormal = (uViewMatrix * vec4(aNormal, 0)).xyz;
    vLight = lightPosition - vertexPosition;
    vEye = -vertexPosition;

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
uniform float uShininess;
uniform vec3 uLightColor;

in vec3 vEye;
in vec3 vLight;
in vec3 vNormal;
in float attenuation;
in vec2 vTexCoord;

out vec4 oColor;

void main() {
    vec3 N = normalize(vNormal);
    vec3 L = normalize(vLight);
    vec3 E = normalize(vEye);
    vec3 R = normalize(reflect(-L, N));
    
    float lambert = max(0.0, dot(L, N));
    float phong = pow(max(0.0, dot(E, R)), uShininess);
    
    float ambient = uAmbient;
    float diffuse = uDiffuse * lambert;
    float specular = uSpecular * phong;
    
    vec3 Light = ((ambient + diffuse + specular) * attenuation) * uLightColor;
    oColor = texture(uTexture, vTexCoord)*vec4(Light, 1);
}
`;

export const shaders = {
    simple: { vertex, fragment }
};
