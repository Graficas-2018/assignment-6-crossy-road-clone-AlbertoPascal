var renderer = null, 
scene = null, 
camera = null,
root = null,
group = null,
orbitControls = null,
mainChar = null;

var duration = 20000; // ms

var currentTime = Date.now();

var initTimer = true, time = null, timer = 30;
var highScore = 0, score = 0;

var canvas = null;

var keypressed = false;

var mainCharBox = null, mainCharBoxHelper = null;
var move = null;
var colliderObjects = [], moveObjects = [], movementColliders = [], cars = [], woods = [];
var mainCharBoxSize = new THREE.Vector3( 1.5, 1.5, 1.5 );

var carAnimation = null, woodAnimation = [];

function onKeyDown(event)
{
    if (!keypressed) {
        //console.log(event.keyCode);
        switch(event.keyCode)
        {
            case 38:
                mainChar.position.z -= 2;
                move = 'up';
                break;

            case 37:
                mainChar.position.x -= 2;
                move = 'left';
                break;

            case 39:
                mainChar.position.x += 2;
                move = 'right';
                break;
        }

        console.log(mainChar);
        keypressed = true;
    }
}

function onKeyUp(event)
{
    keypressed = false;
}

function Collision() {
    mainCharBoxHelper.update();
    mainCharBox = new THREE.Box3().setFromObject(mainChar);
    //mainCharBox = new THREE.Box3().setFromCenterAndSize({center: mainChar.position, size: mainCharBoxSize});

    for (var collider of colliderObjects) {
        if (mainCharBox.intersectsBox(collider)) {
            console.log('Collides');
            /*switch(move) {
                case 'up':
                        mainChar.position.z += 2;
                        break;

                case 'right':
                        mainChar.position.x -= 2;
                        break;

                case 'left':
                        mainChar.position.x += 2;
                        break;

                default:
                        break;
            }

            move = 'else'; */
        }
    }

    for (var collider of movementColliders) {
        if (mainCharBox.intersectsBox(collider)) {
            console.log('Collides');
            switch(move) {
                case 'up':
                        mainChar.position.z += 2;
                        break;

                case 'right':
                        mainChar.position.x -= 2;
                        break;

                case 'left':
                        mainChar.position.x += 2;
                        break;

                default:
                        break;
            }
        }
    }
}

function updateMovementColliders() {
    movementColliders = [];
    for (var moveColliders of moveObjects) {
        cubeBBox = new THREE.Box3().setFromObject(moveColliders);
        movementColliders.push(cubeBBox);
    }
}

function movementAnimation() {

    for (var car of cars) {
        duration = (Math.random() * 5 + 1) * 1000;
        console.log(duration);
        carAnimation = new KF.KeyFrameAnimator;
        carAnimation.init({ 
            interps:
                [
                    { 
                        keys:[0, .5, 1], 
                        values:[
                                { x : 12 },
                                { x : -12 },
                                { x : 12 },
                                ],
                        target:car.position
                    }
                ],
            loop: true,
            duration: duration
        });
        carAnimation.start();
    }

    for (let x = 0; x < woods.length; x++) {
        duration = (Math.random() * 3 + 3) * 1000;
        woodAnimation[x].init({ 
            interps:
                [
                    { 
                        keys:[0, .5, 1], 
                        values:[
                                { x : 12 },
                                { x : -12 },
                                { x : 12 },
                                ],
                        target:woods[x].position
                    }
                ],
            loop: true,
            duration: duration
        });
        woodAnimation[x].start();
    }
}

function run() {
    requestAnimationFrame(function() { run(); });
    
        // Render the scene
        renderer.render( scene, camera );

        // Update objects that can move
        updateMovementColliders();

        // Collider detection
        Collision();

        // Update the animations
        KF.update();

        // Update the camera controller
        orbitControls.update();
}

function setLightColor(light, r, g, b)
{
    r /= 255;
    g /= 255;
    b /= 255;
    
    light.color.setRGB(r, g, b);
}

var directionalLight = null;
var spotLight = null;
var ambientLight = null;
var mapUrl = "../images/checker_large.gif";

var SHADOW_MAP_WIDTH = 2048, SHADOW_MAP_HEIGHT = 2048;

function createScene(canvas) {

    this.canvas = canvas;
    
    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    // Set the viewport size
    renderer.setSize(canvas.width, canvas.height);

    // Turn on shadows
    renderer.shadowMap.enabled = true;
    // Options are THREE.BasicShadowMap, THREE.PCFShadowMap, PCFSoftShadowMap
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Create a new Three.js scene
    scene = new THREE.Scene();

    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 4000 );
    camera.position.set(0, 6, 30);
    scene.add(camera);

    orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
        
    // Create a group to hold all the objects
    root = new THREE.Object3D;
    
    spotLight = new THREE.SpotLight (0xffffff);
    spotLight.position.set(-30, 8, -10);
    spotLight.target.position.set(-2, 0, -2);
    root.add(spotLight);

    spotLight.castShadow = true;

    spotLight.shadow.camera.near = 1;
    spotLight.shadow.camera.far = 200;
    spotLight.shadow.camera.fov = 45;
    
    spotLight.shadow.mapSize.width = SHADOW_MAP_WIDTH;
    spotLight.shadow.mapSize.height = SHADOW_MAP_HEIGHT;

    ambientLight = new THREE.AmbientLight ( 0x888888 );
    root.add(ambientLight);
    
    // Create the objects
    // loadFBX();
    /*geometry = new THREE.BoxBufferGeometry( 1, 1, 1 );
    var object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );
    scene.add(object);*/

    // Create a group to hold the objects
    group = new THREE.Object3D;
    root.add(group);

    // Create a texture map
    var map = new THREE.TextureLoader().load(mapUrl);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(8, 8);

    var color = 0xffffff;

    // Put in a ground plane to show off the lighting
    geometry = new THREE.PlaneGeometry(200, 200, 50, 50);
    var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color:color, map:map, side:THREE.DoubleSide}));

    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = -4.02;
    
    // Add the mesh to our group
    group.add( mesh );
    mesh.castShadow = false;
    mesh.receiveShadow = true;
    

    var material = new THREE.MeshPhongMaterial({ color: 0xffffff });
    geometry = new THREE.CubeGeometry(2, 2, 2);

    // And put the geometry and material together into a mesh
    mainChar = new THREE.Mesh(geometry, material);

    mainCharBoxHelper =new THREE.BoxHelper(mainChar, 0x00ff00);

    group.add(mainChar);
    group.add(mainCharBoxHelper);

   

    // Create the animations
    movementAnimation();

    // Now add the group to our scene
    scene.add( root );
}