import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { GUI } from 'lil-gui/dist/lil-gui.esm'

import waterVertex from './shaders/water/vertex.glsl?raw'
import waterFragment from './shaders/water/fragment.glsl?raw'


/**
 * Base
 */
// Canvas
const canvas = document.querySelector('#sceneCanvas')

// Scene
const scene = new THREE.Scene({ canvas })

/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader()

// DRACO loader
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('./static/draco/')

// GLTF loader
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

/**
 * Textures
 */
const bakedTexture = textureLoader.load('./static/bathroomBaked.jpg')
bakedTexture.flipY = false
bakedTexture.encoding = THREE.sRGBEncoding

const particleTexture = textureLoader.load('./static/12.png')

/**
 * Materials
 */
//Baked material
const bakedMaterial = new THREE.MeshBasicMaterial({
   map: bakedTexture,
})

// Emissive material
const sconceLightMaterial = new THREE.MeshBasicMaterial({color: 0xE9F1FF})

/**
 * Model
 */
gltfLoader.load('./static/bathroom.glb', (gltf) => {
   gltf.scene.children.forEach((child) => {
      switch(child.name) {
         case 'baked':
            child.material = bakedMaterial
            break
         case 'sconceLightA':
            child.material = sconceLightMaterial
            break
         case 'sconceLightB':
            child.material = sconceLightMaterial
            break
         default:
            child.material = bakedMaterial
      }
   })
   scene.add(gltf.scene)
})

/**
 * Water
 */
// Geometry
const waterGeometry = new THREE.BufferGeometry()
const dropletGeometry = new THREE.BufferGeometry()

const waterCount = 250
const dropletCount = 150

const waterPositionArray = new Float32Array(waterCount * 3)
const dropletPositionArray = new Float32Array(dropletCount * 3)
const dropletModifier = new Float32Array(dropletCount)

for (let i=0; i < waterCount; i++) {
   waterPositionArray[i*3+0] = ((Math.random() - 0.5) * .1) + -0.55
   waterPositionArray[i*3+1] = Math.random()
   waterPositionArray[i*3+2] = ((Math.random() - 0.5) * .1) + -0.5
}

for (let i=0; i < dropletCount; i++) {
   dropletPositionArray[i*3+0] = ((Math.random() - 0.5) * .25) - 0.5
   dropletPositionArray[i*3+1] = 0
   dropletPositionArray[i*3+2] = ((Math.random() - 0.5) * .25) - 0.5

   dropletModifier[i] = 2 - (Math.random() + 1)
}

waterGeometry.setAttribute('position', new THREE.BufferAttribute(waterPositionArray, 3))
dropletGeometry.setAttribute('position', new THREE.BufferAttribute(dropletPositionArray, 3))
dropletGeometry.setAttribute('aMod', new THREE.BufferAttribute(dropletModifier, 1))

// Material
const waterMaterial = new THREE.PointsMaterial({
   size: 0.1,
   color: 0xaaaaaa,
   sizeAttenuation: true,
   transparent: true,
   alphaMap: particleTexture,
   depthWrite: false,
   blending: THREE.AdditiveBlending,
})
const dropletMaterial = new THREE.ShaderMaterial({
   depthWrite: false,
   blending: THREE.AdditiveBlending,
   vertexShader: waterVertex,
   fragmentShader: waterFragment,
   transparent: true,
   uniforms: {
      uTime: {value: 0.0},
   },
})

// Points
const water = new THREE.Points(waterGeometry, waterMaterial)
const droplet = new THREE.Points(dropletGeometry, dropletMaterial)
scene.add(water, droplet)

/**
 * Sizes
 */
 const sizes = {
   width: window.innerWidth,
   height: window.innerHeight
}

window.addEventListener('resize', () =>
{
   // Update sizes
   sizes.width = window.innerWidth
   sizes.height = window.innerHeight

   // Update camera
   camera.aspect = sizes.width / sizes.height
   camera.updateProjectionMatrix()

   // Update renderer
   renderer.setSize(sizes.width, sizes.height)
   renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const cameraSettings = {
   fov: 45,
   aspect: sizes.width / sizes.height,
   near: 0.1,
   far: 100,
}

const camera = new THREE.PerspectiveCamera(
   cameraSettings.fov,
   cameraSettings.aspect,
   cameraSettings.near,
   cameraSettings.far,
)
camera.position.set(4, 2, 4)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({ 
   canvas,
   antialias: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.outputEncoding = THREE.sRGBEncoding

let deltaTime = 0
console.log(dropletGeometry)

const render = (time) => {
   time *= 0.001
   deltaTime = time - deltaTime

   // Update materials
   // Water
   for(let i = 0; i < waterCount; i++) {
      const i3 = i * 3
      const positionArray = water.geometry.attributes.position.array
      const x = water.geometry.attributes.position.array[i3]
      const y = water.geometry.attributes.position.array[i3 + 1] - 0.02

      if (y < 0) {
         positionArray[i*3+0] = ((Math.random() - 0.5) * .1) + -0.55
         positionArray[i*3+1] = 1.07
         positionArray[i*3+2] = ((Math.random() - 0.5) * .1) + -0.5
      } else {
         positionArray[i*3+0] += (Math.random() - 0.5) * 0.01
         positionArray[i*3+1] = y
         positionArray[i*3+2] += (Math.random() - 0.5) * 0.01
      }
  }
   waterGeometry.attributes.position.needsUpdate = true

   // Droplets
   dropletMaterial.uniforms.uTime.value = time

   // Update controls
   controls.update()

   // Render
   renderer.render(scene, camera)
   requestAnimationFrame(render)
}
requestAnimationFrame(render)


