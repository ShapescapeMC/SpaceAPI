import { Vector2, Vector3 } from "@minecraft/server";
import { Segment } from "./segment";
import { Polygon } from "./polygon";

/**
 * Represents a Cuboid area in 3D space.
 * Extends Polygon to use a 2D base and adds vertical (Y) data.
 */
export class Cuboid extends Polygon {
	readonly point1: Vector3;
	readonly point2: Vector3;

	/**
	 * Creates a new Cuboid.
	 * @param point1 One corner of the cuboid.
	 * @param point2 The opposite corner of the cuboid.
	 * @param includeFullBlocks If true, the second point will be included in the cuboid.
	 */
	constructor(
		point1: Vector3,
		point2: Vector3,
		includeFullBlocks: boolean = false,
	) {
		const p1 = {
			x: Math.min(point1.x, point2.x),
			y: Math.min(point1.y, point2.y),
			z: Math.min(point1.z, point2.z),
		};
		const p2 = {
			x: Math.max(point1.x, point2.x),
			y: Math.max(point1.y, point2.y),
			z: Math.max(point1.z, point2.z),
		};

		if (includeFullBlocks) {
			if (point2.x % 1 === 0) p2.x++;
			if (point2.y % 1 === 0) p2.y++;
			if (point2.z % 1 === 0) p2.z++;
		}

		const vertices: Vector2[] = [
			{ x: p1.x, y: p1.z },
			{ x: p2.x, y: p1.z },
			{ x: p2.x, y: p2.z },
			{ x: p1.x, y: p2.z },
		];
		super(vertices);
		this.point1 = p1;
		this.point2 = p2;
	}

	/**
	 * Checks if this Cuboid contains the given point.
	 * @param vector A Vector3 (or 2D with y) representing a point.
	 * @returns True if the point is inside the cuboid.
	 */
	contains(vector: Vector3 | { x: number; y: number }): boolean {
		if ((vector as Vector3).z !== undefined) {
			const vec3 = vector as Vector3;
			if (vec3.y < this.point1.y || vec3.y > this.point2.y) return false;
			return super.contains({ x: vec3.x, y: vec3.z });
		}
		return super.contains(vector as Vector2);
	}

	/**
	 * Calculates the center of the cuboid.
	 * @returns A Vector3 representing the center.
	 */
	getCenter(): Vector3 {
		return {
			x: (this.point1.x + this.point2.x) / 2,
			y: (this.point1.y + this.point2.y) / 2,
			z: (this.point1.z + this.point2.z) / 2,
		};
	}

	/**
	 * Gets the 3D center of the cuboid.
	 * @returns The center as a Vector3.
	 */
	getCenter3D(): Vector3 {
		return this.getCenter();
	}

	/**
	 * Calculates the volume of the cuboid.
	 * @returns The volume as a number.
	 */
	getVolume(): number {
		return (
			Math.abs(this.point2.x - this.point1.x) *
			Math.abs(this.point2.y - this.point1.y) *
			Math.abs(this.point2.z - this.point1.z)
		);
	}

	/**
	 * Gets the size of the cuboid along each axis.
	 * @returns A Vector3 representing the size.
	 */
	getSize(): Vector3 {
		return {
			x: Math.abs(this.point2.x - this.point1.x),
			y: Math.abs(this.point2.y - this.point1.y),
			z: Math.abs(this.point2.z - this.point1.z),
		};
	}

	/**
	 * Returns the South-West-Bottom corner of the cuboid.
	 * @returns A Vector3 representing the corner.
	 */
	getPointSWB(): Vector3 {
		return this.point1;
	}

	/**
	 * Returns the North-East-Top corner of the cuboid.
	 * @returns A Vector3 representing the corner.
	 */
	getPointNET(): Vector3 {
		return this.point2;
	}

	/**
	 * Returns the South-East-Bottom corner of the cuboid.
	 * @returns A Vector3 representing the corner.
	 */
	getPointSEB(): Vector3 {
		return {
			x: this.point2.x,
			y: this.point1.y,
			z: this.point1.z,
		};
	}

	/**
	 * Returns the North-West-Top corner of the cuboid.
	 * @returns A Vector3 representing the corner.
	 */
	getPointNWT(): Vector3 {
		return {
			x: this.point1.x,
			y: this.point2.y,
			z: this.point2.z,
		};
	}

	/**
	 * Returns the South-East-Top corner of the cuboid.
	 * @returns A Vector3 representing the corner.
	 */
	getPointSET(): Vector3 {
		return {
			x: this.point2.x,
			y: this.point2.y,
			z: this.point1.z,
		};
	}

	/**
	 * Returns the North-West-Bottom corner of the cuboid.
	 * @returns A Vector3 representing the corner.
	 */
	getPointNWB(): Vector3 {
		return {
			x: this.point1.x,
			y: this.point1.y,
			z: this.point2.z,
		};
	}

	/**
	 * Returns the South-West-Top corner of the cuboid.
	 * @returns A Vector3 representing the corner.
	 */
	getPointSWT(): Vector3 {
		return {
			x: this.point1.x,
			y: this.point2.y,
			z: this.point1.z,
		};
	}

	/**
	 * Returns the North-East-Bottom corner of the cuboid.
	 * @returns A Vector3 representing the corner.
	 */
	getPointNEB(): Vector3 {
		return {
			x: this.point2.x,
			y: this.point1.y,
			z: this.point2.z,
		};
	}

	/**
	 * Gets the array of corner points of the cuboid.
	 * @returns An array of Vector3 representing the corners.
	 */
	getCorners(): Vector3[] {
		return [
			this.getPointSWB(),
			this.getPointNET(),
			this.getPointSEB(),
			this.getPointNWT(),
			this.getPointSET(),
			this.getPointNWB(),
			this.getPointSWT(),
			this.getPointNEB(),
		];
	}

	/**
	 * Gets the underlying 2D corners of the cuboid.
	 * @returns An array of Vector2.
	 */
	getCorners2D(): Vector2[] {
		return [
			{ x: this.point1.x, y: this.point1.z },
			{ x: this.point2.x, y: this.point1.z },
			{ x: this.point2.x, y: this.point2.z },
			{ x: this.point1.x, y: this.point2.z },
		];
	}

	/**
	 * Returns an array of cuboid faces.
	 * @returns An array of Cuboid instances.
	 */
	getFaces(): Cuboid[] {
		return [
			new Cuboid(this.getPointSWB(), this.getPointNET()),
			new Cuboid(this.getPointSEB(), this.getPointNWT()),
			new Cuboid(this.getPointSET(), this.getPointNWB()),
			new Cuboid(this.getPointSWT(), this.getPointNEB()),
		];
	}

	/**
	 * Gets the edges of the cuboid.
	 * @returns An array of Segment instances representing the edges.
	 */
	getEdges(): Segment[] {
		return [
			new Segment(this.getPointSWB(), this.getPointSEB()),
			new Segment(this.getPointSWB(), this.getPointSWT()),
			new Segment(this.getPointSWB(), this.getPointNWB()),
			new Segment(this.getPointNET(), this.getPointSET()),
			new Segment(this.getPointNET(), this.getPointNWT()),
			new Segment(this.getPointNET(), this.getPointNEB()),
			new Segment(this.getPointSEB(), this.getPointSET()),
			new Segment(this.getPointSEB(), this.getPointSWT()),
			new Segment(this.getPointNWT(), this.getPointNWB()),
			new Segment(this.getPointSET(), this.getPointSWT()),
			new Segment(this.getPointNWB(), this.getPointNEB()),
			new Segment(this.getPointSWT(), this.getPointNEB()),
		];
	}

	/**
	 * Calculates the minimal distance from the cuboid to a point.
	 * Returns a negative value if the point is inside.
	 * @param point The point to check.
	 * @returns The distance as a number.
	 */
	distanceToPoint(point: Vector3): number {
		let distance = Number.MAX_VALUE;
		for (const edge of this.getEdges()) {
			distance = Math.min(distance, edge.distanceToPoint(point));
		}
		if (this.contains(point)) {
			distance *= -1;
		}

		return distance;
	}

	/**
	 * Gets all chunk areas intersecting this cuboid.
	 * @returns An array of Cuboid instances.
	 */
	getChunkAreas(): Cuboid[] {
		const chunksWithVertices: Cuboid[] = [];

		this.consumeChunkAreas((chunkArea) => {
			chunksWithVertices.push(chunkArea);
			return true;
		});

		return chunksWithVertices;
	}

	/**
	 * Iterates over chunk areas intersecting this cuboid.
	 * @param callback Function to process each chunk area.
	 * @returns True if iteration completes.
	 */
	consumeChunkAreas(callback: (chunkArea: Cuboid) => boolean): boolean {
		const minX = this.point1.x;
		const maxX = this.point2.x;
		const minZ = this.point1.z;
		const maxZ = this.point2.z;

		const minChunkX = Math.floor(minX / 16);
		const maxChunkX = Math.floor(maxX / 16);
		const minChunkZ = Math.floor(minZ / 16);
		const maxChunkZ = Math.floor(maxZ / 16);

		for (let chunkX = minChunkX; chunkX <= maxChunkX; chunkX++) {
			for (let chunkZ = minChunkZ; chunkZ <= maxChunkZ; chunkZ++) {
				const vertices = [
					{ x: chunkX * 16, z: chunkZ * 16 },
					{ x: chunkX * 16 + 15, z: chunkZ * 16 },
					{ x: chunkX * 16, z: chunkZ * 16 + 15 },
					{ x: chunkX * 16 + 15, z: chunkZ * 16 + 15 },
				];

				const cuboid = new Cuboid(
					{ x: vertices[0].x, y: this.point1.y, z: vertices[0].z },
					{ x: vertices[3].x, y: this.point2.y, z: vertices[3].z },
				);
				const result = callback(cuboid);
				if (!result) {
					return false;
				}
			}
		}
		return true;
	}

	/**
	 * Returns a string representation of this cuboid.
	 * @returns A string describing the cuboid.
	 */
	toString(): string {
		return `Cuboid({x:${this.point1.x}, y:${this.point1.y}, z:${this.point1.z}}, {x:${this.point2.x}, y:${this.point2.y}, z:${this.point2.z}})`;
	}

	/**
	 * Translates the cuboid by the given offset.
	 * @param offset A Vector3 representing the translation.
	 * @returns A new Cuboid translated by the offset.
	 */
	public translate(offset: Vector3): Cuboid {
		const newPoint1 = {
			x: this.point1.x + offset.x,
			y: this.point1.y + offset.y,
			z: this.point1.z + offset.z,
		};
		const newPoint2 = {
			x: this.point2.x + offset.x,
			y: this.point2.y + offset.y,
			z: this.point2.z + offset.z,
		};
		return new Cuboid(newPoint1, newPoint2);
	}

	/**
	 * Inflate the cuboid by the given delta in all directions.
	 * @param delta The expansion value.
	 * @returns A new, expanded Cuboid.
	 */
	public inflate(delta: number): Cuboid {
		const newPoint1 = {
			x: this.point1.x - delta,
			y: this.point1.y - delta,
			z: this.point1.z - delta,
		};
		const newPoint2 = {
			x: this.point2.x + delta,
			y: this.point2.y + delta,
			z: this.point2.z + delta,
		};
		return new Cuboid(newPoint1, newPoint2);
	}

	/**
	 * Creates a clone of this cuboid.
	 * @returns A new Cuboid with the same corners.
	 */
	public clone(): Cuboid {
		return new Cuboid(this.point1, this.point2);
	}

	/**
	 * Divides the cuboid into a specified number of equal-sized smaller cuboids along each axis.
	 * @param divisionsX Number of divisions along the X axis (must be ≥ 1)
	 * @param divisionsY Number of divisions along the Y axis (must be ≥ 1)
	 * @param divisionsZ Number of divisions along the Z axis (must be ≥ 1)
	 * @returns An array of smaller Cuboids that together make up the original Cuboid
	 * @throws Error if any division parameter is less than 1
	 */
	public divide(
		divisionsX: number = 1,
		divisionsY: number = 1,
		divisionsZ: number = 1,
	): Cuboid[] {
		// Validate input parameters
		if (divisionsX < 1 || divisionsY < 1 || divisionsZ < 1) {
			throw new Error("Division parameters must be at least 1");
		}

		// If all divisions are 1, return a copy of this cuboid
		if (divisionsX === 1 && divisionsY === 1 && divisionsZ === 1) {
			return [this.clone()];
		}

		const result: Cuboid[] = [];

		// Calculate size of each division
		const size = this.getSize();
		const divSizeX = size.x / divisionsX;
		const divSizeY = size.y / divisionsY;
		const divSizeZ = size.z / divisionsZ;

		// Generate all smaller cuboids
		for (let x = 0; x < divisionsX; x++) {
			for (let y = 0; y < divisionsY; y++) {
				for (let z = 0; z < divisionsZ; z++) {
					const p1: Vector3 = {
						x: this.point1.x + x * divSizeX,
						y: this.point1.y + y * divSizeY,
						z: this.point1.z + z * divSizeZ,
					};

					const p2: Vector3 = {
						x: this.point1.x + (x + 1) * divSizeX,
						y: this.point1.y + (y + 1) * divSizeY,
						z: this.point1.z + (z + 1) * divSizeZ,
					};

					result.push(new Cuboid(p1, p2));
				}
			}
		}

		return result;
	}
}
