var base = document.getElementById('x-base') ? document.getElementById('x-base').value : '';
var resRoot = base+''
require.config({
	paths : {
		apitest:'src/w2'
	},
	shim : {

		
	}
});

require(['apitest'], function(z) {	
	console.log(window)
	console.log(window.vhash)
	console.log(z)
	console.log(z.vhash)
	z.call("getname","learning");

});


