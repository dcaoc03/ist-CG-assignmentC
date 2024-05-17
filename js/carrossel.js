import * as THREE from 'three';
import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';
import { ParametricGeometries } from "three/addons/geometries/ParametricGeometries.js";

//import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
//import { VRButton } from 'three/addons/webxr/VRButton.js';
//import * as Stats from 'three/addons/libs/stats.module.js';
//import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////

var camera, scene, renderer;

var geometry, material, mesh;

var cylinder;
var rings = [];
var moveUpRing = [];
var parametricSurfaces = [];
const parametricSurfaceColors = [0xe81416, 0xffa500, 0xfaeb36, 0x79c314, 0x487de7, 0x4b369d, 0x70369d];

var keys = {};

var axis;

// Ring radius
    const ringRadius = 7;
    const ringLength = 2;
    const ringHeight = 7;

// Cylinder dimensions
    const cylinderRadius = 4;
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

/////////////////////
/* CREATE SCENE(S) */
/////////////////////

function createScene() {
    'use strict';

    scene = new THREE.Scene();

    axis = new THREE.AxesHelper(10);
    axis.visible = true;

    scene.add(axis);

    // Cylinder creation
    createCylinder(0, 0, 0);

    // Array of Parametric Geometries creation
    parametricSurfaces.push(new ParametricGeometry(ParametricGeometries.mobius3d));
    parametricSurfaces.push(new ParametricGeometry(ParametricGeometries.mobius));
    parametricSurfaces.push(new ParametricGeometries.SphereGeometry(2));
    parametricSurfaces.push(new ParametricGeometries.TorusKnotGeometry(1, 2));

    // Ring creation
    rings.push(createRing(0, 0, 0, innerRingInnerRadius, innerRingOuterRadius, innerRingColor));
    rings.push(createRing(0, 0, 0, middleRingInnerRadius, middleRingOuterRadius, middleRingColor));
    rings.push(createRing(0, 0, 0, outerRingInnerRadius, outerRingOuterRadius, outerRingColor));
    
    // Adding the rings to the axis of the cylinder
    cylinder.add(rings[0]);
    cylinder.add(rings[1]);
    cylinder.add(rings[2]);
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
    camera.position.x = 30;
    camera.position.y = 30;
    camera.position.z = 30;
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

    const shape = new THREE.Shape();
    shape.moveTo(-ringLength/2, -ringHeight/2);
    shape.lineTo(ringLength/2, -ringHeight/2);
    shape.lineTo(ringLength/2, ringHeight/2);
    shape.lineTo(-ringLength/2, ringHeight/2);
    shape.lineTo(-ringLength/2, -ringHeight/2);

    const path = new THREE.Curve();
    const pathRadius = (innerRadius+outerRadius)/2;
    path.getPoint = function (t) {
        var segment = (2*Math.PI) * t;
        return new THREE.Vector3(pathRadius * Math.cos(segment), pathRadius * Math.sin(segment), 0);
    };

    const extrudeSettings = {
        steps: 64,
        bevelEnabled: false,
        extrudePath: path
    };
    
    geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
    material = new THREE.MeshBasicMaterial({ color: ringColor, wireframe: false });
    mesh = new THREE.Mesh(geometry, material);
    mesh.rotateX(3*Math.PI/2);
    moveUpRing.push(true);

    ring.add(mesh);
    createParametricSurfaces(ring, innerRadius, outerRadius);

    ring.position.set(x, y, z);
    return ring;
}

function createParametricSurfaces(obj, innerRadius, outerRadius) {
    'use strict';

    for (let angle=0; angle < 2*Math.PI; angle += Math.PI/4) {
        const random = Math.floor(Math.random() * parametricSurfaces.length);
        geometry = parametricSurfaces[random];
        const random2 = Math.floor(Math.random() * parametricSurfaceColors.length);
        material = new THREE.MeshBasicMaterial({ color: parametricSurfaceColors[random2], wireframe: false });
        mesh = new THREE.Mesh(geometry, material);

        mesh.translateOnAxis(new THREE.Vector3(Math.sin(angle), 0, Math.cos(angle)), (innerRadius+outerRadius)/2);
        mesh.translateY(1+ringLength/2);

        obj.add(mesh);
        mesh.rotateX(Math.PI/2);
    }
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