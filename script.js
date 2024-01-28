$.ajax({
  url: 'online.json?' + (new Date().valueOf().toString()),
		method: 'get',
		dataType: 'html',
		data: {},
		success: function(response) {
      var data = JSON.parse(response);
      var div = document.getElementById('data');
      data.forEach(function (item) {
        div.innerHTML += item[0] +': ' + item[1].toFixed(2) + '<br>' 
      });
		}
	});