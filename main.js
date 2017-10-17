define(function(require,exports,module) {
    var title= document.getElementById('title');
    title.innerHTML = "yes it works";
	var vsea = require('./src/w2.js');
	console.log(window)
	console.log(window.vhash)
	console.log(vsea)
	console.log(vsea.vhash)
	vsea.call("getname","  xuexi ",{age:90});
})