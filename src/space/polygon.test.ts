import { Vector2 } from "@minecraft/server";
import { Polygon } from "./polygon";

describe("Polygon", () => {
	it("should throw an error when created with less than 3 vertices", () => {
		expect(
			() =>
				new Polygon([
					{ x: 0, y: 0 },
					{ x: 1, y: 1 },
				]),
		).toThrow("A polygon must have at least 3 vertices.");
	});

	it("should create a circle polygon with the correct number of sides", () => {
		const center: Vector2 = { x: 0, y: 0 };
		const radius = 10;
		const sides = 36;
		const polygon = Polygon.fromCircle(center, radius, sides);
		expect(polygon.getVertices().length).toBe(sides);
	});

	it("should correctly check if a point is inside the polygon", () => {
		const triangle = new Polygon([
			{ x: 0, y: 0 },
			{ x: 5, y: 0 },
			{ x: 2.5, y: 5 },
		]);
		expect(triangle.contains({ x: 2.5, y: 2 })).toBe(true);
		expect(triangle.contains({ x: 5, y: 5 })).toBe(false);
	});

	it("should correctly compute the area of a triangle", () => {
		// triangle with base 4 and height 3 -> area = 6
		const triangle = new Polygon([
			{ x: 0, y: 0 },
			{ x: 4, y: 0 },
			{ x: 0, y: 3 },
		]);
		expect(triangle.getArea()).toBeCloseTo(6);
	});

	it("should correctly compute the perimeter of a triangle", () => {
		// triangle sides: 3, 4, 5 -> perimeter = 12
		const triangle = new Polygon([
			{ x: 0, y: 0 },
			{ x: 3, y: 0 },
			{ x: 0, y: 4 },
		]);
		expect(triangle.getPerimeter()).toBeCloseTo(12);
	});

	it("should translate the polygon", () => {
		const triangle = new Polygon([
			{ x: 0, y: 0 },
			{ x: 1, y: 0 },
			{ x: 0, y: 1 },
		]);
		const translated = triangle.translate({ x: 2, y: 3 });
		expect(translated.getVertices()).toEqual([
			{ x: 2, y: 3 },
			{ x: 3, y: 3 },
			{ x: 2, y: 4 },
		]);
	});

	it("should rotate the polygon", () => {
		const square = new Polygon([
			{ x: 1, y: 1 },
			{ x: 2, y: 1 },
			{ x: 2, y: 2 },
			{ x: 1, y: 2 },
		]);
		// rotate 90 degrees (Math.PI/2) about its center (1.5, 1.5)
		const rotated = square.rotate(Math.PI / 2);
		const vertices = rotated.getVertices();
		// Since rotation may change the order, check that each vertex is roughly the same distance from the center
		vertices.forEach((v) => {
			const dx = v.x - 1.5;
			const dy = v.y - 1.5;
			const distance = Math.sqrt(dx * dx + dy * dy);
			expect(distance).toBeCloseTo(0.7071, 2);
		});
	});

	it("should clone the polygon", () => {
		const original = new Polygon([
			{ x: 0, y: 0 },
			{ x: 1, y: 0 },
			{ x: 0, y: 1 },
		]);
		const clone = original.clone();
		expect(clone.getVertices()).toEqual(original.getVertices());
		expect(clone).not.toBe(original);
	});

	it("should compute the center correctly", () => {
		const triangle = new Polygon([
			{ x: 0, y: 0 },
			{ x: 4, y: 0 },
			{ x: 0, y: 3 },
		]);
		const center = triangle.getCenter();
		expect(center.x).toBeCloseTo((0 + 4 + 0) / 3);
		expect(center.y).toBeCloseTo((0 + 0 + 3) / 3);
	});

	it("should compute the 3D center correctly", () => {
		const triangle = new Polygon([
			{ x: 1, y: 2 },
			{ x: 5, y: 2 },
			{ x: 3, y: 8 },
		]);
		const center3D = triangle.getCenter3D();
		const center = triangle.getCenter();
		expect(center3D.x).toBeCloseTo(center.x);
		expect(center3D.z).toBeCloseTo(center.y);
		expect(center3D.y).toBe(0);
	});

	it("should handle contains3D properly", () => {
		const square = new Polygon([
			{ x: 0, y: 0 },
			{ x: 4, y: 0 },
			{ x: 4, y: 4 },
			{ x: 0, y: 4 },
		]);
		expect(square.contains3D({ x: 2, y: 100, z: 2 })).toBe(true);
		expect(square.contains3D({ x: 5, y: 0, z: 5 })).toBe(false);
	});

	it("should return a normalized normal vector", () => {
		const triangle = new Polygon([
			{ x: 0, y: 0 },
			{ x: 4, y: 0 },
			{ x: 0, y: 3 },
		]);
		const normal = triangle.getNormal();
		const magnitude = Math.sqrt(normal.x ** 2 + normal.y ** 2 + normal.z ** 2);
		expect(magnitude).toBeCloseTo(1);
	});

	it("should compute the plane equation with the center on the plane", () => {
		const triangle = new Polygon([
			{ x: 0, y: 0 },
			{ x: 4, y: 0 },
			{ x: 0, y: 3 },
		]);
		const plane = triangle.getPlaneEquation();
		const center = triangle.getCenter();
		const center3D = { x: center.x, y: 0, z: center.y };
		// Evaluating the plane equation: a*x + b*y + c*z + d should be nearly 0
		const value =
			plane.a * center3D.x +
			plane.b * center3D.y +
			plane.c * center3D.z +
			plane.d;
		expect(value).toBeCloseTo(0);
	});

	it("should compute the bounding box correctly", () => {
		const polygon = new Polygon([
			{ x: 2, y: 3 },
			{ x: 5, y: 1 },
			{ x: 4, y: 6 },
		]);
		const { min, max } = polygon.getBoundingBox();
		expect(min.x).toBe(2);
		expect(min.z).toBe(1);
		expect(max.x).toBe(5);
		expect(max.z).toBe(6);
	});

	it("should compute the 3D bounding box correctly", () => {
		const polygon = new Polygon([
			{ x: -1, y: -2 },
			{ x: 3, y: 4 },
			{ x: 0, y: 0 },
		]);
		const { min, max } = polygon.getBoundingBox3D();
		expect(min.x).toBe(-1);
		expect(min.z).toBe(-2);
		expect(min.y).toBe(0);
		expect(max.x).toBe(3);
		expect(max.z).toBe(4);
		expect(max.y).toBe(0);
	});

	it("should compute intersection with a 2D line correctly", () => {
		const polygon = new Polygon([
			{ x: 0, y: 0 },
			{ x: 4, y: 0 },
			{ x: 4, y: 4 },
			{ x: 0, y: 4 },
		]);
		const intersections = polygon.getIntersectionWithLine(
			{ x: -1, y: 2 },
			{ x: 5, y: 2 },
		);
		// The horizontal line y = 2 should intersect the square in two points.
		expect(intersections.length).toBe(2);
		intersections.forEach((pt) => {
			expect(pt.y).toBeCloseTo(2);
		});
	});

	it("should compute intersection with a 3D line correctly", () => {
		const polygon = new Polygon([
			{ x: 1, y: 1 },
			{ x: 5, y: 1 },
			{ x: 5, y: 5 },
			{ x: 1, y: 5 },
		]);
		const intersections = polygon.getIntersectionWithLine3D(
			{ x: 0, y: 0, z: 3 },
			{ x: 6, y: 0, z: 3 },
		);
		expect(intersections.length).toBe(2);
		intersections.forEach((pt) => {
			expect(pt.z).toBeCloseTo(3);
			expect(pt.y).toBe(0);
		});
	});

	it("should detect intersecting polygons", () => {
		const poly1 = new Polygon([
			{ x: 0, y: 0 },
			{ x: 4, y: 0 },
			{ x: 4, y: 4 },
			{ x: 0, y: 4 },
		]);
		const poly2 = new Polygon([
			{ x: 2, y: 2 },
			{ x: 6, y: 2 },
			{ x: 6, y: 6 },
			{ x: 2, y: 6 },
		]);
		expect(poly1.intersects(poly2)).toBe(true);
	});

	it("should detect non-intersecting polygons", () => {
		const poly1 = new Polygon([
			{ x: 0, y: 0 },
			{ x: 2, y: 0 },
			{ x: 2, y: 2 },
			{ x: 0, y: 2 },
		]);
		const poly2 = new Polygon([
			{ x: 3, y: 3 },
			{ x: 5, y: 3 },
			{ x: 5, y: 5 },
			{ x: 3, y: 5 },
		]);
		expect(poly1.intersects(poly2)).toBe(false);
	});

	it("should find the closest point on the polygon", () => {
		const polygon = new Polygon([
			{ x: 0, y: 0 },
			{ x: 4, y: 0 },
			{ x: 4, y: 4 },
			{ x: 0, y: 4 },
		]);
		const point3D = { x: 2, y: 0, z: 6 };
		const closest = polygon.closestPointOnPolygon(point3D);
		// The closest point on the top edge should be (2, 4)
		expect(closest.x).toBeCloseTo(2);
		expect(closest.y).toBeCloseTo(4);
	});

	it("should retrieve chunk areas that intersect the polygon", () => {
		// Use a small polygon likely contained in one chunk.
		const polygon = new Polygon([
			{ x: 1, y: 1 },
			{ x: 14, y: 10 },
			{ x: 200, y: 200 },
		]);
		const chunks = polygon.getChunkAreas();
		expect(chunks.length).toBeGreaterThan(0);
	});
});
