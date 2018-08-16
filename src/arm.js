const Plane = require('./plane'),
    math3d = require('math3d');
const { Vector3, Quaternion, Transform}  = math3d;

const table = new Transform(new Vector3(68.58, 22.86, 0), Quaternion.zero);
table.size = new Vector3(60.96, 45.72, 60.96);

const tripod = new Transform(new Vector3(0, 36.25, 0), Quaternion.zero);
tripod.size = new Vector3(5, 72.5, 5);

const body = new Transform();
body.size = new Vector3(34.6964, 16.2052, 17.78);

const arm = new Transform();
arm.size = new Vector3(44.7802, 5, 17.78);

const forearm = new Transform();
forearm.size = new Vector3(40.9448, 5, 5);

const gripper = new Transform();
gripper.size = new Vector3(20.066, 5, 5);

const dof = [],
    angles = [];
for (let i=0; i<5; i++) {
    dof.push([new Vector3(), new Vector3()]);
    angles.push(0);
}

const getAngles = () => angles;
const getDofCenter = i => dof[i][0].average(dof[i][1]);
const getDofAxis = i => dof[i][0].sub(dof[i][1]);


body.position = new Vector3(tripod.position.x, tripod.position.y + tripod.size.y / 2 + body.size.y / 2, tripod.position.z);

dof[0][0] = new Vector3(body.position.x, body.position.y - body.size.y / 2, body.position.z);
dof[0][1] = new Vector3(body.position.x, body.position.y + body.size.y / 2, body.position.z);

dof[1][0] = new Vector3(body.position.x + body.size.x / 2, body.position.y + body.size.y / 2 - arm.size.y / 2, body.position.z - body.size.z / 2);
dof[1][1] = new Vector3(body.position.x + body.size.x / 2, body.position.y + body.size.y / 2 - arm.size.y / 2, body.position.z + body.size.z / 2);
arm.position = new Vector3(dof[1][0].x + arm.size.x / 2, dof[1][0].y + arm.size.y / 2, (dof[1][0].z + dof[1][1].z) / 2);

dof[2][0] = new Vector3(arm.position.x + arm.size.x / 2, arm.position.y, arm.position.z - arm.size.z / 2);
dof[2][1] = new Vector3(arm.position.x + arm.size.x / 2, arm.position.y, arm.position.z + arm.size.z / 2);
forearm.position = new Vector3(dof[2][0].x + forearm.size.x / 2, dof[2][0].y, (dof[2][0].z + dof[2][1].z) / 2);

dof[3][0] = new Vector3(forearm.position.x + forearm.size.x / 2, forearm.position.y, forearm.position.z - forearm.size.z / 2);
dof[3][1] = new Vector3(forearm.position.x + forearm.size.x / 2, forearm.position.y, forearm.position.z + forearm.size.z / 2);
gripper.position = new Vector3(dof[3][0].x + gripper.size.x / 2, dof[3][0].y, (dof[3][0].z + dof[3][1].z) / 2);

dof[4][0] = new Vector3(gripper.position.x + gripper.size.x / 2, gripper.position.y, gripper.position.z - gripper.size.z / 2);
dof[4][1] = new Vector3(gripper.position.x + gripper.size.x / 2, gripper.position.y, gripper.position.z + gripper.size.z / 2);

// Create invisible plane on top of table
const tableTopPlane = new Plane(Vector3.up, new Vector3(table.position.x, table.position.y + table.size.y / 2, table.position.z));


// Report ground distance between table edge and ARM
const tableArmGroundDist = table.position.x - table.size.x/2 - tripod.position.x;
console.log("Ground distance between table edge and ARM: "+ tableArmGroundDist +" cm");


const rotateAroundDof = (dofIndex, pointToRotate, angle) => {
    const center = getDofCenter(dofIndex);
    const quat = Quaternion.AngleAxis(getDofAxis(dofIndex).normalize(), angle);
    return quat.mulVector3(pointToRotate.sub(center)).add(center);
}

Transform.prototype.RotateAround = function(rotationCenter, rotationAxis, angle) {
    const quat = Quaternion.AngleAxis(rotationAxis, angle);
    this.position = quat.mulVector3(this.position.sub(rotationCenter)).add(rotationCenter);
}

const rotateBody = angle => {
    angles[0] = (angles[0] + angle) % 360;
    const rotationCenter = getDofCenter(0);
    const rotationAxis = getDofAxis(0);

    body.RotateAround(rotationCenter, rotationAxis, angle);
    arm.RotateAround(rotationCenter, rotationAxis, angle);
    forearm.RotateAround(rotationCenter, rotationAxis, angle);
    gripper.RotateAround(rotationCenter, rotationAxis, angle);

    for (let i = 1; i < dof.length; i++) {
        dof[i][0] = rotateAroundDof(0, dof[i][0], angle);
        dof[i][1] = rotateAroundDof(0, dof[i][1], angle);
    }
}

const rotateArm = angle => {
    angles[1] = (angles[1] + angle) % 360;
    const rotationCenter = getDofCenter(1);
    const rotationAxis = getDofAxis(1);

    arm.RotateAround(rotationCenter, rotationAxis, angle);
    forearm.RotateAround(rotationCenter, rotationAxis, angle);
    gripper.RotateAround(rotationCenter, rotationAxis, angle);

    for (let i = 2; i < dof.length; i++) {
        dof[i][0] = rotateAroundDof(1, dof[i][0], angle);
        dof[i][1] = rotateAroundDof(1, dof[i][1], angle);
    }
}

const rotateForearm = angle => {
    angles[2] = (angles[2] + angle) % 360;
    const rotationCenter = getDofCenter(2);
    const rotationAxis = getDofAxis(2);

    forearm.RotateAround(rotationCenter, rotationAxis, angle);
    gripper.RotateAround(rotationCenter, rotationAxis, angle);

    for (let i = 3; i < dof.length; i++) {
        dof[i][0] = rotateAroundDof(2, dof[i][0], angle);
        dof[i][1] = rotateAroundDof(2, dof[i][1], angle);
    }
}

const rotateWrist = angle => {
    angles[3] = (angles[3] + angle) % 360;
    const rotationCenter = getDofCenter(3);
    const rotationAxis = getDofAxis(3);
    
    gripper.RotateAround(rotationCenter, rotationAxis, angle);

    for (let i = 4; i < dof.length; i++) {
        dof[i][0] = rotateAroundDof(3, dof[i][0], angle);
        dof[i][1] = rotateAroundDof(3, dof[i][1], angle);
    }
}

const setAngles = (...someAngles) => {
    if (someAngles.length > angles.length) {
        throw new Error('Attempting to setAngles with too many angles');
    }
    
    someAngles.forEach((targetAngle, index) => {
        const angleDelta = targetAngle - angles[index];
        if (angleDelta !== 0) {
            switch (index) {
                case 0: rotateBody(angleDelta); break;
                case 1: rotateArm(angleDelta); break;
                case 2: rotateForearm(angleDelta); break;
                case 3: rotateWrist(angleDelta); break;
                default: throw new Error('Cannot rotate DOF'+ index +': unimplemented operation'); break;
            }
        }
    });

    angleDeltas = someAngles.map((angle, index) => angle - angles[index]);
    if (angleDeltas[0] != 0) {
        rotateBody(angleDeltas[0]);
    }
}

const getDistanceToTable = (...someAngles) => {
    if (typeof someAngles !== 'undefined') {
        setAngles(someAngles);
    }
    return tableTopPlane.distanceTo(getDofCenter(4));
}

module.exports = {
    getAngles,
    setAngles,
    rotateBody,
    rotateArm,
    rotateForearm,
    rotateWrist,
    getDistanceToTable
}