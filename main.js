//import * as THREE from './js/three.js'
import { GUI } from './js/dat.gui.module.js'
//import {OrbitControls} from './js/OrbitControls.js'
//import {Water} from './js/Water.js'
//import {Sky} from './js/Sky.js'

//GLOBAL CONSTS
const gridX = 10;
const gridY = 10;

//RENDERING + SCENE + LOADERS + GUI
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const plyloader = new THREE.PLYLoader();
const textureLoader = new THREE.TextureLoader();
const gui = new GUI();

//CAMERA
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
const orbit = new THREE.OrbitControls(camera, renderer.domElement);
camera.position.set(10, 15, -22);
orbit.update();

// INIT VARIABLES
var battleshipLength = 2;
var xoffset = 0;
var zoffset = 0.5;
var rxoffset = 0;
var rzoffset = 0;
var xborder = -5;
var zborder = -5;
var battleshipRotation = Math.PI/2;
var ship2remain = 1;
var ship3remain = 2;
var ship4remain = 1;
var ship5remain = 1;
var shipType = 0;
var ship3switch = 0;
var rotationCount = 0;
var allowed = true;
var loadedMesh = new THREE.Mesh();
var hidePlayer1 = true;
var hidePlayer2 = false;
var playerTurn = 2;
var remainingArray = [ship2remain, ship3remain, ship4remain, ship5remain];
var P1placed = [];
//const default = [];
const objects = [];


// MATERIALS
const shipMaterial = new THREE.MeshMatcapMaterial({
    color: 0x004cff //player1
//  color: 0xff0033   player2
});

// INVISIBLE PLANE + GRID
const planeMesh = new THREE.Mesh( new THREE.PlaneGeometry(gridX, gridY),
new THREE.MeshBasicMaterial({side: THREE.DoubleSide,visible: false}));
planeMesh.rotateX(-Math.PI / 2);
scene.add(planeMesh);
planeMesh.name = 'ground';
const grid = new THREE.GridHelper(gridX, gridY);
scene.add(grid);

const mousePosition = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
let intersects;

// HIGHLIGHT MESH
const highlightMesh = new THREE.Mesh( new THREE.PlaneGeometry(battleshipLength, 1),
new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, transparent: true}));
highlightMesh.rotateX(-battleshipRotation);
scene.add(highlightMesh);


//KEY PRESS EVENT
document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(e){
    var keyCode = e.which
    switch(keyCode){
        case 82: // letter 'r' for rotating
            rotate();
            //console.log(rotationCount);
        break;

        case 50: // number '2' for battleship select
            shipType = 0;
            battleshipLength = 2;
            battleshipDestroyer();
            //console.log(remainingArray);
        break;

        case 51: // number '3' for battleship select
            shipType = 1;
            battleshipLength = 3;
            battleshipCruiser();
            //console.log(remainingArray)
        break;

        case 52: // number '4' for battleship select
            shipType = 2;
            battleshipLength = 4;
            battleshipBattleship();
        break;

        case 53: // number '5' for battleship select
            shipType = 3;
            battleshipLength = 5;
            battleshipCarrier();
        break;

        case 48: // number '0' for next players placement turn
        hidePlayer1 = true;
        hidePlayer2 = false;
        var remainingArray = [ship2remain, ship3remain, ship4remain, ship5remain];

        break;
    }

};

// 2 spaces long
function battleshipDestroyer(){
    xoffset = 0;
    zoffset = 0.5;
    xborder = -5;
    zborder = -5;
    if(battleshipRotation == 0){
        rxoffset = 0;
        rzoffset = 0;
    }else{
        rxoffset = 0.5;
        rzoffset = -0.5;
    }

    if(remainingArray[shipType] > 0){
        plyloader.load(
            'models/battleship2.ply',
            function (geometry) {
                geometry.computeVertexNormals();
                const mesh = new THREE.Mesh(geometry, shipMaterial)
                mesh.scale.x = 0.07;
                mesh.scale.y = 0.08;
                mesh.scale.z = 0.08;
                loadedMesh = mesh;
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
            },
            (error) => {
                console.log(error)
            }
        );
    }else{
        console.log("You can not place any more ships of this type!")
    }

};

// CRUISER = 3 spaces long
function battleshipCruiser(){
    xoffset = -0.5;
    zoffset = 0.5;
    xborder = -4.5;
    zborder = -4.5;
    if(battleshipRotation == 0){
        rxoffset = 0;
        rzoffset = 0;
    }else{
        rxoffset = 1;
        rzoffset = -1;
    }

    if(remainingArray[shipType] > 0){
        if(ship3switch % 2 == 0){
            plyloader.load(
                'models/cruiser.ply',
                function (geometry) {
                    geometry.computeVertexNormals();
                    const mesh = new THREE.Mesh(geometry, shipMaterial)
                    mesh.scale.x = 0.05;
                    mesh.scale.y = 0.08;
                    mesh.scale.z = 0.08;
                    loadedMesh = mesh;
                },
                (xhr) => {
                    console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
                },
                (error) => {
                    console.log(error)
                }
            );
        }else{
            plyloader.load(
                'models/submarine.ply',
                function (geometry2) {
                    geometry2.computeVertexNormals();
                    const mesh2 = new THREE.Mesh(geometry2, shipMaterial)
                    mesh2.scale.x = 0.07;
                    mesh2.scale.y = 0.07;
                    mesh2.scale.z = 0.07;
                    loadedMesh = mesh2;
                    loadedMesh.rotateY(Math.PI/4);

                    //loadedMesh.rotateX(Math.PI/4);
                },
                (xhr) => {
                    console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
                },
                (error) => {
                    console.log(error)
                }
            );
        }
        ship3switch++;
    }else{
        console.log("You can not place any more ships of this type!")
    }


};

// BATTLESHIP = 4 spaces long
 function battleshipBattleship(){
    xoffset = -1;
    zoffset = 0.5;
    xborder = -4;
    zborder = -4;
    if(battleshipRotation == 0){
        rxoffset = 0;
        rzoffset = 0;
    }else{
        rxoffset = 1.5;
        rzoffset = -1.5;
    }

    if(remainingArray[shipType] > 0){
        plyloader.load(
            'models/battleship2.ply',
            function (geometry) {
                geometry.computeVertexNormals();
                const mesh = new THREE.Mesh(geometry, shipMaterial)
                mesh.scale.x = 0.07;
                mesh.scale.y = 0.08;
                mesh.scale.z = 0.08;
                loadedMesh = mesh;
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
            },
            (error) => {
                console.log(error)
            }
        );
    }else{
        console.log("You can not place any more ships of this type!")
    }

};

// CARRIER = 5 spaces long
function battleshipCarrier(){
    xoffset = -1.5;
    zoffset = 0.5;
    xborder = -3.5;
    zborder = -3.5;
    if(battleshipRotation == 0){
        rxoffset = 0;
        rzoffset = 0;
    }else{
        rxoffset = 2;
        rzoffset = -2;
    }

    console.log(remainingArray);
    plyloader.load(
        'models/carrier2.ply',
        function (geometry) {
            geometry.computeVertexNormals();
            const mesh = new THREE.Mesh(geometry, shipMaterial);
            mesh.scale.x = 0.48;
            mesh.scale.y = 0.50;
            mesh.scale.z = 0.50;
            loadedMesh = mesh;
        },
        (xhr) => {
            console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
        },
        (error) => {
            console.log(error)
        }
    );
};

function rotate(){
    rotationCount++;
    if(rotationCount % 2 == 0){
        battleshipRotation = 0;
        rxoffset = 0;
        rzoffset = 0;
        console.log("rotate A");
        }else{
            switch(shipType){
                case 0:
                    rxoffset = 0.5;
                    rzoffset = -0.5;
                break;

                case 1:
                    rxoffset = 1;
                    rzoffset = -1;
                break;

                case 2:
                    rxoffset = 1.5;
                    rzoffset = -1.5;
                break;

                case 3:
                    rxoffset = 2;
                    rzoffset = -2;
                break;
            }
        battleshipRotation = Math.PI/2;
        console.log("rotate B");
    }

    highlightMesh.rotation.z = battleshipRotation;
};


window.addEventListener('mousemove', function(e) {
    mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
    mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1;
    highlightMesh.scale.x  = battleshipLength/2;
    raycaster.setFromCamera(mousePosition, camera);
    intersects = raycaster.intersectObjects(scene.children);
    intersects.forEach(function(intersect) {
        if(intersect.object.name === 'placed') {
                highlightMesh.material.color.setHex(0xFF0000);
                allowed = false;
        }

        if(intersect.object.name === 'ground') {
            const highlightPos = new THREE.Vector3().copy(intersect.point).floor();
            highlightMesh.position.set(highlightPos.x+xoffset+rxoffset, 0, highlightPos.z+zoffset+rzoffset);
            highlightMesh.material.color.setHex(0xFFFFFF);
            const objectExist = objects.find(function(object) {
            return (object.position.x === highlightMesh.position.x)
                    && (object.position.z === highlightMesh.position.z)
            });

            if(objectExist){
                    highlightMesh.material.color.setHex(0xFF0000);
                    allowed = false;
                    console.log("A ship is in the way of placement!");
            }

            if(battleshipRotation == 0){
                 if(highlightMesh.position.x <= xborder){
                        allowed = false;
                 }else{
                        allowed = true;
                 }
             }else{
                 if(highlightMesh.position.z <= zborder){
                        allowed = false;
                 }
                 else{
                      allowed = true;
                  }
            }

        }
    });
    if(!allowed){
        console.log("you cannot place your object here!!!");
    }
});






// MOUSE CLICK EVENT
 window.addEventListener('mousedown', function() {
     const objectExist = objects.find(function(object) {
         return (object.position.x === highlightMesh.position.x)
         && (object.position.z === highlightMesh.position.z)
     });

    if(!objectExist) {
        intersects.forEach(function(intersect) {
            if(intersect.object.name === 'ground') {
                if(remainingArray[shipType] > 0 && allowed){
                    const placement = new THREE.Mesh( new THREE.PlaneGeometry(battleshipLength, 1),
                    new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, transparent: true}));
                    placement.position.copy(highlightMesh.position);
                    //placement.position.set(Math.ceil(highlightMesh.position.x),Math.ceil(highlightMesh.position.y),Math.ceil(highlightMesh.position.z));
                    placement.rotation.copy(highlightMesh.rotation);
                    placement.rotation.y = battleshipRotation;
                    placement.rotateX(-battleshipRotation);
                    placement.material.color.setHex(0x00FFFF);
                    placement.name = 'placed'
                    var count = 1;
                    var placed = new THREE.Vector3();
                    placed.set(Math.ceil(highlightMesh.position.x),Math.ceil(highlightMesh.position.y),Math.ceil(highlightMesh.position.z));
                    if(battleshipRotation == 0){
                         while(count < battleshipLength){
                                console.log(placed);
                                P1placed.push(placed);
                                placed.x = placed.x - 1;
                                count++;
                         }
                    }else{
                        while(count < battleshipLength){
                            console.log(placed);
                            P1placed.push(placed);
                            placed.z = placed.z - 1;
                            count++;
                         }
                    }

                    console.log(placed);
                    console.log(placement.position);
                    scene.add(placement);
                    objects.push(placement);

                    if(allowed){

                    }
                    const shipMesh = loadedMesh.clone();
                    if(playerTurn == 1){
                        shipMesh.material.color.set(0x004cff);
                     }else{
                        shipMesh.material.color.set(0xff0033);
                     }
                    shipMesh.name = 'player1'
                    scene.add(shipMesh);
                    shipMesh.position.set(placement.position.x,0.07,placement.position.z);
                    shipMesh.rotation.y = battleshipRotation;
                    shipMesh.name = 'ship';
                    objects.push(shipMesh);
                    remainingArray[shipType] = remainingArray[shipType] - 1;
                }else{
                    console.log("You can not place any more ships of this type or not allowed to place here!")
                };
            };



        });
    };
    //console.log(scene.children.length);
});

var materialArray = [];
let txeture_Frint = new THREE.TextureLoader().load('./Daylight/Box_Front.png');
let txeture_Back = new THREE.TextureLoader().load('./Daylight/Box_Back.png');
let txeture_Top = new THREE.TextureLoader().load('./Daylight/Box_Top.png');
let txeture_Bottom = new THREE.TextureLoader().load('./Daylight/Box_Bottom.png');
let txeture_Right = new THREE.TextureLoader().load('./Daylight/Box_Left.png');
let txeture_Left = new THREE.TextureLoader().load('./Daylight/Box_Right.png');

materialArray.push(new THREE.MeshBasicMaterial({map:txeture_Frint}));
materialArray.push(new THREE.MeshBasicMaterial({map:txeture_Back}));
materialArray.push(new THREE.MeshBasicMaterial({map:txeture_Top}));
materialArray.push(new THREE.MeshBasicMaterial({map:txeture_Bottom}));
materialArray.push(new THREE.MeshBasicMaterial({map:txeture_Right}));
materialArray.push(new THREE.MeshBasicMaterial({map:txeture_Left}));

 for(let i =0; i<6; i++){
   materialArray[i].side= THREE.BackSide;
 }

let skyboxGeo = new THREE.BoxGeometry(1000,1000,1000);
let skybox = new THREE.Mesh(skyboxGeo, materialArray);
scene.add(skybox);

var ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.3);
scene.add(ambientLight);

//ANIMATE
function animate(time) {
    highlightMesh.material.opacity = 1 + Math.sin(time / 120);
    objects.forEach(function(object) {
        // if(object.name === 'ship'){
        //     object.rotation.x = object.rotation.x + time/360 * Math.PI/2;
        // }
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
gui.add(highlightMesh.scale, 'x', 1, 2.5);
gui.add(highlightMesh.position, 'x', -5, 5);
gui.add(highlightMesh.position, 'z', -5, 5);
/*gui.addColor(highlightMesh.material.color.getHex(),0,0.1 {
  highlightMesh.material.color.setHex()
});*/
