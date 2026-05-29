const fragment = `
varying vec3 vInstanceShown;
varying vec3 vInstanceColor;

void main() {
    gl_FragColor = vec4(vInstanceColor, vInstanceShown.x * vInstanceShown.y * vInstanceShown.z);
}`;
export default fragment;
