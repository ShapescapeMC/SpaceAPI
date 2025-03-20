import { Cuboid } from "./cuboid";

describe("Cuboid", () => {
	// Setup a default cuboid from (0,0,0) to (10,10,10)
	const p1 = { x: 0, y: 0, z: 0 };
	const p2 = { x: 10, y: 10, z: 10 };
	let cuboid: Cuboid;

	beforeEach(() => {
		cuboid = new Cuboid(p1, p2);
	});

	it("should calculate the correct center", () => {
		const center = cuboid.getCenter();
		expect(center).toEqual({ x: 5, y: 5, z: 5 });
		const center3D = cuboid.getCenter3D();
		expect(center3D).toEqual({ x: 5, y: 5, z: 5 });
	});

	it("should calculate the correct volume", () => {
		// Volume: (p2 - p1 + 1)^3 = (10)^3 = 10^3 = 1000
		expect(cuboid.getVolume()).toBe(1000);
	});

	it("should calculate the correct size", () => {
		// Size should be {10, 10, 10} due to adjustment in constructor.
		const size = cuboid.getSize();
		expect(size).toEqual({ x: 10, y: 10, z: 10 });
	});

	it("should correctly check if a 3D point is inside", () => {
		expect(cuboid.contains({ x: 5, y: 5, z: 5 })).toBe(true);
		// On boundary (low end), inside.
		expect(cuboid.contains({ x: 0, y: 0, z: 0 })).toBe(true);
		// Outside when one coordinate is too high.
		expect(cuboid.contains({ x: 11, y: 5, z: 5 })).toBe(false);
		expect(cuboid.contains({ x: 5, y: -1, z: 5 })).toBe(false);
		expect(cuboid.contains({ x: 5, y: 5, z: 11 })).toBe(false);
	});

	it("should correctly check if a 2D point is inside", () => {
		// Using a 2D point (x, y) where y represents the polygon's y (cuboid's z)
		expect(cuboid.contains({ x: 5, y: 5 })).toBe(true);
		expect(cuboid.contains({ x: 11, y: 5 })).toBe(false);
	});

	it("should translate the cuboid correctly", () => {
		const offset = { x: 5, y: 5, z: 5 };
		const translated = cuboid.translate(offset);
		// New center: (5+5, 5+5, 5+5) = (10, 10, 10)
		expect(translated.getCenter()).toEqual({ x: 10, y: 10, z: 10 });
		// Ensure original remains unchanged.
		expect(cuboid.getCenter()).toEqual({ x: 5, y: 5, z: 5 });
	});

	it("should inflate the cuboid correctly", () => {
		const delta = 2;
		const inflated = cuboid.inflate(delta);
		// New p1: (-2, -2, -2) ; new p2: (12, 12, 12) and center remains same.
		expect(inflated.getCenter()).toEqual({ x: 5, y: 5, z: 5 });
		expect(inflated.getSize()).toEqual({ x: 14, y: 14, z: 14 });
	});

	it("should return the correct corners", () => {
		const corners = cuboid.getCorners();
		// Should have 8 corners.
		expect(corners.length).toBe(8);
		// Due to integer adjustment p2 becomes +1 so valid x values are 0 and 10.
		const xs = corners.map((c) => c.x).sort((a, b) => a - b);
		expect(xs[0]).toBe(0);
		expect(xs[xs.length - 1]).toBe(10);
	});

	it("should return the correct face cuboids", () => {
		const faces = cuboid.getFaces();
		// There should be 4 faces (as defined by getFaces).
		expect(faces.length).toBe(4);
		// Each face should have a positive volume.
		faces.forEach((face) => {
			expect(face.getVolume()).toBeGreaterThan(0);
		});
	});

	it("should return 12 edges", () => {
		const edges = cuboid.getEdges();
		expect(edges.length).toBe(12);
		// Further checks can be added if necessary.
	});

	it("should clone the cuboid correctly", () => {
		const clone = cuboid.clone();
		expect(clone).not.toBe(cuboid);
		expect(clone.getCenter()).toEqual(cuboid.getCenter());
		expect(clone.getVolume()).toEqual(cuboid.getVolume());
	});

	it("should parse toString correctly", () => {
		const str = cuboid.toString();
		expect(str).toContain("Cuboid");
		expect(str).toContain(String(cuboid.getPointSWB().x));
	});

	it("should compute chunk areas intersecting the cuboid", () => {
		// Use a cuboid spanning multiple chunks.
		const cub = new Cuboid({ x: 10, y: 0, z: 10 }, { x: 40, y: 10, z: 40 });
		const chunks = cub.getChunkAreas();
		expect(chunks.length).toBeGreaterThan(1);
		chunks.forEach((chunk) => {
			expect(chunk.getSize().x).toBeGreaterThan(0);
		});
	});

	it("should allow consumeChunkAreas to break early", () => {
		const spyCallback = jest.fn().mockReturnValueOnce(false);
		const result = cuboid.consumeChunkAreas(spyCallback);
		expect(result).toBe(false);
		expect(spyCallback).toHaveBeenCalled();
	});
});
