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
var ringRotationVelocity = 0.4;
var parametricSurfaces = [];
const parametricSurfaceColors = [0x63b4d1, 0x7699d4, 0x487de7, 0x4b369d, 0x70369d, 0x188fac, 0x826c7f, 0x5d4e60];
var materials = [];
var mobiusStrip

var keys = {};

var axis;

// Value of delta for a given frame
var delta;

// Clock of the machine
const clock = new THREE.Clock();

// Cylinder and surfaces movement
    var surfaceRotationVelocity = 0.8;

// Active key
    var active_key = document.getElementById("active_key_val");
    var changingTextActiveKey;

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
    const ringVelocity = 0.5;
    const maximumHeight = 8;

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
    ring.userData = { moving: true, step: 0 };

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
    mobiusStrip = new THREE.Object3D();
    geometry = new THREE.BufferGeometry();
    
    const vertices = new Float32Array([
        5, 1, 0, // 0
        5, -1, 0, // 1

        5*Math.cos(Math.PI/4)-1*Math.cos(3*Math.PI/8), 1*Math.sin(3*Math.PI/8), -5*Math.cos(Math.PI/4)+1*Math.cos(3*Math.PI/8), // 2
        5*Math.cos(Math.PI/4)+1*Math.cos(3*Math.PI/8), -1*Math.sin(3*Math.PI/8), -5*Math.cos(Math.PI/4)-1*Math.cos(3*Math.PI/8), // 3

        0, 1*Math.sin(Math.PI/4), -5+1*Math.cos(Math.PI/4), // 4
        0, -1*Math.sin(Math.PI/4), -5-1*Math.cos(Math.PI/4), // 5

        -5*Math.cos(Math.PI/4)+1*Math.cos(Math.PI/8), 1*Math.sin(Math.PI/8), -5*Math.cos(Math.PI/4)+1*Math.cos(Math.PI/8), // 6
        -5*Math.cos(Math.PI/4)-1*Math.cos(Math.PI/8), -1*Math.sin(Math.PI/8), -5*Math.cos(Math.PI/4)-1*Math.cos(Math.PI/8), // 7

        -4, 0, 0, // 8
        -6, 0, 0, // 9

        -5*Math.cos(Math.PI/4)+1*Math.cos(Math.PI/8), -1*Math.sin(Math.PI/8), 5*Math.cos(Math.PI/4)-1*Math.cos(Math.PI/8), // 10
        -5*Math.cos(Math.PI/4)-1*Math.cos(Math.PI/8), 1*Math.sin(Math.PI/8), 5*Math.cos(Math.PI/4)+1*Math.cos(Math.PI/8), // 11

        0, -1*Math.sin(Math.PI/4), 5-1*Math.cos(Math.PI/4), // 12
        0, 1*Math.sin(Math.PI/4), 5+1*Math.cos(Math.PI/4), // 13
        
        5*Math.cos(Math.PI/4)-1*Math.cos(3*Math.PI/8), -1*Math.sin(3*Math.PI/8), 5*Math.cos(Math.PI/4)-1*Math.cos(3*Math.PI/8), // 14
        5*Math.cos(Math.PI/4)+1*Math.cos(3*Math.PI/8), 1*Math.sin(3*Math.PI/8), 5*Math.cos(Math.PI/4)+1*Math.cos(3*Math.PI/8), // 15
        
        5, -1, 0, // 16
        5, 1, 0, // 17
    ])

    var indices = [];
    for (let i = 0; i < 8; i++) {
        indices.push(2*i, 2*i+1, 2*i+2, 2*i+1, 2*i+3, (i+1)*2);
    }

    geometry.setIndex( indices );
    geometry.setAttribute( 'position', new THREE.BufferAttribute(vertices, 3) );
    
    geometry.computeVertexNormals();
    
    material = new THREE.MeshLambertMaterial( { color: 0xaec6cf,  side: THREE.DoubleSide }
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
function updateHUD(keyPressed, buttonName, active) {
    active_key.textContent = keyPressed;
    changingTextActiveKey = document.getElementById(buttonName);
    if (active)
        changingTextActiveKey.style.color = 'LawnGreen';
    else
        changingTextActiveKey.style.color = 'White';
}

function moveRing(num) {
    rings[num].userData.step += ringVelocity*delta;
    rings[num].position.y = (maximumHeight * (Math.sin(rings[num].userData.step)));
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
    mobiusStrip.rotateY(ringRotationVelocity*delta);

    for (let i = 0; i < rings.length; i++) {
        if (rings[i].userData.moving)
            moveRing(i);
    }

    if (keys[49]) { // Tecla '1'
        keys[49] = false;
        rings[0].userData.moving = !rings[0].userData.moving;
        updateHUD("1", "toggle_inner_ring_movement", rings[0].userData.moving);
    }
    if (keys[50]) { // Tecla '2'
        keys[50] = false;
        rings[1].userData.moving = !rings[1].userData.moving;
        updateHUD("2", "toggle_middle_ring_movement", rings[1].userData.moving);
    }
    if (keys[51]) { // Tecla '3'
        keys[51] = false;
        rings[2].userData.moving = !rings[2].userData.moving;
        updateHUD("3", "toggle_outer_ring_movement", rings[2].userData.moving);
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
            updateHUD("D", "toggle_global_lighting", directionalLight.intensity > 0);
            break;
        case 115: // Tecla 'S(s)'
            for (let index = 0; index < spotLights.length; index++) {
                spotLights[index].visible = !spotLights[index].visible;
            }
            updateHUD("D", "toggle_spotlight_lighting", spotLights[0].visible);
            break;
        case 69: // Tecla 'P(p)'
            break;
        case 113: // Tecla 'Q(q)'
            changeMaterials(materials[0]);
            updateHUD("", "apply_phong_shading", false);
            updateHUD("", "apply_cartoon_shading", false);
            updateHUD("", "apply_normal_shading", false);
            updateHUD("", "apply_no_shading", false);
            updateHUD("Q", "apply_gourand_shading", true);
            break;
        case 119: // Tecla 'W(w)'
            changeMaterials(materials[1]);
            updateHUD("", "apply_gourand_shading", false);
            updateHUD("", "apply_cartoon_shading", false);
            updateHUD("", "apply_normal_shading", false);
            updateHUD("", "apply_no_shading", false);
            updateHUD("W", "apply_phong_shading", true);
            break;
        case 101: // Tecla 'E(e)'
            changeMaterials(materials[2]);
            updateHUD("", "apply_gourand_shading", false);
            updateHUD("", "apply_phong_shading", false);
            updateHUD("", "apply_normal_shading", false);
            updateHUD("", "apply_no_shading", false);
            updateHUD("E", "apply_cartoon_shading", true);
            break;
        case 114: // Tecla 'R(r)'
            changeMaterials(materials[3]);
            updateHUD("", "apply_gourand_shading", false);
            updateHUD("", "apply_phong_shading", false);
            updateHUD("", "apply_cartoon_shading", false);
            updateHUD("", "apply_no_shading", false);
            updateHUD("R", "apply_normal_shading", true);
            break;
        case 116: // Tecla 'T(t)'
            changeMaterials(materials[4]);
            updateHUD("", "apply_gourand_shading", false);
            updateHUD("", "apply_phong_shading", false);
            updateHUD("", "apply_cartoon_shading", false);
            updateHUD("", "apply_normal_shading", false);
            updateHUD("T", "apply_no_shading", true);
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
    active_key.textContent = "";
    //changingTextActiveKey.style.color = 'white';
}

init();
animate();