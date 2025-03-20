import {Vec3} from "@bedrock-oss/bedrock-boost";
import {Segment, SegmentVertex} from "./segment";

describe("Segment", () => {
    it("should create a segment with correct values", () => {
        const point1 = new Vec3(1, 2, 3);
        const point2 = new Vec3(4, 5, 6);
        const segment = new Segment(point1, point2);
        expect(segment.getPoint1()).toEqual(point1);
        expect(segment.getPoint2()).toEqual(point2);
    })
    
    it("should create a segment from a vector with direction", () => {
        const point1 = new Vec3(1, 2, 3);
        const direction = new Vec3(1, 0, 0);
        const length = 5;
        const segment = Segment.fromVectorWithDirection(point1, direction, length);
        expect(segment.getPoint1()).toEqual(point1);
        expect(segment.getPoint2()).toEqual(new Vec3(6, 2, 3));
    })
    
    it("should calculate the distance to a point", () => {
        const point1 = new Vec3(0, 0, 0);
        const point2 = new Vec3(0, 0, 5);
        const segment = new Segment(point1, point2);
        const point = new Vec3(0, 0, 10);
        expect(segment.distanceToPoint(point)).toEqual(5);
    })
    
    it("should calculate the distance to a point when the point is outside the segment", () => {
        const point1 = new Vec3(0, 0, 0);
        const point2 = new Vec3(0, 0, 5);
        const segment = new Segment(point1, point2);
        const point = new Vec3(0, 0, 10);
        expect(segment.distanceToPoint(point)).toEqual(5);
    })
    
    it("should calculate the distance to a point when the point is inside the segment", () => {
        const point1 = new Vec3(0, 0, 0);
        const point2 = new Vec3(0, 0, 5);
        const segment = new Segment(point1, point2);
        const point = new Vec3(0, 0, 2);
        expect(segment.distanceToPoint(point)).toEqual(0);
    })
    
    it("should rotate the segment around a pivot with a rotation", () => {
        const point1 = new Vec3(0, 0, 0);
        const point2 = new Vec3(0, 0, 5);
        const segment = new Segment(point1, point2);
        const pivot = new Vec3(0, 0, 0);
        const rotation = new Vec3(0, 90, 0);
        const rotatedSegment = segment.rotate(pivot, rotation);
        expect(rotatedSegment.getPoint1()).toEqual(new Vec3(0, 0, 0));
        expect(rotatedSegment.getPoint2().x).toBeCloseTo(5);
        expect(rotatedSegment.getPoint2().y).toBeCloseTo(0);
        expect(rotatedSegment.getPoint2().z).toBeCloseTo(0);
    });
    
    it("should get the length of the segment", () => {
        const point1 = new Vec3(0, 0, 0);
        const point2 = new Vec3(0, 0, 5);
        const segment = new Segment(point1, point2);
        expect(segment.getLength()).toEqual(5);
    });
    
    it("should get the direction of the segment", () => {
        const point1 = new Vec3(0, 0, 0);
        const point2 = new Vec3(0, 0, 5);
        const segment = new Segment(point1, point2);
        expect(segment.getDirection()).toEqual(new Vec3(0, 0, 1));
    });
    
    it("should get the direction of the segment from a vertex", () => {
        const point1 = new Vec3(0, 0, 0);
        const point2 = new Vec3(0, 0, 5);
        const segment = new Segment(point1, point2);
        expect(segment.getDirection(SegmentVertex.POINT_1)).toEqual(new Vec3(0, 0, 1));
        expect(segment.getDirection(SegmentVertex.POINT_2)).toEqual(new Vec3(0, 0, -1));
    });
    
    it("should get the midpoint of the segment", () => {
        const point1 = new Vec3(0, 0, 0);
        const point2 = new Vec3(0, 0, 5);
        const segment = new Segment(point1, point2);
        expect(segment.getMidPoint()).toEqual(new Vec3(0, 0, 2.5));
    });
    
    it("should get the inverse of the segment", () => {
        const point1 = new Vec3(0, 0, 0);
        const point2 = new Vec3(0, 0, 5);
        const segment = new Segment(point1, point2);
        const inverse = segment.invert();
        expect(inverse.getPoint1()).toEqual(point2);
        expect(inverse.getPoint2()).toEqual(point1);
    });
    
    it("should find a point on the segment at the specified distance from a vertex", () => {
        const point1 = new Vec3(0, 0, 0);
        const point2 = new Vec3(0, 0, 5);
        const segment = new Segment(point1, point2);
        expect(segment.findPointOn(SegmentVertex.POINT_1, 5)).toEqual(new Vec3(0, 0, 5));
    });
    
    it("should find a point on the segment at the specified distance from a vertex when the distance is greater than the length of the segment", () => {
        const point1 = new Vec3(0, 0, 0);
        const point2 = new Vec3(0, 0, 5);
        const segment = new Segment(point1, point2);
        expect(segment.findPointOn(SegmentVertex.POINT_1, 10)).toEqual(new Vec3(0, 0, 10));
    });
    
    it("should find a point on the segment at the specified distance from a vertex when the distance is negative", () => {
        const point1 = new Vec3(0, 0, 0);
        const point2 = new Vec3(0, 0, 5);
        const segment = new Segment(point1, point2);
        expect(segment.findPointOn(SegmentVertex.POINT_2, -4)).toEqual(new Vec3(0, 0, 9));
    });
    
    it("should find a point on the segment at the specified distance from a vertex when the distance is zero", () => {
        const point1 = new Vec3(0, 0, 0);
        const point2 = new Vec3(0, 0, 5);
        const segment = new Segment(point1, point2);
        expect(segment.findPointOn(SegmentVertex.POINT_1, 0)).toEqual(point1);
    });
    
    it("should find a point on the segment at the specified distance from a vertex when the distance is equal to the segment length", () => {
        const point1 = new Vec3(0, 0, 0);
        const point2 = new Vec3(0, 0, 5);
        const segment = new Segment(point1, point2);
        expect(segment.findPointOn(SegmentVertex.POINT_1, 5)).toEqual(point2);
    });
    
    it("should find a point on the segment at the specified distance from a vertex when the distance is less than the segment length", () => {
        const point1 = new Vec3(0, 0, 0);
        const point2 = new Vec3(0, 0, 5);
        const segment = new Segment(point1, point2);
        expect(segment.findPointOn(SegmentVertex.POINT_2, 1)).toEqual(new Vec3(0, 0, 4));
    });
    
    it("should find a point on the segment at the specified distance from a vertex when the distance is a fraction of the segment length", () => {
        const point1 = new Vec3(0, 0, 0);
        const point2 = new Vec3(0, 0, 5);
        const segment = new Segment(point1, point2);
        expect(segment.findPointOn(SegmentVertex.POINT_2, 0.5).z).toBeCloseTo(4.5);
    });
    
    it("should find the closest point on the segment to a point when the point is outside the segment", () => {
        const point1 = new Vec3(0, 0, 0);
        const point2 = new Vec3(0, 0, 5);
        const segment = new Segment(point1, point2);
        const point = new Vec3(1, 0, 2.5);
        expect(segment.getNearestPoint(point)).toEqual(new Vec3(0, 0, 2.5));
    });
});