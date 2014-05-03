
if(typeof Workflow=="undefined")
  Workflow={};

Workflow.Chaos={};

Workflow.Chaos.stringChaos=function(string){
  var prob = (Math.random()*100);
  var len = string.length;
  var s,c,i;
  if(prob<5){
    return "toString";
  }
  if(prob<25){
    //Let's just randomly delete a charcater from the string
    c = Math.floor(Math.random()*len);
    s = "";
    for(i=0;i<len;i++){
      if(i!=c) s+=string[i];
    }
    return s;
  }
  if(prob<50){
    //Let's randomly insert a character into a string
    c = Math.floor(Math.random()*len);
    s = "";
    for(i=0;i<len;i++){
      if(i!=c) s+=string[i];
      else s+=Math.floor(Math.random()*26).toString(36);
    }
    return s;
  }
  if(prob<75){
    var badChars='\';:{}[]*!`@#$%^&*()_=+-,.<>?\\/';
    //Let's randomly insert a character into a string
    c = Math.floor(Math.random()*len);
    s = "";
    for(i=0;i<len;i++){
      if(i!=c) s+=string[i];
      else s+=badChars[Math.floor(Math.random()*badChars.length)];
    }
    return s;
  }
  return Math.floor(Math.random()*10000)-10000/2;
}; 

Workflow.Chaos.numberChaos=function(number){
  var prob = (Math.random()*120);

  if(prob<20){ 
    return number-Math.random();
  } else if(prob<40){ 
    return number+Math.random();
  } else if(prob<60){
    return number-Math.floor(Math.random()*100);
  } else if(prob<80){
    return number+Math.floor(Math.random()*100);
  } else if(prob<100){
    return number.toString();
  } else if(prob<120){
    return Workflow.Chaos.stringChaos(number.toString());
  }
};

Workflow.Chaos.chaos=function(object){
  var prob = (Math.random()*100);
  object = JSON.parse(JSON.stringify(object));
  if(prob<2){
    return null;
  } else if(prob<4){
    return {};
  } else if(prob<6){
    return (Math.random()*100000).toString(36);
  } else if(prob<8){
    return Math.random()*100000;
  } else if(prob<10){
    return Math.random();
  } else if(prob<12){
    return (Math.random()*1<0.5?true:false);
  } else if(prob<14){
    return [];
  } else if(prob<16){
    return [ object ];
  } else if(prob<18){
    return JSON.stringify(object);
  } else if(prob<20){
    return null;
  } else {
    if(object instanceof Array || typeof object=="object"){
      prob = (Math.random()*100);
      for(var i in object){
          prob = (Math.random()*100);
          if(prob<5){
          } else{
            object[i]=Workflow.Chaos.chaos(object[i]);
          }
      }
      return object;
    } else {
      if(typeof object=="string")
        return Workflow.Chaos.stringChaos(object);      
      else if(typeof object=="number")
        return Workflow.Chaos.numberChaos(object);
      else return object;
    }
  }
};

