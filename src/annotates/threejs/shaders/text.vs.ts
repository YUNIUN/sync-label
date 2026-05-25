const vertex = `
// { leftTop.x, leftTop.y, rightBottom.x, rightBottom.y }
attribute vec4 instanceUV;
// { x, y }
attribute vec2 instanceOffset;
// { width, height }
attribute vec2 instanceSize;
attribute vec3 instanceColor;
// { shownFlag, alpha }
attribute vec3 instanceShown;

uniform vec2 screenResolution;

varying vec2 vUv;
varying vec3 vInstanceShown;
varying vec3 vInstanceColor;

void main() {
    vInstanceShown = instanceShown;
    vInstanceColor = instanceColor;
    vUv = vec2(uv.x < 0.5 ? instanceUV.x : instanceUV.z, uv.y < 0.5 ? instanceUV.w : instanceUV.y);
    vec3 transformed = vec3(position);
    vec4 mvPosition = vec4(transformed, 1.0);
    mvPosition = instanceMatrix * mvPosition;
    mvPosition = modelViewMatrix * mvPosition;
    vec4 screen = projectionMatrix * mvPosition;
    screen /= screen.w;
    screen.xy += ((uv * instanceSize) + instanceOffset) / screenResolution * 2.0;

    gl_Position = screen;
}`;
export default vertex;
