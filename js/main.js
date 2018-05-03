
'use strict'



/**************************************************;
 * VARS SPACES
 **************************************************/
 
const ui = {}  
 
const s = {
	
	isBackgroundTexture: false,
	textureLoader: new THREE.TextureLoader(),
	fontLoader: new THREE.FontLoader()
}



/**************************************************;
 * LOAD ASSETS
 **************************************************/
 			
const loadAssets = () =>  new Promise ( ( resolve ) => {
	
	s.mapDiod = s.textureLoader.load( 
		'maps/map-diod.png',
		() => {
			s.mapDiod.wrapS = s.mapDiod.wrapT = THREE.RepeatWrapping
			s.mapDiod.repeat.set( -0.00001, -0.00001 ) 					
			resolve()
		}		
	)			
} ).then( () => new Promise ( ( resolve ) => {
	
	s.fontLoader.load( 
		'fonts/Roboto_Bold.json', 
		( response ) => {
			s.font1 = response 	
			resolve()
		} )
} ) ).then ( () => new Promise( ( resolve ) => { 

	s.textureCube = new THREE.CubeTextureLoader()
		.setPath( 'maps/')
		.load([ 
			'negx.jpg',
			'negz.jpg', 
			'negy.jpg', 
			'posz.jpg', 
			'posx.jpg', 
			'posy.jpg' 
		],()=> {
			resolve()				
		})	
} ) ).then ( () => new Promise ( ( resolve )=> {
	
	s.fontLoader.load( 
		'fonts/EB-Garamond-ExtraBold_Regular.json', 
		( response ) => {
			s.font2 = response 	
			resolve()
		} )
} ) ).then ( () => new Promise ( ( resolve )=> {	

	s.fontLoader.load( 
		'fonts/Pattaya_Regular.json', 
		( response ) => {
			s.font3 = response 	
			resolve()
		} )
} ) ).then ( () => {
	
	if ( typeof params === 'undefined' ) { 
		ui.switchFont( 'font1' )
	} else { 
		ui.switchFont( params.fontType ) 
	}
	
	if ( typeof params !== 'undefined' ) {
		if ( ! params.colorLettersFront || ! params.colorLettersSide || ! params.colorBoxSide ) { 
			s.initMaterials() 
		} else {	
			s.initMaterials( params.colorLettersFront.hex, params.colorLettersSide.hex, params.colorBoxSide.hex )
		}
	} else {
		s.initMaterials()
	}
			
	s.initScene()	                     
	s.createText()
	ui.calckPrice()		
	s.animate()	
	ui.initPallete()	
} )
 
window.onload = () => loadAssets() 
 
 
 
/**************************************************;
 * SCENE
 **************************************************/ 
 
s.initScene = () => { 
	
	/** SCENE */	
	s.scene = new THREE.Scene()
	s.camera = new THREE.PerspectiveCamera( 
		10,	( window.innerWidth * 0.74 ) / 800, 3.5, 15000 )
	s.camera.position.set( -400, 400, 1700 )
	
	/** SCENE B FOR BACKGROUND */
	s.sceneB = new THREE.Scene()
	s.cameraB = new THREE.PerspectiveCamera( 
		10,	( window.innerWidth * 0.74 ) / 800, 3.5, 25000 )
	s.cameraB.position.set( 0, 0, 1700 )	
	s.cameraB.lookAt( s.sceneB.position )
	
	s.rendererB = new THREE.WebGLRenderer( { canvas: s.canvas, alpha: true } )
	
	/** RENDERER */
	s.canvas = document.getElementById( 'canvas-webgl' )
	s.renderer = new THREE.WebGLRenderer( { canvas: s.canvas, alpha: true } )
	s.renderer.setClearColor( 0x000000, 0.5 )		
	s.handleWindowResize()	
	
	s.renderer.gammaInput = true
	s.renderer.gammaOutput = true			
		
	/** LIGHTS */	
	s.pointL = new THREE.PointLight( 0xffffff, 0.2 )
	s.pointL.position.set( 200, 300, 600 )
	s.scene.add( s.pointL )
	let lightAmb = new THREE.AmbientLight( 0xadd6eb, 0.01 )
	s.scene.add(lightAmb)
		
	/** CUSTOM */
	s.clock = new THREE.Clock()
	s.controls = new THREE.OrbitControls( s.camera, s.renderer.domElement )	
				
	/** COMPOSER */
	s.renderSceneB = new THREE.RenderPass( s.sceneB, s.cameraB )	
	s.renderScene = new THREE.RenderPass( s.scene, s.camera )
	
	s.effectFXAA = new THREE.ShaderPass( THREE.FXAAShader )
	s.effectFXAA.uniforms[ 'resolution' ].value.set( 1 / window.innerWidth, 1 / window.innerHeight )
	
	s.bloomPass = new THREE.UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 )
	s.bloomPass.threshold = 0.21
	s.bloomPass.strength = 1.2
	s.bloomPass.radius = 0.55
	
	s.bloomPass.renderToScreen = true
	
	s.composer = new THREE.EffectComposer( s.renderer )
	s.composer.setSize( window.innerWidth, window.innerHeight )
	
	s.composer.addPass( s.renderScene )
	s.composer.addPass( s.effectFXAA )
	s.composer.addPass( s.bloomPass )
	
	s.renderer.gammaInput = true
	s.renderer.gammaOutput = true
	s.renderer.toneMappingExposure = Math.pow( 0.9, 4.0 )		
}


/** LOADER BACKGROUND TEXTURE ***********************/
 
const addBackImgToScene = () => {
	
	if ( s.backgroundImagePlane ) {
		s.sceneB.remove( s.backgroundImagePlane )		
	}
	
	let imageElement = document.getElementById('upload-img')
	
	imageElement.onload = function( e ) {
		
		let texture = new THREE.Texture( this )
		texture.needsUpdate = true
		let w = 5500
		let h = this.height/this.width * w
		s.planeGeom = new THREE.PlaneGeometry( w, h )
		s.backMat = new THREE.MeshBasicMaterial( { map: texture } )
		s.backgroundImagePlane = new THREE.Mesh( s.planeGeom, s.backMat )
		s.backgroundImagePlane.position.set( 0, 0, -20000 )		
		s.sceneB.add(s.backgroundImagePlane)
		s.backgroundImagePlane.lookAt( s.cameraB.position )
		s.isBackgroundTexture = true	
	}
}


/** ANIMATION SCENE *******************************/
  
s.animate = () => {
		
	s.controls.update()			
    
	if ( s.isBackgroundTexture ) {
		s.renderer.autoClear = false
		s.renderer.clear()
		s.renderer.render( s.sceneB, s.cameraB )
		s.renderer.render( s.scene, s.camera )	
	} else {	
		s.composer.render()	
	}
	
	requestAnimationFrame( s.animate )	
}



/**************************************************;
 * RESIZE WINDOW
 **************************************************/

s.handleWindowResize = () => {
	
	let w = window.innerWidth 
	let h = window.innerHeight 	
	
	/** resize gui */
	$('#sceneSettings').width( w * 0.26 )	
	$('#sceneSettings').height( h )
	
	if ( w < 1135 ) {
		
		$('#sizeWrapper').css( { 'width': '70%', 'float': 'none', 'padding-left': '0px' } )
		$('#heightWrapper').css( { 'width': '70%', 'float': 'none', 'padding-right': '0px' } )		
	} else {
		
		$('#sizeWrapper').css( { 'width': '30%', 'float': 'left', 'padding-left': '15%' } )
		$('#heightWrapper').css( { 'width': '30%', 'float': 'right', 'padding-right': '15%'} )
	} 
	
	/** resize scene */
	s.renderer.setPixelRatio( w * 0.74 / h )	
	s.renderer.setSize( Math.floor( w * 0.74 ), h )	
	
	s.camera.aspect =  w * 0.74 / h
	s.camera.updateProjectionMatrix()
	
	s.cameraB.aspect =  w * 0.74 / h
	s.cameraB.updateProjectionMatrix()		
}

window.addEventListener( 'resize', s.handleWindowResize, false )


/** SWITCH RENDERER COLOR *************************/

s.setColorRenderer = ( v = '000000' ) => {
	
	s.renderer.setClearColor( eval( '0x' + v ), 1.0 )	
	
	if ( v ==  '000000' ) {
		s.renderScene.renderToScreen = false
		s.bloomPass.renderToScreen = true
	} else {
		s.bloomPass.renderToScreen = false
		s.renderScene.renderToScreen = true
	}
}



/**************************************************;
 * MATERIALS / SHADERS
 **************************************************/
 
s.initMaterials = ( c1 = 'ff0000', c2 = 'ffffff', c3 = 'ff0000' ) => {
		
	let cs1 = '0x' + c1
	let cs2 = '0x' + c2		
	let cs3 = '0x' + c3	
	
	/** LIGHT MATERIALS */
	s.matLightMain = new THREE.MeshPhongMaterial( { 		
		
		color: eval( cs1 ),
		emissive: eval( cs1 ),

		transparent: true,
		flatShading: true,
		side: THREE.DoubleSide,
		
	} )
	
	s.matLightSecond = s.matLightMain.clone()
	s.matLightSecond.color.setHex( eval( cs2 ) )
	s.matLightSecond.emissive.setHex( eval( cs2 ) )	

	s.matLightThird = s.matLightMain.clone()
	s.matLightThird.color.setHex( eval( cs3 ) )	
	s.matLightThird.emissive.setHex( eval( cs3 ) )	
			
	s.matDiod = new THREE.ShaderMaterial( s.DiodShader )
	s.matDiod.uniforms.tDiff.value = s.mapDiod  	
	
	/** EASY MATERIALS */
	s.matIronMain = new THREE.MeshPhongMaterial( { 
		envMap: s.textureCube,		
		color: eval( cs1 ),
		shininess: 0.1,				
		reflectivity: 0.2,
		flatShading: true,
		side: THREE.DoubleSide	 		
	})
	
	s.matIronSecond = s.matIronMain.clone()	
	s.matIronSecond.color.setHex( eval( cs2 ) )

	s.matIronThird = s.matIronSecond.clone()	
	s.matIronThird.color.setHex( eval( cs3 ) )	
}	
	
s.DiodShader = {
	uniforms: {
		tDiff: { 
			type: 't',
			value: null 
		},
		tRed: {
			type: 'f',
			value: 1.0 		
		},
		tGreen: {
			type: 'f',
			value: 0.0 		
		},
		tBlue: {
			type: 'f',
			value: 0.0 		
		}		
	},
	vertexShader: [
		'varying vec2 vUv;',
		'void main() {',
			'vUv = uv;',
			'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
		'}'
	].join( '\n' ),
	fragmentShader: [
		'varying vec2 vUv;',
		'uniform sampler2D tDiff;',
		'uniform float tRed;',
		'uniform float tGreen;',
		'uniform float tBlue;',		
		'void main() {',
			'vec2 uv = vUv*0.2;',	
			'vec4 diff = texture2D( tDiff, uv );',
			'vec4 outputing = diff * vec4( tRed, tGreen, tBlue, 1.0 ) * 1.1 + 0.1;',
			'gl_FragColor = outputing;',
		'}'
	].join( '\n' )
}



/**************************************************;
 * TEXT MAIN PARAMS OBJECT
 **************************************************/
	
let sceneText

const dataT = {
	
	typeLight: 'front',
	typeBoard: 'letters',
	textValue: 'Citygrafika',
	heightBoard: 10,
	height: 10,
	isHeightUpdate: false, 	
	size: 50,
	hover: 0,
	curveSegments: 3,
	bevelThickness: 0,
	bevelSize: 0,
	bevelSegments: 0,
	bevelEnabled: false,
	font: null,
	fontType: 'font1',	
	fontName: 'optimer', 
	fontWeight: 'bold',
	fontMap: {
		'helvetiker': 0,
		'optimer': 1,
		'gentilis': 2,
		'droid/droid_sans': 3,
		'droid/droid_serif': 4
	},
	weightMap: {
		'regular': 0,
		'bold': 1
	}	
}

if ( typeof params !== 'undefined' ) {
	for ( let key in dataT ) {
		if ( params[key] ) dataT[key] = params[key] 
	}  
}	
	


/**************************************************;
 * CLASSES LETTERS VOLUME
 **************************************************/
 
  
/** MAIN CLASS FRONTLIGHT LETTERS *****************/ 

class Letters {
	
	constructor () {

		this.setHeight() 
		this.createGeom() 		
		this.setMaterrials()  
		this.createMesh()
		this.sendWidth()	
		this.setBlummPass()			
	}
	
	setHeight() {
		
		dataT.height = dataT.heightBoard		
	}
	
	setBlummPass() {
		
		s.bloomPass.threshold = 0.21
		s.bloomPass.strength = 1.2
		s.bloomPass.radius = 0.55		
	}
	
	createGeom() {
		
		this.geom = new THREE.TextGeometry( dataT.textValue, {
			font: dataT.font,
			size: dataT.size,
			height: dataT.height,
			curveSegments: dataT.curveSegments,
			bevelThickness: dataT.bevelThickness,
			bevelSize: dataT.bevelSize,
			bevelEnabled: dataT.bevelEnabled,
		} )
		this.geom.computeBoundingBox()
		this.geom.computeVertexNormals()
		this.geom.computeFaceNormals()	
	}	
	
	setMaterrials() {
		
		this.mat = [ s.matLightMain, s.matIronSecond ]
	}
	
	createMesh() {
		
		this.mesh = new THREE.Mesh( this.geom, this.mat )
		
		this.centerOffset = -0.5 * ( this.geom.boundingBox.max.x - this.geom.boundingBox.min.x )
				
		this.mesh.position.x = this.centerOffset
		this.mesh.position.y = dataT.hover
		this.mesh.position.z = 0
		this.mesh.rotation.x = 0
		this.mesh.rotation.y = Math.PI * 2
		s.scene.add( this.mesh )
	}
	
	sendWidth() {
		
		let w = this.geom.boundingBox.max.x - this.geom.boundingBox.min.x 
		ui.htmlAddBoardWidth( w.toFixed() )
		ui.orderAddWidth( w.toFixed() )	
	}
	
	remove() {
		
		s.scene.remove( this.mesh )		
		this.mesh = null
		this.geom = null
	}
}


/** FRONT AND SIDE LIGHT **************************/

class LettersPlus extends Letters {
	
	setMaterrials() {
		
		this.mat = [ s.matLightMain, s.matLightSecond ]
	}	
}


/** OPENLIGHT ************************************/

class LettersOpen extends Letters {
	
	setBlummPass() {
		
		s.bloomPass.threshold = 0.21		
		s.bloomPass.strength = 3.0			
	}	
	
	setMaterrials() {
		
		this.mat = [ s.matDiod, s.matIronSecond ]
	}

	remove() {
		
		super.remove()
		s.scene.remove( this.meshDiod )
		this.meshDiod = null
		this.geomDiod = null	
	}	
}


/** CONTRLIGHT ************************************/

class LettersContr extends Letters {

	createGeom() {
		
		super.createGeom()
		
		this.geomLight = new THREE.TextGeometry( dataT.textValue, {
			font: dataT.font,
			size: dataT.size,
			height: 4,
			curveSegments: dataT.curveSegments,
			bevelThickness: dataT.bevelThickness,
			bevelSize: dataT.bevelSize,
			bevelEnabled: dataT.bevelEnabled
		} ) 
	}

	setMaterrials() {
		
		this.mat = [ s.matIronSecond, s.matIronSecond ]
		this.matLight = [ s.matLightMain, s.matLightMain ]
	}	

	createMesh() {
		
		super.createMesh() 		
		
		this.meshLight = new THREE.Mesh( this.geomLight, this.matLight )
		this.meshLight.position.x = this.centerOffset
		this.meshLight.position.z = -4		
		s.scene.add( this.meshLight )
	}	

	remove() {
		
		super.remove()
		s.scene.remove( this.meshLight )
	}	
	
}


/** NONELIGHT ************************************/

class LettersNoneLight extends Letters {
	
	setBlummPass() {
		
		s.bloomPass.threshold = 0.91
		s.bloomPass.strength = 1.2
		s.bloomPass.radius = 0.55		
	}
	
	setMaterrials() {
		
		this.mat = [ s.matIronMain, s.matIronSecond ]
	}	
}



/**************************************************;
 * CLASSES LETTERS BOX
 **************************************************/


/** BOX LETTERS *********************************/  
 
class CorobLetters extends Letters {
	
	constructor() {
		
		super()		
		this.setCorobMat()
		this.setCorobMesh()
	}
	
	setBlummPass() {
		
		s.bloomPass.threshold = 0.41
		s.bloomPass.strength = 0.5
		s.bloomPass.radius = 0.5	
	}	
	
	setHeight() {
		
		dataT.height = 0.2
	}

	setMaterrials() {
		
		this.mat = [ s.matLightMain, s.matIronMain ]
	}	

	setCorobMat() {
		
		this.matCorob = [ s.matIronThird, s.matIronThird, s.matIronThird, s.matIronThird, s.matLightSecond, s.matIronSecond ] 
	}	
	
	setCorobMesh() {
	
		this.meshCorob = new THREE.Mesh(
			new THREE.BoxGeometry( this.geom.boundingBox.max.x + 15, dataT.size*1.7 , dataT.heightBoard ),
			this.matCorob
		)
		this.meshCorob.position.z = -dataT.heightBoard / 2 - 1
		this.meshCorob.position.y = dataT.size / 2 - 5		
		s.scene.add( this.meshCorob )	
	}
	
	remove() {
		
		super.remove()		
		s.scene.remove( this.meshCorob )
		this.meshCorob = null

	}
}


/** BOX LETTERS PLUS ******************************/  
 
class CorobLettersPlus extends CorobLetters {
	
	setCorobMat() {
		
		this.matCorob = [ s.matLightThird, s.matLightThird, s.matLightThird,  s.matLightThird,  s.matLightSecond, s.matIronMain ]
	}				
}


/** BOX LETTERS OPEN LIGHTS **********************/  
 
class CorobLettersOpen extends CorobLetters {
	
	setMaterrials() {
		
		this.mat = [ s.matDiod, s.matDiod ]
		s.matDiod.needsUpdate = true
	}

	createMesh() {
		
		super.createMesh() 		
		this.mesh.position.z = -0.5
	}	
	
	setCorobMat() {
		
		this.matCorob = [ s.matIronThird, s.matIronThird, s.matIronThird,  s.matIronThird, s.matIronSecond, s.matIronSecond ]
	}		
}


/** BOX LETTERS CONTRLIGHT ***********************/  
 
class CorobLettersContr extends CorobLetters {

	setMaterrials() {
		
		this.mat = [ s.matIronMain, s.matIronMain ]
	}	
	
	setCorobMat() {
		
		this.matCorob = [ s.matIronThird, s.matIronThird, s.matIronThird,  s.matIronThird,  s.matLightSecond, s.matLightSecond ]
	}			
}


/** BOX LETTERS NONELIGHT ***********************/  
 
class CorobLettersNoneLight extends CorobLettersContr {
	
	setBlummPass() {
		
		s.bloomPass.threshold = 5.51
		s.bloomPass.strength = 1.2
		s.bloomPass.radius = 0.55		
	}
	
	setCorobMat() {
		
		this.matCorob = [ s.matIronThird, s.matIronThird, s.matIronThird, s.matIronThird, s.matIronSecond, s.matIronSecond ]
	}	
	
	setMaterrials() {
		
		this.mat = [ s.matIronMain, s.matIronMain ]
	}	
}



/**************************************************;
 * INIT TEXT
 **************************************************/	
 
s.createText = () => {
	
	if ( ui.loaderIcon ) ui.loaderIcon.style.display = 'block'
	
	if ( sceneText ) sceneText.remove()
	
	if ( dataT.typeBoard == 'box' ) {
	
		switch ( dataT.typeLight ) {
		case 'front':
			sceneText = new CorobLetters()
			break
		case 'frontPlus': 
			sceneText = new CorobLettersPlus()
			break
		case 'open':
			sceneText = new CorobLettersOpen()
			break
		case 'contr':
			sceneText = new CorobLettersContr()
			break
		case 'none':
			sceneText = new CorobLettersNoneLight()
			break
		}			
	}
		
	if ( dataT.typeBoard == 'letters' ) {	
	
		switch ( dataT.typeLight ) {
		case 'front':
			sceneText = new Letters()
			break
		case 'frontPlus':
			sceneText = new LettersPlus()
			break
		case 'open':
			sceneText = new LettersOpen()
			break
		case 'contr':
			sceneText = new LettersContr()
			break
		case 'none':
			sceneText = new LettersNoneLight()
			break
		}		
	}
	
	if ( ui.loaderIcon ) ui.loaderIcon.style.display = 'none'
	
	ui.prepearOrder()
} 



/**************************************************;
 * INIT INTERFACE 
 **************************************************/

ui.loaderIcon = document.getElementById('preloaderImg')  
 

/** BUTTONS ***************************************/ 
 
$( '.typeBoard' ).click( ( e ) => {
	
	if ( dataT.typeBoard == e.target.value ) return 
		
	$( '.typeBoard' ).removeClass( 'checkOn' )
	$(e.target).addClass( 'checkOn' )
	
	e.target.value == 'box' ? $( '#colorBoxSide' ).css( { 'display': 'block' } ) : $( '#colorBoxSide' ).css( { 'display': 'none' } )
	
	dataT.typeBoard = e.target.value	
	s.createText()
	ui.calckPrice()	
} ) 

$( '.typeLight' ).click( ( e ) => { 

	if ( dataT.typeLight == e.target.value ) return
		
	$( '.typeLight' ).removeClass( 'checkOn' )
	$( e.target ).addClass( 'checkOn' )	
	
	dataT.typeLight = e.target.value 
	s.createText()
	ui.calckPrice()	
} )

ui.switchFont = val => {
	
	switch ( val ) {	
	case 'font1':
		dataT.font = s.font1
		break
	case 'font2':
		dataT.font = s.font2
		break
	case 'font3':
		dataT.font = s.font3
		break
	}
}
  
$( '.font' ).click( ( e ) => { 
	
	if ( dataT.font == e.target.value ) return
	
	$( '.font' ).removeClass( 'checkOn' )
	$( e.target ).addClass( 'checkOn' )
	
	dataT.fontType = e.target.value	
	
	ui.switchFont( e.target.value )
	
	s.createText()
	ui.calckPrice()	
} )
	

/** INPUTS ****************************************/ 

ui.inputsHtml = document.getElementsByClassName( 'inputs' )
ui.inputsValues = []
ui.inputsValuesOld = []

ui.getInputsValues = () => {
	let arr = []
	for( let i = 0; i < ui.inputsHtml.length; i ++ ){
		arr.push( ui.inputsHtml[i].value )
	}
	return arr
}

ui.inputsValuesOld = ui.getInputsValues()

ui.checkInputsValues = () => {

	ui.inputsValues = ui.getInputsValues()
	
	for ( let i = 0; i < ui.inputsValues.length; i ++ ) {
	
		if ( ui.inputsValuesOld[i] != ui.inputsValues[i] ) {
			
			ui.inputsValuesOld = ui.getInputsValues() 
			ui.checkChanges( i )
		}
	}		
}

ui.checkChanges = i => {

	switch( ui.inputsHtml[i].id ) {	
	case 'mainText': 
		dataT.textValue = ui.inputsHtml[i].value
		break
	case 'height':
		if ( ui.inputsHtml[i].value < 1 ) ui.inputsHtml[i].value = 1
		dataT.heightBoard = ui.inputsHtml[i].value			
		break
	case 'size': 
		dataT.size = ui.inputsHtml[i].value
		break
	}	
		
	s.createText()
	ui.calckPrice()
}

setInterval( ui.checkInputsValues, 100 )


/** COLOR PICKER **********************************/

ui.currentColorButton = 'none'

ui.initPallete = () => {
	
	/** init colors */
	let c = document.getElementById( 'containerColors' )
	
	colors.forEach( ( item, i ) => {
		
		let d = document.createElement( 'div' )
		d.id = i
		d.className = 'colorItem'	
		d.style.backgroundColor = '#' + item.hex
		c.appendChild( d )	
	}  )
	
	/** init buttons */
	$( '.colorButt' ).click( ( e ) => {
		
		$( '#colorPic' ).css( { 'display': 'table' } )		
		$( '.colorButt' ).removeClass( 'colorCheckOn' )	
		$( e.target ).addClass( 'colorCheckOn' )
		
		ui.currentColorButton = e.target		
	} )	
	
	$('#hidePallete').click( () => {
			
		$( '#colorPic' ).css( { 'display': 'none' } )
		$( '.colorButt' ).removeClass( 'colorCheckOn' )
		
		ui.currentColorButton = 'none'		
	} )	
}

const hexToRgb = hex => {

    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
    hex = hex.replace( shorthandRegex, (m, r, g, b) => {
       r + r + g + g + b + b
    } )

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255
    } : null
}

$( '#colorPic' ).click( ( e ) => {
	
	if ( ! colors[e.target.id] ) return

	$( ui.currentColorButton ).css( { 'backgroundColor': '#' + colors[e.target.id].hex } ) 
	ui.orderAddColor(  ui.currentColorButton.value, colors[e.target.id].oracle )	
	
	if ( ui.currentColorButton.value == 'colorMain' ) {	
	
		s.matLightMain.color.setHex( eval( '0x' + colors[e.target.id].hex ) )
		s.matLightMain.emissive.setHex(  eval( '0x' + colors[e.target.id].hex ) )
		
		let colorShader = ( hexToRgb( colors[e.target.id].hex ) )
		s.matDiod.uniforms.tRed.value = colorShader.r 
		s.matDiod.uniforms.tGreen.value = colorShader.g 		
		s.matDiod.uniforms.tBlue.value = colorShader.b 			
		
		s.matIronMain.color.setHex( eval( '0x' + colors[e.target.id].hex ) )
		
		$('#colorMainVal').html( colors[e.target.id].oracle )
	}	

	if ( ui.currentColorButton.value == 'colorAdv' ) {	
	
		s.matLightSecond.color.setHex( eval( '0x' + colors[e.target.id].hex ) )	
		s.matLightSecond.emissive.setHex(  eval( '0x' + colors[e.target.id].hex ) )
			
		s.matIronSecond.color.setHex( eval( '0x' + colors[e.target.id].hex ) )
		
		$('#colorAdvVal').html( colors[e.target.id].oracle )		
	}	
	
	if (  ui.currentColorButton.value == 'colorBoxSide' ) {	
	
		s.matLightThird.color.setHex( eval( '0x' + colors[e.target.id].hex ) )
		s.matLightThird.emissive.setHex(  eval( '0x' + colors[e.target.id].hex ) )
		
		s.matIronThird.color.setHex( eval( '0x' + colors[e.target.id].hex ) )		
		
		$('#colorBoxSideSetVal').html( colors[e.target.id].oracle )		
	}

	s.createText()	
} )


/** UI PARAMS *************************************/

$( '.switchDay' ).click( ( e ) => {
	
	$( '.switchDay' ).removeClass( 'checkOnPM' ) 	
	$( e.target ).addClass( 'checkOnPM' )
	
	if ( e.target.value == '000000' ) {
		$( '#sceneSettings' ).removeClass( 'day' ) 
		$( '#app' ).removeClass( 'day' ) 		
	} else {
		$( '#sceneSettings' ).addClass( 'day' )
		$( '#app' ).addClass( 'day' )
	}
	
	s.setColorRenderer( e.target.value )
} )


/** INTERFACE CALLBACK CALCK PARAMS ***************/ 
 
ui.htmlAddBoardWidth = val => $('#width').html( val )


ui.calckPrice = () => {

	let price = dataT.heightBoard * 
				pr[dataT.typeBoard][dataT.typeLight].height10 *
				dataT.size * 
				pr[dataT.typeBoard][dataT.typeLight].size10 * 
				dataT.textValue.length *
				pr[dataT.fontType]
				
	let str = String( price )  
	str = str.replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ')
	$('#price').html( str )

	ui.prepearOrder( str )	
}


/** LOAD IMAGE FROM USER ************************/ 

let fileupload  = $( '#fileupload' )
let buttonFileUpload = $( '#btnupload' )
buttonFileUpload.click( () => { fileupload.click() } )
 
function readURL( e ) {

	if ( this.files && this.files[0] ) {
		var reader = new FileReader()
		$( reader ).load( ( e ) => { 
			$( '#upload-img' ).attr( 'src' , e.target.result )
			addBackImgToScene()	
		} )
		reader.readAsDataURL( this.files[0] )	
	}
}
fileupload.change( readURL )



/** USER FORMS ************************************/ 

$('#showUserForms').click( () => { 

	$( '#formsInsertUserData' ).css( { 'display': 'block' } ) 
	$('#containerForms').css( { 'display': 'block' } )	
	$('#sendMessage').css( { 'display': 'none' } )
} ) 	

$('#hideUserForms').click( () => $( '#formsInsertUserData' ).css( { 'display': 'none' } ) )

$('#sendOrder').click( () => {
	
	if ( typeof SetForms !== 'undefined' ) SetForms( $('#mail').val(), $('#phone').val(), $('#name').val() )
		
	$('#containerForms').css( { 'display': 'none' } )	
	$('#sendMessage').css( { 'display': 'block' } )		
} )


/**************************************************;
 * PREPEAR CUSTOMER ORDER OBJECT 
 **************************************************/
 
ui.prepearOrder = price => {
		
	if ( typeof ORDER === 'undefined' ) return	
	
	switch ( dataT.typeBoard ) {
		case 'letters':
			ORDER['Тип_вывески'] = 'Буквы' 
			break
		case 'box':
			ORDER['Тип_вывески'] = 'Короб' 
			break			
	}

	switch ( dataT.fontType ) {
		case 'font1':
			ORDER['Шрифт'] = 'Без засечек' 
			break
		case 'font2':
			ORDER['Шрифт'] = 'С засечками' 
			break
		case 'font3':
			ORDER['Шрифт'] = 'Декоративный' 
			break				
	}

	switch ( dataT.typeLight ) {
		case 'front':
			ORDER['Подсветка'] = 'Лицевая' 
			break
		case 'frontPlus':
			ORDER['Подсветка'] = 'Лицевая и Торец' 
			break
		case 'open':
			ORDER['Подсветка'] = 'Открытые светодиоды' 
			break
		case 'contr':
			ORDER['Подсветка'] = 'Контражур' 
			break
		case 'none':
			ORDER['Подсветка'] = 'Без подсветки' 
			break			
	}

	ORDER['Текст'] = dataT.textValue  
	ORDER['Высота'] = dataT.size
	ORDER['Глубина'] = dataT.height
	ORDER['Цена'] = price		
} 

ui.orderAddWidth = w => ORDER['Ширина'] = w	


ui.orderAddColor = ( t, c ) => {
	
	switch ( t ) {
		case 'colorMain':
			ORDER['Цвет_Букв'] = c
			break
		case 'colorAdv':
			ORDER['Цвет_Краев'] = c
			break
		case 'colorBoxSide':
			ORDER['Цвет_торца_короба'] = c 
			break			
	}
}


