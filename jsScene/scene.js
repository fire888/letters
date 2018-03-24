
"use strict";
 

 
/**************************************************;
 * SCENE
 **************************************************/

 
const s = {}; 
const offsetBack = {
	pX:0,
	pY:0,
	scale: 1
}
 
s.initScene = () => { 

	
	/** SCENE */	
	scene = new THREE.Scene();
	s.camera = new THREE.PerspectiveCamera( 
		10,	(window.innerWidth * 0.42)/( window.innerHeight * 0.35), 3.5, 15000 );
	s.camera.position.set( 0, 0, 900 );
	
	
	/** LIGHTS */
	let light = new THREE.AmbientLight( 0x112241, 0.2 );
	light.position.set( 0, 100, 350 );
	scene.add(light);

	/** Background Image */ 
	s.backTexture = false;
	
	
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
	s.renderer.setPixelRatio( window.innerWidth /window.innerHeight);
	s.renderer.setSize( window.innerWidth * 0.42, window.innerHeight * 0.35 );
	
	s.renderer.domElement.style.width = s.renderer.domElement.width + 'px';
	s.renderer.domElement.style.height = s.renderer.domElement.height + 'px';
	
	s.renderer.gammaInput = true;
	s.renderer.gammaOutput = true;	
	
	s.controls = new THREE.OrbitControls( s.camera, s.renderer.domElement );	
	
	/** CUSTOM */
	s.clock = new THREE.Clock();

	s.animate();	
}


let yRotation =0, xRotation=0;  let ax = new THREE.Vector3(0,0,1);
/**************************************************;
 * ANIMATION SCENE
 **************************************************/
  
s.animate = () => {
			
	let time = s.clock.getDelta();	
	
	if ( s.backgroundImagePlane ){
		s.backgroundImagePlane.position.set( s.camera.position.x * (-0.1), s.camera.position.y * (-0.1), s.camera.position.z * (-0.1) );
		s.backgroundImagePlane.translateX( offsetBack.pX );
		s.backgroundImagePlane.translateY( offsetBack.pY );		
		var dist = s.camera.position.distanceTo( scene.position ) * 0.0002;
		s.backgroundImagePlane.scale.set( dist * offsetBack.scale, dist * offsetBack.scale, dist * offsetBack.scale );		
		s.backgroundImagePlane.lookAt(s.camera.position);
		//s.backgroundImagePlane.setRotationFromAxisAngle( new THREE.Vector3(0,0,0) );
	}	
	
	if (imgOnLoad){
		imgOnLoad = false;
		addImgToScene();
	}
	
	s.controls.update();	
	s.renderer.render( scene, s.camera);	
	requestAnimationFrame( s.animate );	
}

/**************************************************;
 * ANIMATION SCENE
 **************************************************/

const addImgToScene = () => {
	let imageElement = document.getElementById('upload-img');
	imageElement.onload = function(e) {
		let texture = new THREE.Texture( this );
		texture.needsUpdate = true;
		let w = 2000;
		console.log(this.height); 
		let h = this.height/this.width * w;
		s.planeGeom = new THREE.PlaneGeometry( w, h );
		s.backMat = new THREE.MeshBasicMaterial( {map: texture});
		s.backgroundImagePlane = new THREE.Mesh( s.planeGeom, s.backMat );
		scene.add(s.backgroundImagePlane);	
		$('#buttonsImg').show();	
		
	};	
};





/**************************************************;
 * resize scene
 **************************************************/
/*
s.handleWindowResize = () => {
	s.renderer.setPixelRatio( window.innerWidth /window.innerHeight);	
	s.renderer.setSize( window.innerWidth * 0.42, window.innerWidth  * 0.25 );
	s.renderer.domElement.style.width = s.renderer.domElement.width + 'px';
	s.renderer.domElement.style.height = s.renderer.domElement.height + 'px';	
	s.camera.aspect = (window.innerWidth * 0.42)/( window.innerHeight * 0.35);
	s.camera.updateProjectionMatrix();
}

window.addEventListener('resize', s.handleWindowResize, false);


*/





	
/**************************************************;
 * main text params 
 **************************************************/
	
var textGeo, textMesh1, scene, isTextRotate = false;
 
/** main params */
var textValue = "Citygrafika",
	height = 5,
	size = 20,
	hover = 0,
	curveSegments = 4,
	bevelThickness = 0,
	bevelSize = 0,
	bevelSegments = 1,
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
	
var material = new THREE.MeshPhongMaterial( { color: 0x999999, flatShading: true } );



	
	
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
	/*if ( ! bevelEnabled ) {
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
	}*/
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
		loader.load( 'jsScene/Roboto_Bold.json', function ( response ) {
			font = response;
			
			createText();		
			
		} );
}; 



/**************************************************;
 * INIT
 **************************************************/

 
/** inputs ****************************************/ 

const inputsHtml = document.getElementsByClassName('inputs');
let inputsValues = [];
let inputsValuesOld = [];

const getInputsValues = () => {
	let arr = [];
	for( let i=0; i< inputsHtml.length; i++ ){
		arr.push(inputsHtml[i].value);
	}
	return arr;
}

inputsValuesOld = getInputsValues();

const checkInputsValues = () => {

	inputsValues = getInputsValues();
	for ( let i =0; i< inputsValues.length; i++ ){
		if (inputsValuesOld[i] != inputsValues[i]){
			inputsValuesOld = getInputsValues(); 

			checkChanges( i );
		}
	}		
}

const checkChanges = ( i ) => {

	switch ( inputsHtml[i].id ){
		
		case "mainText": 
			textValue = inputsHtml[i].value;
			break;
					
		case "outLine": 
			bevelSize = inputsHtml[i].value;
			break;	

		case "bevel": 
			height = inputsHtml[i].value;
			break;	

		case "height": 
			size = inputsHtml[i].value;
			break;				
	}	
			
	createText();
}

setInterval( checkInputsValues, 100 );

/** buttons img ****************************/
$('#imgMoveLeft').click( () => {
	if( s.backgroundImagePlane ){
		offsetBack.pX -= 3;
	}
});	
$('#imgMoveRight').click( () => {
	if( s.backgroundImagePlane ){
		offsetBack.pX += 3;
	}
});
$('#imgMoveTop').click( () => {
	if( s.backgroundImagePlane ){
		offsetBack.pY += 3;
	}
});	
$('#imgMoveBottom').click( () => {
	if( s.backgroundImagePlane ){
		offsetBack.pY -= 3;
	}
});
$('#imgMore').click( () => {
	if( s.backgroundImagePlane ){
		offsetBack.scale += 0.1;
	}
});
$('#imgLess').click( () => {
	if( s.backgroundImagePlane ){
		offsetBack.scale -= 0.1;
	}
});
 
 
/** SCENE **********************************/

s.initScene();
//initMouse();
loadFont();



	
	

	
	



