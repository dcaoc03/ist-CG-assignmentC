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
var rings = [];
var moveUpRing = [];

var keys = {};

var axis;

// Ring radius
    const ringRadius = 4;

// Cylinder dimensions
    const cylinderRadius = 3;
    const cylinderHeight = 7;
    const cylinderColor = 0xff0099;

// Inner ring dimensions
    const innerRingInnerRadius = cylinderRadius;
    const innerRingOuterRadius = innerRingInnerRadius+ringRadius;
    const innerRingColor = 0x0055ff;

// Middle ring dimensions
    const middleRingInnerRadius = innerRingOuterRadius;
    const middleRingOuterRadius = middleRingInnerRadius+ringRadius;
    const middleRingColor = 0x00bb66;
    
// Outer ring dimensions
    const outerRingInnerRadius = middleRingOuterRadius;
    const outerRingOuterRadius = outerRingInnerRadius+ringRadius;
    const outerRingColor = 0xffdd00;

// Ring movement
    const ringVelocity = 0.05;
    const maximumHeight = 5;
    const minimumHeight = -5;
    var movingUp = true;

/////////////////////
/* CREATE SCENE(S) */
/////////////////////

function createScene() {
    'use strict';

    scene = new THREE.Scene();

    axis = new THREE.AxesHelper(10);
    axis.visible = true;

    scene.add(axis);

    createCylinder(0, 0, 0);
    rings.push(createRing(0, 0, 0, innerRingInnerRadius, innerRingOuterRadius, innerRingColor));
    rings.push(createRing(0, 0, 0, middleRingInnerRadius, middleRingOuterRadius, middleRingColor));
    rings.push(createRing(0, 0, 0, outerRingInnerRadius, outerRingOuterRadius, outerRingColor));
    scene.add(rings[0]);
    scene.add(rings[1]);
    scene.add(rings[2]);
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
    camera.position.x = 20;
    camera.position.y = 20;
    camera.position.z = 20;
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

function createRing(x, y, z, innerRadius, outerRadius, ringColor) {
    'use strict';

    var ring = new THREE.Object3D();

    geometry = new THREE.RingGeometry(innerRadius, outerRadius);
    material = new THREE.MeshBasicMaterial({ color: ringColor, wireframe: false });
    mesh = new THREE.Mesh(geometry, material);
    mesh.rotateX(3*Math.PI/2);
    moveUpRing.push(true);

    ring.add(mesh);

    ring.position.set(x, y, z);
    return ring;
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
function moveRing(num) {
    if (moveUpRing[num]) {
        rings[num].position.y += ringVelocity;
        if (rings[num].position.y >= maximumHeight)
            moveUpRing[num] = false;
    } else {
        rings[num].position.y -= ringVelocity;
        if (rings[num].position.y <= minimumHeight)
            moveUpRing[num] = true;
    }
}

function update(){
    'use strict';

    cylinder.rotateY(0.01);

    if (keys[49]) { // Tecla '1'
        moveRing(0);
    }
    if (keys[50]) { // Tecla '2'
        moveRing(1);
    }
    if (keys[51]) { // Tecla '3'
        moveRing(2);
    }

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

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("resize", onResize);
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////

function animate() {
    'use strict';
    update();

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

    keys[e.keyCode] = true;
}

///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e){
    'use strict';

    keys[e.keyCode] = false;
    //active_key.textContent = "";
    //changingTextActiveKey.style.color = 'white';
}

init();
animate();