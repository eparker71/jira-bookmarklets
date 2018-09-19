function toFixed(num, fixed) {
  var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
  return num.toString().match(re)[0];
}

function transform(num, max) {
  return toFixed(max - num, 2);
}

var total = 0;
var a = [];
var b = [];

$('table.aui.ghx-auto tr td:nth-child(3)').each(function(i) {
  a.push(Number($(this).text()));
});

var elementExists = document.getElementById("v-0");
if (!elementExists) {
  $('table.aui.ghx-auto tr').each(function(i) {
    if (i == 0) {
      $(this).append('<th id="v-' + i + '" class="ghx-right"></th>');
    } else {
      if (i > 2) {
        $(this).append('<td id="v-' + i + '" class="ghx-right highlight"></td>');
      } else {
        $(this).append('<td id="v-' + i + '" class="ghx-right"></td>');
      }
    }
  });
}

for (var i = 0; i <= a.length - 3; i++) {
  for (var y = 0; y <= 2; y++) {
    total += a[i + y];
  }
  b.push(total / 3);
  total = 0;
}

var max_chart_height = 300;
var max_chart_width = 450;
var max_graph_height = max_chart_height * 0.8;
var max_graph_width = max_chart_width * 0.8;
const c = b.map(x => transform(x * 1.8, max_graph_height));
const d = b.map(x => toFixed(x, 2));
var max_graph_height = max_chart_height * 0.8;
var max_graph_width = max_chart_width * 0.8;
var graph_x_increment = toFixed(max_graph_width / 5, 0);
var graph_y_increment = toFixed(max_graph_height / 3, 0);
var graph_ylable_pos = max_graph_height + 15;
var min_graph_x = max_chart_width / 10;
var graph_y_label_pos = min_graph_x - 15;
var dataOffset = parseInt(min_graph_x, 10) + parseInt(graph_x_increment, 10);
var svg = '';
$('#v-0').text('Velocity');
$('#v-3').text(d[0]);
$('#v-4').text(d[1]);
$('#v-5').text(d[2]);
$('#v-6').text(d[3]);
$('#v-7').text(d[4]);

$('table.aui.ghx-auto tr:nth-child(1) td:nth-child(3)').addClass("g1");
$('table.aui.ghx-auto tr:nth-child(2) td:nth-child(3)').addClass("g1 g2");
$('table.aui.ghx-auto tr:nth-child(3) td:nth-child(3)').addClass("g1 g2 g3");
$('table.aui.ghx-auto tr:nth-child(4) td:nth-child(3)').addClass("g2 g3 g4");
$('table.aui.ghx-auto tr:nth-child(5) td:nth-child(3)').addClass("g3 g4 g5");
$('table.aui.ghx-auto tr:nth-child(6) td:nth-child(3)').addClass("g4 g5");
$('table.aui.ghx-auto tr:nth-child(7) td:nth-child(3)').addClass("g5");

svg += '<svg version="1.2" xmlns="http://www.w3.org/2000/svg"';
svg += ' xmlns:xlink="http://www.w3.org/1999/xlink" style="height: ' + max_chart_height + 'px;width: ' + max_chart_width + 'px;padding-left:50"';
svg += ' aria-labelledby="title" role="img" id="velocity-chart">';
svg += ' <title id="title">Change In Velocity</title>';
svg += ' <g style="stroke: #ccc;stroke-dasharray: 0;stroke-width: 1;" id="yGrid">';
svg += '  <line x1="' + min_graph_x + '" x2="' + min_graph_x + '" y1="' + graph_y_increment + '" y2="' + max_graph_height + '"></line>';
svg += ' </g>';
svg += ' <g style="stroke: #ccc;stroke-dasharray: 0;stroke-width: 1;" id="xGrid">';
svg += '  <line x1="' + min_graph_x + '" x2="' + max_graph_width + '" y1="' + max_graph_height + '" y2="' + max_graph_height + '"></line>';
svg += ' </g>';
svg += ' <g style="text-anchor: middle;">';
svg += '  <text x="' + max_graph_width / 2 + '" y="' + graph_ylable_pos + '" style="font-weight: bold;text-transform: uppercase;font-size: 12px;fill: black;">&Delta; in Velocity</text>';
svg += '</g>';
svg += '<g style="text-anchor: end;">';
svg += '  <text x="' + graph_y_label_pos + '" y="' + graph_y_increment + '">100</text>';
svg += '  <text x="' + graph_y_label_pos + '" y="' + graph_y_increment * 2 + '">50</text>';
svg += '  <text x="' + graph_y_label_pos + '" y="' + graph_y_increment * 3 + '">0</text>';
svg += '</g>';
svg += '<g style="fill: red;stroke-width: 1;" data-setname="Our first data set">';
svg += '<polyline fill="none" stroke="#0074d9" stroke-width="3" ';
svg += 'points="';
svg += ' ' + min_graph_x + ',' + c[0] + ' ';
svg += ' ' + dataOffset + ',' + c[1] + ' ';
var x;
var tmp = dataOffset;
for (x = 2; x < c.length; x++) {
  tmp += parseInt(graph_x_increment, 10);
  svg += ' ' + tmp + ',' + c[x] + ' ';
}
svg += '"/>';
var textOffset = parseInt(c[0], 10) - 10;
svg += '<circle cx="' + min_graph_x + '" cy=' + c[0] + ' data-value="' + d[0] + '" r="4"></circle>';
svg += '<text x="' + min_graph_x + '" y=' + textOffset + '>' + d[0] + '</text>';
textOffset = parseInt(c[1], 10) - 10;
svg += '<circle cx="' + dataOffset + '" cy=' + c[1] + ' data-value="' + d[1] + '" r="4"></circle>';
svg += '<text x="' + dataOffset + '" y=' + textOffset + '>' + d[1] + '</text>';
textOffset = parseInt(c[2], 10) - 10;
dataOffset += parseInt(graph_x_increment, 10);
svg += '<circle cx="' + dataOffset + '" cy=' + c[2] + ' data-value="' + d[2] + '" r="4"></circle>';
svg += '<text x="' + dataOffset + '" y=' + textOffset + '>' + d[2] + '</text>';
textOffset = parseInt(c[3], 10) - 10;
dataOffset += parseInt(graph_x_increment, 10);
svg += '<circle cx="' + dataOffset + '" cy=' + c[3] + ' data-value="' + d[3] + '" r="4"></circle>';
svg += '<text x="' + dataOffset + '" y=' + textOffset + '>' + d[3] + '</text>';
textOffset = parseInt(c[4], 10) - 10;
dataOffset += parseInt(graph_x_increment, 10);
svg += '<circle cx="' + dataOffset + '" cy=' + c[4] + ' data-value="' + d[4] + '" r="4"></circle>';
svg += '<text x="' + dataOffset + '" y=' + textOffset + '>' + d[4] + '</text>';
svg += '</g></svg>';
$('#ghx-chart-data table').css('float', 'left');
var chartExists = document.getElementById("velocity-chart");
if (!chartExists) {
  $('#ghx-chart-data').append(svg);

  $(document).ready(function() {
    $('.highlight').mouseover(function() {
      var id = $(this).attr('id');
      var gnum = parseInt(id.split("-")[1]) - 2;
      $(this).css('background-color', '#ffffbb');
      $('.g' + gnum).css('background-color', '#ffeebd');
    }).mouseout(function() {
      var id = $(this).attr('id');
      var gnum = parseInt(id.split("-")[1]) - 2;
      $(this).css('background-color', 'white');
      $('.g' + gnum).css('background-color', 'white');
    });
  });
}
