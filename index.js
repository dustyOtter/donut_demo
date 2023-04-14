/* 
  * 初始化场景
*/

window.onload = () => {
  window.scrollTo({
    top:0,
    behavior:'smooth'
  })
}

/* 
  * 获取画布场景
*/
const canvas = document.querySelector("canvas.webgl")

/* 
  * 设置场景
*/
const scene = new THREE.Scene()

/* 
  * 设置几何体
*/
const cubeGeometry = new THREE.BoxGeometry(1,1,1,1)
/* 
  * 设置材质
*/
const cubeMaterial = new THREE.MeshBasicMaterial({
  color:0xff0000 // 16进制
})
/* 
  * 设置网格物体
*/
// const cube = new THREE.Mesh(cubeGeometry,cubeMaterial)
// scene.add(cube)

/* 
  * 初始化大小
*/
const sizes = {width:window.innerWidth,height:window.innerHeight}
/* 
  * 滚动状态下
*/
const transformDonut = [
  {
    rotationZ : .45,
    positionX: 1.5
  },
  {
    rotationZ : -.45,
    positionX: -1.5
  },
  {
    rotationZ : .314,
    positionX: 0
  },
]
let scrollY = window.scrollY
let currentSection = 0
window.addEventListener('scroll',function() {
  scrollY = window.scrollY
  const newSection = Math.round(scrollY / sizes.height)
  
  if(newSection != currentSection){
    currentSection = newSection
    console.log(newSection,'newSection');

    if(!!donut){
      gsap.to(
        donut.rotation,{
          duration:1.5,
          ease:'power2.inOut',
          z:transformDonut[currentSection].rotationZ
        }
      )
      gsap.to(
        donut.position,{
          duration:1.5,
          ease:'power2.inOut',
          x:transformDonut[currentSection].positionX
        }
      )
    }
  }
})
/* 
  * 设置环境光
*/
const ambientLight = new THREE.AmbientLight(0xffffff,0.8)
scene.add(ambientLight)
/* 
  * 设置平行光
*/
const directionalLight = new THREE.DirectionalLight(0xffffff,1)
directionalLight.position.set(1,2,0)
scene.add(directionalLight)
/* 
  * 设置相机
*/
const camera = new THREE.PerspectiveCamera(35,sizes.width / sizes.height,0.1,1000)
// camera.lookAt(0,0,0) //相机焦点位置
camera.position.set(0,0,5) //当物体没有渲染出来时，先看控制台有没有报错，如果没有再调试相机位置
scene.add(camera)
/* 
  * 设置蒙板- 平面缓冲几何体 & 着色器材质
*/
const overlayGeometry = new THREE.PlaneGeometry(2,2,1,1)
const overlayMaterial = new THREE.ShaderMaterial({
  vertexShader:`
    void main() {
      gl_Position = vec4(position,1.0);
    }
  `, //顶点着色器的GLSL代码
  fragmentShader:`
  uniform float uAlpha;
  void main() {
    gl_FragColor = vec4(0.0,0.0,0.0,uAlpha); 
  }`, //片元着色器的GLSL代码 控制蒙板显示度 vec4(0.0,0.0,0.0,1.0); => vec4(0.0,0.0,0.0,0.0);
  uniforms:{
    uAlpha:{
      value:1.0 //也可以通过变量去控制蒙板显示度
    }
  },
  transparent:true
})

const overlay = new THREE.Mesh(overlayGeometry,overlayMaterial) 
scene.add(overlay)

/* 
  * 设置loading
*/
const loadingBar = document.querySelector('.loading-bar')
const loadManager = new THREE.LoadingManager(
  () => {
  setTimeout(() => {
    gsap.to(overlayMaterial.uniforms.uAlpha,{
      duration:3,
      value:0,
      delay:1
    })

    loadingBar.classList.add('ended')
    document.body.classList.add('loaded')
    loadingBar.style.transform = ''
  },500)
  },
  (itemUrl,itemLoaded,itemTotal) => {
    const progress = itemLoaded / itemTotal
    loadingBar.style.transform = `scale(${progress})`;
  },
  () => console.error('pro :>> '),
)
/* 
  * 设置GITF LOADER
*/
let donut = null
const gltfLoader = new THREE.GLTFLoader(loadManager)
gltfLoader.load("./assets/donut/scene.gltf",
(e) => { 
  donut = e.scene 
  // 设置布局位置
  donut.position.x = 1.5
  donut.rotation.x =Math.PI * 0.2
  donut.rotation.z =Math.PI * 0.15
  const radius = 8.5
  donut.scale.set(radius,radius,radius)
  // 给最外层的场景添加一个场景
  scene.add(donut)
 }
) 

/* 
  * 设置构造器
*/

const render = new THREE.WebGLRenderer({
  canvas:canvas,
  antialias:true,
  alpha:true
})

render.setSize(sizes.width,sizes.height)
render.setPixelRatio(Math.min(window.devicePixelRatio,2))


/* 
  * 设置核心和动画requestAnimationFrame（H5新增API请求动画帧）
*/
const clock = new THREE.Clock()
let lastElapsedTime = 0

const tick = () => {
  const elapsedTime = clock.getElapsedTime()
  const deltaTime = elapsedTime - lastElapsedTime
  lastElapsedTime =  elapsedTime

  if(!!donut){
    donut.position.y = Math.sin(elapsedTime * 0.5) * 0.1 - 0.1
  }
  // cube.rotation.y = Math.sin(elapsedTime) //左右旋转弧度

  render.render(scene,camera)
  // console.log(deltaTime,'deltaTime--');
  requestAnimationFrame(tick)
}
tick()