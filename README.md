# Village Chronicles

A medieval idle village-building game. Build your settlement, manage resources, defend against threats, and conquer rivals.

## Gameplay

- **Build** — place houses and structures to grow your village
- **Survive** — manage gold income, population, and defences
- **Conquer** — form alliances or wage war on neighbouring villages

### Game Systems

| System | Description |
|--------|-------------|
| Economy | Earn gold over time; spend it on buildings and upgrades |
| Population | Houses increase capacity; villagers generate income |
| Defence | Build walls and train guards to repel raids |
| Combat | Attack neighbouring villages to loot resources |
| Alliances | Form pacts with other villages for mutual protection |
| Catalogue | Unlock new buildings and units as your village grows |

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

To tear down:

```bash
kubectl delete -f k8s-deployment.yaml
```

## Project Structure

```
village_chronicles/
├── public/
│   ├── index.html        # Game UI
│   ├── css/styles.css    # Styles
│   └── js/               # Game modules
│       ├── game.js       # Core game loop
│       ├── economy.js    # Gold & resources
│       ├── combat.js     # Combat system
│       ├── villagers.js  # Villager management
│       ├── map.js        # World map
│       └── ...
├── server.js             # Express server
├── Dockerfile
└── k8s-deployment.yaml
```

## Tech Stack

- **Backend:** Node.js + Express (serves static files)
- **Frontend:** Vanilla JS, HTML5 Canvas
- **Container:** Docker (node:20-alpine)
- **Orchestration:** Kubernetes
