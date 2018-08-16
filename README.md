# ARM 3D motion simulator running on Node.js

Given angles for 4 Degrees of Freedom (DOF), calculate the distance between the tip of the ARM gripper and the table:

```js
arm.setAngles(44, 33, 22, 11);
console.log('Distance between gripper and table: '+ arm.getDistanceToTable() +' cm');
```

Output:
```
Ground distance between table edge and ARM: 38.099999999999994 cm
Distance between gripper and table: -33.67838827197671 cm
```
