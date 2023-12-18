const UE = function(name) {
  this.name = name;
  this.courses = [];
}

UE.prototype.addCourse = function(course){
  this.courses.push(course);
}

export default UE;