import {Vec3} from "@bedrock-oss/bedrock-boost";
import {Vector3} from "@minecraft/server";
import {rotatePoint} from "./utils";

export enum SegmentVertex {
    POINT_1,
    POINT_2
}

/**
 * Represents a segment in 3D space.
 */
export class Segment {
    private readonly point1: Vec3;
    private readonly point2: Vec3;
    private readonly length: number;
    
    constructor(point1: Vector3, point2: Vector3);
    constructor(point1: Vec3, point2: Vec3) {
        point1 = new Vec3(point1);
        point2 = new Vec3(point2);
        this.point1 = point1;
        this.point2 = point2;
        this.length = point1.distance(point2);
    }
    
    /**
     * Creates a segment from a point and a direction.
     * @param point1
     * @param direction
     * @param length
     */
    static fromVectorWithDirection(point1: Vector3, direction: Vector3, length: number): Segment {
        return new Segment(point1, new Vec3({
            x: point1.x + direction.x * length,
            y: point1.y + direction.y * length,
            z: point1.z + direction.z * length
        }));
    }
    
    /**
     * Gets the first point of the segment.
     */
    getPoint1(): Vec3 {
        return this.point1;
    }
    
    /**
     * Gets the second point of the segment.
     */
    getPoint2(): Vec3 {
        return this.point2;
    }
    
    /**
     * Gets the smallest distance from the segment to the specified point.
     * @param point The point to measure the distance to.
     */
    distanceToPoint(point: Vector3): number {
        const segmentLength = this.getLength();
        const direction = this.getDirection(SegmentVertex.POINT_1);
        const point1ToTarget = new Vec3({
            x: point.x - this.point1.x,
            y: point.y - this.point1.y,
            z: point.z - this.point1.z
        });
        
        const dotProduct = point1ToTarget.dot(direction);
        if (dotProduct <= 0) {
            return point1ToTarget.length();
        }
        
        if (dotProduct >= segmentLength) {
            return new Vec3(point).distance(this.point2);
        }
        
        const projection = direction.multiply(dotProduct);
        return point1ToTarget.subtract(projection).length();
    }
    
    /**
     * Rotates the segment around the specified pivot point by the specified rotation.
     * @param pivot The pivot point to rotate around.
     * @param rotation The rotation to apply.
     */
    rotate(pivot: Vector3, rotation: Vector3) {
        return new Segment(
            rotatePoint(this.point1.subtract(pivot), new Vec3(rotation)).add(pivot),
            rotatePoint(this.point2.subtract(pivot), new Vec3(rotation)).add(pivot)
        );
    }
    
    /**
     * Gets the midpoint of the segment.
     */
    getMidPoint(): Vec3 {
        return Vec3.from({
            x: (this.point1.x + this.point2.x) / 2,
            y: (this.point1.y + this.point2.y) / 2,
            z: (this.point1.z + this.point2.z) / 2
        });
    }
    
    /**
     * Gets the length of the segment.
     */
    getLength() {
        return this.length;
    }
    
    /**
     * Get a new segment that is the inverse of this segment.
     */
    invert(): Segment {
        return new Segment(this.point2, this.point1);
    }
    
    /**
     * Gets the direction of the segment.
     * @param from The vertex to get the direction from.
     */
    getDirection(from: SegmentVertex = SegmentVertex.POINT_1): Vec3 {
        const source = from ? this.point2 : this.point1;
        const to = from ? this.point1 : this.point2;
        return new Vec3({
            x: to.x - source.x,
            y: to.y - source.y,
            z: to.z - source.z
        }).divide(this.getLength());
    }
    
    /**
     * Gets a point on the segment at the specified distance from the specified vertex.
     * @param from The vertex to start from.
     * @param distance The distance from the specified vertex.
     * @deprecated Use findPointOn instead.
     */
    findPointOnSegment(from: SegmentVertex, distance: number): Vec3 {
        return this.findPointOn(from, distance);
    }
        
    /**
     * Gets a point on the segment at the specified distance from the specified vertex.
     * @param from The vertex to start from.
     * @param distance The distance from the specified vertex.
     */
    findPointOn(from: SegmentVertex, distance: number): Vec3 {
        
        if (distance < 0) {
            from = from === SegmentVertex.POINT_1 ? SegmentVertex.POINT_2 : SegmentVertex.POINT_1;
            distance = Math.abs(distance) + this.getLength();
        }
    
        const startPoint: Vec3 = from === SegmentVertex.POINT_1 ?  this.point1 :  this.point2;
        const endPoint: Vec3 = from === SegmentVertex.POINT_1 ?  this.point2 :  this.point1;
    
        const direction: Vec3 = new Vec3({
            x: endPoint.x - startPoint.x,
            y: endPoint.y - startPoint.y,
            z: endPoint.z - startPoint.z
        });
    
        const segmentLength: number = Math.sqrt(
            direction.x * direction.x +
            direction.y * direction.y +
            direction.z * direction.z
        );
    
        const normalizedDirection: Vec3 = new Vec3({
            x: direction.x / segmentLength,
            y: direction.y / segmentLength,
            z: direction.z / segmentLength
        });
    
        const scaledDirection: Vec3 = new Vec3({
            x: normalizedDirection.x * distance,
            y: normalizedDirection.y * distance,
            z: normalizedDirection.z * distance
        });
    
        return new Vec3({
            x: startPoint.x + scaledDirection.x,
            y: startPoint.y + scaledDirection.y,
            z: startPoint.z + scaledDirection.z
        });
    }
    
    /**
     * Gets the blocks that the segment passes through.
     * @param thickness The thickness of the line.
     */
    getTouchedBlocks(thickness = 0.1) {
        const blocks: Vector3[] = [];
        
        const dx = this.point2.x - this.point1.x;
        const dy = this.point2.y - this.point1.y;
        const dz = this.point2.z - this.point1.z;
        
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        const steps = Math.ceil(distance / thickness);
        const stepX = dx / steps;
        const stepY = dy / steps;
        const stepZ = dz / steps;
        
        for (let i = 0; i <= steps; i++) {
            const currentX = this.point1.x + stepX * i;
            const currentY = this.point1.y + stepY * i;
            const currentZ = this.point1.z + stepZ * i;
            
            const blockX = Math.floor(currentX);
            const blockY = Math.floor(currentY);
            const blockZ = Math.floor(currentZ);
            
            const block = {x: blockX, y: blockY, z: blockZ};
            if (!blocks.includes(block)) {
                blocks.push(block);
            }
        }
        
        return blocks;
    }
    
    /**
     * Gets the point on the segment nearest to the specified point.
     * @param point The point to find the nearest point to.
     */
    getNearestPoint(point: Vector3): Vec3 {
        const AB = this.point2.subtract(this.point1);
        const AP = Vec3.from(point).subtract(this.point1);
    
        const ab2 = AB.dot(AB);
        
        const t = Math.max(0, Math.min(1, AP.dot(AB) / ab2));
    
        return this.point1.add(AB.scale(t));
    }

    /**
     * Move by Value in the direction of the segment
     * @param value The value to move the segment by.
     * @param direction The direction to move the segment in.
     * @returns {Segment}
     */
    moveByValue(value: number, direction: Vector3): Segment {
        const directionVector = Vec3.from(direction);
        return new Segment(this.point1.add(directionVector.multiply(value)), this.point2.add(directionVector.multiply(value)));
    }
}