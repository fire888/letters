
"use strict";
 

 
/**************************************************;
 * SCENE
 **************************************************/

 
const s = {}; 
 
s.initScene = () => { 
	
	/** SCENE */	
	scene = new THREE.Scene();
	s.camera = new THREE.PerspectiveCamera( 
		10,	window.innerWidth/window.innerHeight, 3.5, 3000 );
	s.camera.position.set( 0, 0, 900 );
				
	/** LIGHTS */
	let light = new THREE.AmbientLight( 0x112241, 0.2 );
	light.position.set( 0, 100, 350 );
	scene.add(light);	
	
	s.spotLight = new THREE.SpotLight( 0xffffff, 0.8 );
	s.spotLight.castShadow = true;
	s.spotLight.angle = 0.33;
	s.spotLight.penumbra = 0.99;
	s.spotLight.decay = 0;
	s.spotLight.distance = 2000;
	s.spotLight.position.set( 100, 200, 400 );
	s.spotLight.lookAt(scene.position);		
	scene.add(s.spotLight);
	
	/** RENDERER */
	s.canvas = document.getElementById( 'canvas-webgl' );
	s.renderer = new THREE.WebGLRenderer({ canvas: s.canvas} );
	s.renderer.setClearColor( 0xffffff );	
	s.renderer.setPixelRatio( window.devicePixelRatio );
	s.renderer.setSize( window.innerWidth, window.innerHeight );
	
	s.canvas.style.width = "75%";	
	s.canvas.style.height =  window.innerHeight/window.innerWidth * 75 + "%";
	
	s.renderer.gammaInput = true;
	s.renderer.gammaOutput = true;	
	
	/** CUSTOM */
	s.clock = new THREE.Clock();

	s.animate();	
}




/**************************************************;
 * ANIMATION SCENE
 **************************************************/
  
s.animate = () => {
			
	let time = s.clock.getDelta();	
	
	let yRotation = (mouseX-window.innerWidth/2)*0.001;
	let xRotation = (mouseY-window.innerHeight/2)*0.001;
	
	//sc.spotLight.rotation.y = yRotation*50000.0;
	
	if (textMesh1){	
			textMesh1.rotation.y = yRotation;
			textMesh1.rotation.x = xRotation;			
	}
	
	
	
	s.renderer.render( scene, s.camera);	
	requestAnimationFrame( s.animate );	
}





/**************************************************;
 * resize scene
 **************************************************/

s.handleWindowResize = () => {
	s.renderer.setSize(window.innerWidth, window.innerHeight);
	s.camera.aspect = window.innerWidth / window.innerHeight;
	s.camera.updateProjectionMatrix();
	s.canvas.style.width = "75%";	
	s.canvas.style.height =  window.innerHeight/window.innerWidth * 75 + "%";	
}

window.addEventListener('resize', s.handleWindowResize, false);





/**************************************************;
 * check mouse move 
 **************************************************/
 	  
let mouseX = 0, mouseY = 0; 
document.addEventListener("mousemove", (e) => {	 
	 mouseX = e.offsetX;
	 mouseY = e.offsetY;	 
});



	
/**************************************************;
 * main text params 
 **************************************************/
	
var textGeo, textMesh1, scene, isTextRotate = false;
 
/** main params */
var textValue = "VipJeveleveres",
		height = 5,
		size = 20,
		hover = 0,
		curveSegments = 4,
		bevelThickness = 2,
		bevelSize = 1.5,
		bevelSegments = 3,
		bevelEnabled = true,
		font = undefined,
		fontName = "optimer", // helvetiker, optimer, gentilis, droid sans, droid serif
		fontWeight = "bold"; // normal bold
		
var fontMap = {
		"helvetiker": 0,
		"optimer": 1,
		"gentilis": 2,
		"droid/droid_sans": 3,
		"droid/droid_serif": 4
};	

var weightMap = {
		"regular": 0,
		"bold": 1
};	
	
var material = new THREE.MeshPhongMaterial( { color: 0xff0000, flatShading: true } );



	
	
/**************************************************;
 * INIT TEXT
 **************************************************/	

function createText() {
				
	if (textMesh1){
		scene.remove(textMesh1)
	}
				
	textGeo = new THREE.TextGeometry( textValue, {
		font: font,
		size: size,
		height: height,
		curveSegments: curveSegments,
		bevelThickness: bevelThickness,
		bevelSize: bevelSize,
		bevelEnabled: bevelEnabled
	});
	textGeo.computeBoundingBox();
	textGeo.computeVertexNormals();
	// "fix" side normals by removing z-component of normals for side faces
	// (this doesn't work well for beveled geometry as then we lose nice curvature around z-axis)
	if ( ! bevelEnabled ) {
		var triangleAreaHeuristics = 0.1 * ( height * size );
		for ( var i = 0; i < textGeo.faces.length; i ++ ) {
			var face = textGeo.faces[ i ];
			if ( face.materialIndex == 1 ) {
				for ( var j = 0; j < face.vertexNormals.length; j ++ ) {
					face.vertexNormals[ j ].z = 0;
					face.vertexNormals[ j ].normalize();
				}
				var va = textGeo.vertices[ face.a ];
				var vb = textGeo.vertices[ face.b ];
				var vc = textGeo.vertices[ face.c ];
				var s = THREE.GeometryUtils.triangleArea( va, vb, vc );
				if ( s > triangleAreaHeuristics ) {
					for ( var j = 0; j < face.vertexNormals.length; j ++ ) {
						face.vertexNormals[ j ].copy( face.normal );
					}
				}
			}
		}
	}
	var centerOffset = -0.5 * ( textGeo.boundingBox.max.x - textGeo.boundingBox.min.x );
	textMesh1 = new THREE.Mesh( textGeo, material );
	textMesh1.position.x = centerOffset;
	textMesh1.position.y = hover;
	textMesh1.position.z = 0;
	textMesh1.rotation.x = 0;
	textMesh1.rotation.y = Math.PI * 2;
	scene.add( textMesh1 );
} 




/**************************************************;
 * LOAD FONTS
 **************************************************/	
			
function loadFont() {
	var loader = new THREE.FontLoader();
		loader.load( 'jsScene/helvetiker_bold.typeface.json', function ( response ) {
			font = response;
			
			createText();		
			
		} );
}; 




/**************************************************;
 * INIT
 **************************************************/

/** BUTTONS ********************************/
 
let reDrawButt = document.getElementById('reDrawButt');
reDrawButt.onclick = () => {
	let textInput = document.getElementById('mainText');
	textValue = textInput.value; 
	createText();	
}

/** SCENE **********************************/

s.initScene();
loadFont();



	
	

	
	



