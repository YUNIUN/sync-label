const fragment = `
varying vec3 vInstanceColor;
varying vec2 vInstanceShown;

void main() {
    gl_FragColor = vec4(vInstanceColor, vInstanceShown.y);
    gl_FragColor.a *= vInstanceShown.x;
}`;
export default fragment;