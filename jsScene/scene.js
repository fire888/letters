"use strict"


/** name space */
const s = {
	textureLoader: new THREE.TextureLoader(),
	fontLoader: new THREE.FontLoader()
}

/**************************************************;
 * LOAD ASSETS
 **************************************************/

s.loadAssets = () => new Promise ( (resolve) => {
	s.textureCube = new THREE.CubeTextureLoader( )
		.setPath( 'jsScene/')
		.load(
			[ 		
				'negx.jpg',
				'negz.jpg', 
				'negy.jpg', 
				'posz.jpg', 
				'posx.jpg', 
				'posy.jpg' 
			],
			()=>  resolve()			
		)
})
.then ( () => new Promise ( (resolve )=> {
			s.mapBump = s.textureLoader.load( 
				"jsScene/map-noise.png",
				() => resolve()			
			)			
	})
)
.then ( () => new Promise ( (resolve )=> {
			s.mapGlow = s.textureLoader.load( 
				"jsScene/map-glow.png",
				() => resolve()			
			)			
	})
)
.then ( () => new Promise ( (resolve )=> {
			s.mapLight = s.textureLoader.load( 
				"jsScene/map-svet.png",
				() => resolve()			
			)			
	})
)
.then ( () => new Promise ( (resolve)=> {
			s.fontLoader.load( 
				'jsScene/Roboto_Bold.json', 
				( response ) => {
					s.font1 = response 	
					font = s.font1
					resolve()
				})
		}) 
)
.then ( () => new Promise ( (resolve)=> {
			s.fontLoader.load( 
				'jsScene/EB-Garamond-ExtraBold_Regular.json', 
				( response ) => {
					s.font2 = response 	
					resolve()
				})
		}) 
)
.then ( () => new Promise ( (resolve)=> {	
			s.fontLoader.load( 
				'jsScene/Pattaya_Regular.json', 
				( response ) => {
					s.font3 = response 	
					resolve()
				})
		}) 
)
.then ( ()=> {
	s.material1 = new THREE.MeshBasicMaterial( { 
		color: 0xff0000,
		flatShading: true,
		//side: THREE.DoubleSide 		
	})
		
	s.material2 = new THREE.MeshPhongMaterial( { 
		color: 0x111b1a,
		emissive: 0x111b1a,
		specular: 0x000000,
		shininess: 0.1,
		bumpMap: s.mapBump,
		bumpScale: 0.1,						
		envMap: s.textureCube,
		reflectivity: 0.2,
		//transparent: true,
		flatShading: true,
		side: THREE.DoubleSide 	
		
	})
	
	s.material3 = new THREE.MeshPhongMaterial( { 
		color: 0x111b1a,
		map: s.mapLight, 
		flatShading: true,
	})	
	

	
	s.matGlow = new THREE.MeshBasicMaterial({ 
		map: s.mapGlow,
		transparent: true		
	})
	
	s.initScene()	
	s.createText()
	s.animate()	
	
})
 
 

s.loadAssets() 
 
 
/**************************************************;
 * SCENE
 **************************************************/
 
 
s.initScene = () => { 

	
	/** SCENE */	
	s.scene = new THREE.Scene();
	s.camera = new THREE.PerspectiveCamera( 
		10,	(window.innerWidth * 0.42)/( window.innerHeight * 0.35), 3.5, 15000 );
	s.camera.position.set( 0, 0, 900 );
	
	/** LIGHTS */
	let lightAmb = new THREE.AmbientLight( 0xadd6eb, 0.01 );
	s.scene.add(lightAmb);
	
	s.spotLight = new THREE.SpotLight( 0xf1eeca, 0.5 );
	s.spotLight.position.set( 0, 1000, 1000 );		
	s.scene.add(s.spotLight);
	
	/** RENDERER */
	s.canvas = document.getElementById( 'canvas-webgl' );
	s.renderer = new THREE.WebGLRenderer({ canvas: s.canvas, alpha: true} );
	s.renderer.setClearColor( 0x000000, 0.1 );	
	s.renderer.setPixelRatio( window.innerWidth /window.innerHeight);
	s.renderer.setSize( window.innerWidth * 0.42, window.innerHeight * 0.35 );
	
	s.renderer.domElement.style.width = s.renderer.domElement.width + 'px';
	s.renderer.domElement.style.height = s.renderer.domElement.height + 'px';
	
	s.renderer.gammaInput = true;
	s.renderer.gammaOutput = true;	
	
	s.controls = new THREE.OrbitControls( s.camera, s.renderer.domElement );	
	
	/** CUSTOM */
	s.clock = new THREE.Clock();
	
	/** Glow plane */
	s.geomGlow = new THREE.PlaneGeometry(10, 10) 
	s.glowPlane = new THREE.Mesh( s.geomGlow, s.matGlow )
	s.scene.add( s.glowPlane )
}









/**************************************************;
 * ANIMATION SCENE
 **************************************************/
  
s.animate = () => {
			
	let time = s.clock.getDelta();	
		
	if (imgOnLoad){
		imgOnLoad = false
		$('#buttonsImg').show()
	}
	
	s.controls.update();	
	s.renderer.render( s.scene, s.camera);	
	requestAnimationFrame( s.animate );	
}






	
/**************************************************;
 * main text params 
 **************************************************/
	
var sceneText,
isHeightUpdate = false 
 
/** main params */
var classLight = "face",

	textValue = "Citygrafika",
	height = 5,
	size = 20,
	hover = 0,
	curveSegments = 4,
	bevelThickness = 0,
	bevelSize = 0,
	bevelSegments = 1,
	bevelEnabled = true,
	font = null,
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
	

	
	
/**************************************************;
 * INIT TEXT
 **************************************************/	
 
s.createText = () => {
	
	if (sceneText){
		sceneText.remove()
	}
	
	switch (classLight){
		case "face":
			sceneText = new Letters()
			break
		case "facePlus":
			sceneText = new LettersPlus()
			break
		case "open":
			sceneText = new LettersOpen()
			break
		case "contr":
			sceneText = new LettersContr()
			break
		case "none":
			sceneText = new LettersNoneLight()
			break				
	}
} 





/**************************************************;
 * CLASSES LETTERS
 **************************************************/


 
/** MAIN CLASS FRONTLIGHT LETTERS *****************/ 
 
class Letters {
	
	constructor () {
		this.geom = new THREE.TextGeometry( textValue, {
			font: font,
			size: size,
			height: height,
			curveSegments: curveSegments,
			bevelThickness: bevelThickness,
			bevelSize: bevelSize,
			bevelEnabled: bevelEnabled
		});
		this.geom.computeBoundingBox();
		this.geom.computeVertexNormals();	
	
		this.addMaterrials()  
		this.createMesh()
		this.setGlow()	
	}
	
	addMaterrials() {
		this.mat = [ s.material1, s.material2 ]
	}
	
	createMesh() {
		console.log("lll")
		this.mesh = new THREE.Mesh( this.geom, this.mat )
		this.centerOffset = -0.5 * ( this.geom.boundingBox.max.x - this.geom.boundingBox.min.x )
		this.mesh.position.x = this.centerOffset
		this.mesh.position.y = hover
		this.mesh.position.z = 0
		this.mesh.rotation.x = 0
		this.mesh.rotation.y = Math.PI * 2
		s.scene.add( this.mesh )
	}
	
	setGlow() {
		s.matGlow.opacity = 0.3
		s.glowPlane.scale.set( this.geom.boundingBox.max.x*0.12, this.geom.boundingBox.max.y*0.13 , 1 )
		s.glowPlane.position.z = ( () => { if (isHeightUpdate){ return height*10 + 1} else { return height +1 } } )()  
		s.glowPlane.position.y = this.geom.boundingBox.max.y*0.4 	
	}
	
	remove() {
		s.scene.remove( this.mesh )
		this.mesh = null
		this.geom = null
		//this = null	
	}
}




/** FRONT AND SIDE LIGHT **************************/

class LettersPlus extends Letters {
	
	addMaterrials() {
		this.mat = [ s.material1, s.material1 ]
	}
	
	setGlow() {
		super.setGlow()
		s.glowPlane.position.z = 0		
	}	
}




/** OPENLIGHT ************************************/

class LettersOpen extends Letters {
	
	constructor() {
		super()
		this.geom2 = new THREE.TextGeometry( textValue, {
			font: font,
			size: size,
			height: -2,
			curveSegments: curveSegments,
			bevelThickness: bevelThickness,
			bevelSize: bevelSize,
			bevelEnabled: bevelEnabled
		});  
		this.geom2.computeVertexNormals();	
		  
		this.mesh2 = new THREE.Mesh( this.geom2, this.mat ) 		
		this.mesh2.position.x = this.centerOffset
		this.mesh2.position.z = height+2
		s.scene.add(this.mesh2)	
		s.glowPlane.position.z = height+3			
	}

	remove() {
		super.remove()
		s.scene.remove( this.mesh2 )
		this.mesh2 = null
		this.geom2 = null	
	}	
}




/** CONTRLIGHT ************************************/

class LettersContr extends Letters {

	addMaterrials() {
		this.mat = [ s.material2, s.material2 ]
	}

	setGlow() {
		super.setGlow()
		s.glowPlane.position.z = 0
		s.matGlow.opacity = 1.0	
	}

	remove() {
		super.remove()
		s.matGlow.opacity = 0.3
	}	
	
}


/** NONELIGHT ************************************/

class LettersNoneLight extends LettersContr {

	setGlow() {
		s.matGlow.opacity = 0.0	
	}	
}




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
 * INIT INTERFACE BUTTONS
 **************************************************/

$('#typeLight').click( (e) => { 
	if ( classLight != e.target.value ){ 
		classLight = e.target.value 
		s.createText()			
	}  	
})  
 
 
$('.font').click( (e) => { 
	switch ( e.target.value ){
		case "f1":
			font = s.font1
			break
		case "f2":
			font = s.font2
			break
		case "f3":
			font = s.font3
			break
	}
	
	s.createText()
}) 
 
 
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
			textValue = inputsHtml[i].value
			break	
		case "outLine": 
			bevelSize = inputsHtml[i].value
			break
		case "bevel":
			if ( inputsHtml[i].value < 0 ){
				//$("#bevel").value = 0
				//inputsHtml[i].value = 0
			}
			height = inputsHtml[i].value
			isHeightUpdate = true 
			break
		case "height": 
			size = inputsHtml[i].value
			break
	}	
		
	s.createText()
}

setInterval( checkInputsValues, 100 )



/** buttons img ****************************/

const backImgHtml = document.getElementById('upload-img')
const posBackImg = {
	left: 0,
	top: 0,
	width: 100
}

$('#imgMoveLeft').click( () => { 
	posBackImg.left -= 10
	backImgHtml.style.marginLeft = posBackImg.left + "px"
})
	
$('#imgMoveRight').click( () => {
	posBackImg.left += 10
	backImgHtml.style.marginLeft = posBackImg.left + "px"
})

$('#imgMoveTop').click( () => {
	posBackImg.top -= 10
	backImgHtml.style.marginTop = posBackImg.top + "px"	
})


$('#imgMoveBottom').click( () => {
	posBackImg.top += 10
	backImgHtml.style.marginTop = posBackImg.top + "px"	
})

$('#imgMore').click( () => {
	posBackImg.width += 10
	backImgHtml.style.width = posBackImg.width + "%"	
})

$('#imgLess').click( () => {
	posBackImg.width -= 10
	backImgHtml.style.width = posBackImg.width + "%"
});
 
 

 
 
