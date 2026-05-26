// #define DASHED
const vertex = `
attribute vec3 instanceP1;
attribute vec3 instanceP2;
attribute vec3 instanceP3;
attribute vec3 instanceColor;
// { shownFlag, alpha }
attribute vec3 instanceShown;

varying vec3 vInstanceShown;
varying vec3 vInstanceColor;

float whenEq(float a, float b) {
    return 1.0 - abs(sign(b - a));
}

void main() {
    vInstanceShown = instanceShown;
    vInstanceColor = instanceColor;

    vec3 transformed = vec3(
        whenEq(position.x, 1.0) * instanceP1 + 
        whenEq(position.x, 2.0) * instanceP2 + 
        whenEq(position.x, 3.0) * instanceP3 
    );
    vec4 mvPosition = vec4(transformed, 1.0);
    mvPosition = instanceMatrix * mvPosition;
    mvPosition = modelViewMatrix * mvPosition;
    gl_Position = projectionMatrix * mvPosition;;
}`;
export default vertex;
