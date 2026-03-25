# 🤖 Interactive Robot Controller (Three.js)

A performant and interactive 3D web application built using Three.js, demonstrating real-time animation control, raycasting interaction, and dynamic lighting.

---

## 🚀 Live Demo
🔗 https://robot-controller-threejs.netlify.app/

## 📦 GitHub Repository
🔗https://github.com/rushikeshmagar123/Three.js-Robot-Controller
---

## 📌 Features

### 🎮 Interactive Animations
- Default **Idle** animation on load
- Click **Head** → triggers **Jump** animation (plays once and blends back to Idle)
- Click **Torso** → toggles **Walking** animation loop

### 🖱 Raycasting Interaction
- Uses Three.js Raycaster to detect user clicks on specific body parts
- Robust detection using hierarchy traversal (not dependent on exact mesh names)

### 🌙 Dynamic Lighting
- Toggle **Night Mode** using UI button
- Replaces scene lighting with a **PointLight**
- Light smoothly follows mouse movement using interpolation (lerp)

### ⚡ Performance Optimization
- devicePixelRatio capped for mobile GPU performance
- No object creation inside render loop
- Smooth animation blending using AnimationMixer
- Efficient raycasting logic

### 🧠 Memory Management
- Proper disposal of geometries, materials, and renderer on unload
- Prevents GPU memory leaks in SPA environments

---

## 🛠 Tech Stack

- **Three.js (v0.160.1)**
- WebGL
- JavaScript (ES Modules)
- GLTFLoader (for 3D assets)

---

## 📂 Project Structure
project/
│── index.html
│── main.js
