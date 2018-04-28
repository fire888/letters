
"use strict"



/**************************************************;
 * VARS SPACES
 **************************************************/

const appl = {
	
	resizeColorPicker: null
}  
 
const s = {
	
	textureLoader: new THREE.TextureLoader(),
	fontLoader: new THREE.FontLoader()
}



/**************************************************;
 * LOAD ASSETS
 **************************************************/
 
const loadAssets = () => new Promise ( ( resolve )=> {
			
		appl.resizeColorPicker( window.innerWidth, window.innerHeight )
		
		s.mapGlow = s.textureLoader.load( 
			"maps/map-glow.png",
			() => resolve()			
		)			
} )
.then( () => new Promise ( ( resolve )=> {
			s.mapDiod = s.textureLoader.load( 
				"maps/map-diod.png",
				() => {
					s.mapDiod.wrapS = s.mapDiod.wrapT = THREE.RepeatWrapping;
					s.mapDiod.repeat.set( -0.00001, -0.00001 ); 					
					resolve()
				}		
			)			
	})
)
.then( () => new Promise ( ( resolve )=> {
			s.fontLoader.load( 
				'fonts/Roboto_Bold.json', 
				( response ) => {
					s.font1 = response 	
					dataT.font = s.font1
					resolve()
				})
		}) 
)
.then ( () => new Promise ( ( resolve )=> {
			s.fontLoader.load( 
				'fonts/EB-Garamond-ExtraBold_Regular.json', 
				( response ) => {
					s.font2 = response 	
					resolve()
				})
		}) 
)
.then ( () => new Promise ( ( resolve )=> {	
			s.fontLoader.load( 
				'fonts/Pattaya_Regular.json', 
				( response ) => {
					s.font3 = response 	
					resolve()
				})
		}) 
)
.then ( () => {
		
	s.initMaterials()
	s.initScene()	
	s.createText()
	appl.calckPrice()	
	s.animate()		
} )
 
window.onload = () => loadAssets() 
 
 
 
/**************************************************;
 * SCENE
 **************************************************/ 
 
s.initScene = () => { 
	
	/** SCENE */	
	s.scene = new THREE.Scene();
	s.camera = new THREE.PerspectiveCamera( 
		10,	( window.innerWidth * 0.74 ) / 800, 3.5, 15000 );
	s.camera.position.set( -400, 400, 1700 )
	
	/** RENDERER */
	s.canvas = document.getElementById( 'canvas-webgl' )
	s.renderer = new THREE.WebGLRenderer( { canvas: s.canvas, alpha: true } )
	s.renderer.setClearColor( 0x000000, 0.5 );		
	//s.renderer.setClearColor( 0xffffff )
	s.handleWindowResize()	
	
	s.renderer.gammaInput = true;
	s.renderer.gammaOutput = true;			
		
	/** LIGHTS */
	let pointL = new THREE.PointLight( 0xffffff, 1.0 )
	pointL.position.set( 200, 300, 600 )
	s.scene.add( pointL );
	let lightAmb = new THREE.AmbientLight( 0xadd6eb, 0.01 )
	s.scene.add(lightAmb);
		
	/** CUSTOM */
	s.clock = new THREE.Clock();
	s.controls = new THREE.OrbitControls( s.camera, s.renderer.domElement )
	
	/** GlOW PLANE */
	s.geomGlow = new THREE.PlaneGeometry( 10, 10 ) 
	s.glowPlane = new THREE.Mesh( s.geomGlow, s.matGlow )
	s.scene.add( s.glowPlane )
				
	/** COMPOSER */
	s.renderScene = new THREE.RenderPass( s.scene, s.camera )
	
	s.effectFXAA = new THREE.ShaderPass( THREE.FXAAShader );
	s.effectFXAA.uniforms[ 'resolution' ].value.set( 1 / window.innerWidth, 1 / window.innerHeight )
	
	s.bloomPass = new THREE.UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 )
	s.bloomPass.threshold = 0.21
	s.bloomPass.strength = 1.2
	s.bloomPass.radius = 0.55
	
	s.bloomPass.renderToScreen = true;
	//s.renderScene.renderToScreen = true;
	
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
		
	s.controls.update()			
	s.composer.render()
	
	requestAnimationFrame( s.animate );	
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
	
	appl.resizeColorPicker( w )	
	
	if ( w < 1135 ) {
		
		$('#sizeWrapper').css( { 'width': '70%', 'float': 'none', 'padding-left': '0px' } );
		$('#heightWrapper').css( { 'width': '70%', 'float': 'none', 'padding-right': '0px' } );		
	} else {
		
		$('#sizeWrapper').css( { 'width': '30%', 'float': 'left', 'padding-left': '15%' } );
		$('#heightWrapper').css( { 'width': '30%', 'float': 'right', 'padding-right': '15%'} );
	} 
	
	/** resize scene */
	s.renderer.setPixelRatio( w * 0.74 / h );	
	s.renderer.setSize( Math.floor( w * 0.74 ), h );	
	s.camera.aspect =  w * 0.74 / h ;
	s.camera.updateProjectionMatrix();	
}

window.addEventListener( 'resize', s.handleWindowResize, false );



/**************************************************;
 * TEXT MAIN PARAMS OBJECT
 **************************************************/
	
let sceneText

const dataT = {
	
	typeLight: 'front',
	typeBoard: 'letters',
	textValue: 'Citygrafika',
	valFrontZ: 10,
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
 * CLASSES LETTERS VOLUME
 **************************************************/
 
  
/** MAIN CLASS FRONTLIGHT LETTERS *****************/ 

class Letters {
	
	constructor () {
		
		this.chancheColorPallete()
		this.setHeight() 
		this.setBlummPass()	
		this.createGeom() 		
		this.setMaterrials()  
		this.createMesh()		
		this.setGlow()
	}
	
	chancheColorPallete() {
		
		appl.resizeColorPicker( window.innerWidth, 25, 1 )
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
		});
		this.geom.computeBoundingBox()
		this.geom.computeVertexNormals()	
	}	
	
	setMaterrials() {
		
		this.mat = [ s.matLightMain, s.matIron ]
	}
	
	createMesh() {
		
		this.mesh = new THREE.Mesh( this.geom, this.mat )
		
		this.centerOffset = -0.5 * ( this.geom.boundingBox.max.x - this.geom.boundingBox.min.x )
		
		appl.htmlAddBoardWidth( this.geom.boundingBox.max.x - this.geom.boundingBox.min.x )	
		
		this.mesh.position.x = this.centerOffset
		this.mesh.position.y = dataT.hover
		this.mesh.position.z = 0
		this.mesh.rotation.x = 0
		this.mesh.rotation.y = Math.PI * 2
		s.scene.add( this.mesh )
	}
	
	setGlow() {
		
		s.glowPlane.visible = false	
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
		
		this.mat = [ s.matDiod, s.matIron ]
	}
	
	setGlow() {	
		
		s.glowPlane.visible = true
		s.matGlow.opacity = 0.3
		s.glowPlane.scale.set( this.geom.boundingBox.max.x*0.14, this.geom.boundingBox.max.y*0.18, 1 )
		s.glowPlane.position.x = 0	
		s.glowPlane.position.z = this.geom.boundingBox.max.z + 3  
		s.glowPlane.position.y = this.geom.boundingBox.max.y * 0.4 	
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
	
	setBlummPass() {
		
		s.bloomPass.threshold = 0.21		
		s.bloomPass.strength = 5.0			
	}

	setMaterrials() {
		
		this.mat = [ s.matBlack, s.matIron ]
		this.matLight = [ s.matLightMain, s.matLightMain ]
	}	

	createMesh() {
		
		super.createMesh() 		
		
		this.meshLight = new THREE.Mesh( this.geomLight, this.matLight )
		this.meshLight.position.x = this.centerOffset
		this.meshLight.position.z = -4		
		s.scene.add( this.meshLight )
	}	

	setGlow() {
		
		s.glowPlane.visible = true
		s.matGlow.opacity = 0.2
		s.glowPlane.scale.set( this.geom.boundingBox.max.x*0.14, this.geom.boundingBox.max.y*0.18, 1 )
		s.glowPlane.position.z = 0  
		s.glowPlane.position.y = this.geom.boundingBox.max.y * 0.4 
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
		
		this.mat = [ s.matIronColor, s.matIronColor ]
	}

	setGlow() {
		
		s.glowPlane.visible = false	
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
	
	chancheColorPallete() {
		
		appl.resizeColorPicker( window.innerWidth, 25, 0.4 )
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
		
		this.mat = [ s.matIronColor, s.matIronColor ]
	}	

	setCorobMat() {
		
		this.matCorob = [ s.matIron, s.matIron, s.matIron, s.matIron, s.matLightSecond, s.matIron ] 
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
		
		this.matCorob = [  s.matLightSecond, s.matLightSecond, s.matLightSecond,  s.matLightSecond,  s.matLightSecond, s.matIron]
	}				
}


/** BOX LETTERS OPEN LIGHTS **********************/  
 
class CorobLettersOpen extends CorobLetters {
	
	chancheColorPallete() {
		
		appl.resizeColorPicker( window.innerWidth, 25, 1.0 )
	}
	
	setBlummPass() {
		
		s.bloomPass.threshold = 0.21		
		s.bloomPass.strength = 5.2			
	}	
	
	setMaterrials() {
		
		this.mat = [ s.matDiod, s.matDiod ]
		s.matDiod.needsUpdate = true
	}

	createMesh() {
		
		super.createMesh() 		
		this.mesh.position.z = -0.5
	}	
	
	setCorobMat() {
		
		this.matCorob = [  s.matIron, s.matIron, s.matIron,  s.matIron,  s.matBlack, s.matIron]
	}	
	
	setGlow() {
		
		s.glowPlane.visible = true
		s.matGlow.opacity = 0.2
		s.glowPlane.scale.set( this.geom.boundingBox.max.x*0.14, this.geom.boundingBox.max.y*0.18, 1 )
		s.glowPlane.position.z = 2  
		s.glowPlane.position.y = this.geom.boundingBox.max.y * 0.4 
	}		
}


/** BOX LETTERS CONTRLIGHT ***********************/  
 
class CorobLettersContr extends CorobLetters {
	
	chancheColorPallete() {
		
		appl.resizeColorPicker( window.innerWidth, 25, 1 )
	}

	setBlummPass() {
		
		s.bloomPass.threshold = 0.21		
		s.bloomPass.strength = 1.2			
	}	

	setMaterrials() {
		
		this.mat = [ s.matLightMain, s.matLightMain ]
	}	
	
	setCorobMat() {
		
		this.matCorob = [  s.matIron, s.matIron, s.matIron,  s.matIron,  s.matBlack, s.matIron]
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
		
		this.matCorob = [ s.matIron, s.matIron, s.matIron, s.matIron, s.matIron, s.matIron ]
	}	
	
	setMaterrials() {
		
		this.mat = [ s.matIronColor, s.matIronColor ]
	}	
}



/**************************************************;
 * INIT TEXT
 **************************************************/	
 
s.createText = () => {
	
	if ( app.loaderIcon ) app.loaderIcon.style.display = 'block'
	
	if ( sceneText ) sceneText.remove()
	
	if ( dataT.typeBoard == "box" ) {
	
		switch ( dataT.typeLight ) {
			case "front":
				sceneText = new CorobLetters()
				break
			case "frontPlus": 
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
		
	if ( dataT.typeBoard == "letters" ) {	
	
		switch ( dataT.typeLight ) {
			case "front":
				sceneText = new Letters()
				break
			case "frontPlus":
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
	
	if ( app.loaderIcon ) app.loaderIcon.style.display = 'none'
} 



/**************************************************;
 * INIT INTERFACE 
 **************************************************/
 
app.loaderIcon = document.getElementById('loader');  
 

/** BUTTONS ***************************************/ 
 
$('.typeBoard').click( ( e ) => {
	
	if ( dataT.typeBoard == e.target.value ) return 
		
	$('.typeBoard').removeClass('checkOn')
	$(e.target).addClass('checkOn')
	
	dataT.typeBoard = e.target.value	
	s.createText()
	appl.calckPrice()	
} ) 

$('.typeLight').click( ( e ) => { 

	if ( dataT.typeLight == e.target.value ) return
		
	$('.typeLight').removeClass('checkOn')
	$(e.target).addClass('checkOn')	
	
	dataT.typeLight = e.target.value 
	s.createText()
	appl.calckPrice()	
} )
  
$('.font').click( ( e ) => { 
	
	if ( dataT.font == e.target.value ) return
	
	$('.font').removeClass('checkOn')
	$(e.target).addClass('checkOn')
	
	dataT.fontType = e.target.value	
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
	appl.calckPrice()	
} )


/** INPUTS ****************************************/ 

appl.inputsHtml = document.getElementsByClassName('inputs');
appl.inputsValues = [];
appl.inputsValuesOld = [];

appl.getInputsValues = () => {
	let arr = [];
	for( let i = 0; i < appl.inputsHtml.length; i ++ ){
		arr.push( appl.inputsHtml[i].value );
	}
	return arr;
}

appl.inputsValuesOld = appl.getInputsValues();

appl.checkInputsValues = () => {

	appl.inputsValues = appl.getInputsValues();
	
	for ( let i =0; i< appl.inputsValues.length; i++ ) {
	
		if ( appl.inputsValuesOld[i] != appl.inputsValues[i] ) {
			
			appl.inputsValuesOld = appl.getInputsValues(); 
			appl.checkChanges( i );
		}
	}		
}

appl.checkChanges = ( i ) => {

	switch( appl.inputsHtml[i].id ) {
		
		case "mainText": 
			dataT.textValue = appl.inputsHtml[i].value
			break
		case "height":
			if ( appl.inputsHtml[i].value < 1 ) appl.inputsHtml[i].value = 1
			dataT.heightBoard = appl.inputsHtml[i].value;
			dataT.valFrontZ = appl.inputsHtml[i].value; 			
			break
		case "size": 
			dataT.size = appl.inputsHtml[i].value
			break
	}	
		
	s.createText()
	appl.calckPrice()
}

setInterval( appl.checkInputsValues, 100 )


/** COLOR PICKER **********************************/

//appl.colorCanvas = document.getElementById('colorPikerBar')
appl.colorPick = document.getElementById('colorPicker') 
//appl.context = appl.colorCanvas.getContext('2d')

let mouseDown = false
window.onmousedown = e => mouseDown = true
window.onmouseup = e => mouseDown = false

const rgbToHex = ( r, g, b ) => {
	
    if ( r > 255 || g > 255 || b > 255 )
        throw "Invalid color component";
    return ( ( r << 16 ) | ( g << 8 ) | b ).toString( 16 );
}


appl.resizeColorPicker = function( wW = 300, hW = 25, coef = 1 ) {
	
	if ( ! appl.colorCanvas ) return 
	if ( ! appl.colorCanvas.getContext ) return
	
	let w = Math.floor( wW * 0.2 ) 
	let h = 25 

	appl.colorCanvas.width = w
	appl.colorCanvas.height = h 
	let grad = appl.context.createLinearGradient( 0, 0, w, 0);
	let val = 255 * coef
	let val2 = 50
	if ( coef < 1) val2 = 0
	let cols = [ [val,0,0], [val,val,0], [0,val,0], [0,val,val], [val2, val2, val], [val, 0 ,val] ];
	
	for ( var i = 0; i <= 5; i ++ ) {
		let color = 'rgb(' +  cols[i][0] + ',' + cols[i][1] + ',' + cols[i][2] + ')';
		grad.addColorStop( i*1/5, color );
	}	
	
	appl.context.fillStyle = grad;
	appl.context.fillRect(0,0, w, h);		
}

/*appl.colorCanvas.onmousemove = e => {

	if ( ! mouseDown ) return
	
	let x = e.offsetX == undefined ? e.layerX : e.offsetX
	let y = e.offsetY == undefined ? e.layerY : e.offsetY
	appl.colorPick.style.marginLeft = x + 'px'

	let p = appl.context.getImageData(x, y, 1, 1).data;
	let hex = "0x" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
	
	s.matLightMain.color.setHex( hex )	
	s.matGlow.color.setHex( hex )
	s.matIronColor.color.setHex( hex )	
}*/		


/** INTERFACE CALLBACK CALCK PARAMS ***************/ 
 
appl.htmlAddBoardWidth = val => {
	
	$('#width').html( val.toFixed() )
}

appl.calckPrice = () => {

	let price = dataT.heightBoard * 
				pr[dataT.typeBoard][dataT.typeLight].height10 *
				dataT.size * 
				pr[dataT.typeBoard][dataT.typeLight].size10 * 
				dataT.textValue.length *
				pr[dataT.fontType]
				
	let str = String( price )  
	str = str.replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ')
	$('#price').html( str );	
}	



/**************************************************;
 * MATERIALS / SHADERS
 **************************************************/
 
s.initMaterials = () => {
	
	s.matLightMain = new THREE.MeshBasicMaterial( { 
		color: 0x3f2fff,
		flatShading: true,		
	})
	
	s.matLightSecond = new THREE.ShaderMaterial( s.LightShader )	
		
	s.matIron = new THREE.MeshPhongMaterial( { 
		color: 0x111b1a,
		emissive: 0x070707,
		specular: 0x000000,
		shininess: 0.1,				
		reflectivity: 0.2,
		transparent: true,
		flatShading: true,
		side: THREE.DoubleSide 		
	})
	
	s.matIronColor = s.matIron.clone()	
	s.matIronColor.color.setHex( 0xff0000 )	
	
	s.matDiod = new THREE.ShaderMaterial( s.DiodShader )
	s.matDiod.uniforms.tDiff.value = s.mapDiod  	
	
	s.matBlack = new THREE.MeshBasicMaterial( { color:0x050505 } )
	
	s.matGlow = new THREE.MeshBasicMaterial( { 	
		map: s.mapGlow,
		color: 0x00ffbd,
		flatShading: true,
		side: THREE.DoubleSide,
		opacity: 0.3,
		transparent: true, 
		depthWrite: false	
	} )
	
	s.matEasyColor = new THREE.MeshPhongMaterial( { 	
		color: 0x005500,
		transparent: true,
		flatShading: true		
	} )
}	
	
s.DiodShader = {
	uniforms: {
		tDiff: { 
			type: "t",
			value: null 
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
		'void main() {',
			'vec2 uv = vUv*0.2;',	
			'vec4 diff = texture2D( tDiff, uv );',
			'gl_FragColor = diff;',
		'}'
	].join( '\n' )
}

s.LightShader = {
	uniforms: {	
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
		'void main() {',
			'vec2 uv = vUv;',	
			'gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);',
		'}'
	].join( '\n' )
}

 