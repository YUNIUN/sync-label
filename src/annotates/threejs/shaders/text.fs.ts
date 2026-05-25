const fragment = `
uniform sampler2D fontImage;

varying vec2 vUv;
varying vec3 vInstanceColor;
varying vec3 vInstanceShown;

void main() {
    vec3 mainCol = texture2D(fontImage, vUv).rgb;
    gl_FragColor = vec4(mainCol * vInstanceColor, vInstanceShown.x * vInstanceShown.y * vInstanceShown.z * mainCol.r);
}`;
export default fragment;
