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
            length = getRandomInt(5, 10);
        for (var i = 0; i < length; i++) {
            data.push({
                "name": "Item" + (i + 1),
                "color": getRandomColor(),
                "value": getRandom(100, 2000)
            });
        }

        return data;
    };

    function createLegendItem(name, color, type) {
        type = type || 'circle';
        return '<li class="chart-legend_item"><span class="chart-legend_' + type + '" style="background: '+color+'"></span><span class="chart-legend_text">'+name+'</span></li>';
    };

    var $chart_bar = $('.chart-canvas');
    if (!$chart_bar.length)return;
    var $container = $chart_bar.closest('.home-indicators_item');
    if (!$container.length)$container = $chart_bar.closest('ul');
    var $legend = $container.find('.chart-legend .home-indicators-legend_content');
    if (!$legend.length) $legend = $container.find('.chart-legend');
    $legend.empty();

    var chartData = generateData();

    $.each(chartData, function(cid){
        var item = createLegendItem(this.name, this.color, 'circle');
        if (parseInt(cid)){
            $legend.prepend(item);
        } else {
            $legend.append(item);
        }
    });

    initRoundChart3D({
        "dataObj": chartData
    });
});