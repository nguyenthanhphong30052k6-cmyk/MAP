// === Three.js setup ===
const container = document.getElementById('canvasContainer');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf7fafc);

// camera
const camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 1, 5000);
camera.position.set(0, 800, 1200);
camera.lookAt(0,0,0);

// renderer
const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

// controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.target.set(0,0,0);
controls.update();

// lights
const ambient = new THREE.AmbientLight(0xffffff,0.7);
scene.add(ambient);
const dirLight = new THREE.DirectionalLight(0xffffff,0.6);
dirLight.position.set(500,1000,500);
scene.add(dirLight);

// floor
const floorGeo = new THREE.BoxGeometry(1600,20,1000);
const floorMat = new THREE.MeshStandardMaterial({color:0xf7fafc});
const floor = new THREE.Mesh(floorGeo,floorMat);
floor.position.set(0,-10,0);
scene.add(floor);

// stores data
const storeData = [
  {name:'Main Entrance', x:0, z:200, color:0xffffff},
  {name:'Verizon', x:150, z:100, color:0xdbeafe},
  {name:'AT&T', x:-150, z:80, color:0xfff1cc},
  {name:'MediaMarkt', x:200, z:-100, color:0xe6f0ff},
  {name:'Nike Store', x:-300, z:-200, color:0xdbeafe},
  {name:'Starbucks', x:300, z:-50, color:0xfff7ed},
  {name:'Bank', x:400, z:200, color:0xc7f9cc},
  {name:'Apple Store', x:450, z:-200, color:0xe6f0ff},
  {name:'McCafe', x:0, z:-300, color:0xfff7ed},
];

const stores = [];
const storeMeshes = new THREE.Group();
scene.add(storeMeshes);
storeData.forEach(s=>{
  const geo = new THREE.BoxGeometry(120,100,80);
  const mat = new THREE.MeshStandardMaterial({color:s.color});
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(s.x,50,s.z);
  mesh.userData.name = s.name;
  storeMeshes.add(mesh);
  stores.push(mesh);
});

// raycaster + tooltip
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const tooltip = document.createElement('div');
tooltip.style.position='absolute';
tooltip.style.padding='6px 10px';
tooltip.style.background='rgba(0,0,0,0.8)';
tooltip.style.color='white';
tooltip.style.borderRadius='6px';
tooltip.style.pointerEvents='none';
tooltip.style.display='none';
document.body.appendChild(tooltip);

function onMouseMove(e){
  mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(stores);
  if(intersects.length>0){
    tooltip.style.display='block';
    tooltip.style.left = e.clientX + 'px';
    tooltip.style.top = (e.clientY-20) + 'px';
    tooltip.textContent = intersects[0].object.userData.name;
  } else {
    tooltip.style.display='none';
  }
}
window.addEventListener('mousemove', onMouseMove);

// route
const routePoints = [
  new THREE.Vector3(0,50,200),
  new THREE.Vector3(-150,50,80),
  new THREE.Vector3(0,50,50),
  new THREE.Vector3(200,50,-100),
  new THREE.Vector3(-300,50,-200),
  new THREE.Vector3(300,50,-50),
  new THREE.Vector3(400,50,200),
  new THREE.Vector3(450,50,-200),
  new THREE.Vector3(0,50,-300)
];
const routeGeo = new THREE.BufferGeometry().setFromPoints(routePoints);
const routeMat = new THREE.LineBasicMaterial({color:0x0b5cff, linewidth:4});
const routeLine = new THREE.Line(routeGeo, routeMat);
scene.add(routeLine);

// marker
const markerGeo = new THREE.SphereGeometry(15,16,16);
const markerMat = new THREE.MeshStandardMaterial({color:0xff0000});
const marker = new THREE.Mesh(markerGeo, markerMat);
marker.position.copy(routePoints[0]);
scene.add(marker);

// animate marker
let routeIndex = 0;
let t = 0;
function animateMarker(){
  const start = routePoints[routeIndex];
  const end = routePoints[routeIndex+1];
  t += 0.005;
  if(t>1){t=0; routeIndex++; if(routeIndex>=routePoints.length-1) routeIndex=0;}
  marker.position.lerpVectors(start,end,t);
}

// render loop
function animate(){
  requestAnimationFrame(animate);
  animateMarker();
  renderer.render(scene,camera);
}
animate();

// resize
window.addEventListener('resize', ()=>{
  camera.aspect=window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
