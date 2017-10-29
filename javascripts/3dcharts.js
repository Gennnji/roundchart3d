(function() {

    $(function() {

        var drawChart, responsiveChart;

        !function () {
            var RoundChart3D = {},
                minLabelPadAngle = 0.4;

            // возвращает уникальный ключ для элемента в наборе
            function idFunc(d) {
                return d.data.name;
            }

            function mergeWithFirstEqualZero(first, second){
                var secondSet = d3.set();

                second.forEach(function (d) {
                    secondSet.add(d.name);
                });

                var onlyFirst = first
                    .filter(function (d){ return !secondSet.has(d.name) })
                    .map(function (d) { d.value = 0; return d; });
                return d3.merge([ second, onlyFirst ]);
            }

            // возвращает true, если указанный угол находится в пределах двух других
            function angleIsBetween(angle, startAngle, endAngle) {
                if (angle >= Math.PI * 2) {
                    angle /= Math.PI * 2;
                }
                if (startAngle >= Math.PI * 2) {
                    startAngle /= Math.PI * 2;
                }
                if (endAngle >= Math.PI * 2) {
                    endAngle /= Math.PI * 2;
                }
                return angle >= startAngle && angle <= endAngle;
            }

            function getSectorParams(d, rx, ry, depth, ir, outerHiddenAngles, innerPadding) {

                var result = {};

                result.depth = {
                    x: depth * Math.cos(-.3),
                    y: depth * Math.sin(-.3)
                };
                result.innerRadius = {
                    x: ir * rx,
                    y: ir * ry
                };
                result.outerRadius = {
                    x: innerPadding * rx + rx,
                    y: innerPadding * ry + ry
                };
                result.innerPadding = {
                    x: innerPadding * rx * Math.cos(d.midAngle),
                    y: innerPadding * ry * Math.sin(d.midAngle)
                };
                result.outerArcStart = {
                    x: result.outerRadius.x * Math.cos(d.startAngle),
                    y: result.outerRadius.y * Math.sin(d.startAngle)
                };
                result.outerArcEnd = {
                    x: result.outerRadius.x * Math.cos(d.endAngle),
                    y: result.outerRadius.y * Math.sin(d.endAngle)
                };
                result.innerArcStart = {
                    x: innerPadding * rx * Math.cos(d.midAngle),
                    y: innerPadding * ry * Math.sin(d.midAngle)
                };
                result.innerArcEnd = {
                    x: innerPadding * rx * Math.cos(d.midAngle),
                    y: innerPadding * ry * Math.sin(d.midAngle)
                };

                return result;
            }

            function pieTop(d, rx, ry, depth, ir, outerHiddenAngles, innerPadding) {

                if (d.endAngle - d.startAngle == 0 ) {
                    return "M 0 0";
                }

                var sector = getSectorParams(d, rx, ry, depth, ir, outerHiddenAngles, innerPadding),
                    ret = [];

                // внешняя дуга
                ret.push("M", sector.outerArcStart.x, sector.outerArcStart.y);
                ret.push("A", sector.outerRadius.x, sector.outerRadius.y, "0", (d.endAngle-d.startAngle > Math.PI? 1: 0), "1", sector.outerArcEnd.x, sector.outerArcEnd.y);
                ret.push("L", sector.innerArcEnd.x, sector.innerArcEnd.y);

                // внутренняя дуга
                // ret.push("A", sector.innerRadius.x, sector.innerRadius.y, "0", (d.endAngle-d.startAngle > Math.PI? 1: 0), "0", sector.innerArcStart.x, sector.innerArcStart.y);
                ret.push("Z");
                return ret.join(" ");
            }
            function pieBottom(d, rx, ry, depth, ir, outerHiddenAngles, innerPadding) {

                if (d.endAngle - d.startAngle == 0 ) {
                    return "M 0 0";
                }

                var sector = getSectorParams(d, rx, ry, depth, ir, outerHiddenAngles, innerPadding),
                    ret = [];

                // внешняя дуга
                ret.push("M", sector.depth.x + sector.outerArcStart.x, sector.depth.y + sector.outerArcStart.y);
                ret.push("A", sector.outerRadius.x, sector.outerRadius.y, "0", (d.endAngle-d.startAngle > Math.PI? 1: 0), "1", sector.depth.x + sector.outerArcEnd.x, sector.depth.y + sector.outerArcEnd.y);
                ret.push("L", sector.depth.x + sector.innerArcEnd.x, sector.depth.y + sector.innerArcEnd.y);

                // внутренняя дуга
                // ret.push("A", innerRadius.x, innerRadius.y, "0", (d.endAngle-d.startAngle > Math.PI? 1: 0), "0", innerArcStart.x, innerArcStart.y);
                ret.push("Z");
                return ret.join(" ");
            }

            function pieOuter(d, rx, ry, depth, ir, outerHiddenAngles, innerPadding) {

                if (d.endAngle - d.startAngle == 0 ) {
                    return "M 0 0";
                }

                var startAngle = d.startAngle,
                    endAngle = d.endAngle,
                    sector = getSectorParams(d, rx, ry, depth, ir, outerHiddenAngles, innerPadding),
                    ret = [];

                ret.push("M", sector.depth.x + sector.outerArcStart.x, sector.depth.y + sector.outerArcStart.y);
                ret.push("A", sector.outerRadius.x, sector.outerRadius.y, "0", (d.endAngle-d.startAngle > Math.PI? 1: 0), "1", sector.depth.x + sector.outerArcEnd.x, sector.depth.y + sector.outerArcEnd.y);
                ret.push("L", sector.outerArcEnd.x, sector.outerArcEnd.y);
                ret.push("A", sector.outerRadius.x, sector.outerRadius.y, "0", (d.endAngle-d.startAngle > Math.PI? 1: 0), "0", sector.outerArcStart.x, sector.outerArcStart.y);
                ret.push("Z");
                return ret.join(" ");
            }

            // первая боковая сторона сектора
            function pieSide1(d, rx, ry, depth, ir, outerHiddenAngles, innerPadding) {

                if (d.endAngle - d.startAngle == 0 ) {
                    return [0, 0];
                }

                var sector = getSectorParams(d, rx, ry, depth, ir, outerHiddenAngles, innerPadding),
                    ret = [
                        sector.depth.x + sector.outerArcStart.x, sector.depth.y + sector.outerArcStart.y,
                        sector.depth.x + sector.innerPadding.x, sector.depth.y + sector.innerPadding.y,
                        sector.innerPadding.x, sector.innerPadding.y,
                        sector.outerArcStart.x, sector.outerArcStart.y
                    ];
                return ret.join(" ");
            }
            // вторая боковая сторона сектора
            function pieSide2(d, rx, ry, depth, ir, outerHiddenAngles, innerPadding) {

                if (d.endAngle - d.startAngle == 0 ) {
                    return [0, 0];
                }

                var sector = getSectorParams(d, rx, ry, depth, ir, outerHiddenAngles, innerPadding),
                    ret = [
                        sector.depth.x + sector.outerArcEnd.x, sector.depth.y + sector.outerArcEnd.y,
                        sector.depth.x + sector.innerPadding.x, sector.depth.y + sector.innerPadding.y,
                        sector.innerPadding.x, sector.innerPadding.y,
                        sector.outerArcEnd.x, sector.outerArcEnd.y
                    ];
                return ret.join(" ");
            }

            // внутренная сторона (пока не используется)
            function pieInner(d, rx, ry, depth, ir, outerHiddenAngles, innerPadding){

                if (d.endAngle - d.startAngle == 0 ) {
                    return "M 0 0";
                }

                var startAngle = (d.startAngle < Math.PI ? Math.PI : d.startAngle),
                    endAngle = (d.endAngle < Math.PI ? Math.PI : d.endAngle);

                var sx = ir*rx*Math.cos(startAngle),
                    sy = ir*ry*Math.sin(startAngle),
                    ex = ir*rx*Math.cos(endAngle),
                    ey = ir*ry*Math.sin(endAngle);

                var ret = [];
                ret.push("M",sx, sy);
                ret.push("A",ir*rx,ir*ry,"0 0 1",ex,ey);
                ret.push("L",ex,depth+ey);
                ret.push("A",ir*rx, ir*ry,"0 0 0",sx,depth+sy);
                ret.push("Z");
                return ret.join(" ");
            }

            // возвращает координаты центра сектора
            function linePoints(d, rx, ry, depth, ir, innerPadding) {
                var points = [], x, y;

                // начало внутри сектора
                points.push([
                    rx * 0.8 * Math.cos(d.midAngle),
                    ry * 0.8 * Math.sin(d.midAngle)
                ]);

                // следущая точка за пределами сектора
                x = rx * 1.15* Math.cos(d.outerMidAngle);
                y = ry * 1.15 * Math.sin(d.outerMidAngle);
                points.push([x, y]);

                // следущая точка за пределами сектора и на той же высоте, что и предыдущая, но подальше
                x += x / Math.abs(x) * 80;
                points.push([x, y]);

                return points;
            }

            function getPercent(d) {
                if (d.padAngle && d.data.value) {
                    d.startAngle -= d.padAngle / 2;
                    d.endAngle += d.padAngle / 2;
                }
                return Math.round(1000*(d.endAngle-d.startAngle)/(Math.PI*2))/10+'%';
            }

            function moveSectorTo(sector, translateX, translateY) {
                this
                    .transition()
                        .attr('transform', 'translate(' + translateX + ', ' + translateY + ')');
            }
            // выделяет сектор
            function focusSector() {
                this
                    .style('fill', function (d) {
                        return d3.hsl(d3.select(this).style('fill')).brighter(0.3);
                    })
                    .each(function (d) {
                        // если сектор сейчас не меняет свою форму
                        // if (!this.__transition__) {
                            d3.select(this).call(
                                moveSectorTo,
                                20 * Math.cos(d.midAngle),
                                20 * Math.sin(d.midAngle)
                            );
                        // }
                    });
            }
            // возвращает сектор в исходное состояние
            function blurSector() {
                this
                    .style('fill', function (d) {
                        return d3.hsl(d3.select(this).style('fill')).darker(0.3);
                    })
                    .call(moveSectorTo, 0, 0);
            }

            function mouseenterTooltip(d) {

                var coordinateTooltip, heightTooltip, tooltip, widthTooltip, widthWindow,
                    $this = $(this),
                    $parent = $this.closest('.slices'),
                    id = $this.data('id');

                $parent.children(
                    '.slice__top[data-id="' + id + '"],' +
                    '.slice__bottom[data-id="' + id + '"],' +
                    '.slice__inner[data-id="' + id + '"],' +
                    '.slice__outer[data-id="' + id + '"],' +
                    '.slice__side1[data-id="' + id + '"],' +
                    '.slice__side2[data-id="' + id + '"]'
                )
                    .css("cursor", "pointer")
                    .each(function () {
                        d3.select(this).call(focusSector);
                    });

                tooltip = d3.select(".chart .chart-tooltip_wrap");
                tooltip.select(".chart .chart-tooltip_name").text(d.data.name);
                widthTooltip = $(".chart .chart-tooltip_wrap").innerWidth();
                heightTooltip = $(".chart .chart-tooltip_wrap").height();
                coordinateTooltip = d3.event.pageX;
                widthWindow = $(window).width();

                tooltip.style("left", d3.event.pageX - $(".chart .chart-tooltip_wrap").outerWidth() / 2 + "px");
                tooltip.style("top", d3.event.pageY - heightTooltip - 30 + "px").style("display", "block");
            };
            function mouseleaveTooltip(d) {
                var $this = $(this),
                    $parent = $this.closest('.slices'),
                    id = $this.data('id');

                $parent.children(
                    '.slice__top[data-id="' + id + '"],' +
                    '.slice__bottom[data-id="' + id + '"],' +
                    '.slice__inner[data-id="' + id + '"],' +
                    '.slice__outer[data-id="' + id + '"],' +
                    '.slice__side1[data-id="' + id + '"],' +
                    '.slice__side2[data-id="' + id + '"]'
                )
                    .attr("opacity", 1)
                    .each(function () {
                        d3.select(this).call(blurSector);
                    });

                d3.select(".chart .chart-tooltip_wrap").style("display", "none");
            };


            RoundChart3D.transition = function (id, data, init, rx, ry, depth, ir, outerHiddenAngles, innerPadding, padAngle){
                function arcTweenInner(a) {
                    var i = d3.interpolate(this._current, a);
                    this._current = i(0);
                    return function (t) { return pieInner(i(t), rx, ry, depth, ir, outerHiddenAngles, innerPadding);    };
                }
                function arcTweenOuter(a) {
                    var i = d3.interpolate(this._current, a);
                    this._current = i(0);
                    return function (t) { return pieOuter(i(t), rx, ry, depth, ir, outerHiddenAngles, innerPadding);    };
                }
                function arcTweenTop(a) {
                    var i = d3.interpolate(this._current, a);
                    this._current = i(0);
                    return function (t) { return pieTop(i(t), rx, ry, depth, ir, outerHiddenAngles, innerPadding);    };
                }
                function arcTweenBottom(a) {
                    var i = d3.interpolate(this._current, a);
                    this._current = i(0);
                    return function (t) { return pieBottom(i(t), rx, ry, depth, ir, outerHiddenAngles, innerPadding);    };
                }
                function arcTweenSide1(a) {
                    var i = d3.interpolate(this._current, a);
                    this._current = i(0);
                    return function (t) { return pieSide1(i(t), rx, ry, depth, ir, outerHiddenAngles, innerPadding);    };
                }
                function arcTweenSide2(a) {
                    var i = d3.interpolate(this._current, a);
                    this._current = i(0);
                    return function (t) { return pieSide2(i(t), rx, ry, depth, ir, outerHiddenAngles, innerPadding);    };
                }

                function lineTweenPoints(a) {
                    var i = d3.interpolate(this._current, a);
                            irx = d3.interpolate(init ? 0 : rx, rx);
                            iry = d3.interpolate(init ? 0 : ry, ry);
                    this._current = i(0);
                    return function (t) {
                        // получаем точки для линии и запоминаем их
                        var points = linePoints(i(t), irx(t), iry(t), depth, ir, innerPadding);
                        return points.join(',');
                    };
                }
                function lineCircleTweenCx(a) {
                    var i = d3.interpolate(this._current, a);
                            irx = d3.interpolate(init ? 0 : rx, rx);
                            iry = d3.interpolate(init ? 0 : ry, ry);
                    this._current = i(0);
                    return function (t) {
                        // получаем точки для линии
                        var points = linePoints(i(t), irx(t), iry(t), depth, ir, innerPadding);
                        // и получаем конечную
                        var lastPoint = points.pop();
                        return lastPoint[0];
                    };
                }
                function lineCircleTweenCy(a) {
                    var i = d3.interpolate(this._current, a);
                            irx = d3.interpolate(init ? 0 : rx, rx);
                            iry = d3.interpolate(init ? 0 : ry, ry);
                    this._current = i(0);
                    return function (t) {
                        // получаем точки для линии
                        var points = linePoints(i(t), irx(t), iry(t), depth, ir, innerPadding);
                        // и получаем конечную
                        var lastPoint = points.pop();
                        return lastPoint[1];
                    };
                }
                function textTweenX(a) {
                    var i = d3.interpolate(this._current, a);
                            irx = d3.interpolate(init ? 0 : rx, rx);
                            iry = d3.interpolate(init ? 0 : ry, ry);
                    this._current = i(0);
                    return function (t) {
                        // получаем точки для линии
                        var points = linePoints(i(t), irx(t), iry(t), depth, ir, innerPadding);
                        // и получаем конечную
                        var lastPoint = points.pop();
                        return lastPoint[0] > 0 ? lastPoint[0]+10 : lastPoint[0]-10;
                    };
                }
                function textTweenY(a) {
                    var i = d3.interpolate(this._current, a);
                            irx = d3.interpolate(init ? 0 : rx, rx);
                            iry = d3.interpolate(init ? 0 : ry, ry);
                    this._current = i(0);
                    return function(t) {
                        // получаем точки для линии
                        var points = linePoints(i(t), irx(t), iry(t), depth, ir, innerPadding);
                        // и получаем конечную
                        var lastPoint = points.pop();
                        return lastPoint[1];
                    };
                }
                function textTweenAnchor(a) {
                    var i = d3.interpolate(this._current, a);
                            irx = d3.interpolate(init ? 0 : rx, rx);
                            iry = d3.interpolate(init ? 0 : ry, ry);
                    this._current = i(0);
                    return function (t) {
                        // получаем точки для линии
                        var points = linePoints(i(t), irx(t), iry(t), depth, ir, innerPadding);
                        // и получаем конечную
                        var lastPoint = points.pop();
                        return lastPoint[0] > 0 ? 'start' : 'end';
                    };
                }

                var _data = prepareData(data, false, padAngle);

                var chart = d3.select('#'+id),
                    slices = chart.select('.slices'),
                    transitionDelay,
                    transitionDuration,
                    slices,
                    slicesBottom,
                    slicesInner,
                    slicesSide1,
                    slicesSide2,
                    slicesTop,
                    slicesOuter,
                    lines,
                    linesCircle,
                    linesPercent;

                // для первого запуска анимируем все сектора последовательно
                if (init) {
                    transitionDelay = function (d, i) {
                        return i * 150;
                    };
                    transitionDuration = 160;

                // для последующих анимируем синхронно
                } else {
                    transitionDelay = 0;
                    transitionDuration = 750;
                }

                function opacityHandler(d) {
                    return (d == null || !d.value) ? 0 : 1;
                }
                function commonTransition(transition) {
                    transition
                        .delay(transitionDelay)
                        .duration(transitionDuration)
                        .attr('opacity', opacityHandler);
                }

                // получаем текущие данные в диаграмме
                var currentData = slices.selectAll('.slice__bottom').data().map(function (d) { return d.data; });

                var _currentData = prepareData(mergeWithFirstEqualZero(currentData, data), false, padAngle),
                    _data = prepareData(data, false, padAngle);

                var blocks,
                    transition,
                    funcType,
                    func,
                    blocksConfig = {};

                // нижние стороны (для просвечивания)
                blocksConfig['.slice__bottom'] = {
                    'd': {
                        'funcType': "attrTween",
                        'func': arcTweenBottom
                    }
                };
                if (ir) {
                    // внутренние стороны, если задан внутренний радиус
                    blocksConfig['.slice__bottom'] = {
                        'd': {
                            'funcType': "attrTween",
                            'func': arcTweenInner
                        }
                    };
                }
                // первые боковые стороны
                blocksConfig['.slice__side1'] = {
                    'points': {
                        'funcType': "attrTween",
                        'func': arcTweenSide1
                    }
                };
                // вторые боковые стороны
                blocksConfig['.slice__side2'] = {
                    'points': {
                        'funcType': "attrTween",
                        'func': arcTweenSide2
                    }
                };
                // внешние стороны
                blocksConfig['.slice__outer'] = {
                    'd': {
                        'funcType': "attrTween",
                        'func': arcTweenOuter
                    }
                };
                // верхние стороны
                blocksConfig['.slice__top'] = {
                    'd': {
                        'funcType': "attrTween",
                        'func': arcTweenTop
                    }
                };

                // линии надписей
                blocksConfig['.line'] = {
                    'points': {
                        'funcType': "attrTween",
                        'func': lineTweenPoints
                    }
                };
                // кружки надписей
                blocksConfig['.line__circle'] = {
                    'cx': {
                        'funcType': "attrTween",
                        'func': lineCircleTweenCx
                    },
                    'cy': {
                        'funcType': "attrTween",
                        'func': lineCircleTweenCy
                    }
                };
                // сами надписи
                blocksConfig['.line__percent'] = {
                    'x': {
                        'funcType': "attrTween",
                        'func': textTweenX
                    },
                    'y': {
                        'funcType': "attrTween",
                        'func': textTweenY
                    },
                    'text-anchor': {
                        'funcType': "attrTween",
                        'func': textTweenAnchor
                    },
                    'text': {
                        'funcType': "tween",
                        'func': function (a) {
                            var i = d3.interpolate(this._current, a);
                            this._current = i(0);
                            return function (t) {
                                d3.select(this).text(getPercent(i(t)));
                            }
                        }
                    }
                };

                for (var selector in blocksConfig) {
                    blocks = slices.selectAll(selector).data(_currentData, idFunc);
                    // TODO: namespace решил проблему, но непонятно почему
                    transition = blocks.transition('change-shape')
                        .call(commonTransition);

                    for (var attrName in blocksConfig[selector]) {
                        funcType = blocksConfig[selector][attrName]['funcType'];
                        func = blocksConfig[selector][attrName]['func'];
                        transition[funcType](attrName, func);
                    }

                    blocks = slices.selectAll(selector).data(_data, idFunc);
                    blocks.exit().transition()
                        .delay(transitionDuration).duration(0);
                }
            }

            RoundChart3D.draw = function (id, data, init, x/*center x*/, y/*center y*/,
                    rx/*radius x*/, ry/*radius y*/, depth, ir/*inner radius*/,
                    outerHiddenAngles/*углы в пределах которых внешние стороны не видны*/,
                    innerPadding/*inner padding*/,
                    padAngle/*размера угла интервала между секторами*/
            ){

                function commonHandler() {
                    this
                        .attr('opacity', 0)
                        // задаём id в data-параметре
                        .attr('data-id', function (d) {
                            return d.data.name;
                        })
                        .each(function (d) {
                            this._current = d;
                        });
                }
                function mouseHandler() {
                    this
                        .on('mouseenter', mouseenterTooltip)
                        .on('mouseleave', mouseleaveTooltip);
                }

                var slices,
                    slicesBottom,
                    slicesInner,
                    slicesSide1,
                    slicesSide2,
                    slicesTop,
                    slicesOuter,
                    lines,
                    linesCircle,
                    linesPercent;

                var chart = d3.select("#"+id);

                slices = chart.selectAll('.slices');

                if (slices.empty()) {
                    slices = chart.append("g")
                        .attr("transform", "translate(" + x + "," + y + ")")
                        .attr("class", "slices");
                }

                // получаем текущие данные в диаграмме
                // var currentData = slices.selectAll('.slice__bottom').data().map(function(d) { return d.data; });

                // var _currentData = prepareData(mergeWithFirstEqualZero(currentData, data), false, padAngle),
                    var _data = prepareData(data, init, padAngle);

                // нижние стороны (для просвечивающего выделения)
                slicesBottom = slices.selectAll('.slice__bottom').data(_data, idFunc);
                slicesBottom.enter()
                    .append("path")
                        .attr("class", "slice__bottom")
                        .style("stroke", function (d) { return d.data.color; })
                        .style("stroke-width", 1)
                        .style("fill", function (d) { return d.data.color; })
                        .attr("d",function (d) { return pieBottom(d, rx, ry, depth, ir, outerHiddenAngles, innerPadding);})
                        .call(commonHandler);

                if (ir) {
                    // внутренние стороны (для кольцевой диаграммы)
                    slicesInner = slices.selectAll('.slice__inner').data(_data, idFunc);
                    slicesInner.enter()
                        .append("path")
                            .attr("class", "slice__inner")
                            .style("fill", function (d) { return d3.hsl(d.data.color).darker(0.7); })
                            .attr("d",function (d) { return pieInner(d, rx, ry, depth, ir, outerHiddenAngles, innerPadding);})
                            .call(commonHandler)
                            .call(mouseHandler);
                }

                // первая боковая сторона
                slicesSide1 = slices.selectAll('.slice__side1').data(_data, idFunc);
                slicesSide1.enter()
                    .append("polygon")
                        .attr("class", "slice__side1")
                        .style("fill", function (d) { return d3.hsl(d.data.color).darker(0.7); })
                        .attr("points", function (d) { return pieSide1(d, rx, ry, depth, ir, outerHiddenAngles, innerPadding); })
                        .call(commonHandler)
                        .call(mouseHandler);

                // вторая боковая сторона
                slicesSide2 = slices.selectAll('.slice__side2').data(_data, idFunc);
                slicesSide2.enter()
                    .append("polygon")
                        .attr("class", "slice__side2")
                        .style("fill", function (d) { return d3.hsl(d.data.color).darker(0.7); })
                        .attr("points", function (d) { return pieSide2(d, rx, ry, depth, ir, outerHiddenAngles, innerPadding); })
                        .call(commonHandler)
                        .call(mouseHandler);

                // внешние стороны
                slicesOuter = slices.selectAll('.slice__outer').data(_data, idFunc);
                slicesOuter.enter()
                    .append("path")
                        .attr("class", "slice__outer")
                        .style("fill", function (d) { return d3.hsl(d.data.color).darker(0.7); })
                        .attr("d", function (d) { return pieOuter(d, rx, ry, depth, ir, outerHiddenAngles, innerPadding); })
                        .call(commonHandler)
                        .call(mouseHandler);

                // верхние стороны
                slicesTop = slices.selectAll('.slice__top').data(_data, idFunc);
                slicesTop.enter()
                    .append("path")
                        .attr("class", "slice__top")
                        .style("stroke", function (d) { return d.data.color; })
                        .style("stroke-width", 1)
                        .style("fill", function (d) { return d.data.color; })
                        .attr("d",function (d) { return pieTop(d, rx, ry, depth, ir, outerHiddenAngles, innerPadding);})
                        .call(commonHandler)
                        .call(mouseHandler);

                // линии надписей
                lines = slices.selectAll('.line').data(_data, idFunc);
                lines.enter()
                    .append("polyline")
                        .attr("class", "line")
                        .attr('fill', 'none')
                        .attr('stroke-width', 1)
                        .attr('stroke', 'lightgray')
                        .attr("points", function (d) {
                            // получаем точки для линии и запоминаем их
                            var points = linePoints(d, rx, ry, depth, ir, innerPadding, init);
                            return points.join(',');
                        })
                        .call(commonHandler);

                // круги надписей
                linesCircle = slices.selectAll('.line__circle').data(_data, idFunc);
                linesCircle.enter()
                    .append("circle")
                        .attr("class", "line__circle")
                        .attr("fill", function (d) { return d.data.color; })
                        .each(function (d) {
                            // получаем точки для линии
                            var points = linePoints(d, rx, ry, depth, ir, innerPadding, init);
                            // и получаем конечную
                            var lastPoint = points.pop();
                            d3.select(this).attr({
                                'cx': lastPoint[0],
                                'cy': lastPoint[1],
                                'r': 7.5,
                                'stroke': 'none',
                                'stroke-width': 0
                            });
                        })
                        .call(commonHandler);

                // надписи
                linesPercent = slices.selectAll('.line__percent').data(_data, idFunc);
                linesPercent.enter()
                    .append("text")
                        .attr("class", "line__percent")
                        .each(function (d) {
                            // получаем точки для линии
                            var points = linePoints(d, rx, ry, depth, ir, innerPadding, init);
                            // и получаем конечную
                            var lastPoint = points.pop();
                            d3.select(this).attr({
                                'x': lastPoint[0] > 0 ? lastPoint[0]+10 : lastPoint[0]-10,
                                'y': lastPoint[1],
                                'dy': ".35em",
                                'text-anchor': lastPoint[0] > 0 ? 'start' : 'end'
                            })
                            .style("font", "14px 'PlumbMedium',sans-serif");
                        })
                        .text(getPercent)
                        .call(commonHandler);
            }

            this.RoundChart3D = RoundChart3D;
        }();

        // возвращает начальный и конечный углы сектора, в пределах которого не видны внешние стороны секторов
        function getOuterHiddenAngles(zAngle) {
            depthAngle = -2;
            zAngle += depthAngle;
            switch (true) {
                case zAngle > 0 && zAngle < 1/2*Math.PI || zAngle > 3/2*Math.PI && zAngle < 2*Math.PI:
                    return {
                        startAngle: 1/2*Math.PI + depthAngle,
                        endAngle: 1/2*Math.PI + Math.PI + depthAngle
                    };
                case zAngle > 1/2*Math.PI && zAngle < 3/2*Math.PI:
                    return {
                        startAngle: 3/2*Math.PI + depthAngle,
                        endAngle: 3/2*Math.PI + Math.PI + depthAngle
                    };
                // case zAngle == 0:
                default:
                    return {
                        startAngle: 0 + depthAngle,
                        endAngle: 0 + depthAngle
                    };
                // case 'bottom':
                //     return {
                //         startAngle: Math.PI * 2,
                //         endAngle: Math.PI * 2 + Math.PI
                //     };
                // case 'top':
                // default:
                //     return {
                //         startAngle: Math.PI,
                //         endAngle: Math.PI + Math.PI
                //     };
            };
        }

        function prepareData(data, isBeforeFirstTransition, padAngle) {

                // генерируем данные для чарта
            var _data = d3.layout.pie()
                .sort(null)
                .value(function (d) {
                    return d.value;
                })
                // проблемное место... пока начало диаграммы в нуле
                // .startAngle(0)
                // .startAngle(-1/2*Math.PI)
                // .endAngle(3/2*Math.PI)
                // пришлось для пустых значений вычислять пропуски без генерации
                // .padAngle(padAngle)
                (data);

            var lastMidAngle,
                minLabelPadAngle = padAngle * 2;

            // исправление недочёта D3: значение углов становится NaN, если значение из данных пустое
            _data = _data.map(function (d) {

                d.startAngle = isNaN( d.startAngle ) ? 0 : d.startAngle;
                d.endAngle = isNaN( d.endAngle ) ? 0 : d.endAngle;

                if (padAngle && d.data.value) {
                    d.padAngle = padAngle;
                    d.startAngle += d.padAngle / 2;
                    d.endAngle -= d.padAngle / 2;
                }

                // средний угол
                d.midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;

                // вычисляем углы для внешних точек надписей так, чтобы надписи не пересекались
                if (lastMidAngle && d.midAngle - lastMidAngle < minLabelPadAngle) {
                    d.outerMidAngle = d.midAngle + minLabelPadAngle;
                } else {
                    d.outerMidAngle = d.midAngle;
                }
                lastMidAngle = d.outerMidAngle;

                // если значение пустое, то и углы одинаковые
                if (!d.data.value) {
                    d.endAngle = d.startAngle;
                }
                return d;
            });

            return _data;
        }

        drawChart = function (dataset) {
            var width = 600,
                height = 450,
                // истинная толщина диаграммы (гипотенуза для вычисления радиуса по оси X)
                depth = 50,
                // угол поворота по оси Z
                // zAngle = Math.PI / 4,
                zAngle = .3,
                // узнаём видимую толщину диаграммы
                visibleDepth = depth * (zAngle ? Math.sin(Math.PI - zAngle) : 0),
                // истинный радиус диаграммы
                radius = Math.min(width, height) / 3,
                // узнаём видимый радиус по оси X после поворота на угол zAngle
                radiusX = radius * Math.cos(zAngle),
                // радиус по оси Y остаётся неизменным
                radiusY = radius,

                data = [],
                // _data = [],

                // угол между секторами
                padAngle = .07;
                innerPadding = .07,

                // флаг первого запуска
                init = false;

            // готовим данные для диаграммы и не исключаем пустые значения
            data = dataset.dataObj.reduce(function (res, d) {
                res.push({
                    name: d.name,
                    value: d.value,
                    color: d.color
                });
                return res;
            }, []);

            // узнаём, первый ли запуск
            init = d3.select(".chart-canvas").selectAll("svg").empty();

            // получаем настройки соответственно тому, в какую сторону повёрнута диаграмма
            var outerHidden = getOuterHiddenAngles('left');

            // создаём svg только в первый раз
            var svg = d3.select(".chart-canvas")
                .selectAll("svg").data([Object])
                .enter()
                    .append("svg")
                        .attr("id", "svg-chart")
                        .attr("class", "svg-chart")
                        .attr("width", width)
                        .attr("height", height)
                        .attr("viewBox", "0 0 " + width + " " + height)
                        .attr("preserveAspectRatio", "xMidYMid");

            RoundChart3D.draw("svg-chart", data, init, width / 2, height / 2, radiusX, radiusY, visibleDepth, 0, outerHidden, innerPadding, padAngle);
            RoundChart3D.transition("svg-chart", data, init, radiusX, radiusY, visibleDepth, 0, outerHidden, innerPadding, padAngle);
        }

        responsiveChart = function () {
            var aspect, chart, container;
            chart = $(".svg-chart");
            aspect = chart.width() / chart.height();
            container = $(".chart-canvas");
            $(window).on("resize", function () {
                var targetWidth;
                targetWidth = container.width();
                chart.attr("width", targetWidth);
                chart.attr("height", Math.round(targetWidth / aspect));
            }).trigger("resize");
        };
        return window.initRoundChart3D = function (data) {
            drawChart(data);
            responsiveChart();
        };
    });

}).call(this);
