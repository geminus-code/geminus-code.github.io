var oList;

function select_ticker(elm, file) {
	oList.select(elm);
  ReactDOM.unmountComponentAtNode(document.getElementById('chart_container'));
  $.ajax({
		url: '/json/' + file + '.json?' + (new Date().valueOf().toString()),
		method: 'get',
		dataType: 'html',
		data: {},
		success: function(response) {
      ReactDOM.render( /*#__PURE__*/React.createElement(ChartContainer, {
        data: JSON.parse(response)
      }), document.getElementById('chart_container'));
		}
	});
}

$(document).ready(function(){
	oList = new tickersList(document.getElementById('tickersList'), 'active', 'nav-link');
	$.ajax({
		url: '/json/tickers.json?' + (new Date().valueOf().toString()),
		method: 'get',
		dataType: 'html',
		data: {},
		success: function(response) {
			oList.create_list(JSON.parse(response));
		}
	});
});