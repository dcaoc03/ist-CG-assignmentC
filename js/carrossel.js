import * as THREE from 'three';
import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';
import { ParametricGeometries } from "three/addons/geometries/ParametricGeometries.js";
import { VRButton } from 'three/addons/webxr/VRButton.js';

//import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
//import * as Stats from 'three/addons/libs/stats.module.js';
//import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////

var camera, scene, renderer;

var geometry, material, mesh;

var directionalLight;
var cylinder;
var rings = [], spotLights = [];
var moveUpRing = [];
var parametricSurfaces = [];
const parametricSurfaceColors = [0x63b4d1, 0x7699d4, 0x487de7, 0x4b369d, 0x70369d, 0x188fac, 0x826c7f, 0x5d4e60];

var keys = {};

var axis;

// Ring radius
    const ringRadius = 10;
    const ringLength = 2;
    const ringHeight = 10;

// Cylinder dimensions
    const cylinderRadius = 4;
    const cylinderHeight = 7;
    const cylinderColor = 0xe5a9a9;

// Inner ring dimensions
    const innerRingInnerRadius = cylinderRadius;
    const innerRingOuterRadius = innerRingInnerRadius+ringRadius;
    const innerRingColor = 0xd66ba0;

// Middle ring dimensions
    const middleRingInnerRadius = innerRingOuterRadius;
    const middleRingOuterRadius = middleRingInnerRadius+ringRadius;
    const middleRingColor = 0xaf4d98;
    
// Outer ring dimensions
    const outerRingInnerRadius = middleRingOuterRadius;
    const outerRingOuterRadius = outerRingInnerRadius+ringRadius;
    const outerRingColor = 0xd66ba0;

// Ring movement
    const ringVelocity = 0.1;
    const maximumHeight = 8;
    const minimumHeight = -8;

/////////////////////
/* CREATE SCENE(S) */
/////////////////////

function parametricHyperbloid(u, v, target) {
    
    u = u * 2 * Math.PI;
    v = 1.5 * (v - 0.5) * 2;

    const x = Math.cosh(v) * Math.cos(u);
    const y = Math.cosh(v) * Math.sin(u);
    const z = Math.sinh(v);

    target.set(x, y, z);
}

function parametricCylinder(u, v, target) {

    const x = 2*Math.cos( u * 2 * Math.PI );
    const y = 2*Math.sin( u * 2 * Math.PI );
    const z = 5 * v;

    target.set( x, y, z );
}

function createScene() {
    'use strict';

    scene = new THREE.Scene();

    axis = new THREE.AxesHelper(10);
    axis.visible = false;

    scene.add(axis);

    // Skydome creation
    createSkydome(0, 0, 0);

    // Cylinder creation
    createCylinder(0, 0, 0);

    // Array of Parametric Geometries creation
    parametricSurfaces.push(new ParametricGeometry(ParametricGeometries.mobius3d));
    parametricSurfaces.push(new ParametricGeometry(ParametricGeometries.mobius));
    parametricSurfaces.push(new ParametricGeometries.SphereGeometry(2));
    parametricSurfaces.push(new ParametricGeometries.TorusKnotGeometry(1, 2));
    parametricSurfaces.push(new ParametricGeometry(parametricHyperbloid));
    parametricSurfaces.push(new ParametricGeometry(parametricCylinder, 25, 25));
    geometry = new ParametricGeometry(ParametricGeometries.klein, 25, 25);
    geometry.scale(0.5, 0.5, 0.5);
    geometry.rotateX(Math.PI);
    parametricSurfaces.push(geometry);
    parametricSurfaces.push(new ParametricGeometry(ParametricGeometries.plane(4, 3), 25, 25));

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

function createDirectionalLight() {
    'use strict';

    directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.intensity = 5;
    directionalLight.position.set(30, 30, -30);
    directionalLight.lookAt(scene.position);
    scene.add(directionalLight);
}

function createAmbientLight() {
    'use strict';

    const ambientLight = new THREE.AmbientLight(0xffb66d, 1);
    scene.add(ambientLight);
}

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////

function createCylinder(x, y, z) {
    'use strict';

    cylinder = new THREE.Object3D();

    geometry = new THREE.CylinderGeometry(cylinderRadius, cylinderRadius, cylinderHeight);
    material = new THREE.MeshStandardMaterial({ color: cylinderColor, wireframe: false });
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
    material = new THREE.MeshStandardMaterial({ color: ringColor, wireframe: false });
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

    // Shufflling the parametric surface array (in order to randomize the order in which the surfaces are drawn)
    for (let i = parametricSurfaces.length - 1; i > 0; i--) { 
        const j = Math.floor(Math.random() * (i + 1)); 
        [parametricSurfaces[i], parametricSurfaces[j]] = [parametricSurfaces[j], parametricSurfaces[i]]; 
    } 

    for (let angle=0; angle < 2*Math.PI; angle += Math.PI/4) {
        geometry = parametricSurfaces[angle/(Math.PI/4)];
        const random2 = Math.floor(Math.random() * parametricSurfaceColors.length);
        material = new THREE.MeshStandardMaterial({ color: parametricSurfaceColors[random2], wireframe: false, side: THREE.DoubleSide });
        mesh = new THREE.Mesh(geometry, material);

        mesh.translateOnAxis(new THREE.Vector3(Math.sin(angle), 0, Math.cos(angle)), (innerRadius+outerRadius)/2);
        geometry.computeBoundingSphere();
        mesh.translateY(geometry.boundingSphere.radius+ringLength/2);

        // Create a spotlight with a color, intensity, distance, angle, penumbra, and decay
        const spotLight = new THREE.SpotLight(0xffffff, 10, 20, Math.PI / 5, 0.1, 1);
        spotLight.translateOnAxis(new THREE.Vector3(Math.sin(angle), 0, Math.cos(angle)), (innerRadius));
        spotLight.translateY(ringLength/2)
        spotLight.target = mesh;

        spotLights.push(spotLight);

        obj.add(spotLight);
        obj.add(mesh);
        mesh.rotateX(Math.PI/2);
    }
}

function createSkydome(x, y, z) {
    'use strict';

    var skydome = new THREE.Object3D();

    geometry = new THREE.SphereGeometry(outerRingOuterRadius, 32, 32, 0, Math.PI * 2, 0, Math.PI/2);
    var loader  = new THREE.TextureLoader();
    var texture = loader.load( "still_video.png" );
    material = new THREE.MeshPhongMaterial({ map: texture});
    mesh = new THREE.Mesh(geometry, material);
    mesh.material.side = THREE.BackSide;

    skydome.add(mesh);

    skydome.position.x = x;
    skydome.position.y = y;
    skydome.position.z = z;
    scene.add(skydome);
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
        spotLights[num].position.y += ringVelocity;
        if (rings[num].position.y >= maximumHeight)
            moveUpRing[num] = false;
    } else {
        rings[num].position.y -= ringVelocity;
        spotLights[num].position.y -= ringVelocity;
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
    renderer.xr.enabled = true;
    document.body.appendChild(renderer.domElement);
    document.body.appendChild( VRButton.createButton( renderer ) );

    createScene();
    createCamera();
    createAmbientLight();
    createDirectionalLight();

    window.addEventListener("keypress", onKeyPress);
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

    renderer.setAnimationLoop(animate);
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

    // "If" utilizado para evitar adicionar trues desnecessarios (o professor n gostou)
    if (e.keyCode >= 49 && e.keyCode <= 51) {
        keys[e.keyCode] = true;
    }
}

function onKeyPress(e) {
    'use strict';

    console.log("Key pressed: " + e.keyCode);
    switch (e.keyCode) {
        case 100: // Tecla 'D(d)'
            if (directionalLight.intensity > 0) { directionalLight.intensity = 0; }
            else { directionalLight.intensity = 3.5; }
            break;
        case 69: // Tecla 'P(p)'
            break;
        case 69: // Tecla 'P(p)'
            break;
        default:
            break;
    }
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