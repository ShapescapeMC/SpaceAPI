import { WorldPath, PathDirection, VectorDirectional } from "./path";
import { Segment, SegmentVertex } from "./segment";
import { Vec3 } from "@bedrock-oss/bedrock-boost";

describe("WorldPath", () => {
	it("should initialize with a single segment", () => {
		const seg = new Segment({ x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 });
		const path = new WorldPath(seg);
		expect(path.getSegments().length).toBe(1);
	});

	it("should initialize with an array of segments", () => {
		const seg1 = new Segment({ x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 });
		const seg2 = new Segment({ x: 1, y: 0, z: 0 }, { x: 2, y: 0, z: 0 });
		const path = new WorldPath([seg1, seg2]);
		expect(path.getSegments().length).toBe(2);
	});

	it("should add segments correctly", () => {
		const seg = new Segment({ x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 });
		const path = new WorldPath(seg);
		const segNew = new Segment({ x: 1, y: 0, z: 0 }, { x: 2, y: 0, z: 0 });
		path.addSegment(segNew);
		expect(path.getSegments().length).toBe(2);
	});

	it("should add a point correctly by creating a new segment", () => {
		const seg = new Segment({ x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 });
		const path = new WorldPath(seg);
		const initialLength = path.getSegments().length;
		const newPoint = { x: 2, y: 0, z: 0 };
		path.addPoint(newPoint);
		expect(path.getSegments().length).toBe(initialLength + 1);
		const lastSegment = path.getSegments()[path.getSegments().length - 1];
		const expectedPoint = Vec3.from(newPoint)
			.toBlockLocation()
			.add(0.5, 0, 0.5);
		expect(lastSegment.getPoint2()).toEqual(expectedPoint);
	});

	it("should retrieve directional vectors through getDirectionalVectors", () => {
		// Create a segment and override its methods for controlled testing
		const seg = new Segment({ x: 0, y: 0, z: 0 }, { x: 2, y: 0, z: 0 });
		seg.getTouchedBlocks = jest.fn(() => [
			{ x: 0, y: 0, z: 0 },
			{ x: 1, y: 0, z: 0 },
			{ x: 2, y: 0, z: 0 },
		]);
		seg.getDirection = jest.fn(() => Vec3.from({ x: 1, y: 0, z: 0 }));
		const path = new WorldPath(seg);
		const vectors = path.getDirectionalVectors({
			excludeVerticalDirections: true,
			blockStartIndex: 0,
			blockEndIndex: 0,
		});
		// Callback calls = (touchedBlocks.length - 1) = 2
		expect(vectors.length).toBe(2);
		// With given direction {x:1,y:0,z:0}, base direction expected is EAST.
		expect(vectors[0].direction).toBe(PathDirection.EAST);
	});

	it("should allow consumeDirectionalVectors to be used with a custom callback", () => {
		const seg = new Segment({ x: 5, y: 0, z: 5 }, { x: 7, y: 0, z: 5 });
		seg.getTouchedBlocks = jest.fn(() => [
			{ x: 5, y: 0, z: 5 },
			{ x: 6, y: 0, z: 5 },
			{ x: 7, y: 0, z: 5 },
		]);
		seg.getDirection = jest.fn(() => Vec3.from({ x: 1, y: 0, z: 0 }));
		const path = new WorldPath(seg);
		const callback = jest.fn();
		path.consumeDirectionalVectors(callback, {
			blockStartIndex: 0,
			blockEndIndex: 0,
		});
		expect(callback).toHaveBeenCalledTimes(2);
	});

	it("should respect blockStartIndex and blockEndIndex options", () => {
		const seg = new Segment({ x: 10, y: 0, z: 10 }, { x: 14, y: 0, z: 10 });
		seg.getTouchedBlocks = jest.fn(() => [
			{ x: 10, y: 0, z: 10 },
			{ x: 11, y: 0, z: 10 },
			{ x: 12, y: 0, z: 10 },
			{ x: 13, y: 0, z: 10 },
			{ x: 14, y: 0, z: 10 },
		]);
		seg.getDirection = jest.fn(() => Vec3.from({ x: 1, y: 0, z: 0 }));
		const path = new WorldPath(seg);
		const callback = jest.fn();
		// With blockStartIndex = 1 and blockEndIndex = 1, expect (5 - 1 - 1) = 3 - 1 = 2 iterations.
		path.consumeDirectionalVectors(callback, {
			blockStartIndex: 1,
			blockEndIndex: 1,
		});
		expect(callback).toHaveBeenCalledTimes(2);
	});

	it("should adjust half directions based on relative height", () => {
		// Create segment with touchedBlocks triggering half-direction conversion
		const seg = new Segment({ x: 0, y: 0, z: 0 }, { x: 1, y: 0.5, z: 0 });
		// Override getTouchedBlocks for controlled block positions using Vec3 instances
		seg.getTouchedBlocks = jest.fn(() => [
			Vec3.from({ x: 0, y: 0, z: 0 }),
			Vec3.from({ x: 1, y: 0.5, z: 0 }),
		]);
		// Override getDirection to include vertical component
		seg.getDirection = jest.fn(() => Vec3.from({ x: 1, y: 1, z: 0 }));
		const vectors: VectorDirectional[] =
			seg.getTouchedBlocks().length > 1
				? new WorldPath(seg).getDirectionalVectors({
						excludeHalfDirections: false,
				  })
				: [];
		// For direction {x:1,y:1,z:0}, the computed base is EAST_UP and with relative height 0.5, should be converted.
		expect(vectors[0].direction).toBe(PathDirection.EAST_UP_HALF);
	});
});
