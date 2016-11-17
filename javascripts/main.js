$(document).ready(function() {

    function getRandom(min, max) {
        return Math.random() * (max - min) + min;
    }
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    function getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    function generateData() {
        var data = [],
            length = 10;
        for (var i = 0; i < length; i++) {
            if (i != getRandomInt(0, 9)) {
                data.push({
                    "name": "Item" + (i + 1),
                    "color": getRandomColor(),
                    "value": getRandom(100, 2000)
                });
            }
        }

        return data;
    };

    function createLegendItem(name, color, type) {
        type = type || 'circle';
        return '<li class="chart-legend_item"><span class="chart-legend_' + type + '" style="background: '+color+'"></span><span class="chart-legend_text">'+name+'</span></li>';
    };


    function drawChart() {
        var $chart_bar = $('.chart-canvas');
        if (!$chart_bar.length)return;
        var $container = $chart_bar.closest('.home-indicators_item');
        if (!$container.length)$container = $chart_bar.closest('ul');
        var $legend = $container.find('.chart-legend .home-indicators-legend_content');
        if (!$legend.length) $legend = $container.find('.chart-legend');
        $legend.empty();

        var chartData = generateData();

        // сортируем по убыванию, чтобы вывести легенду
        var legendData = chartData.slice(0).sort(function(a, b) {
            if (a.end_sum > b.end_sum) {
                return -1;
            } else if (a.end_sum < b.end_sum) {
                return 1;
            } else {
                return 0;
            }
        });

        $.each(legendData, function(index){
            var item = createLegendItem(this.name, this.color, 'circle');
            $legend.append(item);
        });

        initRoundChart3D({
            "dataObj": chartData
        });
    }

    drawChart();

    $('.button-update-chart').on('click', function(e) {
        e.preventDefault();

        drawChart();
    });
});