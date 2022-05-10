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
for (countColumns = 0; countColumns < gridColumns; countColumns++){
for (countRows = 0; countRows < gridRows; countRows=countRows++){
    var object = new THREE.Mesh(gridPlane, gridMaterial);
    object.position.set(countRows,countColumns,1);
    scene.add(object);
    clear(object);
}
}


// ADDING OBJECTS TO SCENE //



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
