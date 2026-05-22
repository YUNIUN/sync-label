const vertex = `
attribute vec3 instanceColor;
// { shownFlag, alpha }
attribute vec2 instanceShown;
// { width, height }
attribute vec2 instanceSize;
// { minWidth, minHeight, maxWidth, maxHeight }
attribute vec4 instanceLimit;

uniform vec2 screenResolution;

varying float vEdge;

varying vec2 vUv;
varying vec2 vInstanceShown;
varying vec3 vInstanceColor;

void main() {
    vUv = uv;
    vInstanceShown = instanceShown;
    vInstanceColor = instanceColor;
    
    vec3 transformed = vec3(position);
    vec4 mvPosition = vec4(transformed, 1.0);
    mvPosition = instanceMatrix * mvPosition;
    mvPosition = modelViewMatrix * mvPosition;
    vec4 screen = projectionMatrix * mvPosition;
    screen /= screen.w;
    float _width = max(min(instanceLimit.z, instanceSize.x), instanceLimit.x);
    float _height = max(min(instanceLimit.w, instanceSize.y), instanceLimit.y);
    vEdge = min(0.2, min(2.0 / _width, 2.0 / _height));
    screen.x += (vUv.x - 0.5) * _width * 2.0 / screenResolution.x;
    screen.y += (vUv.y - 0.5) * _height * 2.0 / screenResolution.y;

    gl_Position = screen;
}`;
export default vertex;