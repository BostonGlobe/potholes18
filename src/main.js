'use strict';
(function() {
	// global variables
    var streetMap = L.tileLayer('https://api.mapbox.com/styles/v1/gabriel-florit/cjc6jt6kk3thh2rpbd5pa6a0r/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZ2FicmllbC1mbG9yaXQiLCJhIjoiVldqX21RVSJ9.Udl7GDHMsMh8EcMpxIr2gA', {
        id: 'mapbox.street',
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    });
    var holes15 = L.layerGroup(),
        holes16 = L.layerGroup(),
        holes17 = L.layerGroup(),
        holes18 = L.layerGroup(),
        brushedHoles = L.layerGroup();

    var map= L.map('map', {
        center: [42.323, -71.072],
        zoom: 12,
        layers: [streetMap, brushedHoles],
        scrollWheelZoom: false,
        //zoomControl: false,
        attributionControl: false,
        doubleClickZoom: false,
        zoomSnap: 0.2,
        //dragging: false,
        //preferCanvas: true
    });


	// called once on page load
	var init = function() {

	};

	// called automatically on article page resize
	window.onResize = function(width) {

	};

	// called when the graphic enters the viewport
	window.enterView = function() {
        map.fitBounds([[42.398768, -71.187746],[42.229946, -70.983835]]);
	};


	// graphic code
    //https://docs.google.com/spreadsheets/d/e/2PACX-1vT_dsN_2YF5hdLd9ALxefxfEsDfJuUQCJiRYDszxlPYIW8q5BaCnnbzlpsBw8EMlDOXr8QEZWEWL2HX/pubhtml



    //   var streetMap = L.tileLayer('https://api.mapbox.com/styles/v1/gabriel-florit/cj8vpf6aw7w022tqq4wuugiil/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZ2FicmllbC1mbG9yaXQiLCJhIjoiVldqX21RVSJ9.Udl7GDHMsMh8EcMpxIr2gA', {
    //       id: 'mapbox.street',
    //       attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    //   });

    var dispatch = d3.dispatch('brushend');
    // graphic code



    // https://docs.google.com/spreadsheets/d/e/2PACX-1vT_dsN_2YF5hdLd9ALxefxfEsDfJuUQCJiRYDszxlPYIW8q5BaCnnbzlpsBw8EMlDOXr8QEZWEWL2HX/pubhtml
    d3.queue()
        .defer(d3.json, './assets/bos_neighborhoods.json')
        //.defer(d3.csv, './assets/Potholes15-18.csv', parceCSV)
        .defer(d3.csv, './assets/PotholesData12-18.csv', parceCSV)
        //.defer(d3.json, 'https://spreadsheets.google.com/feeds/cells/1HYshjqehc-Q22ZJOpbbhZa5e-6V8_OopMNNa-4GZ1RU/1/public/values?alt=json-in-script')
        .await(dataloaded);

    function dataloaded(err, geo, data) {

        var shapeMap = L.geoJSON(geo, {
            style: function (d) {
                return {
                    weight: 1,
                    opacity: 1,
                    color: 'darkgray',
                    dashArray: '3',
                    fillOpacity: 0
                }
            }
        });

        var baseMaps = {
            "Street": streetMap
        };
        var overlayMaps = {
            '<span style="color: steelblue">▇</span> You choose': brushedHoles,
            '<span style="color: #984ea3">▇</span> 2018': holes18,
            '<span style="color: #4daf4a">▇</span> 2017': holes17,
            '<span style="color: orange">▇</span> 2016': holes16,
            '<span style="color: #e41a1c">▇</span> 2015': holes15,
        };


        shapeMap.addTo(map);


        L.control.layers(baseMaps, overlayMaps, {
            collapsed: false,
            hideSingleBase: true
        }).addTo(map);

        createLayers(data, 2015, holes15, style(15));
        createLayers(data, 2016, holes16, style(16));
        createLayers(data, 2017, holes17, style(17));
        createLayers(data, 2018, holes18, style(18));



        var  margin = {top: 10, right: 30, bottom: 30, left: 40},
            // width = 1000,
            // height = 700;
            width = document.getElementById('plot').clientWidth - margin.left - margin.right,
            height = document.getElementById('plot').clientHeight - margin.top - margin.bottom;

            var svg = d3.select('.canvas')
                .attr('width', width+ margin.left+margin.right)
                .attr('height', height+margin.top + margin.bottom)
                .attr('viewbox', '0 0 1500 1000')
                .attr('preserveAspectRatio', 'xMidYMid meet')
                .append('g')
                .attr('class', 'canvasG')
                .attr('transform', 'translate('+ margin.left+ ',' +margin.top +')');

            var scaleX = d3.scaleTime()
                .domain([new Date(2012, 7, 1), new Date(2018, 0, 31)])
                .rangeRound([0, width]);

            var histogram = d3.histogram()
                .value(function(d) { return d.opendate; })
                .domain(scaleX.domain())
                .thresholds(scaleX.ticks(d3.timeMonth));

            var bins = histogram(data);
            console.log(bins);
            var durations = [];
            bins.forEach(function (bin) {
                var filteredBin = bin.filter(function (t) {
                    return t.duration!= null && t.duration!=-1
                });
                var median = d3.median(filteredBin, function (t) {
                    return t.duration;
                });
                var avg = d3.mean(filteredBin, function (t) {
                    return t.duration
                });
                var min = d3.min(filteredBin, function (t) {
                    if(t.duration == -1){
                        console.log(t);
                    }
                    return t.duration
                });
                var max = d3.max(filteredBin, function (t) {
                    return t.duration
                });
                durations.push(
                    {median: median,
                    average: avg,
                        min: min,
                        max: max
                    });
            });
            console.log(durations);

            var scaleY = d3.scaleLinear().range([height, 0]);
            scaleY.domain([0, d3.max(bins, function (d) {
                return d.length;
            })]);

            svg.selectAll("rect")
                .data(bins)
                .enter().append("rect")
                .attr("class", "bar")
                .attr("x", 1)
                .attr("transform", function(d) {
                    return "translate(" + scaleX(d.x0) + "," + scaleY(d.length) + ")"; })
                .attr("width", function(d) { return scaleX(d.x1) - scaleX(d.x0) -1 ; })
                .attr("height", function(d) { return height - scaleY(d.length); })
                .attr('fill', 'steelblue')
                .on('mouseover', function (d) {
                    //console.log(d);
                    var x = d3.event.pageX,
                        y = d3.event.pageY;

                    d3.select('.tooltip')
                        .style('opacity', 1)
                        .style('left', x+'px')
                        .style('top', y+'px')
                        .html(
                            '<p>'+ getDate(d[0].opendate) +'<br/>'
                            + 'Reports: ' + d.length +'</p>');
                })
                .on('mouseout', function (d) {
                    d3.select('.tooltip')
                        .style('opacity', 0);
                });

            // add the x Axis
            svg.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(scaleX));

            // add the y Axis
            svg.append("g")
                .call(d3.axisLeft(scaleY).ticks(4));

        var brushX = d3.brushX()
            .extent([[0, 0], [width, height]])
            .on("end", brushed);

        var brushg = svg.append('g')
            .attr("class", "brush")
            .call(brushX);
        brushg.selectAll(".handle").remove();
        
        brushg.selectAll('.overlay').each(function (d) {
            d.type = 'selection';
        }).on('mousedown touchstart', brushcentered);

        brushEnd([new Date(2014, 0, 1), new Date(2014, 3, 1)]); //initialize



        brushg
            .call(brushX.move, [new Date(2014, 0, 1), new Date(2014, 3, 1)].map(scaleX));

        dispatch.on('brushend', brushEnd);

        function brushcentered() {
            var dx = scaleX(new Date(2014, 3, 1)) - scaleX(new Date(2014, 0, 1)), // Use a fixed width when recentering.
                cx = d3.mouse(this)[0],
                x0 = cx - dx / 2,
                x1 = cx + dx / 2;
            d3.select(this.parentNode).call(brushX.move, x1 > width ? [width - dx, width] : x0 < 0 ? [0, dx] : [x0, x1]);
        }
        function brushEnd(val) {
                console.log(val);
                brushedHoles.clearLayers();
                var yearData = data.filter(function (d) {
                    return d.opendate >= val[0] && d.opendate< val[1];
                });
                console.log(yearData.length);
                d3.select('.timeRange').text(dateFormat(val));
                d3.select('.complaints').text(yearData.length);
                yearData.forEach(function (t) {
                    var circle = L.circleMarker([t.lat, t.lng], {
                        stroke:false,
                        fillColor: 'steelblue',
                        fillOpacity: 0.5,
                        radius: 2,
                        className: 'circle'
                    });
                    circle.addTo(brushedHoles);
                });
        }

        function brushed() {
            if (!d3.event.sourceEvent) return; // Only transition after input.
            if (!d3.event.selection) {
                return;
            } // Ignore empty selections.
            var d0 = d3.event.selection.map(scaleX.invert);
           // console.log(d0);
            var d1 = d0.map(d3.timeMonth.round);

            dispatch.call('brushend', this, d1);
            if (d1[0] >= d1[1]) {
                d1[0] = d3.timeMonth.floor(d0[0]);
                d1[1] = d3.timeMonth.offset(d1[0]);
            }
            d3.select(this).transition().call(d3.event.target.move, d1.map(scaleX));

        }
    }

    function getDate(date) {
        var monthNames = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.",
            "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."];
        var month = monthNames[date.getMonth()];
        var year = date.getYear()+1900;
        return month + ',' + year;
    }

    function createLayers(data, year, layer, style) {
        var yearData = data.filter(function (d) {
            return d.year == year
        });
        // console.log(yearData.length);
        yearData.forEach(function (t) {
            var circle = L.circleMarker([t.lat, t.lng], style);
            circle.addTo(layer);
        });
    }
    function style(num) {
        var c ='red';

        if(num==15){
            c = '#e41a1c'
        } else if(num ==16){
            c = 'orange'
        } else if(num ==17){
            c = '#4daf4a'
        } else if(num ==18){
            c = '#984ea3'
        }
        return {
            //color: c,
            stroke:false,
            fillColor: c,
            fillOpacity: 0.5,
            radius: 2,
            className: 'circle'
        }
    }

    function dateFormat(val) {
       //val is an array;
       var day1 = showMonth(val[0].getMonth())+' '+ val[0].getDate() +', '+ (val[0].getYear()+1900);
       var day02 = new Date(val[1] - 86400000);
       var day2 = showMonth(day02.getMonth())+' '+ day02.getDate() +', '+ (day02.getYear()+1900);

       console.log(day1, day2);
       return day1 +' to '+ day2;
    }
    function showMonth(month) {
        var monthStr = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.",
            "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."
        ];
        return monthStr[month];
    }

    function parceCSV(d) {
        return {
            year: +parceTime(d['open_dt']).getYear()+1900,
            opendate: parceTime(d['open_dt']),
            closedate: (d['closed_dt'])? parceTime(d['closed_dt']):'',
            lat: (d.Latitude)? (+d.Latitude): 0,
            lng: (d.Longitude)? (+d.Longitude): 0,
            reason: d['REASON']? d['REASON']: '',
            subject: d['SUBJECT']? d['SUBJECT']: '',
            type: d['TYPE']? d['TYPE']: '',
            street: d['LOCATION_STREET_NAME']?d['LOCATION_STREET_NAME']:'',
            duration: (d['closed_dt'])? Math.floor(( parceTime(d['closed_dt'])-parceTime(d['open_dt']) )/60000) : null //how many minutes
        }
    }
    function parceTime(str) {
        // 1/22/18 22:02
        var d = +str.split(' ')[0].split('/')[1],
            m = +str.split(' ')[0].split('/')[0]-1,
            y = +str.split(' ')[0].split('/')[2]+2000,
            hour = +str.split(' ')[1].split(':')[0],
            minute = +str.split(' ')[1].split(':')[1];

         return new Date(y, m, d, hour, minute)
    }









	// run code
	init();
})();
