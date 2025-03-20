import {Vector3} from "@minecraft/server";
import {Vec3} from "@bedrock-oss/bedrock-boost";

/**
 * Rotates a point around the origin by the specified rotation.
 * @param point The point to rotate.
 * @param rotation The rotation to apply.
 */
export function rotatePoint(point: Vector3 | Vec3, rotation: Vector3): Vec3 {
    let newPoint = new Vec3(point.x, point.y, point.z);
    newPoint = newPoint.rotate({x:1, y:0, z:0}, rotation.x);
    newPoint = newPoint.rotate({x:0, y:1, z:0}, rotation.y);
    newPoint = newPoint.rotate({x:0, y:0, z:1}, rotation.z);
    
    return newPoint;
}