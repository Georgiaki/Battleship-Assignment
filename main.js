import { GUI } from './js/dat.gui.module.js'
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
//const textureLoader = new THREE.TextureLoader();
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
var battleshipRotation = Math.PI/2;
var ship2remain = 1;
var ship3remain = 2;
var ship4remain = 1;
var ship5remain = 1;
var shipType = 0;
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
const highlightMesh = new THREE.Mesh( new THREE.BoxGeometry(battleshipLength, -1, 1), 
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
        if(remainingArray[shipType] > 0){
            battleshipBattleship();

        }
        break;

        case 53: // number '5' for battleship select
            shipType = 3;
            battleshipLength = 5;
            if(remainingArray[shipType] > 0){
                battleshipCarrier();

            }
        break;

        case 48: // number '0' for next players placement turn
        hidePlayer1 = true;
        hidePlayer2 = false;
        var remainingArray = [ship2remain, ship3remain, ship4remain, ship5remain];

        break;
    }

};

//5 spaces long
function battleshipCarrier(){
    xoffset = 0.5;
    zoffset = 0.5;
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

// 4 spaces long
 function battleshipBattleship(){
    xoffset = 0;
    zoffset = 0.5;
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
            allowed = true;
            const highlightPos = new THREE.Vector3().copy(intersect.point).floor();
            highlightMesh.position.set(Math.floor(highlightPos.x)+xoffset, -0.5, Math.floor(highlightPos.z)+zoffset);
            highlightMesh.material.color.setHex(0xFFFFFF);
            const objectExist = objects.find(function(object) {
            return (object.position.x === highlightMesh.position.x)
                && (object.position.z === highlightMesh.position.z)
            });

            if(rotationCount % 2 == 0 && highlightMesh.position.x == -5){
                console.log(highlightMesh.position)
                highlightMesh.material.color.setHex(0xFF0000);
                allowed = false;
            }
            
            if(rotationCount % 2 != 0 && highlightMesh.position.z == -5){
                console.log(highlightMesh.position)
                highlightMesh.material.color.setHex(0xFF0000);
                allowed = false;
            }

            if(objectExist){
                highlightMesh.material.color.setHex(0xFF0000);
                allowed = false;
            }   
        }
    });
});



function rotate(){
    rotationCount++;
    highlightMesh.position.set(Math.ceil(highlightMesh.x)+xoffset, 0, Math.ceil(highlightMesh.z)+zoffset);
    if(rotationCount % 2 == 0){
        battleshipRotation = 0;
        xoffset=0;
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



 window.addEventListener('mousedown', function() {
     const objectExist = objects.find(function(object) {
         return (object.position.x === highlightMesh.position.x)
         && (object.position.z === highlightMesh.position.z)
     });

    if(!objectExist) {
        intersects.forEach(function(intersect) {
            if(intersect.object.name === 'ground') {
                if(remainingArray[shipType] > 0 && allowed){
                    const placement = new THREE.Mesh( new THREE.BoxGeometry(battleshipLength, -1, 1), 
                    new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, transparent: true}));                    
                    placement.position.copy(highlightMesh.position);
                    placement.rotation.copy(highlightMesh.rotation);
                    placement.rotation.y = battleshipRotation;
                    placement.rotateX(-battleshipRotation);
                    placement.material.color.setHex(0x00FFFF);
                    placement.name = 'placed'
                    var count = 0;
                    var placed = new THREE.Vector3(highlightMesh.position.Vector3);
          

                    // var x = placement.position.x;
                    // var z = placement.position.z;
                    // if(battleshipRotation == 0){
                    //     while(count < battleshipLength){
                    //         P1placed.push(placement.position);
                    //         placx--; 
                            
                    //         count++;

                    //     }
                    // }else{

                    // };
                    console.log(placed.position);
                    console.log(placement.position);
                    scene.add(placement);
                    objects.push(placement);

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
                    objects.push(shipMesh);
                    remainingArray[shipType] = remainingArray[shipType] - 1;
                };
            };



        });
    };
    //console.log(scene.children.length);
});

//ANIMATE
function animate(time) {
    highlightMesh.material.opacity = 1 + Math.sin(time / 120);
    //objects.forEach(function(object) {});
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
//gui.add(highlightMesh.scale, 'x', 1, 5);