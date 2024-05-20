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
var ringMovement = [];
var ringMovingUp = [];
var ringRotationVelocity = 0.4;
var parametricSurfaces = [];
const parametricSurfaceColors = [0x63b4d1, 0x7699d4, 0x487de7, 0x4b369d, 0x70369d, 0x188fac, 0x826c7f, 0x5d4e60];
var materials = [];

var keys = {};

var axis;

// Value of delta for a given frame
var delta;

// Clock of the machine
const clock = new THREE.Clock();

// Cylinder and surfaces movement
    var surfaceRotationVelocity = 0.8;

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
    const ringVelocity = 3;
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

    // Mobius Strip creation
    createMobiusStrip(0, 25, 0);

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

    // Adding all the necessary materials
    materials.push(new THREE.MeshLambertMaterial({wireframe: false, side: THREE.DoubleSide}));
    materials.push(new THREE.MeshPhongMaterial({wireframe: false, side: THREE.DoubleSide}));
    materials.push(new THREE.MeshToonMaterial({wireframe: false, side: THREE.DoubleSide}));
    materials.push(new THREE.MeshNormalMaterial({wireframe: false, side: THREE.DoubleSide}));
    materials.push(new THREE.MeshBasicMaterial({wireframe: false, side: THREE.DoubleSide}));
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
    material = new THREE.MeshLambertMaterial({ color: cylinderColor, wireframe: false });
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
    material = new THREE.MeshLambertMaterial({ color: ringColor, wireframe: false });
    mesh = new THREE.Mesh(geometry, material);
    mesh.rotateX(3*Math.PI/2);
    ringMovement.push(true);
    ringMovingUp.push(true);

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
        material = new THREE.MeshLambertMaterial({ color: parametricSurfaceColors[random2], wireframe: false, side: THREE.DoubleSide });
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

    geometry = new THREE.SphereGeometry(2*outerRingOuterRadius, 32, 32, 0, Math.PI * 2, 0, Math.PI/2);
    var loader  = new THREE.TextureLoader();
    var texture = loader.load( "still_video.png" );
    material = new THREE.MeshPhongMaterial({ map: texture, side: THREE.BackSide});
    mesh = new THREE.Mesh(geometry, material);

    skydome.add(mesh);

    skydome.position.x = x;
    skydome.position.y = y;
    skydome.position.z = z;
    scene.add(skydome);
}

function createMobiusStrip(x, y, z) {
    var mobiusStrip = new THREE.Object3D();
    geometry = new THREE.BufferGeometry();
    // listar vértices (vectores 3D com as coordenadas de cada vértice)
    const vertices = new Float32Array([
    -1.0, -1.0, 1.0, // v0
    1.0, -1.0, 1.0, // v1
    1.0, 1.0, 1.0, // v2
    -1.0, 1.0, 1.0, // v3
    -1.0, -1.0, 0.0, // v4
    1.0, -1.0, 0.0, // v5
    1.0, 1.0, 0.0, // v6
    -1.0, 1.0, 0.0, // v7
    ]);
    geometry.setAttribute( 'position', new THREE.BufferAttribute(vertices, 3) );
    // listar tripletos de índices por forma a definir cada face/triângulo
    // notem que a sequência de índices deve indicar o sentido da normal
    const indices = [
                    0, 1, 2,
                    2, 3, 0,
                    4, 5, 6,
                    6, 7, 4,
                    0, 4, 5,
                    5, 1, 0,
                    2, 6, 7,
                    7, 3, 2
                    ];
    geometry.setIndex( indices );
    // não esquecer de calcular as normais de cada face
    geometry.computeVertexNormals();
    // uma vez na posse de uma geometria, definir um material e criar uma Mesh
    material = new THREE.MeshLambertMaterial( { color: 0xaec6cf }
    );
    mesh = new THREE.Mesh( geometry, material );
    mobiusStrip.add(mesh);
    mobiusStrip.position.x = x;
    mobiusStrip.position.y = y;
    mobiusStrip.position.z = z;
    scene.add(mobiusStrip);
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
    if (ringMovingUp[num]) {
        rings[num].position.y += ringVelocity*delta;
        spotLights[num].position.y += ringVelocity*delta;
        if (rings[num].position.y >= maximumHeight)
            ringMovingUp[num] = false;
    } else {
        rings[num].position.y -= ringVelocity*delta;
        spotLights[num].position.y -= ringVelocity*delta;
        if (rings[num].position.y <= minimumHeight)
            ringMovingUp[num] = true;
    }
}

function moveSurfaces() {
    for (var i=0; i<parametricSurfaces.length; i++) {
        parametricSurfaces[i].rotateZ(surfaceRotationVelocity*delta);
    }
}

function changeMaterials(newMaterial) {
    // Change cylinder
    cylinder.traverse(function (node) {
        if (node instanceof THREE.Mesh) {
            var oldMaterialColor = node.material.color;
            node.material = newMaterial.clone();
            node.material.color = oldMaterialColor;
        }
    });
}

function update(){
    'use strict';

    delta = clock.getDelta();

    cylinder.rotateY(ringRotationVelocity*delta);
    moveSurfaces();
    
    if (ringMovement[0]) {
        moveRing(0);
    }
    if (ringMovement[1]) {
        moveRing(1);
    }
    if (ringMovement[2]) {
        moveRing(2);
    }

    if (keys[49]) { // Tecla '1'
        keys[49] = false;
        ringMovement[0] = !ringMovement[0];
    }
    if (keys[50]) { // Tecla '2'
        keys[50] = false;
        ringMovement[1] = !ringMovement[1];
    }
    if (keys[51]) { // Tecla '3'
        keys[51] = false;
        ringMovement[2] = !ringMovement[2];
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

function determine_rotation_direction(velocity) {
    var random = Math.floor(Math.random() * 3) - 1;
    while (!random) {
        random = Math.floor(Math.random() * 3) - 1;
    }
    return random*velocity;
}

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

    ringRotationVelocity = determine_rotation_direction(ringRotationVelocity);
    surfaceRotationVelocity = determine_rotation_direction(surfaceRotationVelocity);

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
        case 115: // Tecla 'S(s)'
            for (let index = 0; index < spotLights.length; index++) {
                spotLights[index].visible = !spotLights[index].visible;
            }
            break;
        case 69: // Tecla 'P(p)'
            break;
        case 113: // Tecla 'Q(q)'
            changeMaterials(materials[0]);
            break;
        case 119: // Tecla 'W(w)'
            changeMaterials(materials[1]);
            break;
        case 101: // Tecla 'E(e)'
            changeMaterials(materials[2]);
            break;
        case 114: // Tecla 'R(r)'
            changeMaterials(materials[3]);
            break;
        case 116: // Tecla 'T(t)'
            changeMaterials(materials[4]);
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