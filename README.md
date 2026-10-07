# ☕ Coffee Stream Geometry Lab
### 咖啡流線幾何實驗室

An interactive 3D learning project that explores differential geometry through the everyday problem of pouring coffee into a takeaway cup.

## 🌐 Live Demo

**Try the interactive project:**  
https://coffee-pour-sim.vercel.app

---

## 💡 Motivation

This project started from a simple real-life question:

> **Can coffee be poured accurately through the small opening of a takeaway cup without removing the lid?**

Instead of treating the coffee stream only as a physics simulation, this project models its centerline as a **parametrized curve** and uses differential geometry to study how the curve moves, bends, and enters the cup opening.

The central idea is:

> **A successful pour depends not only on where the stream reaches the lid, but also on the direction in which it enters.**

---

## 📐 Geometry Concepts

The project visualizes several concepts from differential geometry.

### Parametrized Curve

The centerline of the coffee stream is represented as

\[
\alpha(t)
\]

so each point along the stream can be studied geometrically.

### Frenet Frame — T, N, B

At a selected point \(P(t)\), the application displays the Frenet frame:

- **T — Tangent:** direction in which the stream is moving
- **N — Normal:** direction in which the curve is bending
- **B — Binormal:** direction perpendicular to both T and N

This makes the local geometry of the coffee trajectory visible directly in the 3D scene.

### Curvature

Curvature measures how strongly the trajectory bends:

\[
\kappa
\]

The corresponding radius of curvature is

\[
R = \frac{1}{\kappa}
\]

A larger curvature therefore corresponds to a smaller radius and a sharper bend.

### Torsion

Torsion measures how a curve twists out of its osculating plane.

The main coffee trajectory in this project is planar, so its binormal remains approximately constant and

\[
\tau \approx 0
\]

A spatial teaching curve is also included to demonstrate the difference between planar and spatial curves.

---

## 🎯 Entry Geometry

Reaching the cup opening is not enough by itself.

The project analyzes two conditions:

### 1. Position Alignment

Let \(Q\) be the point where the stream intersects the lid plane and \(C\) the center of the drinking hole.

\[
d = \|Q-C\|
\]

This measures how far the stream is from the center of the opening.

### 2. Directional Alignment

The tangent vector at the entry point,

\[
T_{\text{entry}},
\]

describes the direction in which the stream enters the lid.

When the stream enters at an oblique angle, its circular cross-section appears approximately elliptical on the lid plane.

The application therefore evaluates both position and direction when estimating whether the stream can pass through the opening.

### Main conclusion

\[
\boxed{\text{Good Pour} \neq \text{Position Only}}
\]

Instead:

\[
\boxed{\text{Good Pour} =
\text{Position Alignment} +
\text{Directional Alignment}}
\]

---

## 🧪 Interactive Controls

Users can experiment with:

- Mug tilt angle
- Mug height
- Distance from the cup
- Flow rate
- Pour progression
- TNB observation position

The 3D visualization updates interactively so that changes in the pouring conditions can be connected to changes in the geometry of the trajectory.

---

## 🎓 Guided Learning

The project includes a guided learning mode that introduces the geometry step by step:

1. Observe the coffee trajectory
2. Explore the tangent vector
3. Observe the normal direction and curvature
4. Examine the Frenet frame
5. Compare planar and spatial behavior
6. Analyze the cup-entry geometry
7. Experiment independently

The goal is to make differential geometry easier to understand through direct visual interaction.

---

## 🛠️ Built With

- React
- TypeScript
- Vite
- Three.js
- React Three Fiber
- Zustand
- Tailwind CSS
- Vercel

---

## 📚 Academic Context

This project was created as an interactive geometry learning project.

The main mathematical concepts are based on topics from differential geometry of curves, including:

- Parametrized curves
- Tangent vectors
- Frenet frames
- Curvature
- Radius of curvature
- Torsion
- Planar and spatial curves

Additional entry-geometry analysis was developed to apply these concepts to the original coffee-pouring problem.

---

## 🚀 Run Locally

Clone the repository:

```bash
git clone https://github.com/shojimo08/coffee-pour-sim.git
cd coffee-pour-sim
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Then open the local URL shown by Vite in your browser.

---

## 👤 Author

**Shoji**

Geometry course project — 2026