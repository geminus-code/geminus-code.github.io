var retData;
var trendData = [];
var trendIdx = 0;
var ticker = '';
var x_scale;
var ctx = document.getElementById('chart').getContext('2d');
var config = {
	data: {
		labels: [],
		datasets: [{
			type: 'line',
			label: 'y_pred',
			pointRadius: 0,
			pointHoverRadius: 3,
			pointStyle: 'rect',
			borderColor: 'red',
			backgroundColor: 'red',
			borderWidth: 2,
			fill: false,
			data: [],
		},{
			type: 'line',
			label: 'y_true',
			pointRadius: 0,
			pointHoverRadius: 3,
			pointStyle: 'rect',
			borderColor: 'black',
			backgroundColor: 'black',
			borderWidth: 2,
			fill: false,
			data: [],
		},{
			type: 'line',
			label: 'train/test split',
			pointRadius: 0,
			pointHoverRadius: 0,
			borderColor: 'blue',
			borderWidth: 1,
			fill: false,
			data: [],
		}]
	},
	options: {
		animation: {duration: 0},
		scales: {
			xAxes: [{
				type: 'time',
				distribution: 'series',
				ticks: {
					source: 'labels'
				},
			}],
			yAxes: [{
				gridLines: {drawBorder: false},
				scaleLabel: {
					display: true,
					labelString: 'Closing price'
				}
			}],
		},
		hover: {
			mode: 'index',
			position: 'nearest',
			intersect: false,
		},
		tooltips: {
			enabled: true,
			mode: 'index',
			position: 'nearest',
			intersect: false,
			titleFontColor: '#000000',
			bodyFontColor: '#000000',
			backgroundColor: 'rgba(240,240,240,0.7)',
			borderColor: 'rgba(0,0,0,0.1)',
			borderWidth: 1,
		},
	}
};

$.ajax({
	url: '/demo.json',
	method: 'get',
	dataType: 'html',
	data: {},
}).done(function(response) {
	retData = JSON.parse(response);
	let add_html = '<ul class="nav nav-pills flex-column">';
	Object.keys(retData).forEach(function(item, i) {
		Object.keys(retData[item]).forEach(function(item2, i2) {
			let BAIC = (retData[item][item2]['BIC'] + retData[item][item2]['AIC']).toFixed(3);
			let PR = retData[item][item2]['pearsonr'].toFixed(3);
			add_html += '<li class="nav-item">';
			if (item2.search(/aggregate/i) != -1) {
				add_html += '<a class="nav-link" href="#" id="' + item2 + '" onclick="show_model(this,\'' + item + '\')">' + item + ' aggregate</a>';
			} else {
				add_html += '<a class="nav-link" href="#" id="' + item2 + '" onclick="show_model(this,\'' + item + '\')">' + item + ' ' + PR + ' / ' + BAIC + '</a>';
			}
			add_html += '</li>';
		});
	});
	add_html += '</ul>';
	$("#models").html(add_html);
});

function updateChart(shift=0) {
	if (ticker == '') {return;}
	trendIdx += shift;
	if (trendIdx < x_scale) {trendIdx = x_scale;}
	if (trendIdx > trendData['data'].length - 1) {trendIdx = trendData['data'].length - 1;}
	let y_pred = [];
	let y_true = [];
	let split_line = [];
	let split_date = new Date(trendData['split_date']);
	let _min = trendData['data'][0][1];
	let _max = trendData['data'][0][1];
	let labels = [];
	let cntr = trendIdx - x_scale;
	for (let i = trendIdx - x_scale; i <= trendIdx; i++) {
		let d = new Date(trendData['data'][i][0]);
		y_pred.push({
			t: d.valueOf(),
			y: trendData['data'][i][2]
		});
		if (trendData['data'][i][1] != null) {
			_min = Math.min(_min, trendData['data'][i][1]);
			_max = Math.max(_max, trendData['data'][i][1]);
			y_true.push({
				t: d.valueOf(),
				y: trendData['data'][i][1]
			});
		}
		_min = Math.min(_min, trendData['data'][i][2]);
		_max = Math.max(_max, trendData['data'][i][2]);
		if (d.valueOf() == split_date.valueOf()) {
			split_line.push({t:d.valueOf(), y:null});
			split_line.push({t:d.valueOf(), y:null});
		}
		if (i == cntr) {
			labels.push(d.valueOf());
			cntr += Math.ceil(x_scale / 4);
			if (cntr > trendIdx) {cntr = trendIdx;}
		}
	}
	if (split_line.length != 0) {
		split_line[0]['y'] = _min;
		split_line[1]['y'] = _max;
	}
	config.data.datasets[0].data = y_pred;
	config.data.datasets[1].data = y_true;
	config.data.datasets[2].data = split_line;
	config.data.labels = labels;
	if (window.myChart) {window.myChart.destroy(); delete window.myChart;}
	window.myChart = new Chart(ctx, config);
}

function show_model(obj, name) {
	$(".nav-link").each(function (indx, element) { 
		$(element).attr("class", $(element).attr("class").replace(" active", "").trim());
	});
	obj.setAttribute("class", obj.className + " active");
	ticker = name;
	trendData = retData[ticker][obj.id];
	let BIC = trendData['BIC'].toFixed(3);
	let AIC = trendData['AIC'].toFixed(3);
	let PR = trendData['pearsonr'].toFixed(3);
	$("#info").html(ticker+':   BIC='+BIC+' / AIC='+AIC+' / pearsonr='+PR);
	$("#info").attr("class", $("#info").attr("class").replace(" invisible", " visible"));
	unit_select();
}

function unit_select() {
	switch ($("#unit").val()) {
		case "1":
			x_scale = 100;
			break;
		case "2":
			x_scale = 200;
			break;
		case "3":
			x_scale = 300;
			break;
		case "4":
			x_scale = 500;
			break;
		case "5":
			x_scale = 1000;
			break;
		case "6":
			x_scale = trendData['data'].length - 1;
			trendIdx = trendData['data'].length - 1;
			break;
	}
	updateChart(0);
}

$(document).ready(function(){$('[data-toggle="tooltip"]').tooltip();});
$('#trendBack').bind('click', function () {updateChart(-3);});
$('#trendForward').bind('click', function () {updateChart(3);});
$('#trendBackLong').bind('click', function () {updateChart(-100);});
$('#trendForwardLong').bind('click', function () {updateChart(100);});
$('#unit').bind('change', unit_select);
