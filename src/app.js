const arm = require('./arm');

/*
arm.rotateBody(44);
arm.rotateArm(33);
arm.rotateForearm(22);
arm.rotateWrist(11);
*/
arm.setAngles(44, 33, 22, 11);

const angles = arm.getAngles();
for (let i = 0; i < angles.length-1; i++) {
    console.log("DOF " + i + " angle:\t" + angles[i]);
}

console.log('Distance between gripper and table: '+ arm.getDistanceToTable() +' cm');