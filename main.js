import { GUI } from './js/dat.gui.module.js'

//GLOBAL CONSTS
const gridX = 10;
const gridY = 10;

//RENDERING + SCENE + LOADERS + GUI
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const sceneOrtho = new THREE.Scene(); // overlay scene
var plyloader = new THREE.PLYLoader();
plyloader = plyloader.load(
    'models/battleship1.ply',
    function (geometry) {
        geometry.computeVertexNormals();
        const mesh = new THREE.Mesh(geometry, shipMaterial)
        mesh.scale.x = 0.03;
        mesh.scale.y = 0.04;
        mesh.scale.z = 0.03;
        loadedMesh = mesh;
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
    },
    (error) => {
        console.log(error)
    }
);

const textureLoader = new THREE.TextureLoader();
renderer.autoClear = false; // to allow overlay
const gui = new GUI();

//CAMERA
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
const cameraOrtho = new THREE.OrthographicCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );
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
var ship3switch = 1;
var rotationCount = 0;
var check = 0;
var allowed = true;
var placingtime = true;
var fired = false;
var loadedMesh = new THREE.Mesh();
var playerTurn = 1;
var remainingArray = [ship2remain, ship3remain, ship4remain, ship5remain];
var P1placed = [];
var P2placed = [];
const P1ships = new THREE.Group();
const P2ships = new THREE.Group();
const objects = [];

// MATERIALS
const shipMaterial = new THREE.MeshMatcapMaterial({
    color: 0x004cff
    //color: 0xff0033 p2
});

// GEOMETRY 
const hitmarker = new THREE.TorusGeometry(1, 2 , 25, 200);
const missmarker = new THREE.TorusGeometry(1, 3 , 25, 3);

var material_floor = new THREE.MeshLambertMaterial();
material_floor.shininess=100;
//material_floor.color= new THREE.Color(0.2,0.2,1);
var normal_map = new THREE.TextureLoader().load('img/normal.png');
material_floor.normalMap=normal_map;

var geometry_plane = new THREE.BoxGeometry(1000,0.2,1000);
var floorMesh= new THREE.Mesh(geometry_plane,material_floor);
floorMesh.position.y-=6;
scene.add(floorMesh);

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
highlightMesh.translateY(0.5);
scene.add(highlightMesh);

//PRIVACY SCREEN
 const privacyMesh = new THREE.Mesh( new THREE.BoxGeometry(1500, 1500, 1500),
 new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide, transparent: false}));
 privacyMesh.name ='screen';
 privacyMesh.position.y = 500;
 sceneOrtho.add(privacyMesh);
 privacyMesh.visible = false

//KEY PRESS EVENT
document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(e){
    var keyCode = e.which
    switch(keyCode){
        case 82: // letter 'r' for rotating
        if (placingtime){
            rotate();
        }
        break;

        case 50: // number '2' for battleship select
            if (placingtime){
                shipType = 0;
                battleshipLength = 2;
                battleshipDestroyer();   
            }
        break;

        case 51: // number '3' for battleship select
        if (placingtime){
            shipType = 1;
            battleshipLength = 3;
            battleshipCruiser();
        }
        break;

        case 52: // number '4' for battleship select
        if (placingtime){
            shipType = 2;
            battleshipLength = 4;
            battleshipBattleship();
        }
        break;

        case 53: // number '5' for battleship select
        if (placingtime){
            shipType = 3;
            battleshipLength = 5;
            battleshipCarrier();
        }
        break;

        case 57: // number '9' to not end turn
            check = 0;
        break;

        case 48: // number '0' for next players placement turn
            if(check == 0){
                checkTurn();
            }else{
                nextTurn();
            }
        break;

        case 13: //
        privacyMesh.visible = false;
        break;
    }

};


// check end turn
function checkTurn(){
    if(placingtime){
            if(playerTurn % 2 == 0){
            //player2
            var count = [];
            for (let i = 0; i < remainingArray.length; i++){
                if(remainingArray[i] > 0){
                    count.push(i);
                }
            }
            if(count.length > 0){
                console.log("Cannot end turn. Please place all ships. Ships remaining:");
                for(let i = 0; i < count.length; i++){
                    count[i] = count[i] + 2;
                    console.log("Ship of length " + count[i]);
                }
                console.log(count);
            }else{
                console.log("Are you sure you want to end your turn?");
                console.log("Press 0 again to confirm the end of your turn, else press 9 to continue playing");
                check++;
            }
        }else{
            //player1
            var count = [];
            for (let i = 0; i < remainingArray.length; i++){
                if(remainingArray[i] > 0){
                    count.push(i);
                }
            }
            if(count.length > 0){
                console.log("Cannot end turn. Please place all ships. Ships remaining:");
                for(let i = 0; i < count.length; i++){
                    count[i] = count[i] + 2;
                    console.log("Ship of length " + count[i]);
                }
                console.log(count);
            }else{
                console.log("Are you sure you want to end your turn?");
                console.log("Press 0 again to confirm the end of your turn, else press 9 to continue playing");
                check++;
            }
        }
    }else{
        check++;
        console.log("Are you sure you want to end your turn?");
        console.log("Press 0 again to confirm the end of your turn, else press 9 to continue playing");
    }

};

function nextTurn(){
    console.log(P1placed);
    console.log(P2placed);
    check = 0;
    playerTurn++;
    P2ships.visible = false;
    P1ships.visible = false;
    privacyMesh.visible = true;
    fired = false;
    remainingArray = [ship2remain, ship3remain, ship4remain, ship5remain];
    if (playerTurn > 2){
        placingtime = false;
        battleshipLength = 1;
        xoffset = 0.5;
        zoffset = 0.5;
        //P2ships.material.opacity = 0.2;
        //rxoffset = 0.5;
        //rzoffset = 0.5;
    }

    if(playerTurn % 2 == 0){
        //player 2
        P2ships.visible = true;
        P1ships.visible = false;
        shipMaterial.color.set(0xff0033);
    }else{
        //player 1
        P1ships.visible = true;
        P2ships.visible = false;
        shipMaterial.color.set(0x004cff);
    }
    console.log("Press enter when the next player is behind the screen and ready for their turn")
};

// DESTROYER = 2 spaces long
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

    const loader = new THREE.PLYLoader();
    if(remainingArray[shipType] > 0){
        loader.load(
            'models/battleship1.ply',
            function (geometry) {
                geometry.computeVertexNormals();
                const mesh = new THREE.Mesh(geometry, shipMaterial)
                mesh.scale.x = 0.03;
                mesh.scale.y = 0.04;
                mesh.scale.z = 0.03;
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

    const loader = new THREE.PLYLoader();
    if(remainingArray[shipType] > 0){
        if(ship3switch % 2 == 0){
            loader.load(
                'models/cruiser.ply',
                function (geometry) {
                    geometry.computeVertexNormals();
                    const mesh = new THREE.Mesh(geometry, shipMaterial)
                    mesh.scale.x = 0.05;
                    mesh.scale.y = 0.08;
                    mesh.scale.z = 0.08;
                    loadedMesh = mesh;
                    loadedMesh.position.set(loadedMesh.position.x+0.2, loadedMesh.position.y+0.2, loadedMesh.position.z+0.2);
                },
                (xhr) => {
                    console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
                },
                (error) => {
                    console.log(error)
                }
            );
        }else{
            loader.load(
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

    const loader =  new THREE.PLYLoader();
    if(remainingArray[shipType] > 0){
        loader.load(
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

    const loader =  new THREE.PLYLoader();
    loader.load(
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
    if (placingtime){
        intersects.forEach(function(intersect) {
            if(playerTurn % 2 == 0){
                if(intersect.object.name === 'placed2') {
                        highlightMesh.material.color.setHex(0xFF0000);
                        allowed = false;
                }
            }else{
                if(intersect.object.name === 'placed1') {
                        highlightMesh.material.color.setHex(0xFF0000);
                        allowed = false;
                }
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
                    if(playerTurn % 2 == 0){
                        if(objectExist.name === 'placed2') {
                                highlightMesh.material.color.setHex(0xFF0000);
                                allowed = false;
                        }
                    }else{
                        if(objectExist.name === 'placed1') {
                                highlightMesh.material.color.setHex(0xFF0000);
                                allowed = false;
                        }
                    }
                        // highlightMesh.material.color.setHex(0xFF0000);
                        // allowed = false;
                        // console.log("A ship is in the way of placement!");
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
            //console.log(highlightMesh.position);2
        });
        if(!allowed){
            console.log("you cannot place your object here!!!");
        };
    }else{
        intersects.forEach(function(intersect) {
            if(intersect.object.name === 'ground') {
                const highlightPos = new THREE.Vector3().copy(intersect.point).floor();
                highlightMesh.position.set(highlightPos.x+xoffset+rxoffset, 0, highlightPos.z+zoffset+rzoffset);
                highlightMesh.material.color.setHex(0xFFFFFF);
                const objectExist = objects.find(function(object) {
                return (object.position.x === highlightMesh.position.x)
                        && (object.position.z === highlightMesh.position.z)
                });
        }
    });
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
                if (placingtime){
                    if(remainingArray[shipType] > 0 && allowed){
                        const placement = new THREE.Mesh( new THREE.PlaneGeometry(battleshipLength, 1),
                        new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, transparent: true}));
                        placement.position.copy(highlightMesh.position);
                        placement.rotation.copy(highlightMesh.rotation);
                        placement.rotation.y = battleshipRotation;
                        placement.rotateX(-battleshipRotation);
                        //placement.material.color.setHex(0x00FFFF);
                        var count = 1;
                        var placed = new THREE.Vector3();
                        placed.set(Math.ceil(highlightMesh.position.x),Math.ceil(highlightMesh.position.y),Math.ceil(highlightMesh.position.z));
                        if(battleshipRotation == 0){
                            while(count < battleshipLength){
                                    console.log(placed);
                                    if(playerTurn % 2 == 0){
                                        placement.name = 'placed2'
                                        P2placed.push(placed);
                                        P2ships.add(placement);

                                    }else{
                                        placement.name = 'placed1'
                                        P1placed.push(placed);
                                        P1ships.add(placement);
                                    };
                                    placed.x = placed.x - 1;
                                    count++;
                            }
                        }else{
                            while(count < battleshipLength){
                                console.log(placed);
                                if(playerTurn % 2 == 0){
                                    placement.name = 'placed2'
                                    P2placed.push(placed);
                                    P2ships.add(placement);
                                }else{
                                    placement.name = 'placed1'
                                    P1placed.push(placed);
                                    P1ships.add(placement);
                                };
                                placed.z = placed.z - 1;
                                count++;
                            }
                        }

                        console.log(placed);
                        //console.log(placement.position);
                        // scene.add(placement);
                        objects.push(placement);
                        placement.translateZ(-0.001);



                        if(playerTurn % 2 == 0){
                            //shipMaterial.color.set(0xff0033);
                            const shipMesh = loadedMesh.clone();
                            //shipMesh.material.color.set(0xff0033);
                            shipMesh.name = 'player2'
                            //console.log("player2");
                            shipMesh.position.set(placement.position.x,0.07,placement.position.z);
                            shipMesh.rotation.y = battleshipRotation;
                            P2ships.add(shipMesh);
                            remainingArray[shipType] = remainingArray[shipType] - 1;
                            placement.material.color.setHex(0xff0033);
                            scene.add(P2ships);
                        }else{
                            //shipMaterial.color.set(0x004cff);
                            const shipMesh = loadedMesh.clone();
                            //shipMesh.material.color.set(0x004cff);
                            shipMesh.name = 'player1'
                        // scene.add(shipMesh);
                            shipMesh.position.set(placement.position.x,0.07,placement.position.z);
                            shipMesh.rotation.y = battleshipRotation;
                            P1ships.add(shipMesh);
                            remainingArray[shipType] = remainingArray[shipType] - 1;
                            placement.material.color.setHex(0x004cff);
                            scene.add(P1ships);

                        }

                        if(shipType == 1){
                            ship3switch++;
                            battleshipCruiser();
                        }
                        //scene.add(shipMesh);

                    }else{
                        console.log("You can not place any more ships of this type or not allowed to place here!")
                    };

                }
        };

        if(!placingtime){
            if(!fired){
                if(playerTurn % 2 == 0){
                        if(intersect.object.name === 'placed1') {
                            const hitp2 = new THREE.Mesh( hitmarker,
                            new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, transparent: true}));        
                            hitp2.material.color.setHex(0x39FF14);
                            hitp2.position.copy(highlightMesh.position);
                            hitp2.rotation.copy(highlightMesh.rotation);
                            hitp2.rotation.y = battleshipRotation;
                            hitp2.rotateX(-battleshipRotation);
                            hitp2.scale.x = 0.1;
                            hitp2.scale.y = 0.1;
                            hitp2.scale.z = 0.1;

                            P2ships.add(hitp2);
                            scene.add(P2ships);                        
                        }

                        if(intersect.object.name !== 'placed1') {
                            const missp2 = new THREE.Mesh(missmarker,
                            new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, transparent: true})); 
                            missp2.material.color.setHex(0x808080);
                            missp2.position.copy(highlightMesh.position);
                            missp2.rotation.copy(highlightMesh.rotation);
                            missp2.rotation.y = battleshipRotation;
                            missp2.rotateX(-battleshipRotation);
                            missp2.scale.x = 0.1;
                            missp2.scale.y = 0.1;
                            missp2.scale.z = 0.1;

                            P2ships.add(missp2);
                            scene.add(P2ships);
                        }

                    }else{
                        if(intersect.object.name === 'player2') {
                            const hitp1 = new THREE.Mesh( hitmarker,
                            new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, transparent: true}));        
                            hitp1.material.color.setHex(0x39FF14);
                            hitp1.position.copy(highlightMesh.position);
                            hitp1.rotation.copy(highlightMesh.rotation);
                            hitp1.rotation.y = battleshipRotation;
                            hitp1.rotateX(-battleshipRotation);
                            hitp1.scale.x = 0.1;
                            hitp1.scale.y = 0.1;
                            hitp1.scale.z = 0.1;

                            P1ships.add(hitp1);
                            scene.add(P1ships);

                        }
                        if(intersect.object.name === 'player2') {
                            const missp1 = new THREE.Mesh(missmarker,
                            new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, transparent: true})); 
                            missp1.material.color.setHex(0x808080);
                            missp1.position.copy(highlightMesh.position);
                            missp1.rotation.copy(highlightMesh.rotation);
                            missp1.rotation.y = battleshipRotation;
                            missp1.rotateX(-battleshipRotation);
                            missp1.scale.x = 0.1;
                            missp1.scale.y = 0.1;
                            missp1.scale.z = 0.1;

                            P1ships.add(missp1);
                            scene.add(P1ships);
                        }
                    }
                    fired = true;
                    setTimeout(function(){ 

                        nextTurn();
                    }, 3000);
            }
 
        }
    });   //console.log(scene.children.length);
};
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
    // objects.forEach(function(object) {
    //     // if(object.name === 'ship'){
    //     //     object.rotation.x = object.rotation.x + time/360 * Math.PI/2;
    //     // }
    // });

    renderer.clear();
    renderer.render( scene, camera );
    renderer.clearDepth();
    renderer.render( sceneOrtho, cameraOrtho );

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
// gui.add(highlightMesh.scale, 'x', 1, 2.5);
// gui.add(highlightMesh.position, 'x', -5, 5);
// gui.add(highlightMesh.position, 'z', -5, 5);
/*gui.addColor(highlightMesh.material.color.getHex(),0,0.1 {
  highlightMesh.material.color.setHex()
});*/
