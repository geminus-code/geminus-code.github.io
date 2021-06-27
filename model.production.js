class tickersList {
	constructor(ref, mark, unmark) {
		this.ref = ref;
		this.mark = mark;
		this.unmark = unmark;
	}
	select(elm) {
		var collect = this.ref.getElementsByClassName(this.mark);
		for (let i = 0; i < collect.length; i++) {
			collect[i].className = this.unmark;
		}
		elm.className = this.unmark + ' ' + this.mark;
	}
	create_list(data) {
		var str = '';
		data.forEach(function(item) {
      str += '<li class="nav-item"><a class="'+this.unmark+'" onClick="select_ticker(this, \''+item['file']+'\')" href="#">'+item['name']+'</a></li>'
		}.bind(this));
		this.ref.innerHTML = str;
	}
}

const getOrCreateTooltip = (chart) => {
  let tooltipEl = chart.canvas.parentNode.querySelector('div');

  if (!tooltipEl) {
    tooltipEl = document.createElement('div');
    tooltipEl.style.background = 'rgba(240,240,240,0.7)';
    tooltipEl.style.borderRadius = '3px';
    tooltipEl.style.border = '1px solid rgba(0,0,0,0.1)';
    tooltipEl.style.color = 'black';
    tooltipEl.style.opacity = 1;
    tooltipEl.style.pointerEvents = 'none';
    tooltipEl.style.position = 'absolute';
    tooltipEl.style.transform = 'translate(-50%, 0)';
    tooltipEl.style.transition = 'all .1s ease';   
    tooltipEl.style.font = 'Arial';
    tooltipEl.style.fontSize = '12px';

    const table = document.createElement('table');
    table.style.margin = '0px';

    tooltipEl.appendChild(table);
    chart.canvas.parentNode.appendChild(tooltipEl);
  }

  return tooltipEl;
};

const externalTooltipHandler = (context) => {
  // Tooltip Element
  const {chart, tooltip} = context;
  const tooltipEl = getOrCreateTooltip(chart);

  // Hide if no tooltip
  if (tooltip.opacity === 0) {
    tooltipEl.style.opacity = 0;
    return;
  }
   
  // Set Text
  if (tooltip.body) {
    const titleLines = tooltip.title || [];
    const bodyLines = tooltip.body.map(b => b.lines);
    const tableHead = document.createElement('thead');
    titleLines.forEach(title => {
      const tr = document.createElement('tr');
      tr.style.borderWidth = 0;
      const th = document.createElement('th');
      th.style.borderWidth = 0;
      th.style.textAlign = 'center';
      const text = document.createTextNode(title);
      th.appendChild(text);
      tr.appendChild(th);
      tableHead.appendChild(tr);
    });

    const tableBody = document.createElement('tbody');
    bodyLines.forEach((body, i) => {
      const colors = tooltip.labelColors[i];
      const span = document.createElement('span');
      span.style.background = colors.backgroundColor;
      span.style.borderColor = colors.borderColor;
      span.style.borderWidth = '2px';
      span.style.marginRight = '10px';
      span.style.height = '10px';
      span.style.width = '10px';
      span.style.display = 'inline-block';
      const tr = document.createElement('tr');
      tr.style.backgroundColor = 'inherit';
      tr.style.borderWidth = 0;
      const td = document.createElement('td');
      td.style.borderWidth = 0;
      const text = document.createTextNode(body);
      td.appendChild(span);
      td.appendChild(text);
      tr.appendChild(td);
      tableBody.appendChild(tr);
    });

    const tableRoot = tooltipEl.querySelector('table');

    // Remove old children
    while (tableRoot.firstChild) {
      tableRoot.firstChild.remove();
    }

    // Add new children
    tableRoot.appendChild(tableHead);
    tableRoot.appendChild(tableBody);
  }

  const {offsetLeft: positionX, offsetTop: positionY} = chart.canvas;
  var position = chart.canvas.getBoundingClientRect();

  // Display and position
  tooltipEl.style.opacity = 1;  
  tooltipEl.style.left = positionX + position.width/2 + 'px';
  tooltipEl.style.top = positionY + chart.legend.height + 36 + 'px';
  tooltipEl.style.padding = tooltip.options.padding + 'px ' + tooltip.options.padding + 'px';
};

class ChartContainer extends React.Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
    this.infoRef = React.createRef();
    this.state = {
      isDown: false,
      model: 'aggregate',
      animationTitle: 'animation top',
      animationClass: 'bi bi-card-list mk-item',
      calc_period: 3
    };
    this.split_line_config = {
      type: 'line',
      pointRadius: 0,
      pointHoverRadius: 0,
      borderColor: 'blue',
      borderWidth: 1,
      fill: false,
      data: []
    };
    this.eval_line_config = {
      type: 'line',
      pointRadius: 0,
      pointHoverRadius: 0,
      borderColor: 'blue',
      borderWidth: 1,
      fill: false,
      data: []
    };
    this.config = {
      data: {
        labels: [],
        datasets: [{
          type: 'line',
          label: 'price',
          pointRadius: 0,
          pointHoverRadius: 3,
          pointStyle: 'rect',
          pointRotation: 0,
          borderColor: 'black',
          backgroundColor: 'black',
          borderWidth: 2,
          fill: false,
          data: []
        }, {
          type: 'line',
          label: 'predict',
          pointRadius: 0,
          pointHoverRadius: 3,
          pointStyle: 'rect',
          pointRotation: 0,
          borderColor: 'red',
          backgroundColor: 'red',
          borderWidth: 2,
          fill: false,
          data: []
        }]
      },
      options: {
        parsing: false,
        //maintainAspectRatio: false,
        animation: {
          duration: 0
        },
        plugins: {
          legend: {
            display: false,
            labels: {
              color: '#000000',
              usePointStyle: true
            }
          },
          title: {
            display: true,
            text: ''
          },
          tooltip: {
            enabled: false,
            titleColor: '#000000',
            bodyColor: '#000000',
            backgroundColor: 'rgba(240,240,240,0.7)',
            borderColor: 'rgba(0,0,0,0.1)',
            borderWidth: 1,
            external: externalTooltipHandler
          }
        },
        scales: {
          x: {
            type: 'timeseries',
            bounds: 'ticks',
            offset: false,
            time: {
              stepSize: 12,
              tooltipFormat: 'dd.MM.yyyy HH:mm:ss'
            },
            ticks: {
              source: 'data'
            }
          },
          y: {
            title: {
              display: true,
              text: 'closing price'
            }
          }
        },
        interaction: {
          mode: 'index',
          position: 'nearest',
          intersect: false
        },
        elements: {
          line: {
            tension: 0.2
          }
        }
      }
    };
    this.chartData = this.return_data(this.state.model);
    this.x_scale = this.chartData.data.length - 1;
    this.trendIdx = this.chartData.data.length - 1;
  }

  mouseDown(e) {
    if (e.button == 0) {
      this.setState({
        isDown: true
      });
    }
  }

  mouseUp(e) {
    if (e.button == 0) {
      this.setState({
        isDown: false
      });
    }
  }

  mouseMove(e) {
    if (this.state.isDown) {
      this.update_data(-e.movementX);
      this.update_chart();
    }
  }

  mouseWheel(e) {
    this.x_scale += e.deltaY;
    this.update_data();
    this.update_chart();
  }

  update_chart() {
    if (this.myChart == undefined) {
      this.myChart = new Chart(this.myRef.current.getContext('2d'), this.config);
    } else {
      this.myChart.update();
    }
  }

  componentDidMount() {
    this.update_data();
    this.update_chart();
  }

  return_data(model) {
    var ret;
    this.props.data.predicts.forEach(function (item) {
      if (item['model'] == model) {
        ret = item;
      }
    }.bind(this));
    return ret;
  }

  select_item(model) {
    this.chartData = this.return_data(model);
    this.update_data();
    this.setState({
      model: model
    });
    this.update_chart();
  }

  calc_prc() {
    let k = 0;
    let best = {
      dt: '',
      prc: 0
    };
    let prc = 0;
    let last;

    for (let i = 0; i < this.chartData.data.length; i++) {
      if (this.chartData.data[i][1] == null) {
        if (last == undefined) {
          last = this.chartData.data[i - 1][2];
        }

        k += 1;
        prc = 100 * (this.chartData.data[i][2] - last) / last;

        if (Math.abs(prc) > Math.abs(best['prc'])) {
          best['prc'] = prc;
          best['dt'] = this.chartData.data[i][0];
        }

        if (k >= 14 * this.state.calc_period) {
          break;
        }
      }
    }

    return best;
  }

  selectHandle(e) {
    this.setState({
      calc_period: e.target.value
    });
  }

  animation() {
    this.setState(function (state, props) {
      var ret;

      switch (state.animationTitle) {
        case 'animation top':
          ret = {
            animationTitle: 'animation float',
            animationClass: 'bi bi-chat-right-text mk-item'
          };
          this.config.options.plugins.tooltip.enabled = true;
          this.config.options.plugins.tooltip.external = null;
          break;

        case 'animation float':
          ret = {
            animationTitle: 'animation disable',
            animationClass: 'bi bi-x-circle mk-item'
          };
          this.config.options.plugins.tooltip.enabled = false;
          this.config.options.plugins.tooltip.external = null;
          break;

        case 'animation disable':
          ret = {
            animationTitle: 'animation top',
            animationClass: 'bi bi-card-list mk-item'
          };
          this.config.options.plugins.tooltip.enabled = false;
          this.config.options.plugins.tooltip.external = externalTooltipHandler;
          break;
      }

      return ret;
    });
    this.update_chart();
  }

  constraint() {
    if (this.x_scale < 150) {
      this.x_scale = 150;
    }

    if (this.x_scale > this.chartData.data.length - 1) {
      this.x_scale = this.chartData.data.length - 1;
    }

    if (this.trendIdx < this.x_scale) {
      this.trendIdx = this.x_scale;
    }

    if (this.trendIdx > this.chartData.data.length - 1) {
      this.trendIdx = this.chartData.data.length - 1;
    }
  }

  update_data(shift = 0) {
    this.trendIdx += shift;
    this.constraint();
    this.config.data.datasets[0].data = new Array();
    this.config.data.datasets[1].data = new Array();
    var split_line = [];
    var eval_line = [];
    var split_date = new Date(this.chartData['split_date']);
    var eval_date = new Date(this.chartData['test_date']);

    var _min;

    var _max;

    for (let j = this.trendIdx - this.x_scale; j <= this.trendIdx; j++) {
      let d = new Date(this.chartData.data[j][0]);

      if (_min == undefined) {
        _min = this.chartData.data[j][1];
      }

      if (_max == undefined) {
        _max = this.chartData.data[j][1];
      }

      if (this.chartData.data[j][1] != null) {
        _min = Math.min(_min, this.chartData.data[j][1]);
        _max = Math.max(_max, this.chartData.data[j][1]);
      }

      _min = Math.min(_min, this.chartData.data[j][2]);
      _max = Math.max(_max, this.chartData.data[j][2]);

      if (d.valueOf() == split_date.valueOf()) {
        split_line.push({
          x: d.valueOf(),
          y: null
        });
        split_line.push({
          x: d.valueOf(),
          y: null
        });
      }

      if (d.valueOf() == eval_date.valueOf()) {
        eval_line.push({
          x: d.valueOf(),
          y: null
        });
        eval_line.push({
          x: d.valueOf(),
          y: null
        });
      }

      this.config.data.datasets[0].data.push({
        x: d.valueOf(),
        y: this.chartData.data[j][1]
      });
      this.config.data.datasets[1].data.push({
        x: d.valueOf(),
        y: this.chartData.data[j][2]
      });
    }

    var sft = 2;

    if (split_line.length != 0) {
      split_line[0]['y'] = _min;
      split_line[1]['y'] = _max;
      this.config.data.datasets.splice(sft, 1, this.split_line_config);
      this.config.data.datasets[sft].data = split_line;
      sft += 1;
    } else {
      this.config.data.datasets.splice(sft, 1);
    }

    if (eval_line.length != 0) {
      eval_line[0]['y'] = _min;
      eval_line[1]['y'] = _max;
      this.config.data.datasets.splice(sft, 1, this.eval_line_config);
      this.config.data.datasets[sft].data = eval_line;
      sft += 1;
    } else {
      this.config.data.datasets.splice(sft, 1);
    }

    this.config.options.plugins.title.text = 'test statistics: pearsonr = ' + this.chartData['test_corr'].toFixed(3) + ' \\ rmse = ' + this.chartData['test_rmse'].toFixed(3);
  }

  render() {
    var best = this.calc_prc();
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      class: "d-flex justify-content-between flex-wrap flex-nowrap align-items-center pt-2 pb-2 border-bottom"
    }, /*#__PURE__*/React.createElement("ul", {
      class: "nav user-select-none"
    }, this.props.data.predicts.map(function (item, i) {
      var modelName = item['model'] == 'aggregate' ? item['model'] : (item['AIC'] + item['BIC']).toFixed(3);
      var className = item['model'] == this.state.model ? 'nav-link mk-item mk-item-select' : 'nav-link mk-item';
      return /*#__PURE__*/React.createElement("li", {
        key: i,
        class: "nav-item"
      }, /*#__PURE__*/React.createElement("a", {
        className: className,
        href: "#",
        onClick: this.select_item.bind(this, item['model'])
      }, modelName));
    }.bind(this))), /*#__PURE__*/React.createElement("i", {
      className: this.state.animationClass,
      onClick: this.animation.bind(this),
      Title: this.state.animationTitle
    })), /*#__PURE__*/React.createElement("div", {
      class: "position-relative"
    }, /*#__PURE__*/React.createElement("canvas", {
      class: "w-100",
      id: "canvas",
      width: "900",
      height: "380",
      onMouseDown: this.mouseDown.bind(this),
      onMouseUp: this.mouseUp.bind(this),
      onMouseMove: this.mouseMove.bind(this),
      onWheel: this.mouseWheel.bind(this),
      ref: this.myRef
    })), /*#__PURE__*/React.createElement("div", {
      class: "pt-3 d-flex flex-nowrap"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      class: "fw-bold"
    }, "Model statistics:"), /*#__PURE__*/React.createElement("div", {
      class: "d-flex flex-wrap"
    }, /*#__PURE__*/React.createElement("div", {
      class: "text-nowrap"
    }, /*#__PURE__*/React.createElement("span", {
      class: "text-muted"
    }, "create date: "), /*#__PURE__*/React.createElement("span", {
      class: "font-monospace"
    }, this.chartData['create_date']), "\u2002\\\u2002"), /*#__PURE__*/React.createElement("div", {
      class: "text-nowrap"
    }, /*#__PURE__*/React.createElement("span", {
      class: "text-muted"
    }, "validation date: "), /*#__PURE__*/React.createElement("span", {
      class: "font-monospace"
    }, this.chartData['split_date']), "\u2002\\\u2002"), /*#__PURE__*/React.createElement("div", {
      class: "text-nowrap"
    }, /*#__PURE__*/React.createElement("span", {
      class: "text-muted"
    }, "test date: "), /*#__PURE__*/React.createElement("span", {
      class: "font-monospace"
    }, this.chartData['test_date']), "\u2002\\\u2002")), /*#__PURE__*/React.createElement("div", {
      class: "d-flex flex-wrap"
    }, /*#__PURE__*/React.createElement("div", {
      class: "text-nowrap"
    }, /*#__PURE__*/React.createElement("span", {
      class: "text-muted"
    }, "pearson: "), /*#__PURE__*/React.createElement("span", {
      class: "font-monospace"
    }, this.chartData['pearson'].toFixed(3)), "\u2002\\\u2002"), /*#__PURE__*/React.createElement("div", {
      class: "text-nowrap"
    }, /*#__PURE__*/React.createElement("span", {
      class: "text-muted"
    }, "spearman: "), /*#__PURE__*/React.createElement("span", {
      class: "font-monospace"
    }, this.chartData['spearman'].toFixed(3)), "\u2002\\\u2002"), /*#__PURE__*/React.createElement("div", {
      class: "text-nowrap"
    }, /*#__PURE__*/React.createElement("span", {
      class: "text-muted"
    }, "kendall: "), /*#__PURE__*/React.createElement("span", {
      class: "font-monospace"
    }, this.chartData['kendall'].toFixed(3)), "\u2002\\\u2002"), /*#__PURE__*/React.createElement("div", {
      class: "text-nowrap"
    }, /*#__PURE__*/React.createElement("span", {
      class: "text-muted"
    }, "BIC: "), /*#__PURE__*/React.createElement("span", {
      class: "font-monospace"
    }, this.chartData['BIC'].toFixed(3)), "\u2002\\\u2002"), /*#__PURE__*/React.createElement("div", {
      class: "text-nowrap"
    }, /*#__PURE__*/React.createElement("span", {
      class: "text-muted"
    }, "AIC: "), /*#__PURE__*/React.createElement("span", {
      class: "font-monospace"
    }, this.chartData['AIC'].toFixed(3)), "\u2002\\\u2002"), /*#__PURE__*/React.createElement("div", {
      class: "text-nowrap"
    }, /*#__PURE__*/React.createElement("span", {
      class: "text-muted"
    }, "dKL: "), /*#__PURE__*/React.createElement("span", {
      class: "font-monospace"
    }, this.chartData['dKL'].toFixed(3)), "\u2002\\\u2002"), /*#__PURE__*/React.createElement("div", {
      class: "text-nowrap"
    }, /*#__PURE__*/React.createElement("span", {
      class: "text-muted"
    }, "rmse: "), /*#__PURE__*/React.createElement("span", {
      class: "font-monospace"
    }, this.chartData['rmse'].toFixed(3)), "\u2002\\\u2002"))), /*#__PURE__*/React.createElement("div", {
      class: "ps-4 flex-grow-1 d-flex flex-column align-items-center"
    }, /*#__PURE__*/React.createElement("div", {
      class: "fw-bold"
    }, "Calculation"), /*#__PURE__*/React.createElement("div", {
      class: "d-flex flex-nowrap align-items-top"
    }, /*#__PURE__*/React.createElement("div", {
      class: "text-nowrap pe-2"
    }, "for", /*#__PURE__*/React.createElement("select", {
      size: "1",
      class: "mx-2 font-monospace",
      value: this.state.calc_period,
      onChange: this.selectHandle.bind(this)
    }, /*#__PURE__*/React.createElement("option", {
      value: "1"
    }, "1"), /*#__PURE__*/React.createElement("option", {
      value: "2"
    }, "2"), /*#__PURE__*/React.createElement("option", {
      value: "3"
    }, "3"), /*#__PURE__*/React.createElement("option", {
      value: "4"
    }, "4"), /*#__PURE__*/React.createElement("option", {
      value: "5"
    }, "5")), this.state.calc_period > 1 ? 'days:' : 'day:'), /*#__PURE__*/React.createElement("div", {
      class: "text-nowrap"
    }, /*#__PURE__*/React.createElement("div", {
      class: "text-center font-monospace"
    }, best['prc'].toFixed(2), " %"), /*#__PURE__*/React.createElement("div", {
      class: "fs-06"
    }, best['dt']))))));
  }

}