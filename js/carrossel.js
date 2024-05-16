import * as THREE from 'three';
//import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
//import { VRButton } from 'three/addons/webxr/VRButton.js';
//import * as Stats from 'three/addons/libs/stats.module.js';
//import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////

var camera, scene, renderer;

var geometry, material, mesh;

var cylinder, innerRing, middleRing, outerRing;

var velocity;

var axis;

// Cylinder dimensions
    const cylinderRadius = 2;
    const cylinderHeight = 5;
    const cylinderColor = 0x00ff00;

// Inner ring dimensions
    const innerRingInnerRadius = cylinderRadius;
    const innerRingOuterRadius = innerRingInnerRadius+3;
    const innerRingColor = 0x0000ff;

// Middle ring dimensions
    const middleRingInnerRadius = innerRingOuterRadius;
    const middleRingOuterRadius = middleRingInnerRadius+3;
    const middleRingColor = 0xff00ff;
    
// Outer ring dimensions
    const outerRingInnerRadius = middleRingOuterRadius;
    const outerRingOuterRadius = outerRingInnerRadius+3;
    const outerRingColor = 0xffff00;

/////////////////////
/* CREATE SCENE(S) */
/////////////////////

function createScene() {
    'use strict';

    scene = new THREE.Scene();

    axis = new THREE.AxesHelper(10);
    axis.visible = false;

    scene.add(axis);

    createCylinder(0, 0, 0);
    createRing(innerRing, 0, 0, 0, innerRingInnerRadius, innerRingOuterRadius, innerRingColor);
    createRing(middleRing, 0, 0, 0, middleRingInnerRadius, middleRingOuterRadius, middleRingColor);
    createRing(outerRing, 0, 0, 0, outerRingInnerRadius, outerRingOuterRadius, outerRingColor);
}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////

function createCamera() {
    'use strict';
    camera = new THREE.PerspectiveCamera(70,
                                         window.innerWidth / window.innerHeight,
                                         1,
                                         1000);
    camera.position.x = 10;
    camera.position.y = 10;
    camera.position.z = 10;
    camera.lookAt(scene.position);
}

/////////////////////
/* CREATE LIGHT(S) */
/////////////////////

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////

function createCylinder(x, y, z) {
    'use strict';

    cylinder = new THREE.Object3D();

    geometry = new THREE.CylinderGeometry(cylinderRadius, cylinderRadius, cylinderHeight);
    material = new THREE.MeshBasicMaterial({ color: cylinderColor, wireframe: false });
    mesh = new THREE.Mesh(geometry, material);
    cylinder.add(mesh);

    cylinder.position.x = x;
    cylinder.position.y = y;
    cylinder.position.z = z;
    scene.add(cylinder);
}

function createRing(ring, x, y, z, innerRadius, outerRadius, ringColor) {
    'use strict';

    ring = new THREE.Object3D();

    geometry = new THREE.RingGeometry(innerRadius, outerRadius);
    material = new THREE.MeshBasicMaterial({ color: ringColor, wireframe: false });
    mesh = new THREE.Mesh(geometry, material);
    mesh.rotateX(3*Math.PI/2);
    ring.add(mesh);

    ring.position.x = x;
    ring.position.y = y;
    ring.position.z = z;
    scene.add(ring);
}

//////////////////////
/* CHECK COLLISIONS */
//////////////////////
function checkCollisions(){
    'use strict';

}

///////////////////////
/* HANDLE COLLISIONS */
///////////////////////
function handleCollisions(){
    'use strict';

}

////////////
/* UPDATE */
////////////
function update(){
    'use strict';

}

/////////////
/* DISPLAY */
/////////////

function render() {
    'use strict';
    renderer.render(scene, camera);
}

////////////////////////////////
/* INITIALIZE ANIMATION CYCLE */
////////////////////////////////

function init() {
    'use strict';
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    createScene();
    createCamera();
    velocity = 0.10;

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////

function animate() {
    'use strict';

    render();

    requestAnimationFrame(animate);
}

////////////////////////////
/* RESIZE WINDOW CALLBACK */
////////////////////////////

function onResize() {
    'use strict';

    renderer.setSize(window.innerWidth, window.innerHeight);

    if (window.innerHeight > 0 && window.innerWidth > 0) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }

}

///////////////////////
/* KEY DOWN CALLBACK */
///////////////////////

function onKeyDown(e) {
    'use strict';

    switch (e.keyCode) {
    }
}

///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e){
    'use strict';
}

init();
animate();