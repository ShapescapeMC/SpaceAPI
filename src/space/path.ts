import { Segment, SegmentVertex } from "./segment";
import { Vector3, world } from "@minecraft/server";
import { Vec3 } from "@bedrock-oss/bedrock-boost";

export class WorldPath {
	private readonly segments: Segment[] = [];

	constructor(path: Segment | Segment[]) {
		if (Array.isArray(path)) {
			this.segments = path;
		} else if (path) {
			this.segments.push(path);
		}
	}

	public getSegments(): Segment[] {
		return [...this.segments];
	}

	public addSegment(segment: Segment): void {
		this.segments.push(segment);
	}

	public addPoint(point: Vector3, center: boolean = true): void {
		const lastSegment = this.segments[this.segments.length - 1];
		const newSegment = new Segment(
			lastSegment.getPoint2(),
			center ? Vec3.from(point).toBlockLocation().add(0.5, 0, 0.5) : point,
		);
		this.segments.push(newSegment);
	}

	public getDirectionalVectors(
		options?: VectorDirectionalQueryOptions,
	): VectorDirectional[] {
		const vectors: VectorDirectional[] = [];
		this.consumeDirectionalVectors((vector) => {
			vectors.push(vector);
		}, options);
		return vectors;
	}

	public consumeDirectionalVectors(
		callback: (vector: VectorDirectional) => void,
		options?: VectorDirectionalQueryOptions,
	): void {
		const blockStartIndex = options?.blockStartIndex || 0;
		const blockEndIndex = options?.blockEndIndex || 0;
		const excludeHalfDirections = options?.excludeHalfDirections || false;
		const excludeVerticalDirections =
			options?.excludeVerticalDirections || false;

		// Track processed vectors to detect duplicates
		const processedVectors = new Set<string>();

		for (let i = 0; i < this.segments.length; i++) {
			const segment = this.segments[i];
			const direction = segment.getDirection(SegmentVertex.POINT_1);
			const touchedBlocks = segment.getTouchedBlocks(0, false);
			for (
				let j = blockStartIndex;
				j < touchedBlocks.length - blockEndIndex;
				j++
			) {
				let touchedBlock = touchedBlocks[j];

				// Create a unique key for the vector
				const vectorKey = `${touchedBlock.x.toFixed(
					2,
				)},${touchedBlock.y.toFixed(2)},${touchedBlock.z.toFixed(2)}`;
				// Check if the vector is already processed
				if (processedVectors.has(vectorKey)) {
					continue; // Skip if already processed
				}
				let nextTouchedBlock = touchedBlocks[j + 1];
				if (nextTouchedBlock === undefined && this.segments[i + 1]) {
					nextTouchedBlock = this.segments[i + 1].getPoint1();
				}
				let pathDirection = this.vectorToDirection(
					direction,
					excludeVerticalDirections,
				);
				const blockType = world
					.getDimension("overworld")
					.getBlock(touchedBlock)?.typeId;
				const nextBlockType = world
					.getDimension("overworld")
					.getBlock(nextTouchedBlock ? nextTouchedBlock : touchedBlock)?.typeId;
				if (
					((blockType && blockType.includes("slab")) ||
						(nextBlockType && nextBlockType.includes("slab"))) &&
					!excludeHalfDirections
				) {
					pathDirection = this.directionToHalfDirection(pathDirection);
				}

				processedVectors.add(vectorKey);
				callback({
					vector: touchedBlock,
					direction: pathDirection,
				});
			}
		}
	}

	public clone(): WorldPath {
		// Returns a new WorldPath with the same segments
		return new WorldPath(this.getSegments());
	}

	public concat(other: WorldPath): WorldPath {
		// Returns a new WorldPath by concatenating this and other,
		// inserting a connecting segment if last and first points differ
		const segA = this.getSegments();
		const segB = other.getSegments();
		const combined = [...segA];
		if (segA.length > 0 && segB.length > 0) {
			const lastPt = segA[segA.length - 1].getPoint2();
			const firstPt = segB[0].getPoint1();
			if (
				lastPt.x !== firstPt.x ||
				lastPt.y !== firstPt.y ||
				lastPt.z !== firstPt.z
			) {
				combined.push(new Segment(lastPt, firstPt));
			}
		}
		combined.push(...segB);
		return new WorldPath(combined);
	}

	private vectorToDirection(
		vector: Vector3,
		excludeVerticalDirections: boolean,
	): PathDirection {
		const angleXZ = Math.atan2(vector.z, vector.x);
		const degreesXZ = (angleXZ * (180 / Math.PI) + 360) % 360;

		const magnitude = Math.sqrt(vector.x ** 2 + vector.y ** 2 + vector.z ** 2);
		const normalizedY = vector.y / magnitude;

		let baseDirectionStr: keyof typeof PathDirection;

		// Determine the main cardinal direction as a string
		if (degreesXZ >= 45 && degreesXZ < 135) {
			baseDirectionStr = "SOUTH";
		} else if (degreesXZ >= 135 && degreesXZ < 225) {
			baseDirectionStr = "WEST";
		} else if (degreesXZ >= 225 && degreesXZ < 315) {
			baseDirectionStr = "NORTH";
		} else {
			baseDirectionStr = "EAST";
		}

		if (!excludeVerticalDirections) {
			if (normalizedY > 0.7) {
				return PathDirection[
					`${baseDirectionStr}_UP` as keyof typeof PathDirection
				];
			} else if (normalizedY < -0.7) {
				return PathDirection[
					`${baseDirectionStr}_DOWN` as keyof typeof PathDirection
				];
			}
		}
		return PathDirection[baseDirectionStr];
	}

	private directionToHalfDirection(direction: PathDirection): PathDirection {
		switch (direction) {
			case PathDirection.NORTH:
			case PathDirection.NORTH_UP:
				return PathDirection.NORTH_UP_HALF;
			case PathDirection.SOUTH:
			case PathDirection.SOUTH_UP:
				return PathDirection.SOUTH_UP_HALF;
			case PathDirection.EAST:
			case PathDirection.EAST_UP:
				return PathDirection.EAST_UP_HALF;
			case PathDirection.WEST:
			case PathDirection.WEST_UP:
				return PathDirection.WEST_UP_HALF;
			case PathDirection.NORTH_DOWN:
				return PathDirection.NORTH_DOWN_HALF;
			case PathDirection.SOUTH_DOWN:
				return PathDirection.SOUTH_DOWN_HALF;
			case PathDirection.EAST_DOWN:
				return PathDirection.EAST_DOWN_HALF;
			case PathDirection.WEST_DOWN:
				return PathDirection.WEST_DOWN_HALF;
			default:
				return direction;
		}
	}
}

export enum PathDirection {
	NORTH,
	SOUTH,
	EAST,
	WEST,
	NORTH_UP,
	SOUTH_UP,
	EAST_UP,
	WEST_UP,
	NORTH_DOWN,
	SOUTH_DOWN,
	EAST_DOWN,
	WEST_DOWN,
	NORTH_UP_HALF,
	SOUTH_UP_HALF,
	EAST_UP_HALF,
	WEST_UP_HALF,
	NORTH_DOWN_HALF,
	SOUTH_DOWN_HALF,
	EAST_DOWN_HALF,
	WEST_DOWN_HALF,
}

export interface VectorDirectional {
	vector: Vector3;
	direction: PathDirection;
}

export interface VectorDirectionalQueryOptions {
	excludeHalfDirections?: boolean;
	excludeVerticalDirections?: boolean;
	blockStartIndex?: number;
	blockEndIndex?: number;
}
