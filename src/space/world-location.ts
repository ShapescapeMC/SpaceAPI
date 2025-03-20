import {Dimension, Entity, Vector2, Vector3, world} from "@minecraft/server";

export class WorldLocation {
    readonly location: Vector3;
    readonly rotation: Vector2;
    readonly dimension: Dimension;
    
    constructor(position: Vector3, rotation?: Vector2, dimension?: Dimension) {
        this.location = position;
        this.rotation = rotation || {x: 0, y: 0};
        this.dimension = dimension || world.getDimension("overworld");
    }
    
    static from(worldLocation: WorldLocation): WorldLocation {
        return new WorldLocation(worldLocation.location, worldLocation.rotation, world.getDimension(worldLocation.dimension.id));
    }
    
    /**
     * Gets the position of this location.
     * @deprecated Use location instead.
     */
    getPosition(): Vector3 {
        return this.location;
    }
    
    /**
     * Gets the rotation of this location.
     * @deprecated Use rotation instead.
     */
    getRotation(): Vector2 {
        return this.rotation;
    }
    
    /**
     * Gets the dimension of this location.
     * @deprecated Use dimension instead.
     */
    getDimension(): Dimension {
        return this.dimension;
    }
    
    /**
     * Teleports an entity to this location.
     * @param entity The entity to teleport.
     */
    teleport(entity: Entity): void {
        entity.teleport(this.location, {
            rotation: this.rotation,
            dimension: this.dimension
        });
    }
    
    /**
     * Checks if this location is equal to another location.
     * @param other The other location to compare.
     */
    equals(other: WorldLocation): boolean {
        return this.location.x === other.location.x &&
            this.location.y === other.location.y &&
            this.location.z === other.location.z &&
            this.rotation.x === other.rotation.x &&
            this.rotation.y === other.rotation.y &&
            this.dimension === other.dimension;
    }
    
    /**
     * Checks if this location is close to another location.
     * @param other The other location to compare.
     */
    isCloseTo(other: WorldLocation): boolean {
        return Math.abs(this.location.x - other.location.x) < 0.1 &&
            Math.abs(this.location.y - other.location.y) < 0.1 &&
            Math.abs(this.location.z - other.location.z) < 0.1 &&
            Math.abs(this.rotation.x - other.rotation.x) < 0.1 &&
            Math.abs(this.rotation.y - other.rotation.y) < 0.1 &&
            this.dimension === other.dimension;
    }
}