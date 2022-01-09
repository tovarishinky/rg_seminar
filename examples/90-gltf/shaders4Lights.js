const vertex = `#version 300 es

layout (location = 0) in vec4 aPosition;
layout (location = 1) in vec2 aTexCoord;
layout (location = 2) in vec3 aNormal;

uniform mat4 uViewMatrix;
uniform mat4 uProjection;
uniform mat4 uModelMatrix;
uniform float uUseFakeLights;
uniform vec2 rand;

out vec3 vVertexPosition;
out vec3 vNormal;
out vec2 vTexCoord;
out mat4 modelMat;
out vec2 vRand;
out mat4 vViewMat;

void main() {

    vVertexPosition =(uViewMatrix*uModelMatrix*aPosition).xyz;

    vNormal=aNormal;
    if(uUseFakeLights>0.5){
        vNormal=(vec4(0,1.0,0,0)).xyz;
    }
    modelMat=uModelMatrix;
    vTexCoord = aTexCoord;
    vViewMat = uViewMatrix;
    vRand = rand;
    mat4 mvpMatrix=uViewMatrix *uModelMatrix;
    gl_Position = uProjection * mvpMatrix * aPosition;
}
`;

const fragment = `#version 300 es
precision mediump float;



uniform mediump sampler2D uTexture;

uniform float uAmbient;
uniform float uDiffuse[4];
uniform float uSpecular;
uniform mat4 uligtMatrix[4];


uniform float uShininess;
uniform vec3 uLightColor[4];
uniform vec3 uLightPosition[4];
uniform vec3 uLightAttenuation;
uniform float uIsParticle;
uniform float lampa;

in vec3 vVertexPosition;
in vec3 vNormal;
in vec2 vTexCoord;
in mat4 modelMat;
in vec2 vRand;
in mat4 vViewMat;

out vec4 oColor;



void main() {
    for (int i = 0; i < 4; i++) {
        vec3 lightPosition = (vViewMat*vec4(uLightPosition[i], 1)).xyz;
        float d = distance(vVertexPosition, lightPosition);
        float attenuation = 1.0 / dot(uLightAttenuation, vec3(1, d, d * d));
            
        vec3 N = normalize((vViewMat*modelMat*vec4(vNormal, 0)).xyz);
        vec3 L = normalize(lightPosition - vVertexPosition);
        vec3 E = normalize(-vVertexPosition);
        vec3 R = normalize(reflect(-L, N));
        
        float lambert = max(0.0, dot(L, N));
        float phong = pow(max(0.0, dot(E, R)), uShininess);
        
        float ambient = uAmbient;
        float diffuse = uDiffuse[i] * lambert;
        float specular = uSpecular * phong;
        if(lampa>0.5){
            specular=0.0;
            ambient=2.0;
        }
        
        vec3 diffuseLight = vec3(245,150,49)*specular; //specular color
        
        vec4 textureColour = texture(uTexture, vTexCoord);
        if(uIsParticle>0.5){
            textureColour = texture(uTexture, vTexCoord+vRand);
        }
        if(textureColour.a<0.5){
            discard;
        }
        
        vec3 Light = ((ambient + diffuse) * attenuation) * uLightColor[i]+(diffuseLight * 0.01)* attenuation;
        oColor += textureColour * vec4(Light, 1);
    }
}
`;

export const shaders = {
    simple: { vertex, fragment }
};
