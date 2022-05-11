//import * as THREE from '/js/three.js';
//import {OrbitControls} from '/js/OrbitControls.js';
import {GUI} from './js/dat.gui.module.js'

const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const orbit = new THREE.OrbitControls(camera, renderer.domElement);

camera.position.set(10, 15, -22);

orbit.update();

// select ship size
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



const planeMesh = new THREE.Mesh(
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
scene.add(grid);

const highlightMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(battleshipLength, 1),
    new THREE.MeshBasicMaterial({
        side: THREE.DoubleSide,
        transparent: true
    })
);
highlightMesh.rotateX(battleshipRotation);
highlightMesh.position.set(0.5, 0, 0.5);
scene.add(highlightMesh);


const mousePosition = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
let intersects;

// key presses
var rotationCount = 0;
document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(e){
    var keyCode = e.which
    switch(keyCode){
        case 82: // letter 'r' for rotating
            rotationCount++;
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
    objects.forEach(function(object) {
        // object.rotation.x = time / 1000;
        // object.rotation.z = time / 1000;
        // object.position.y = 0.5 + 0.5 * Math.abs(Math.sin(time / 1000));
    });
    renderer.render(scene, camera);











    //battleship select
    /*
    switch (battleshipLength) {
        case 2:
            xoffset = 0;
            zoffset = 0.5;
          break;
    
        case 3:
            xoffset = 0.5;
            zoffset = 0.5;
          break;
    
        case 4:
            xoffset = 0;
            zoffset = 0.5;
          break;
    
        case 5:
            xoffset = 0.5;
            zoffset = 0.5;
          break;
      };
    */
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







/*// GLOBAL VARIABLES  //
const gridRows = 4;
var countRows = 0;
const gridColumns = 4;
var countColumns = 0;

// CAMERA AND VECTORS //
var cameraCenter = new THREE.Vector3();
var mouse = new THREE.Vector2();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.z = 300;
camera.position.x = 0;
camera.position.y = 0;
camera.lookAt (new THREE.Vector3(0,0,0));
cameraCenter.x = camera.position.x;
cameraCenter.y = camera.position.y;

// SCENE AND EVENT LISTENERS//
var scene = new THREE.Scene();
document.addEventListener('mousemove', mouseMove, false);
window.addEventListener('resize', windowResize, false);


// RENDERER //
var renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setClearColor("#000000");
renderer.setSize(window.innerWidth,window.innerHeight);
document.body.appendChild(renderer.domElement);

/---------------------/
// GEOMETRY //
var gridPlane = new THREE.PlaneGeometry(10,10);

// MATERIALS //
var gridMaterial = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );

// MESHES AND ADJUSTMENTS //
// for (countColumns = 0; countColumns < gridColumns; countColumns++){
// for (countRows = 0; countRows < gridRows; countRows=countRows++){
//     var object = new THREE.Mesh(gridPlane, gridMaterial);
//     object.position.set(countRows,countColumns,1);
//     scene.add(object);
//     clear(object);
// }
// }


// ADDING OBJECTS TO SCENE //

// // geometry
// var geometry = new THREE.PlaneGeometry();
// geometry.vertices.push( new THREE.Vector3( 0, 5, 0 ) );
// geometry.vertices.push( new THREE.Vector3( 5, -5, -2 ) );
// geometry.vertices.push( new THREE.Vector3( -5, -5, 2 ) );
// geometry.vertices.push( new THREE.Vector3( 0, 5, 0 ) ); // close the loop

// const size = 10;
// const divisions = 10;

// const gridHelper = new THREE.GridHelper( size, divisions );
// gridHelper.position(0,0,0)
// scene.add( gridHelper );

// // material
// var material = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 5 } );

// // line
// var line = new THREE.Line( geometry, material );
// scene.add( line );
class GridHelper extends LineSegments {

	constructor( size = 10, divisions = 10, color1 = 0x444444, color2 = 0x888888 ) {

		color1 = new Color( color1 );
		color2 = new Color( color2 );

		const center = divisions / 2;
		const step = size / divisions;
		const halfSize = size / 2;

		const vertices = [], colors = [];

		for ( let i = 0, j = 0, k = - halfSize; i <= divisions; i ++, k += step ) {

			vertices.push( - halfSize, 0, k, halfSize, 0, k );
			vertices.push( k, 0, - halfSize, k, 0, halfSize );

			const color = i === center ? color1 : color2;

			color.toArray( colors, j ); j += 3;
			color.toArray( colors, j ); j += 3;
			color.toArray( colors, j ); j += 3;
			color.toArray( colors, j ); j += 3;

		}

		const geometry = new BufferGeometry();
		geometry.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
		geometry.setAttribute( 'color', new Float32BufferAttribute( colors, 3 ) );

		const material = new LineBasicMaterial( { vertexColors: true, toneMapped: false } );

		super( geometry, material );

		this.type = 'GridHelper';

	}

}

// LIGHTING //
var ambLight = new THREE.AmbientLight(0xFD4AFA);
ambLight.position.set(camera.position.x,camera.position.y,camera.position.z);
var pointLight = new THREE.PointLight( 0xffffff, 5, 100);

// ADDING LIGHTS TO SCENE //
scene.add(ambLight);
scene.add(pointLight);


/----------------------------------------------------------------/
// MESH FUNCTIONS //

function test(){}; // placeholder



/-----------------------------------------------------------------------------/
// SYSTEM FUNCTIONS //

// fix window when resized
function windowResize ()
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// create movement of camera with mouseClick and Hover
  function updateCamera() {
    camera.position.x = cameraCenter.x + (cameraHorzLimit * mouse.x);
    camera.position.y = cameraCenter.y + (cameraVertLimit * mouse.y);
}

// event for mouse move
function mouseMove(event) {
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}



/-----------------------------------------------------------------------------------------------------/
// RENDER SCENE //
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();
*/
