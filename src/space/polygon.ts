import { Vector2, Vector3 } from "@minecraft/server";
import { Vec3 } from "@bedrock-oss/bedrock-boost";
import { Segment } from "./segment";

/**
 * Represents a 2D polygon area.
 * Implements the Area interface using Vector2 vertices.
 */
export class Polygon {
	protected readonly vertices: Vector2[] = [];

	/**
	 * Creates a new Polygon.
	 * @param vertices An array of Vector2 representing the polygon's vertices.
	 * @throws Error if less than 3 vertices are provided.
	 */
	constructor(vertices: Vector2[]) {
		if (vertices.length < 3) {
			throw new Error("A polygon must have at least 3 vertices.");
		}
		this.vertices = vertices;
	}

	/**
	 * Generates a polygon approximating a circle.
	 * @param center The center of the circle.
	 * @param radius The radius of the circle.
	 * @param sides The number of sides of the polygon.
	 * @returns A new Polygon approximating a circle.
	 */
	public static fromCircle(
		center: Vector2,
		radius: number,
		sides: number,
	): Polygon {
		const points: Vector2[] = [];
		const angleIncrement = (2 * Math.PI) / sides;

		for (let i = 0; i < sides; i++) {
			const angle = i * angleIncrement;
			const x = center.x + radius * Math.cos(angle);
			const y = center.y + radius * Math.sin(angle);
			points.push({ x, y });
		}

		return new Polygon(points);
	}

	/**
	 * Checks if a point is inside the polygon.
	 * @param point A Vector2 representing the point.
	 * @returns True if the point is inside the polygon.
	 */
	public contains(point: Vector2): boolean {
		let inside = false;
		for (
			let i = 0, j = this.vertices.length - 1;
			i < this.vertices.length;
			j = i++
		) {
			const xi = this.vertices[i].x,
				yi = this.vertices[i].y;
			const xj = this.vertices[j].x,
				yj = this.vertices[j].y;

			const intersect =
				yi > point.y != yj > point.y &&
				point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
			if (intersect) inside = !inside;
		}
		return inside;
	}

	/**
	 * Checks if a 3D point is inside the polygon (ignores Y coordinate).
	 * @param point A Vector3 representing the point.
	 * @returns True if the point is inside the polygon.
	 */
	public contains3D(point: Vector3): boolean {
		return this.contains({ x: point.x, y: point.z });
	}

	/**
	 * Gets the vertices of the polygon.
	 * @returns An array of Vector2 representing the vertices.
	 */
	public getVertices(): Vector2[] {
		return this.vertices;
	}

	/**
	 * Calculates the center of the polygon.
	 * @returns A Vector2 representing the center.
	 */
	public getCenter(): Vector2 {
		let x = 0,
			y = 0;
		for (const vertex of this.vertices) {
			x += vertex.x;
			y += vertex.y;
		}
		return { x: x / this.vertices.length, y: y / this.vertices.length };
	}

	/**
	 * Gets the 3D center of the polygon (with Y set to 0).
	 * @returns A Vector3 representing the center.
	 */
	public getCenter3D(): Vector3 {
		const center = this.getCenter();
		return { x: center.x, y: 0, z: center.y };
	}

	/**
	 * Calculates the area of the polygon.
	 * @returns The area as a number.
	 */
	public getArea(): number {
		let area = 0;
		const n = this.vertices.length;

		for (let i = 0, j = n - 1; i < n; j = i++) {
			area +=
				(this.vertices[j].x + this.vertices[i].x) *
				(this.vertices[j].y - this.vertices[i].y);
		}

		return Math.abs(area / 2);
	}

	/**
	 * Calculates the perimeter of the polygon.
	 * @returns The perimeter as a number.
	 */
	public getPerimeter(): number {
		let perimeter = 0;
		const n = this.vertices.length;

		for (let i = 0, j = n - 1; i < n; j = i++) {
			const point1 = new Vec3(this.vertices[i].x, 0, this.vertices[i].y);
			const point2 = new Vec3(this.vertices[j].x, 0, this.vertices[j].y);
			perimeter += point1.distance(point2);
		}

		return perimeter;
	}

	/**
	 * Computes the normal vector of the polygon.
	 * @returns A Vec3 representing the normal.
	 */
	public getNormal(): Vec3 {
		const n = this.vertices.length;
		let normal = new Vec3({ x: 0, y: 0, z: 0 });

		for (let i = 0, j = n - 1; i < n; j = i++) {
			const point1 = new Vec3(this.vertices[i].x, 0, this.vertices[i].y);
			const point2 = new Vec3(this.vertices[j].x, 0, this.vertices[j].y);
			normal = normal.add(point1.cross(point2));
		}

		return normal.normalize();
	}

	/**
	 * Calculates the plane equation of the polygon.
	 * @returns An object containing coefficients {a, b, c, d}.
	 */
	public getPlaneEquation(): { a: number; b: number; c: number; d: number } {
		const normal = this.getNormal();
		const center = this.getCenter();
		const center3D = new Vec3(center.x, 0, center.y);

		return {
			a: normal.x,
			b: normal.y,
			c: normal.z,
			d: -normal.dot(center3D),
		};
	}

	/**
	 * Gets the bounding box of the polygon.
	 * @returns An object with min and max Vector3 values.
	 */
	public getBoundingBox(): { min: Vector3; max: Vector3 } {
		let minX = Infinity,
			minZ = Infinity;
		let maxX = -Infinity,
			maxZ = -Infinity;

		for (const vertex of this.vertices) {
			minX = Math.min(minX, vertex.x);
			minZ = Math.min(minZ, vertex.y);
			maxX = Math.max(maxX, vertex.x);
			maxZ = Math.max(maxZ, vertex.y);
		}

		return {
			min: { x: minX, y: 0, z: minZ },
			max: { x: maxX, y: 0, z: maxZ },
		};
	}

	/**
	 * Gets the 3D bounding box of the polygon.
	 * @returns An object with min and max Vector3 values.
	 */
	public getBoundingBox3D(): { min: Vector3; max: Vector3 } {
		const { min, max } = this.getBoundingBox();
		return {
			min: { x: min.x, y: 0, z: min.z },
			max: { x: max.x, y: 0, z: max.z },
		};
	}

	/**
	 * Computes the intersection points of the polygon with a given plane.
	 * @param plane The plane defined by coefficients {a, b, c, d}.
	 * @returns An array of Vector2 intersections.
	 */
	public getIntersection(plane: {
		a: number;
		b: number;
		c: number;
		d: number;
	}): Vector2[] {
		const n = this.vertices.length;
		const intersection: Vector2[] = [];

		for (let i = 0, j = n - 1; i < n; j = i++) {
			const point1 = this.vertices[i];
			const point2 = this.vertices[j];

			const d1 = plane.a * point1.x + plane.b * point1.y + plane.d;
			const d2 = plane.a * point2.x + plane.b * point2.y + plane.d;

			if (d1 * d2 < 0) {
				const t = d1 / (d1 - d2);
				const x = point1.x + t * (point2.x - point1.x);
				const y = point1.y + t * (point2.y - point1.y);
				intersection.push({ x, y });
			}
		}

		return intersection;
	}

	/**
	 * Computes the 3D intersections of the polygon with a given plane.
	 * @param plane The plane defined by coefficients {a, b, c, d}.
	 * @returns An array of Vector3 intersections.
	 */
	public getIntersection3D(plane: {
		a: number;
		b: number;
		c: number;
		d: number;
	}): Vector3[] {
		const intersection = this.getIntersection(plane);
		return intersection.map(({ x, y }) => ({ x, y: 0, z: y }));
	}

	/**
	 * Calculates the distance from the polygon to a point.
	 * @param point A Vector2 representing the point.
	 * @returns The distance as a number.
	 */
	public getDistanceToPoint(point: Vector2): number {
		const plane = this.getPlaneEquation();
		return (
			Math.abs(plane.a * point.x + plane.b * point.y + plane.d) /
			Math.sqrt(plane.a ** 2 + plane.b ** 2)
		);
	}

	/**
	 * Calculates the 3D distance from the polygon to a point (ignoring Y).
	 * @param point A Vector3 representing the point.
	 * @returns The distance as a number.
	 */
	public getDistanceToPoint3D(point: Vector3): number {
		return this.getDistanceToPoint({ x: point.x, y: point.z });
	}

	/**
	 * Computes the intersection of the polygon with a line.
	 * @param start The start point as Vector2.
	 * @param end The end point as Vector2.
	 * @returns An array of Vector2 intersection points.
	 */
	public getIntersectionWithLine(start: Vector2, end: Vector2): Vector2[] {
		const n = this.vertices.length;
		const intersection: Vector2[] = [];

		for (let i = 0, j = n - 1; i < n; j = i++) {
			const point1 = this.vertices[i];
			const point2 = this.vertices[j];

			const d1 =
				(start.x - point1.x) * (point2.y - point1.y) -
				(start.y - point1.y) * (point2.x - point1.x);
			const d2 =
				(end.x - point1.x) * (point2.y - point1.y) -
				(end.y - point1.y) * (point2.x - point1.x);

			if (d1 * d2 < 0) {
				const t = d1 / (d1 - d2);
				const x = start.x + t * (end.x - start.x);
				const y = start.y + t * (end.y - start.y);
				intersection.push({ x, y });
			}
		}

		return intersection;
	}

	/**
	 * Computes the 3D intersection of the polygon with a line.
	 * @param start The start point as Vector3.
	 * @param end The end point as Vector3.
	 * @returns An array of Vector3 intersection points.
	 */
	public getIntersectionWithLine3D(start: Vector3, end: Vector3): Vector3[] {
		const intersection = this.getIntersectionWithLine(
			{ x: start.x, y: start.z },
			{ x: end.x, y: end.z },
		);
		return intersection.map(({ x, y }) => ({ x, y: 0, z: y }));
	}

	/**
	 * Determines whether this polygon intersects with another polygon.
	 * @param polygon Another Polygon instance.
	 * @returns True if they intersect.
	 */
	public intersects(polygon: Polygon): boolean {
		for (const vertex of polygon.getVertices()) {
			if (this.contains3D({ x: vertex.x, y: 0, z: vertex.y })) {
				return true;
			}
		}
		for (const vertex of this.getVertices()) {
			if (polygon.contains3D({ x: vertex.x, y: 0, z: vertex.y })) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Finds the closest point on the polygon to a given 3D point.
	 * @param point3D A Vector3 representing the reference point.
	 * @returns A Vector2 representing the closest point on the polygon.
	 */
	public closestPointOnPolygon(point3D: Vector3): Vector2 {
		const point2D: Vector2 = { x: point3D.x, y: point3D.z };
		let closestPoint: Vector3 | null = null;
		let minDistance = Infinity;

		for (let i = 0; i < this.vertices.length; i++) {
			const v1 = this.vertices[i];
			const v2 = this.vertices[(i + 1) % this.vertices.length]; // Considera il poligono come chiuso

			const segment = new Segment(
				{ x: v1.x, y: 0, z: v1.y },
				{ x: v2.x, y: 0, z: v2.y },
			);
			const candidatePoint = segment.getNearestPoint({
				x: point3D.x,
				y: 0,
				z: point3D.z,
			});
			const distance = Vec3.from(candidatePoint).distance({
				x: point2D.x,
				y: 0,
				z: point2D.y,
			});

			if (distance < minDistance) {
				minDistance = distance;
				closestPoint = candidatePoint;
			}
			if (distance < 0.05) {
				break;
			}
		}

		return { x: closestPoint!.x, y: closestPoint!.z }!;
	}

	/**
	 * Gets all chunk areas intersecting this polygon.
	 * @returns An array of Cuboid chunk areas.
	 */
	getChunkAreas(): Polygon[] {
		const chunks: Polygon[] = [];

		this.consumeChunkAreas((chunkArea) => {
			chunks.push(chunkArea);
			return true;
		});

		return chunks;
	}

	/**
	 * Iterates over the chunk areas that intersect with this polygon.
	 * Works even when the polygon is smaller than a chunk.
	 * The created chunk area uses all 4 vertices of the chunk.
	 * @param callback A function processing each chunk area; return false to abort iteration.
	 * @returns True if the iteration completed without interruption, otherwise false.
	 */
	consumeChunkAreas(callback: (chunkArea: Polygon) => boolean): boolean {
		const visited = new Set<string>();

		// Compute the starting chunk based on the first vertex of the polygon
		const startVertex = this.vertices[0];
		const startChunkX = Math.floor(startVertex.x / 16);
		const startChunkZ = Math.floor(startVertex.y / 16);

		// Initialize the queue with the starting chunk and set up adjacent directions
		const queue: [number, number][] = [[startChunkX, startChunkZ]];
		const directions: [number, number][] = [
			[0, 1],
			[0, -1],
			[1, 0],
			[-1, 0],
		];

		// Utility to create a chunk polygon with all four vertices in proper order.
		const getChunkPolygon = (chunkX: number, chunkZ: number): Polygon => {
			return new Polygon([
				{ x: chunkX * 16, y: chunkZ * 16 }, // top-left
				{ x: chunkX * 16 + 15, y: chunkZ * 16 }, // top-right
				{ x: chunkX * 16 + 15, y: chunkZ * 16 + 15 }, // bottom-right
				{ x: chunkX * 16, y: chunkZ * 16 + 15 }, // bottom-left
			]);
		};

		while (queue.length > 0) {
			const [chunkX, chunkZ] = queue.shift()!;
			const chunkKey = `${chunkX},${chunkZ}`;
			if (visited.has(chunkKey)) continue;
			visited.add(chunkKey);

			const chunkPoly = getChunkPolygon(chunkX, chunkZ);

			// Check if the chunk polygon intersects with the current polygon
			if (this.intersects(chunkPoly)) {
				if (!callback(chunkPoly)) {
					return false;
				}

				// Add adjacent chunks to the queue for further exploration
				for (const [dx, dz] of directions) {
					queue.push([chunkX + dx, chunkZ + dz]);
				}
			}
		}

		return true;
	}

	/**
	 * Returns a new Polygon translated by the given offset.
	 * @param offset A Vector2 representing the offset.
	 * @returns A new Polygon instance.
	 */
	public translate(offset: Vector2): Polygon {
		const newVertices = this.vertices.map((v) => ({
			x: v.x + offset.x,
			y: v.y + offset.y,
		}));
		return new Polygon(newVertices);
	}

	/**
	 * Returns a new Polygon rotated by the given angle.
	 * @param angle Rotation in radians.
	 * @param pivot Optional pivot point; defaults to the center.
	 * @returns A new rotated Polygon instance.
	 */
	public rotate(angle: number, pivot?: Vector2): Polygon {
		pivot = pivot || this.getCenter();
		const cos = Math.cos(angle),
			sin = Math.sin(angle);
		const newVertices = this.vertices.map((v) => ({
			x: pivot!.x + (v.x - pivot!.x) * cos - (v.y - pivot!.y) * sin,
			y: pivot!.y + (v.x - pivot!.x) * sin + (v.y - pivot!.y) * cos,
		}));
		return new Polygon(newVertices);
	}

	/**
	 * Returns a clone of the polygon.
	 * @returns A new Polygon instance with the same vertices.
	 */
	public clone(): Polygon {
		return new Polygon([...this.vertices]);
	}
}
