import { useRef, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
// import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import * as TWEEN from "tween.js";

const CricketPitch = () => {
  const refContainer = useRef(null);
  useEffect(() => {
    // Set up the scene
    const scene = new THREE.Scene({});
    scene.add(new THREE.AxesHelper(15));
    // scene.add(new THREE.GridHelper(100,15));

    // const bgTexture = new THREE.TextureLoader().load("clouds.jpeg");
    // bgTexture.wrapS = THREE.RepeatWrapping; // Repeat the texture along the x-axis
    // bgTexture.repeat.x = 1; // Repeat the texture twice along the x-axis
    // scene.background = bgTexture;

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Define custom ellipse geometry
    function createEllipseGeometry(radiusX, radiusY, segments) {
      const geometry = new THREE.BufferGeometry();
      const positions = [];
      const indices = [];

      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        const x = radiusX * Math.cos(theta);
        const z = radiusY * Math.sin(theta);
        positions.push(x, 0, z);
      }

      for (let i = 0; i < segments; i++) {
        indices.push(i, i + 1, segments);
      }

      geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(positions, 3)
      );
      geometry.setIndex(indices);
      return geometry;
    }

    // Add ground ellipse geometry
    const groundGeometry = createEllipseGeometry(45, 43, 70);

    // Load grass texture
    // const grass = new THREE.TextureLoader().load("grassTexture.jpg");

    // Create the pitch material with grass texture
    const groundMaterial = new THREE.MeshPhongMaterial({
      // map: grass,
      color: 0x1a5d1a,
      side: THREE.DoubleSide,
      shininess: 1000,
    });

    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.y = -Math.PI / 2; // Rotate to lay flat on the x-y plane
    scene.add(ground);

    //fbx loader
    // const fbxLoader = new FBXLoader();
    // fbxLoader.load("fbx/model.fbx", (object) => {
    //   scene.add(object);
    //   object.position.set(-0.3, 0.6, -5);
    //   object.scale.set(1, 1, 1);
    // });
    // fbxLoader.load("fbx/bowler.fbx", (object) => {
    //   scene.add(object);
    //   object.position.set(-0.7, 0.6, 6);
    //   object.scale.set(0.01, 0.01, 0.01);
    // });

    // Define the path for the ball
    const pathPoints = [
      new THREE.Vector3(0, 1, 6), // Initial position
      new THREE.Vector3(0, 0.3, 0), // Intermediate position
      new THREE.Vector3(0, 1, -6), // Final position
    ];

    let currentPointIndex = 0;
    let ballPosition = pathPoints[currentPointIndex].clone();

    // Create the ball
    const ballGeometry = new THREE.SphereGeometry(0.1, 20, 20);
    const ballMaterial = new THREE.MeshBasicMaterial({ color: "red" });
    const ball = new THREE.Mesh(ballGeometry, ballMaterial);
    scene.add(ball);

    // 30 Yards Circle
    const yardsCircle = new THREE.EllipseCurve(
      0,
      0, // ax, aY
      25,
      30, // xRadius, yRadius
      0,
      2 * Math.PI, // aStartAngle, aEndAngle
      false, // aClockwise
      0 // aRotation
    );

    let pts = yardsCircle.getSpacedPoints(100);
    pts.forEach((p) => {
      p.z = -p.y;
      p.y = 0;
    }); // z = -y; y = 0

    let geometry = new THREE.BufferGeometry().setFromPoints(pts);
    let material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      opacity: 1,
      linewidth: 5,
    });
    let mesh = new THREE.Line(geometry, material);
    scene.add(mesh);

    // Outer Boundary
    const outerBoundary = new THREE.EllipseCurve(
      0,
      0, // ax, aY
      40,
      43, // xRadius, yRadius
      0,
      2 * Math.PI, // aStartAngle, aEndAngle
      false, // aClockwise
      0 // aRotation
    );
    let OB = outerBoundary.getSpacedPoints(170);
    OB.forEach((p) => {
      p.z = -p.y;
      p.y = 0;
    }); // z = -y; y = 0

    let OBgeometry = new THREE.BufferGeometry().setFromPoints(OB);
    let OBmaterial = new THREE.MeshBasicMaterial({
      color: "brown",
      opacity: 1,
    });
    let outerBoundaryMesh = new THREE.Line(OBgeometry, OBmaterial);
    scene.add(outerBoundaryMesh);

    // Dimensions of the pitch
    const pitchWidth = 5; // Width of the pitch
    const pitchLength = 16; // Length of the pitch
    const pitchHeight = 0.1; // Thickness of the pitch

    // Create a geometry for the pitch
    const pitchGeometry = new THREE.BoxGeometry(
      pitchWidth,
      pitchHeight,
      pitchLength
    );

    // Create a material with light brown color
    const pitchMaterial = new THREE.MeshBasicMaterial({ color: 0xe78e5f }); // Light brown color

    // Create the pitch mesh
    const pitchMesh = new THREE.Mesh(pitchGeometry, pitchMaterial);
    scene.add(pitchMesh);

    // Add stumps geometry (white color)
    const stumpsGeometry = new THREE.CylinderGeometry(
      0.04,
      0.04,
      1,
      12,
      1,
      false,
      0,
      6.283185307179586
    );
    const stumpsMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

    function createStump(x, y, z) {
      const stump = new THREE.Mesh(stumpsGeometry, stumpsMaterial);
      stump.position.set(x, y, z);
      return stump;
    }

    const stumps = [
      createStump(0.2, 0.5, -6),
      createStump(0, 0.5, -6),
      createStump(-0.2, 0.5, -6),
      createStump(-0.2, 0.5, 6),
      createStump(0, 0.5, 6),
      createStump(0.2, 0.5, 6),
    ];

    stumps.forEach((stump) => scene.add(stump));

    // Create bails geometry
    const bailsGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.2, 12);
    const bailsMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

    // Create bails and position them between the stumps
    const bail1 = new THREE.Mesh(bailsGeometry, bailsMaterial);
    bail1.position.set(0.1, 1, -6);
    bail1.rotateZ(Math.PI / 2);
    scene.add(bail1);

    const bail2 = new THREE.Mesh(bailsGeometry, bailsMaterial);
    bail2.position.set(-0.1, 1, -6);
    bail2.rotateZ(Math.PI / 2);
    scene.add(bail2);

    const bail3 = new THREE.Mesh(bailsGeometry, bailsMaterial);
    bail3.position.set(0.1, 1, 6);
    bail3.rotateZ(Math.PI / 2);
    scene.add(bail3);

    const bail4 = new THREE.Mesh(bailsGeometry, bailsMaterial);
    bail4.position.set(-0.1, 1, 6);
    bail4.rotateZ(Math.PI / 2);
    scene.add(bail4);

    // Create blue material for wide lines
    const wideLineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

    // Define width and height of the wide lines
    const wideLineWidth = 0.02;
    const wideLineHeight = pitchHeight + 0.01; // slightly taller than pitch

    // Create the geometry for wide lines
    const wideLineGeometry = new THREE.BoxGeometry(
      wideLineWidth,
      wideLineHeight,
      pitchWidth
    );

    // Create wide line before stumps (one end)
    const leftWideLineFront = new THREE.Mesh(
      wideLineGeometry,
      wideLineMaterial
    );
    leftWideLineFront.position.set(0, 0, -5.5);
    leftWideLineFront.rotateY(300);
    scene.add(leftWideLineFront);

    const leftWideLineBack = new THREE.Mesh(wideLineGeometry, wideLineMaterial);
    leftWideLineBack.position.set(0, 0, -6.5);
    leftWideLineBack.rotateY(300);
    scene.add(leftWideLineBack);

    // Create side line before stumps (one end)
    const leftSideLineFront = new THREE.Mesh(
      wideLineGeometry,
      wideLineMaterial
    );
    leftSideLineFront.position.set(-2, 0, -6);
    scene.add(leftSideLineFront);

    const rightSideLineFront = new THREE.Mesh(
      wideLineGeometry,
      wideLineMaterial
    );
    rightSideLineFront.position.set(2, 0, -6);
    scene.add(rightSideLineFront);

    // Create wide line before stumps (second end)
    const rightWideLineFront = new THREE.Mesh(
      wideLineGeometry,
      wideLineMaterial
    );
    rightWideLineFront.position.set(0, 0, 5.5);
    rightWideLineFront.rotateY(300);
    scene.add(rightWideLineFront);

    const rightWideLineBack = new THREE.Mesh(
      wideLineGeometry,
      wideLineMaterial
    );
    rightWideLineBack.position.set(0, 0, 6.5);
    rightWideLineBack.rotateY(300);
    scene.add(rightWideLineBack);

    // Create side line before stumps (one end)
    const leftSideLineBack = new THREE.Mesh(wideLineGeometry, wideLineMaterial);
    leftSideLineBack.position.set(2, 0, 6);
    scene.add(leftSideLineBack);

    const rightSideLineBack = new THREE.Mesh(
      wideLineGeometry,
      wideLineMaterial
    );
    rightSideLineBack.position.set(-2, 0, 6);
    scene.add(rightSideLineBack);

    // Position the camera
    camera.position.set(0, 50, 50);
    camera.lookAt(0, 1, 0);

    // Add orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // smooths out camera movement

    // Add lighting
    var light = new THREE.PointLight(0xffffff);
    light.position.set(-10, 15, 50);
    scene.add(light);

    var AmbientLight = new THREE.AmbientLight(0xffffff);
    scene.add(AmbientLight);

    // Render the scene
    // Inside the animate function
    function animate() {
      requestAnimationFrame(animate);

      // Move the ball towards the next point on the path
      const targetPoint = pathPoints[currentPointIndex];
      const direction = targetPoint.clone().sub(ballPosition).normalize();
      ballPosition.add(direction.multiplyScalar(0.05)); // Adjust speed here

      // Check if the ball has reached the target point
      if (ballPosition.distanceTo(targetPoint) < 0.1) {
        currentPointIndex = (currentPointIndex + 1) % pathPoints.length;
      }

      // Check for collision with bails
      const ballRadius = 0.1; // Adjust as per ball geometry
      const bailRadius = 0.02; // Adjust as per bail geometry
      const collisionThreshold = ballRadius + bailRadius;

      for (let bail of [bail1, bail2, bail3, bail4]) {
        const bailPosition = bail.position;
        const distance = ballPosition.distanceTo(bailPosition);

        if (distance < collisionThreshold) {
          // Bail falls when collision occurs
          animateBailFall(bail);
        }
      }

      // Update ball position
      ball.position.copy(ballPosition);

      controls.update();
      renderer.render(scene, camera);
    }

    // Function to animate bail falling
    function animateBailFall(bail) {
      // Perform animation or tween to make the bail fall
      // Example:
      const targetRotation = Math.PI; // Adjust as per desired falling angle
      const duration = 1000; // Adjust as per desired duration of falling animation

      new TWEEN.Tween(bail.rotation)
        .to({ y: targetRotation }, duration)
        .start();
    }

    animate();
  }, []);

  return <div ref={refContainer}></div>;
};

export default CricketPitch;
