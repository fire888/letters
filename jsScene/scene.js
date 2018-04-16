"use strict"


/**************************************************;
 * VARS SPACES
 **************************************************/

 const s = {
	
	textureLoader: new THREE.TextureLoader(),
	fontLoader: new THREE.FontLoader()
}



/**************************************************;
 * LOAD ASSETS
 **************************************************/
 
const loadAssets = () => new Promise ( ( resolve )=> {
			s.mapGlow = s.textureLoader.load( 
				"jsScene/map-glow.png",
				() => resolve()			
			)			
} )
.then( () => new Promise ( ( resolve )=> {
			s.mapLight = s.textureLoader.load( 
				"jsScene/map-svet.png",
				() => {
					s.mapLight.wrapS = s.mapLight.wrapT = THREE.RepeatWrapping;
					s.mapLight.repeat.set(0.1, 0.1); 					
					resolve()
				}		
			)			
	})
)
.then( () => new Promise ( ( resolve )=> {
			s.fontLoader.load( 
				'jsScene/Roboto_Bold.json', 
				( response ) => {
					s.font1 = response 	
					dataT.font = s.font1
					resolve()
				})
		}) 
)
.then ( () => new Promise ( ( resolve )=> {
			s.fontLoader.load( 
				'jsScene/EB-Garamond-ExtraBold_Regular.json', 
				( response ) => {
					s.font2 = response 	
					resolve()
				})
		}) 
)
.then ( () => new Promise ( ( resolve )=> {	
			s.fontLoader.load( 
				'jsScene/Pattaya_Regular.json', 
				( response ) => {
					s.font3 = response 	
					resolve()
				})
		}) 
)
.then ( () => {
	
	s.matLightMain = new THREE.MeshBasicMaterial( { 
		color: 0xff0000,
		flatShading: true,		
	})
	
	s.matLightSecond = new THREE.MeshBasicMaterial( {  
		color: 0xffffff,
		flatShading: true,	
	})	
		
	s.matIron = new THREE.MeshPhongMaterial( { 
		color: 0x111b1a,
		emissive: 0x111b1a,
		specular: 0x000000,
		shininess: 0.1,				
		reflectivity: 0.2,
		transparent: true,
		flatShading: true,
		side: THREE.DoubleSide 		
	})
		
	s.matSvetodiod = new THREE.MeshBasicMaterial( { 
		color: 0xffffff,
		map: s.mapLight, 
		flatShading: true,	
	} )		
		
	s.matGlow = new THREE.MeshBasicMaterial( { 	
		map: s.mapGlow,
		color: 0xff0000,
		flatShading: true,
		side: THREE.DoubleSide,
		opacity: 0.3,
		transparent: true, 
		depthWrite: false	
	} )
	
	s.matEasyColor = new THREE.MeshPhongMaterial( { 	
		color: 0x554444,
		transparent: true,
		flatShading: true		
	} )	
	
	s.initScene()	
	s.createText()
	s.animate()	
	
} )
 
loadAssets() 
 
 
 
/**************************************************;
 * SCENE
 **************************************************/ 
 
s.initScene = () => { 
	
	/** SCENE */	
	s.scene = new THREE.Scene();
	s.camera = new THREE.PerspectiveCamera( 
		10,	( window.innerWidth * 0.74 ) / ( window.innerHeight * 0.74 ), 3.5, 15000 );
	s.camera.position.set( 0, 0, 1300 )
	
	/** RENDERER */
	s.canvas = document.getElementById( 'canvas-webgl' )
	s.renderer = new THREE.WebGLRenderer( { canvas: s.canvas } )
	s.renderer.setClearColor( 0x000000 );	
	s.renderer.setPixelRatio( window.innerWidth *0.74 / window.innerHeight * 0.74 );	
	s.renderer.setSize( Math.floor(window.innerWidth * 0.74 - 10 ), Math.floor( window.innerHeight  * 0.74 -10 ) );	
	s.camera.aspect = ( window.innerWidth * 0.74 ) / ( window.innerHeight * 0.74 );
	s.camera.updateProjectionMatrix();
	
	s.renderer.gammaInput = true;
	s.renderer.gammaOutput = true;			
		
	/** LIGHTS */
	let lightAmb = new THREE.AmbientLight( 0xadd6eb, 0.01 )
	s.scene.add(lightAmb);
	
	s.spotLight = new THREE.SpotLight( 0xf1eeca, 0.5 )
	s.spotLight.position.set( 0, 1000, 1000 );		
	s.scene.add(s.spotLight);
		
	/** CUSTOM */
	s.clock = new THREE.Clock();
	s.controls = new THREE.OrbitControls( s.camera, s.renderer.domElement )
	
	/** Glow plane */
	s.geomGlow = new THREE.PlaneGeometry( 10, 10 ) 
	s.glowPlane = new THREE.Mesh( s.geomGlow, s.matGlow )
	s.scene.add( s.glowPlane )
	
	/** mat light */
	s.matShaderLight = new THREE.ShaderMaterial( LightShader )	
	s.clock = new THREE.Clock();	
	
	/** COMPOSER */
	s.renderScene = new THREE.RenderPass( s.scene, s.camera );
	
	s.effectFXAA = new THREE.ShaderPass( THREE.FXAAShader );
	s.effectFXAA.uniforms[ 'resolution' ].value.set( 1 / window.innerWidth, 1 / window.innerHeight );
	
	s.bloomPass = new THREE.UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 ); //1.0, 9, 0.5, 512);
	s.bloomPass.threshold = 0.21
	s.bloomPass.strength = 1.2
	s.bloomPass.radius = 0.55
	
	s.bloomPass.renderToScreen = true;
	
	s.composer = new THREE.EffectComposer( s.renderer );
	s.composer.setSize( window.innerWidth, window.innerHeight );
	s.composer.addPass( s.renderScene );
	s.composer.addPass( s.effectFXAA );
	s.composer.addPass( s.bloomPass );
	
	s.renderer.gammaInput = true;
	s.renderer.gammaOutput = true;
	s.renderer.toneMappingExposure = Math.pow( 0.9, 4.0 )		
}



/**************************************************;
 * ANIMATION SCENE
 **************************************************/
  
s.animate = () => {
	
	let time = s.clock.getDelta();	
	
	s.controls.update()		
	
	//if ( s.matGlow ) s.matGlow.needsUpdate = true
	//if ( s.mapGlow ) s.mapGlow.needsUpdate = true

	s.renderer.toneMappingExposure = Math.pow( 0.9, 4.0 );	
	s.composer.render();
	//s.renderer.render( s.scene, s.camera);
	
	requestAnimationFrame( s.animate );	
}



/**************************************************;
 * MAIN TEXT PARAMS OBJECT
 **************************************************/
	
let sceneText

const dataT = {
	
	classLight: 'face',
	typeBoard: 'lettersVolume',
	textValue: 'Citygrafika',
	height: 20,
	oldHeightLetters: 5,
	oldHeightCorob: 1,
	isHeightUpdate: false, 	
	size: 50,
	hover: 0,
	curveSegments: 4,
	bevelThickness: 0,
	bevelSize: 0,
	bevelSegments: 1,
	bevelEnabled: false,
	font: null,
	fontName: "optimer", 
	fontWeight: "bold",
	fontMap: {
		"helvetiker": 0,
		"optimer": 1,
		"gentilis": 2,
		"droid/droid_sans": 3,
		"droid/droid_serif": 4
	},
	weightMap: {
		"regular": 0,
		"bold": 1
	}	
}	
	


/**************************************************;
 * CLASSES LETTERS
 **************************************************/
 
  
/** MAIN CLASS FRONTLIGHT LETTERS *****************/ 

class Letters {
	
	constructor () {
			
		this.createGeom() 		
		this.createMaterrials()  
		this.createMesh()		
		this.setGlow()	
	}
	
	createGeom() {
		
		console.log( `Create: ${ dataT.height }`)
		
		this.geom = new THREE.TextGeometry( dataT.textValue, {
			font: dataT.font,
			size: dataT.size,
			height: dataT.height,
			curveSegments: dataT.curveSegments,
			bevelThickness: dataT.bevelThickness,
			bevelSize: dataT.bevelSize,
			bevelEnabled: dataT.bevelEnabled,
		});
		this.geom.computeBoundingBox()
		this.geom.computeVertexNormals()	
	}	
	
	createMaterrials() {
		
		this.mat = [ s.matLightMain, s.matIron ]
		this.matTex = [ s.matSvetodiod, s.matIron]
	}
	
	createMesh() {
		
		this.mesh = new THREE.Mesh( this.geom, this.mat )
		this.centerOffset = -0.5 * ( this.geom.boundingBox.max.x - this.geom.boundingBox.min.x )
		//console.log( this.geom.boundingBox.max.x - this.geom.boundingBox.min.x )
		htmlAddBoardWidth( this.geom.boundingBox.max.x - this.geom.boundingBox.min.x )	
		this.mesh.position.x = this.centerOffset
		this.mesh.position.y = dataT.hover
		this.mesh.position.z = 0
		this.mesh.rotation.x = 0
		this.mesh.rotation.y = Math.PI * 2
		s.scene.add( this.mesh )
	}
	
	setGlow() {
		
		s.matGlow.opacity = 0.1
		s.glowPlane.scale.set( this.geom.boundingBox.max.x*0.12, this.geom.boundingBox.max.y*0.13 , 1 )
		s.glowPlane.position.z = dataT.height+1  
		s.glowPlane.position.y = this.geom.boundingBox.max.y * 0.4 	
	}
	
	remove() {
		
		s.scene.remove( this.mesh )		
		this.mesh = null
		this.geom = null
	}
}


/** FRONT AND SIDE LIGHT **************************/

class LettersPlus extends Letters {
	
	createGeomLight() {

		this.geomLight = new THREE.TextGeometry( textValue, {
			font: font,
			size: size,
			height: height,
			curveSegments: curveSegments,
			bevelThickness: bevelThickness,
			bevelSize: bevelSize,
			bevelEnabled: bevelEnabled,
			//material: 0, 
			//extrudeMaterial: 1
		});
		this.geomLight.computeBoundingBox()
		this.geomLight.computeVertexNormals()				
	}

	createMeshLight() {
		super.createMeshLight()
		this.meshLight.position.z = 0				
	}	
	
	
	addMaterrials() {
		this.mat = [ s.matLightMain, s.matLightSecond ]
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
	
	addMaterrials() {
		this.mat = [ s.matSvetodiod, s.matIron ];
	}
	
	createMeshLight(){
		super.createMeshLight()
		this.meshLight.material = s.matLightSecond
	}
	
	setGlow() {
		super.setGlow()
		//s.glowPlane.position.z = 0
		s.matGlow.opacity = 0.2	
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
		this.mat = [ s.matIron, s.matIron ]
	}
	
	createMesh(){
		super.createMesh()
		this.mesh.material = new THREE.MeshBasicMaterial({ color:0x000000})
	}
	
	createMeshLight(){
		super.createMeshLight()
		this.meshLight.material = s.matLightMain
		this.meshLight.position.z = -2
		
		this.meshContr = this.mesh.clone()
		this.meshContr.material = new THREE.MeshBasicMaterial({ color:0xff0000 })
		s.scene.add( this.meshContr )	
		this.meshContr.position.z = -5		
	}

	setGlow() {
		super.setGlow()
		s.glowPlane.position.z = 0
		s.matGlow.opacity = 0.4	
	}

	remove() {
		super.remove()
		s.matGlow.opacity = 0.3
		
		s.scene.remove( this.meshContr )
	}	
	
}


/** NONELIGHT ************************************/

class LettersNoneLight extends LettersContr {
	
	createMesh(){
		super.createMesh()
		this.mesh.material = new THREE.MeshBasicMaterial({ color:0x111111 })
	}
	
	createGeomLight(){
	}		

	createMeshLight(){
	}		

	setGlow() {
		s.matGlow.opacity = 0.0	
	}	
}




/** COROB LETTERS *********************************/  
 
class CorobLetters extends Letters {
	
	constructor() {
		
		height = constHeightCorobLetters
		
		super()
		
		this.setCorobMat()
		this.setCorobMesh()

	}	

	setCorobMat() {
		
		this.matCorob = [  s.matIron, s.matIron, s.matIron,  s.matIron,  s.matLightSecond, s.matIron]
	}	
	
	setCorobMesh() {
	
		this.meshCorob = new THREE.Mesh(
			new THREE.BoxGeometry(this.geom.boundingBox.max.x + 10, size*1.7 , constHeightVolumeLetters ),
			this.matCorob
		)
		this.meshCorob.position.z = -constHeightVolumeLetters/2-1
		this.meshCorob.position.y = size/2-3		
		s.scene.add(this.meshCorob)	
	}
	
	setGlow() {
		
		s.matGlow.opacity = 0.3
		s.glowPlane.scale.set( this.geom.boundingBox.max.x*0.14, this.geom.boundingBox.max.y*0.24 , 1 ) 
		s.glowPlane.position.y = this.geom.boundingBox.max.y/2-3
		s.glowPlane.position.z = 0.05// -constHeightVolumeLetters
	}		
	
	remove() {
		
		s.scene.remove(this.meshCorob)
		this.meshCorob = null
		super.remove()
	}
}


/** COROB LETTERS PLUS ****************************/  
 
class CorobLettersPlus extends CorobLetters {
	
	setCorobMesh() {
		super.setCorobMesh()
		this.meshCorob2 = new THREE.Mesh(
			new THREE.BoxGeometry(this.geom.boundingBox.max.x + 10, size*1.7 , constHeightVolumeLetters ),
			this.matCorob//new THREE.MeshBasicMaterial( {color: 0xffffff })
		)
		this.meshCorob.position.z = -constHeightVolumeLetters/2-1
		this.meshCorob.position.y = size/2-2		
		s.scene.add(this.meshCorob)	
	}	
	
	setCorobMat() {
		this.matCorob = [  s.matLightSecond, s.matLightSecond, s.matLightSecond,  s.matLightSecond,  s.matLightSecond, s.matIron]
	}	
	
	setGlow() {
		super.setGlow()
		s.glowPlane.position.z = -constHeightVolumeLetters-2
	}		
}


/** COROB LETTERS OPEN LIGHTS *********************/  
 
class CorobLettersOpen extends CorobLetters {
	
	addMaterrials() {
		this.mat = [ s.matSvetodiod, s.matSvetodiod ]
	}	
	
	setCorobMat() {
		this.matCorob = [  s.matIron, s.matIron, s.matIron,  s.matIron,  s.matIron, s.matIron]
	}	
	
	setGlow() {
		super.setGlow()
		s.glowPlane.position.z = 1
	}		
}


/** COROB LETTERS CONTRLIGHT *********************/  
 
class CorobLettersContr extends CorobLetters {
	
	addMaterrials() {
		this.mat = [ s.matEasyColor, s.matEasyColor ]
	}	
	
	setCorobMat() {
		this.matCorob = [  s.matIron, s.matIron, s.matIron,  s.matIron,  s.matIron, s.matIron]
	}	
	
	setGlow() {
		super.setGlow()
		s.matGlow.opacity = 0.5
		s.glowPlane.position.z = -constHeightVolumeLetters-2
	}		
}


/** COROB LETTERS NONELIGHT *********************/  
 
class CorobLettersNoneLight extends CorobLettersContr {
			
	setGlow() {
		super.setGlow()
		s.matGlow.opacity = 0.0
	}		
}



/**************************************************;
 * RESIZE WINDOW
 **************************************************/

s.handleWindowResize = () => {
	s.renderer.setPixelRatio( window.innerWidth * 0.74 / window.innerHeight * 0.74);	
	s.renderer.setSize( Math.floor(window.innerWidth * 0.74), Math.floor(window.innerHeight  * 0.74) );	
	s.camera.aspect = ( window.innerWidth * 0.74 ) / ( window.innerHeight * 0.74 );
	s.camera.updateProjectionMatrix();
}

window.addEventListener( 'resize', s.handleWindowResize, false );



/**************************************************;
 * INIT TEXT
 **************************************************/	
 
s.createText = () => {
	
	if ( sceneText ) sceneText.remove()
	
	if ( dataT.typeBoard == "lightBox" ) {
	
		switch ( dataT.classLight ) {
			case "face":
				sceneText = new CorobLetters()
				break
			case "facePlus": 
				sceneText = new CorobLettersPlus()
				break
			case "open":
				sceneText = new CorobLettersOpen()
				break
			case "contr":
				sceneText = new CorobLettersContr()
				break
			case "none":
				sceneText = new CorobLettersNoneLight()
				break
		}			
	}
	
	if ( dataT.typeBoard == "lettersVolume" ) {	
		
		switch ( dataT.classLight ) {
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
} 



/**************************************************;
 * INIT INTERFACE BUTTONS
 **************************************************/
 
$('.typeBoard').click( ( e ) => {
	
	if ( dataT.typeBoard == e.target.value ) return 
	
	$('.typeBoard').removeClass('checkOn')
	$(e.target).addClass('checkOn')
	
	dataT.typeBoard = e.target.value
	
	if ( typeSignboard == 'lettersVolume') {
		//dataT.height = dataT.oldHeightCorob
	}
	
	if ( typeSignboard == 'letterCorobs') {
		dataT.oldHeightCorob = height
	}	
	
	s.createText()	
} ) 
  
$('.font').click( ( e ) => { 
	
	if ( dataT.font == e.target.value ) return
	
	$('.font').removeClass('checkOn')
	$(e.target).addClass('checkOn')
	
	switch ( e.target.value ) {
		case "font1":
			dataT.font = s.font1
			break
		case "font2":
			dataT.font = s.font2
			break
		case "font3":
			dataT.font = s.font3
			break
	}
	s.createText()
} )

$('.typeLight').click( ( e ) => { 

	if ( dataT.classLight == e.target.value ) return
		
	$('.typeLight').removeClass('checkOn')
	$(e.target).addClass('checkOn')	
	
	dataT.classLight = e.target.value 
	s.createText()			
} )


/** INPUTS ****************************************/ 

const inputsHtml = document.getElementsByClassName('inputs');
let inputsValues = [];
let inputsValuesOld = [];

const getInputsValues = () => {
	let arr = [];
	for( let i = 0; i < inputsHtml.length; i ++ ){
		arr.push( inputsHtml[i].value );
	}
	return arr;
}

inputsValuesOld = getInputsValues();

const checkInputsValues = () => {

	inputsValues = getInputsValues();
	
	for ( let i =0; i< inputsValues.length; i++ ) {
	
		if ( inputsValuesOld[i] != inputsValues[i] ) {
			
			inputsValuesOld = getInputsValues(); 
			checkChanges( i );
		}
	}		
}

const checkChanges = ( i ) => {

	switch( inputsHtml[i].id ) {
		
		case "mainText": 
			dataT.textValue = inputsHtml[i].value
			break
		case "bevel":
			if ( inputsHtml[i].value < 1 ) inputsHtml[i].value = 1
			dataT.height = inputsHtml[i].value; 
			break
		case "height": 
			dataT.size = inputsHtml[i].value
			break
	}	
		
	s.createText()
}

setInterval( checkInputsValues, 100 )


const htmlAddBoardWidth = val => {
	$('#width').html( val.toFixed() )
}


/** BUTTONS IMG ****************************/
/*
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


$('#imgDell').click( () => {
	backImgHtml.src = "#"
});

*/

/**************************************************;
 * MAT SHADERS
 **************************************************/

/** MAT BLACK SHADER */
const ShadowShader = {
	uniforms: {
	},

	vertexShader: [
		"varying vec2 vUv;",
		"void main() {",
		  "vUv = uv;",
			"vec3 newPosition = position + normal* vec3( -1.5, -1.5, 1.0 );",	
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );",
		"}"
	].join( "\n" ),

	fragmentShader: [
		"varying vec2 vUv;",
		"void main() {",
			"gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 ) ;",
		"}"
	].join( "\n" )
};

/** MAT WHITE SHADER LIGHT */
const LightShader = {
	uniforms: {
		iTime: { value: null }		
	},

	vertexShader: [
		"uniform float iTime;",
		"varying vec2 vUv;",
		"void main() {",
		  "vUv = uv;",
			"vec3 newPosition = position + normal* vec3( 1.2 * sin( iTime * (-.8) ), 1.0 * sin( iTime * 0.2 ), sin( iTime * 0.2 ));",	
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );",
		"}"
	].join( "\n" ),

	fragmentShader: [
		"varying vec2 vUv;",
		"void main() {",
			"gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 ) ;",
		"}"
	].join( "\n" )
};


