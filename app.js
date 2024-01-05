import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { gsap } from 'gsap';

let camera, scene, renderer, controls;
let mesh1, mesh2;

init();
animate();

function init() {
  // Setup scene, camera, renderer...
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 100);
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // OrbitControls
  controls = new OrbitControls(camera, renderer.domElement);

  // Add meshes...
  const geometry = new THREE.BoxGeometry(10, 10, 10);
  const material1 = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const material2 = new THREE.MeshBasicMaterial({ color: 0x0000ff });

  mesh1 = new THREE.Mesh(geometry, material1);
  mesh1.position.set(-20, 0, 0);
  scene.add(mesh1);

  mesh2 = new THREE.Mesh(geometry, material2);
  mesh2.position.set(20, 0, 0);
  scene.add(mesh2);

  // Event listeners...
  window.addEventListener('resize', onWindowResize, false);
  document.addEventListener('click', onDocumentClick, false);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentClick(event) {
  event.preventDefault();

  // Raycasting logic...
  const mouse = new THREE.Vector2();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects([mesh1, mesh2]);
  if (intersects.length > 0) {
    rotateCameraToFaceObject(intersects[0].object);
  }
}

function rotateCameraToFaceObject(targetObject) {
  window.targetObject = targetObject;
  window.controls = controls;
  // controls.enabled = false;
  const targetPosition = new THREE.Vector3();
  targetObject.getWorldPosition(targetPosition);
  const direction = targetPosition.clone().sub(camera.position).normalize();

  // Look-at Quaternion
  const targetQuaternion = new THREE.Quaternion().setFromUnitVectors(camera.up, new THREE.Vector3(0, 1, 0)).multiply(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, -1), direction));

  // Animate the rotation
  gsap.to(camera.quaternion, {
    x: targetQuaternion.x,
    y: targetQuaternion.y,
    z: targetQuaternion.z,
    w: targetQuaternion.w,
    duration: 1,
    onUpdate: () => {
      camera.updateMatrixWorld();
    }
  });
}

function animate() {
  requestAnimationFrame(animate);
  // controls.update(); // Enable this if you want to use OrbitControls for additional interaction
  renderer.render(scene, camera);
}
