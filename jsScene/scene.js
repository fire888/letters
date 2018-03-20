
"use strict";
 

 
/**************************************************;
 * SCENE
 **************************************************/

const s = {}; 
 
s.initScene = () => { 
	
	/** SCENE */	
	s.scene = new THREE.Scene();
	s.camera = new THREE.PerspectiveCamera( 
		10,	window.innerWidth/window.innerHeight, 3.5, 3000 );
	s.camera.position.set( 0, 0, 900 );
				
	/** LIGHTS */
	let light = new THREE.AmbientLight( 0x112241, 0.2 );
	light.position.set( 0, 100, 350 );
	s.scene.add(light);	
	
	s.spotLight = new THREE.SpotLight( 0xffffff, 0.8 );
	s.spotLight.castShadow = true;
	s.spotLight.angle = 0.33;
	s.spotLight.penumbra = 0.99;
	s.spotLight.decay = 0;
	s.spotLight.distance = 2000;
	s.spotLight.position.set( 100, 200, 400 );
	s.spotLight.lookAt(s.scene.position);		
	s.scene.add(s.spotLight);
	
	/** RENDERER */
	let canvas = document.getElementById( 'canvas-webgl' );
	s.renderer = new THREE.WebGLRenderer({ canvas: canvas} );
	s.renderer.setClearColor( 0xffffffff );	
	s.renderer.setPixelRatio( window.devicePixelRatio );
	s.renderer.setSize( window.innerWidth, window.innerHeight );
	s.renderer.gammaInput = true;
	s.renderer.gammaOutput = true;	
	
	/** CUSTOM */
	s.clock = new THREE.Clock();
	s.addGeom();
	s.animate();	
}


s.addGeom = () => {
	
	let m = new THREE.Mesh(
		new THREE.BoxGeometry( 30, 30, 30 ),
		new THREE.MeshBasicMaterial( { color: 0x00aaff } )
	);
	s.scene.add( m );	
	
	let text = "three.js",
		height = 20,
		size = 70,
		hover = 30,
		curveSegments = 4,
		bevelThickness = 2,
		bevelSize = 1.5,
		bevelSegments = 3,
		bevelEnabled = true,
		font = undefined,
		fontName = "optimer", // helvetiker, optimer, gentilis, droid sans, droid serif
		fontWeight = "bold"; // normal bold
		
}



/**************************************************;
 * ANIMATION SCENE
 **************************************************/
  
s.animate = () => {
			
	let time = s.clock.getDelta();	
	
	s.renderer.render( s.scene, s.camera);	
	requestAnimationFrame( s.animate );	
}



/**************************************************;
 * resize scene
 **************************************************/

s.handleWindowResize = () => {
	s.renderer.setSize(window.innerWidth, window.innerHeight);
	s.camera.aspect = window.innerWidth / window.innerHeight;
	s.camera.updateProjectionMatrix();
}

window.addEventListener('resize', s.handleWindowResize, false);



/**************************************************;
 * INIT
 **************************************************/
 
s.initScene(); 

