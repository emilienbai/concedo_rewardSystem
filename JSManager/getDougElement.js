function getAllElements(){
  var list = [];
  //var tail = dougContract.getHead();
  console.log("getAllElements");
  dougContract.tail(function(error, result){
    tail = result;
    var currentKey = tail;

    function finished(){
      console.log(list);//TODO callback
    }

    function getElems(key){
      dougContract.getElement(key, function(err, res){
        list.push(res);
        console.log(currentKey);
        currentKey = res[1];
        if (currentKey != 0){
          getElems(currentKey);
        } else {
          finished();
        }
      })
    }
    getElems(currentKey);
  }
)}
//getAllElements();