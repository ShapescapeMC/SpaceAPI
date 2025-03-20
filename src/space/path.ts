import { Segment, SegmentVertex } from "./segment";
import { Vector3 } from "@minecraft/server";
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

	public addPoint(point: Vector3) {
		const lastSegment = this.segments[this.segments.length - 1];
		const newSegment = new Segment(
			lastSegment.getPoint2(),
			Vec3.from(point).toBlockLocation().add(0.5, 0, 0.5),
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

		for (let i = 0; i < this.segments.length; i++) {
			const segment = this.segments[i];
			const direction = segment.getDirection(SegmentVertex.POINT_1);
			const touchedBlocks = segment.getTouchedBlocks();
			for (
				let j = blockStartIndex;
				j < touchedBlocks.length - 1 - blockEndIndex;
				j++
			) {
				let touchedBlock = touchedBlocks[j];
				const nextTouchedBlock = touchedBlocks[j + 1];
				const distance = Vec3.from(touchedBlock).distance(nextTouchedBlock);
				if (distance < 1) continue;
				let pathDirection = this.vectorToDirection(
					direction,
					excludeVerticalDirections,
				);
				const relativeHeight =
					nextTouchedBlock.y - Math.floor(nextTouchedBlock.y);
				if (
					relativeHeight > 0.4 &&
					relativeHeight < 0.6 &&
					!excludeHalfDirections
				) {
					pathDirection = this.directionToHalfDirection(pathDirection);
				}
				touchedBlock = Vec3.from(touchedBlock).add(0.5, 0, 0.5);
				callback({
					vector: touchedBlock,
					direction: pathDirection,
				});
			}
		}
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
			case PathDirection.NORTH_UP:
				return PathDirection.NORTH_UP_HALF;
			case PathDirection.SOUTH_UP:
				return PathDirection.SOUTH_UP_HALF;
			case PathDirection.EAST_UP:
				return PathDirection.EAST_UP_HALF;
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
