
//IMPORTING
import * as THREE from './js/three.module';
import {OrbitControls} from '/js/OrbitControls';
import {GUI} from './js/dat.gui.module'

<<<<<<< HEAD

//GLOBAL CONSTS
const gridX = 10;
const gridY = 10;

//RENDERING + SCENE
=======
>>>>>>> parent of 691a886 (dynamic grid size and displaying placed grids, needs logic to block input)
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();

//CAMERA
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
const orbit = new OrbitControls(camera, renderer.domElement);
camera.position.set(10, 15, -22);
orbit.update();

// INIT VARIABLES 
var battleshipLength = 2;
var xoffset = 0;
var zoffset = 0.5;
var battleshipRotation = Math.PI/2;
var ship2remain = 1;
var ship3remain = 2;
var ship4remain = 1;
var ship5remain = 1;
const remainingArray = [ship2remain, ship3remain, ship4remain, ship5remain];
var shipType = 0;
var rotationCount = 0;


// INVISIBLE PLANE + GRID
const planeMesh = new THREE.Mesh(
<<<<<<< HEAD
    new THREE.PlaneGeometry(gridX, gridY),
    new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, visible: false}));
planeMesh.rotateX(-Math.PI / 2);
scene.add(planeMesh);
planeMesh.name = 'ground';
const grid = new THREE.GridHelper(gridX, gridY);
=======
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshBasicMaterial({
        side: THREE.DoubleSide,
        visible: false
    })
);
planeMesh.rotateX(-Math.PI / 2);
scene.add(planeMesh);
planeMesh.name = 'ground';

const grid = new THREE.GridHelper(10, 10);
>>>>>>> parent of 691a886 (dynamic grid size and displaying placed grids, needs logic to block input)
scene.add(grid);

// HIGHLIGHT MESH
const highlightMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(battleshipLength, 1),
    new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, transparent: true}));
highlightMesh.rotateX(battleshipRotation);
scene.add(highlightMesh);


const mousePosition = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
let intersects;

//KEY PRESS EVENT
document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(e){
    var keyCode = e.which
    switch(keyCode){
        case 82: // letter 'r' for rotating
            rotationCount++;
            rotate();
            console.log(rotationCount);
        break;

        case 50: // number '2' for battleship select
            shipType = 0;
            battleshipLength = 2;
            xoffset = 0;
            zoffset = 0.5;
            console.log(remainingArray);
        break;

        case 51: // number '3' for battleship select
            shipType = 1;
            battleshipLength = 3;
            xoffset = 0.5;
            zoffset = 0.5;
            console.log(remainingArray)
        break;

        case 52: // number '4' for battleship select
            shipType = 2;
            battleshipLength = 4;
            xoffset = 0;
            zoffset = 0.5;
            console.log(remainingArray)
        break;

        case 53: // number '5' for battleship select
            shipType = 3;
            battleshipLength = 5;
            xoffset = 0.5;
            zoffset = 0.5;
            console.log(remainingArray)
        break;
    }

};


window.addEventListener('mousemove', function(e) {
    mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
    mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mousePosition, camera);
    intersects = raycaster.intersectObjects(scene.children);
    intersects.forEach(function(intersect) {
        if(intersect.object.name === 'ground') {
            const highlightPos = new THREE.Vector3().copy(intersect.point).floor();
            highlightMesh.position.set(highlightPos.x+xoffset, 0, highlightPos.z+zoffset);
            console.log(highlightMesh.position)
            highlightMesh.rotateX(battleshipRotation);
            const objectExist = objects.find(function(object) {
                return (object.position.x === highlightMesh.position.x)
                && (object.position.z === highlightMesh.position.z)
            });

            if(!objectExist)
                highlightMesh.material.color.setHex(0xFFFFFF);
            else
                highlightMesh.material.color.setHex(0xFF0000);
        }
    });
});

const sphereMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 4, 2),
    new THREE.MeshBasicMaterial({
        wireframe: true,
        color: 0xFFEA00
    })
);

function rotate(){
    rotationCount++;
    if(rotationCount % 2 == 0){
        battleshipRotation = 0;
        xoffset = 0;
        zoffset=0.5;
        console.log("rotate A");
        //highlightMesh.position.y = 0.5;
        //highlightMesh.position.z = 0.5;
        highlightMesh.rotation.z = 0;
        }else{
        battleshipRotation = Math.PI/2;
        xoffset = 0.5;
        zoffset=0;
        console.log("rotate B");
        highlightMesh.rotation.z = Math.PI / 2;
        }
};
///test

const objects = [];

window.addEventListener('mousedown', function() {
    const objectExist = objects.find(function(object) {
        return (object.position.x === highlightMesh.position.x)
        && (object.position.z === highlightMesh.position.z)
    });

    if(!objectExist) {
        intersects.forEach(function(intersect) {
            if(intersect.object.name === 'ground') {

                if(remainingArray[shipType] > 0){5
                const sphereClone = sphereMesh.clone();
                sphereClone.position.copy(highlightMesh.position);
				sphereClone.rotation.y = battleshipRotation;
                scene.add(sphereClone);
                objects.push(sphereClone);
                highlightMesh.material.color.setHex(0xFF0000);
                    remainingArray[shipType] = remainingArray[shipType] - 1;
                };
            }



        });
    }
    
    console.log(scene.children.length);
});

function animate(time) {
    highlightMesh.material.opacity = 1 + Math.sin(time / 120);
<<<<<<< HEAD
    highlightMesh.geometry.scale = battleshipLength;
=======
>>>>>>> parent of 691a886 (dynamic grid size and displaying placed grids, needs logic to block input)
    objects.forEach(function(object) {
        // object.rotation.x = time / 1000;
        // object.rotation.z = time / 1000;
        // object.position.y = 0.5 + 0.5 * Math.abs(Math.sin(time / 1000));
    });
    renderer.render(scene, camera)
    //rotation toggle
    if(rotationCount % 2 == 0){
        battleshipRotation = 0;
        
      }else{
        battleshipRotation = Math.PI/2;
      };
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// GUI //
const gui = new GUI();
gui.add(highlightMesh.scale, 'x', 1, 5);