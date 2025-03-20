# SpaceAPI: Geometry & World Tools for Minecraft Bedrock

![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/ShapescapeMC/SpaceAPI/publish.workflow.yml?style=for-the-badge&label=Publish)

## Overview

SpaceAPI is a collection of geometry and world utility classes designed exclusively for Minecraft Bedrock. The library provides tools for managing world locations, creating and manipulating 3D segments, constructing paths, and working with polygons and cuboids for spatial computations.

## Key Features

- **World Location Utilities**: Easily create and manipulate positions, rotations, and dimensions.
- **Segment Operations**: Define 3D segments with methods for distance calculations, midpoints, rotations, and inversion.
- **Polygon & Path Tools**: Generate, translate, and rotate polygons; compute intersections, normals, and circumscribed areas, and derive directional vectors along paths.
- **Cuboid Calculations**: Compute volumes, sizes, edges, and manage chunk-based area methods for 3D regions.

## Installation

Install the package via npm:
```bash
npm install @shapescape/space
```

## Usage

### World Location

Represent and use world positions with ease:
```typescript
import { WorldLocation } from "./src/space/world-location";

const location = new WorldLocation({ x: 0, y: 64, z: 0 });
location.teleport(someEntity);
```

### Segment & Path

Create segments and build paths for spatial navigation:
```typescript
import { Segment } from "./src/space/segment";
import { WorldPath } from "./src/space/path";

const segment = new Segment({ x: 0, y: 64, z: 0 }, { x: 10, y: 64, z: 10 });
const path = new WorldPath(segment);
path.addPoint({ x: 20, y: 64, z: 20 });
```

### Polygon & Cuboid

Work with 2D areas and 3D regions:
```typescript
import { Polygon } from "./src/space/polygon";
import { Cuboid } from "./src/space/cuboid";

const circlePolygon = Polygon.fromCircle({ x: 50, y: 50 }, 20, 32);
const cuboid = new Cuboid({ x: 0, y: 60, z: 0 }, { x: 20, y: 80, z: 20 });
```

## Minecraft Bedrock Dependency

SpaceAPI is built to work only within the Minecraft Bedrock Edition environment. It relies on server APIs and dynamic storage features exclusive to Bedrock.

## License

SpaceAPI is licensed under the [LGPL v3 License](LICENSE).

## Contributing

Contributions are welcome! Please ensure your changes are compatible with Minecraft Bedrock and integrate well with the provided geometric and world utility classes.

Happy building!