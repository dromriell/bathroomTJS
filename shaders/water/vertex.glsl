uniform float uTime;
uniform float uDeltaTime;

attribute float aMod;

void main() {
   vec4 modelPosition = modelMatrix * vec4(position, 1.0);
   modelPosition.y += sin(uTime * aMod * 6.0) * 0.1 + 0.1;

   vec4 viewPosition = viewMatrix * modelPosition;

   vec4 projectionPosition = projectionMatrix * viewPosition;


   gl_Position = projectionPosition;
   
   gl_PointSize = 2.0;
}