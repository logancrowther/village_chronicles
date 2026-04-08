# Village Chronicles

A medieval idle village-building game. Build your settlement, manage resources, defend against threats, and conquer rivals.

## Gameplay

- **Build** — place houses and structures to grow your village
- **Survive** — manage gold income, population, and defences
- **Conquer** — form alliances or wage war on neighbouring villages

## Running Locally

**Prerequisites:** Node.js 20+

```bash
npm install
npm start
```

The app will be available at `http://localhost:3000`.

For development with auto-reload:

```bash
npm run dev
```

## Docker

```bash
docker build -t village-chronicles .
docker run -p 3000:3000 village-chronicles
```

> **macOS Apple Silicon:** Add `--platform linux/amd64` if building for a Linux/amd64 target (e.g. deploying to Kubernetes):
> ```bash
> docker build --platform linux/amd64 -t village-chronicles .
> ```

## Kubernetes

Apply the included manifest to deploy to a cluster:

```bash
kubectl apply -f k8s-deployment.yaml
```

This creates:
- A `village` namespace
- A `Deployment` running the app on port 3000
- A `ClusterIP` Service
- An `Ingress` with TLS termination

## Tech Stack

- **Backend:** Node.js + Express (serves static files)
- **Frontend:** Vanilla JS, HTML5 Canvas
- **Container:** Docker (node:20-alpine)
- **Orchestration:** Kubernetes
