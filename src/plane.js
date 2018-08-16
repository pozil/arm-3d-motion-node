module.exports = class Plane {
    constructor(normal, point) {
        this.normal = normal;
        this.point = point;
    }

    distanceTo(point) {
        return this.normal.x * (point.x - this.point.x)
                + this.normal.y * (point.y - this.point.y)
                + this.normal.z * (point.z - this.point.z)
            / Math.sqrt(
                Math.pow(this.normal.x, 2)
                + Math.pow(this.normal.y, 2)
                + Math.pow(this.normal.z, 2));
    }
}
