(function() {
  $(function() {
    var drawChart, responsiveChart;

    // новый 3d-чарт
    // !function() {
      var RoundChart3D={};

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

      function pieTop(d, rx, ry, depth, ir, outerHiddenAngles, innerPadding){

        if (d.endAngle - d.startAngle == 0 ) return "M 0 0";

        var innerRadius = {
            x: ir * rx,
            y: ir * ry
          },
          outerRadius = {
            x: innerPadding * rx + rx,
            y: innerPadding * ry + ry
          },
          outerArcStart = {
            x: outerRadius.x * Math.cos(d.startAngle),
            y: outerRadius.y * Math.sin(d.startAngle)
          },
          outerArcEnd = {
            x: outerRadius.x * Math.cos(d.endAngle),
            y: outerRadius.y * Math.sin(d.endAngle)
          }
          innerArcStart = {
            x: innerPadding * rx * Math.cos(d.midAngle),
            y: innerPadding * ry * Math.sin(d.midAngle)
          },
          innerArcEnd = {
            x: innerPadding * rx * Math.cos(d.midAngle),
            y: innerPadding * ry * Math.sin(d.midAngle)
          };

        var ret = [];
        // внешняя дуга
        ret.push(
          "M", outerArcStart.x, outerArcStart.y,
          "A", outerRadius.x, outerRadius.y, "0", (d.endAngle-d.startAngle > Math.PI? 1: 0), "1", outerArcEnd.x, outerArcEnd.y,
          "L", innerArcEnd.x, innerArcEnd.y
        );
        // внутренняя дуга
        ret.push(
          // "A", innerRadius.x, innerRadius.y, "0", (d.endAngle-d.startAngle > Math.PI? 1: 0), "0", innerArcStart.x, innerArcStart.y,
          "Z"
        );
        return ret.join(" ");
      }
      function pieBottom(d, rx, ry, depth, ir, outerHiddenAngles, innerPadding){

        if (d.endAngle - d.startAngle == 0 ) return "M 0 0";

        var depth = {
            x: depth * Math.cos(-.3),
            y: depth * Math.sin(-.3),
          },
          innerRadius = {
            x: ir * rx,
            y: ir * ry
          },
          outerRadius = {
            x: innerPadding * rx + rx,
            y: innerPadding * ry + ry
          },
          outerArcStart = {
            x: outerRadius.x * Math.cos(d.startAngle),
            y: outerRadius.y * Math.sin(d.startAngle)
          },
          outerArcEnd = {
            x: outerRadius.x * Math.cos(d.endAngle),
            y: outerRadius.y * Math.sin(d.endAngle)
          }
          innerArcStart = {
            x: innerPadding * rx * Math.cos(d.midAngle),
            y: innerPadding * ry * Math.sin(d.midAngle)
          },
          innerArcEnd = {
            x: innerPadding * rx * Math.cos(d.midAngle),
            y: innerPadding * ry * Math.sin(d.midAngle)
          };

        var ret = [];
        // внешняя дуга
        ret.push(
          "M", depth.x + outerArcStart.x, depth.y + outerArcStart.y,
          "A", outerRadius.x, outerRadius.y, "0", (d.endAngle-d.startAngle > Math.PI? 1: 0), "1", depth.x + outerArcEnd.x, depth.y + outerArcEnd.y,
          "L", depth.x + innerArcEnd.x, depth.y + innerArcEnd.y
        );
        // внутренняя дуга
        ret.push(
          // "A", innerRadius.x, innerRadius.y, "0", (d.endAngle-d.startAngle > Math.PI? 1: 0), "0", innerArcStart.x, innerArcStart.y,
          "Z"
        );
        return ret.join(" ");
      }

      function pieOuter(d, rx, ry, depth, ir, outerHiddenAngles, innerPadding) {

        var startAngle = d.startAngle,
            endAngle = d.endAngle,
            intermediateAngle1, intermediateAngle2;

        var depth = {
            x: depth * Math.cos(-.3),
            y: depth * Math.sin(-.3),
          },
          radius = {
            x: innerPadding * rx + rx,
            y: innerPadding * ry + ry
          },
          outerArcStart = {
            x: radius.x * Math.cos(startAngle),
            y: radius.y * Math.sin(startAngle)
          },
          outerArcEnd = {
            x: radius.x * Math.cos(endAngle),
            y: radius.y * Math.sin(endAngle)
          };

        // для 3d-диаграммы добавляем промежуточные точки дугам там, где пропадают из видимости внешние стороны секторов
        if (depth) {
          intermediateAngle1 = d.startAngle < outerHiddenAngles.startAngle && d.endAngle > outerHiddenAngles.startAngle ? outerHiddenAngles.startAngle : null;
          intermediateAngle2 = d.startAngle < outerHiddenAngles.endAngle && d.endAngle > outerHiddenAngles.endAngle ? outerHiddenAngles.endAngle : null;
        }

        var ret = [];
        var parts = [
          {
            sx: outerArcStart.x,
            sy: outerArcStart.y
          }
        ];

        if (intermediateAngle1 !== null && intermediateAngle1 !== undefined) {
          parts.push({
            sx: radius.x*Math.cos(intermediateAngle1),
            sy: radius.y*Math.sin(intermediateAngle1)
          });
        }
        if (intermediateAngle2 !== null && intermediateAngle2 !== undefined) {
          parts.push({
            sx: radius.x*Math.cos(intermediateAngle2),
            sy: radius.y*Math.sin(intermediateAngle2)
          });
        }

        for (i in parts) {
          ret.push("M", depth.x + parts[i]['sx'], depth.y + parts[i]['sy']);
          if (parts[i+1]) {
            ret.push("A", radius.x, radius.y, "0 0 1", depth.x + parts[i+1]['sx'], depth.y + parts[i+1]['sy']);
            ret.push("L", parts[i+1]['sx'], parts[i+1]['sy']);
          } else {
            ret.push("A", radius.x, radius.y, "0 0 1", depth.x + outerArcEnd.x, depth.y + outerArcEnd.y);
            ret.push("L", outerArcEnd.x, outerArcEnd.y);
          }
          ret.push("A", radius.x, radius.y, "0 0 0", parts[i]['sx'], parts[i]['sy']);
        }
        ret.push("Z");

        return ret.join(" ");
      }

      // первая боковая сторона сектора
      function pieSide1(d, rx, ry, depth, ir, outerHiddenAngles, innerPadding) {

        var depth = {
            x: depth * Math.cos(-.3),
            y: depth * Math.sin(-.3),
          },
          radius = {
            x: innerPadding * rx + rx,
            y: innerPadding * ry + ry
          },
          innerPadding = {
            x: innerPadding * rx * Math.cos(d.midAngle),
            y: innerPadding * ry * Math.sin(d.midAngle)
          }
          outerArcStart = {
            x: radius.x * Math.cos(d.startAngle),
            y: radius.y * Math.sin(d.startAngle)
          };

        var ret = [
          depth.x + outerArcStart.x, depth.y + outerArcStart.y,
          depth.x + innerPadding.x, depth.y + innerPadding.y,
          innerPadding.x, innerPadding.y,
          outerArcStart.x, outerArcStart.y
        ];

        return ret.join(" ");
      }
      // вторая боковая сторона сектора
      function pieSide2(d, rx, ry, depth, ir, outerHiddenAngles, innerPadding) {

        var depth = {
            x: depth * Math.cos(-.3),
            y: depth * Math.sin(-.3),
          },
          radius = {
            x: innerPadding * rx + rx,
            y: innerPadding * ry + ry
          },
          innerPadding = {
            x: innerPadding * rx * Math.cos(d.midAngle),
            y: innerPadding * ry * Math.sin(d.midAngle)
          }
          outerArcEnd = {
            x: radius.x * Math.cos(d.endAngle),
            y: radius.y * Math.sin(d.endAngle)
          };

        var ret = [
          depth.x + outerArcEnd.x, depth.y + outerArcEnd.y,
          depth.x + innerPadding.x, depth.y + innerPadding.y,
          innerPadding.x, innerPadding.y,
          outerArcEnd.x, outerArcEnd.y
        ];

        return ret.join(" ");
      }

      function pieInner(d, rx, ry, depth, ir, outerHiddenAngles, innerPadding){
        var startAngle = (d.startAngle < Math.PI ? Math.PI : d.startAngle);
        var endAngle = (d.endAngle < Math.PI ? Math.PI : d.endAngle);

        var sx = ir*rx*Math.cos(startAngle),
          sy = ir*ry*Math.sin(startAngle),
          ex = ir*rx*Math.cos(endAngle),
          ey = ir*ry*Math.sin(endAngle);

          var ret = [];
          ret.push(
            "M",sx, sy,
            "A",ir*rx,ir*ry,"0 0 1",ex,ey,
            "L",ex,depth+ey,
            "A",ir*rx, ir*ry,"0 0 0",sx,depth+sy,
            "z"
          );
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
        x = rx * 1.1 * Math.cos(d.midAngle);
        y = ry * 1.1 * Math.sin(d.midAngle);
        points.push([x, y]);

        // следущая точка за пределами сектора и на той же высоте, что и предыдущая, но подальше
        x += x / Math.abs(x) * 100;
        points.push([x, y]);

        return points;
      }

      function getPercent(d) {
        return Math.round(1000*(d.endAngle-d.startAngle)/(Math.PI*2))/10+'%';
      }

      function prepareData(data, isBeforeFirstTransition, padAngle) {
        // генерируем данные для чарта
        var _data = d3.layout.pie()
          .sort(null)
          .value(function(d) {
            return d.value;
          })
          // проблемное место... пока начало диаграммы в нуле
          // .startAngle(-1/2*Math.PI)
          // .endAngle(3/2*Math.PI)
          .padAngle(padAngle)
          (data);

        // исправление недочёта D3: значение углов становится NaN, если значение из данных пустое
        return _data.map(function(d) {
          d.startAngle = isNaN( d.startAngle ) ? 0 : d.startAngle;
          d.endAngle = isNaN( d.endAngle ) ? 0 : d.endAngle;
          if (d.padAngle) {
            d.startAngle += d.padAngle / 2;
            d.endAngle -= d.padAngle / 2;
          }
          // средний угол
          d.midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;

          // если значение инициализирующее перед началом
          if (isBeforeFirstTransition) {
            d.endAngle = d.startAngle;
          }
          return d;
        });
      }

      function mouseenterTooltip(d) {

        var coordinateTooltip, heightTooltip, tooltip, widthTooltip, widthWindow,
          $this = $(this),
          $parent = $this.closest('.slices'),
          $list = $parent.children('.' + $this.attr('class')),
          index = $list.index($this);

        $parent.children(
          '.slice__top:eq(' + index + '),' +
          '.slice__bottom:eq(' + index + '),' +
          '.slice__inner:eq(' + index + '),' +
          '.slice__outer:eq(' + index + '),' +
          '.slice__side1:eq(' + index + '),' +
          '.slice__side2:eq(' + index + ')'
        )
          .css("cursor", "pointer")
          .attr("opacity", 0.6);

        var translateX = 20 * Math.cos(d.midAngle),
            translateY = 20 * Math.sin(d.midAngle);

        d3.select(d3.selectAll('.slice__top')[0][index])
          .transition()
            .attr('transform', 'translate(' + translateX + ', ' + translateY + ')');
        d3.select(d3.selectAll('.slice__bottom')[0][index])
          .transition()
            .attr('transform', 'translate(' + translateX + ', ' + translateY + ')');
        d3.select(d3.selectAll('.slice__inner')[0][index])
          .transition()
            .attr('transform', 'translate(' + translateX + ', ' + translateY + ')');
        d3.select(d3.selectAll('.slice__outer')[0][index])
          .transition()
            .attr('transform', 'translate(' + translateX + ', ' + translateY + ')');
        d3.select(d3.selectAll('.slice__side1')[0][index])
          .transition()
            .attr('transform', 'translate(' + translateX + ', ' + translateY + ')');
        d3.select(d3.selectAll('.slice__side2')[0][index])
          .transition()
            .attr('transform', 'translate(' + translateX + ', ' + translateY + ')');

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
          $list = $parent.children('.' + $this.attr('class')),
          index = $list.index($this);

        d3.select(".chart .chart-tooltip_wrap").style("display", "none");

        $parent.children(
          '.slice__top:eq(' + index + '),' +
          '.slice__bottom:eq(' + index + '),' +
          '.slice__inner:eq(' + index + '),' +
          '.slice__outer:eq(' + index + '),' +
          '.slice__side1:eq(' + index + '),' +
          '.slice__side2:eq(' + index + ')'
        ).attr("opacity", 1);

        d3.select(d3.selectAll('.slice__top')[0][index])
          .transition()
            .attr('transform', 'translate(0, 0)');
        d3.select(d3.selectAll('.slice__bottom')[0][index])
          .transition()
            .attr('transform', 'translate(0, 0)');
        d3.select(d3.selectAll('.slice__inner')[0][index])
          .transition()
            .attr('transform', 'translate(0, 0)');
        d3.select(d3.selectAll('.slice__outer')[0][index])
          .transition()
            .attr('transform', 'translate(0, 0)');
        d3.select(d3.selectAll('.slice__side1')[0][index])
          .transition()
            .attr('transform', 'translate(0, 0)');
        d3.select(d3.selectAll('.slice__side2')[0][index])
          .transition()
            .attr('transform', 'translate(0, 0)');
      };

      RoundChart3D.transition = function(id, data, init, rx, ry, depth, ir, outerHiddenAngles, innerPadding, padAngle){
        function arcTweenInner(a) {
          var i = d3.interpolate(this._current, a);
          this._current = i(0);
          return function(t) { return pieInner(i(t), rx, ry, depth, ir, outerHiddenAngles, innerPadding);  };
        }
        function arcTweenOuter(a) {
          var i = d3.interpolate(this._current, a);
          this._current = i(0);
          return function(t) { return pieOuter(i(t), rx, ry, depth, ir, outerHiddenAngles, innerPadding);  };
        }
        function arcTweenTop(a) {
          var i = d3.interpolate(this._current, a);
          this._current = i(0);
          return function(t) { return pieTop(i(t), rx, ry, depth, ir, outerHiddenAngles, innerPadding);  };
        }
        function arcTweenBottom(a) {
          var i = d3.interpolate(this._current, a);
          this._current = i(0);
          return function(t) { return pieBottom(i(t), rx, ry, depth, ir, outerHiddenAngles, innerPadding);  };
        }
        function arcTweenSide1(a) {
          var i = d3.interpolate(this._current, a);
          this._current = i(0);
          return function(t) { return pieSide1(i(t), rx, ry, depth, ir, outerHiddenAngles, innerPadding);  };
        }
        function arcTweenSide2(a) {
          var i = d3.interpolate(this._current, a);
          this._current = i(0);
          return function(t) { return pieSide2(i(t), rx, ry, depth, ir, outerHiddenAngles, innerPadding);  };
        }

        function lineTweenPoints(a) {
          var i = d3.interpolate(this._current, a);
              irx = d3.interpolate(init ? 0 : rx, rx);
              iry = d3.interpolate(init ? 0 : ry, ry);
          this._current = i(0);
          return function(t) {
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
          return function(t) {
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
          return function(t) {
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
          return function(t) {
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
          return function(t) {
            // получаем точки для линии
            var points = linePoints(i(t), irx(t), iry(t), depth, ir, innerPadding);
            // и получаем конечную
            var lastPoint = points.pop();
            return lastPoint[0] > 0 ? 'start' : 'end';
          };
        }

        function opacityHandler(d) {
          if (d == null || !d.value) {
            return 0;
          } else {
            return 1;
          }
        }

        var _data = prepareData(data, false, padAngle);

        var chart = d3.select('#'+id),
            transitionDelay,
            transitionDuration;

        // для первого запуска анимируем все сектора последовательно
        if (init) {
          transitionDelay = function(d, i) {
            return i * 150;
          };
          transitionDuration = 160;

        // для последующих анимируем синхронно
        } else {
          transitionDelay = 0;
          transitionDuration = 750;
        }

        // нижние стороны (для просвечивания)
        chart.selectAll('.slice__bottom').data(_data)
          .transition()
            .delay(transitionDelay)
            .duration(transitionDuration)
            .attr('opacity', opacityHandler)
            .attrTween("d", arcTweenBottom);

        // внутренние стороны, если задан внутренний радиус
        if (ir) {
          chart.selectAll('.slice__inner').data(_data)
            .transition()
              .delay(transitionDelay)
              .duration(transitionDuration)
              .attr('opacity', opacityHandler)
              .attrTween("d", arcTweenInner);
        }

        // первая боковая сторона
        chart.selectAll('.slice__side1').data(_data)
          .transition()
            .delay(transitionDelay)
            .duration(transitionDuration)
            .attr('opacity', opacityHandler)
            .attrTween("points", arcTweenSide1);

        // вторая боковая сторона
        chart.selectAll('.slice__side2').data(_data)
          .transition()
            .delay(transitionDelay)
            .duration(transitionDuration)
            .attr('opacity', opacityHandler)
            .attrTween("points", arcTweenSide2);

        // внешние стороны
        chart.selectAll('.slice__outer').data(_data)
          .transition()
            .delay(transitionDelay)
            .duration(transitionDuration)
            .attr('opacity', opacityHandler)
            .attrTween("d", arcTweenOuter);

        // верхние стороны
        chart.selectAll('.slice__top').data(_data)
          .transition()
            .delay(transitionDelay)
            .duration(transitionDuration)
            .attr('opacity', opacityHandler)
            .attrTween("d", arcTweenTop);

        // линии надписей
        chart.selectAll('.line').data(_data)
          .transition()
            .delay(transitionDelay)
            .duration(transitionDuration)
            .attr('opacity', opacityHandler)
            .attrTween("points", lineTweenPoints);

        // кружки надписей
        chart.selectAll('.line__circle').data(_data)
          .transition()
            .delay(transitionDelay)
            .duration(transitionDuration)
            .attr('opacity', opacityHandler)
            .attrTween("cx", lineCircleTweenCx)
            .attrTween("cy", lineCircleTweenCy);

        // сами надписи
        chart.selectAll('.line__percent').data(_data)
          .transition()
            .delay(transitionDelay)
            .duration(transitionDuration)
            .attr('opacity', opacityHandler)
            .attrTween("x", textTweenX)
            .attrTween("y", textTweenY)
            .attrTween("text-anchor", textTweenAnchor)
            .tween('text', function(a) {
              var i = d3.interpolate(this._current, a);
              this._current = i(0);
              return function(t) {
                d3.select(this).text(getPercent(i(t)));
              }
            });
      }

      RoundChart3D.draw=function(id, data, init, x/*center x*/, y/*center y*/,
          rx/*radius x*/, ry/*radius y*/, depth, ir/*inner radius*/,
          outerHiddenAngles/*углы в пределах которых внешние стороны не видны*/,
          innerPadding/*inner padding*/,
          padAngle/*размера угла интервала между секторами*/
      ){

        var _data = prepareData(data, init, padAngle);

        var slices,
          enteredSlices,
          innerSlices,
          topSlices,
          outerSlices,
          percents,
          lines;

        var chart = d3.select("#"+id);

        slices = chart.selectAll('.slices').data([Object]).enter()
          .append("g")
            .attr("transform", "translate(" + x + "," + y + ")")
            .attr("class", "slices");

        // нижние стороны (для просвечивающего выделения)
        slices.selectAll('.slice__bottom').data(_data).enter()
          .append("path")
            .attr("class", "slice__bottom")
            .style("stroke", function(d) { return d.data.color; })
            .style("stroke-width", 1)
            .style("fill", function(d) { return d.data.color; })
            .attr("d",function(d) { return pieBottom(d, rx, ry, depth, ir, outerHiddenAngles, innerPadding);})
            .attr('opacity', 0)
            .each(function(d) {
              this._current = d;
            })
            .on('mouseenter', mouseenterTooltip)
            .on('mouseleave', mouseleaveTooltip);

        if (ir) {
          // внутренние стороны (для кольцевой диаграммы)
          slices.selectAll('.slice__inner').data(_data).enter()
            .append("path")
              .attr("class", "slice__inner")
              .style("fill", function(d) { return d3.hsl(d.data.color).darker(0.7); })
              .attr("d",function(d) { return pieInner(d, rx, ry, depth, ir, outerHiddenAngles, innerPadding);})
              .attr('opacity', 0)
              .each(function(d) {
                this._current = d;
              })
              .on('mouseenter', mouseenterTooltip)
              .on('mouseleave', mouseleaveTooltip);
        }

        // первая боковая сторона
        slices.selectAll('.slice__side1').data(_data).enter()
          .append("polygon")
            .attr("class", "slice__side1")
            .style("fill", function(d) { return d3.hsl(d.data.color).darker(0.7); })
            .attr("points", function(d) { return pieSide1(d, rx, ry, depth, ir, outerHiddenAngles, innerPadding); })
            .attr('opacity', 0)
            .each(function(d) {
              this._current = d;
            })
            .on('mouseenter', mouseenterTooltip)
            .on('mouseleave', mouseleaveTooltip);
        // вторая боковая сторона
        slices.selectAll('.slice__side2').data(_data).enter()
          .append("polygon")
            .attr("class", "slice__side2")
            .style("fill", function(d) { return d3.hsl(d.data.color).darker(0.7); })
            .attr("points", function(d) { return pieSide2(d, rx, ry, depth, ir, outerHiddenAngles, innerPadding); })
            .attr('opacity', 0)
            .each(function(d) {
              this._current = d;
            })
            .on('mouseenter', mouseenterTooltip)
            .on('mouseleave', mouseleaveTooltip);

        // внешние стороны
        slices.selectAll('.slice__outer').data(_data).enter()
          .append("path")
            .attr("class", "slice__outer")
            .style("fill", function(d) { return d3.hsl(d.data.color).darker(0.7); })
            .attr("d", function(d) { return pieOuter(d, rx, ry, depth, ir, outerHiddenAngles, innerPadding); })
            .attr('opacity', 0)
            .each(function(d) {
              this._current = d;
            })
            .on('mouseenter', mouseenterTooltip)
            .on('mouseleave', mouseleaveTooltip);

        // верхние стороны
        slices.selectAll('.slice__top').data(_data).enter()
          .append("path")
            .attr("class", "slice__top")
            .style("stroke", function(d) { return d.data.color; })
            .style("stroke-width", 1)
            .style("fill", function(d) { return d.data.color; })
            .attr("d",function(d) { return pieTop(d, rx, ry, depth, ir, outerHiddenAngles, innerPadding);})
            .attr('opacity', 0)
            .each(function(d) {
              this._current = d;
            })
            .on('mouseenter', mouseenterTooltip)
            .on('mouseleave', mouseleaveTooltip);

        // линии подписей
        slices.selectAll('.line').data(_data).enter()
          .append("polyline")
            .attr("class", "line")
            .attr('fill', 'none')
            .attr('stroke-width', 1)
            .attr('stroke', 'lightgray')
            .attr("points", function(d) {
              // получаем точки для линии и запоминаем их
              var points = linePoints(d, rx, ry, depth, ir, innerPadding, init);
              return points.join(',');
            })
            .attr('opacity', 0)
            .each(function(d) {
              this._current = d;
            });

        // круги подписей
        slices.selectAll('.line__circle').data(_data).enter()
          .append("circle")
            .attr("class", "line__circle")
            .attr("fill", function(d) { return d.data.color; })
            .attr('opacity', 0)
            .each(function(d) {
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
              this._current = d;
            });

        // подписи
        slices.selectAll('.line__percent').data(_data).enter()
          .append("text")
            .attr("class", "line__percent")
            .attr('opacity', 0)
            .each(function(d) {
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
              this._current = d;
            })
            .text(getPercent);
      }

      this.RoundChart3D = RoundChart3D;
    // }();

    // возвращает начальный и конечный углы сектора, в пределах которого не видны внешние стороны секторов
    getOuterHiddenAngles = function(zAngle) {
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
        //   return {
        //     startAngle: Math.PI * 2,
        //     endAngle: Math.PI * 2 + Math.PI
        //   };
        // case 'top':
        // default:
        //   return {
        //     startAngle: Math.PI,
        //     endAngle: Math.PI + Math.PI
        //   };
      };
    }

    // новый 3d-чарт pie
    drawChart = function(dataset) {
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

          // угол между секторами
          padAngle = .07;
          innerPadding = .07,

          // флаг первого запуска
          init = false;

      // готовим данные для диаграммы
      data = dataset.dataObj.map(function(d) {
        return {
          name: d.name,
          value: d.value,
          color: d.color
        };
      })
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

    responsiveChart = function() {
      var aspect, chart, container;
      chart = $(".svg-chart");
      aspect = chart.width() / chart.height();
      container = $(".chart-canvas");
      $(window).on("resize", function() {
        var targetWidth;
        targetWidth = container.width();
        chart.attr("width", targetWidth);
        chart.attr("height", Math.round(targetWidth / aspect));
      }).trigger("resize");
    };
    return window.initRoundChart3D = function(data) {
      drawChart(data);
      responsiveChart();
    };
  });

}).call(this);
