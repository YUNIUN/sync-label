const vertex = `
attribute vec3 instanceColor;
// { shownFlag, alpha }
attribute vec2 instanceShown;
// { width, height }
attribute vec2 instanceSize;
// { minWidth, minHeight, maxWidth, maxHeight }
attribute vec4 instanceLimit;

varying vec2 vUv;
varying vec2 vInstanceShown;
varying vec3 vInstanceColor;

void main() {
    vUv = uv;
    vInstanceShown = instanceShown;
    vInstanceColor = instanceColor;

    float _width = max(min(instanceLimit.z, instanceSize.x), instanceLimit.x);
    float _height = max(min(instanceLimit.w, instanceSize.y), instanceLimit.y);
    vec3 transformed = vec3(position * vec3(_width, _height, 1.0));
    vec4 mvPosition = vec4(transformed, 1.0);
    mvPosition = instanceMatrix * mvPosition;
    mvPosition = modelViewMatrix * mvPosition;
    vec4 screen = projectionMatrix * mvPosition;

    gl_Position = screen;
}`;
export default vertex;
