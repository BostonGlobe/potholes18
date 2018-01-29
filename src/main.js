'use strict';
(function() {
	// global variables



	// called once on page load
	var init = function() {

	};

	// called automatically on article page resize
	window.onResize = function(width) {

	};

	// called when the graphic enters the viewport
	window.enterView = function() {

	};


	// graphic code
    //https://docs.google.com/spreadsheets/d/e/2PACX-1vT_dsN_2YF5hdLd9ALxefxfEsDfJuUQCJiRYDszxlPYIW8q5BaCnnbzlpsBw8EMlDOXr8QEZWEWL2HX/pubhtml


      var streetMap = L.tileLayer('https://api.mapbox.com/styles/v1/gabriel-florit/cjc6jt6kk3thh2rpbd5pa6a0r/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZ2FicmllbC1mbG9yaXQiLCJhIjoiVldqX21RVSJ9.Udl7GDHMsMh8EcMpxIr2gA', {
        id: 'mapbox.street',
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    });
    //   var streetMap = L.tileLayer('https://api.mapbox.com/styles/v1/gabriel-florit/cj8vpf6aw7w022tqq4wuugiil/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZ2FicmllbC1mbG9yaXQiLCJhIjoiVldqX21RVSJ9.Udl7GDHMsMh8EcMpxIr2gA', {
    //       id: 'mapbox.street',
    //       attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    //   });


    // graphic code
    var typeSet = d3.set();
    var random;
    var circlesByYear, circleGroup;
    var holes15, holes16, holes17, holes18;

    // https://docs.google.com/spreadsheets/d/e/2PACX-1vT_dsN_2YF5hdLd9ALxefxfEsDfJuUQCJiRYDszxlPYIW8q5BaCnnbzlpsBw8EMlDOXr8QEZWEWL2HX/pubhtml
    d3.queue()
        .defer(d3.json, './assets/bos_neighborhoods.json')
        //.defer(d3.csv, './assets/Potholes15-18.csv', parceCSV)
        .defer(d3.csv, './assets/PotholesData12-18.csv', parceCSV)
        //.defer(d3.json, 'https://spreadsheets.google.com/feeds/cells/1HYshjqehc-Q22ZJOpbbhZa5e-6V8_OopMNNa-4GZ1RU/1/public/values?alt=json-in-script')
        .await(dataloaded);

    function dataloaded(err, geo, data) {

        holes15 = L.layerGroup();
        holes16 = L.layerGroup();
        holes17 = L.layerGroup();
        holes18 = L.layerGroup();

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
            '<span style="color: #984ea3">▇</span> 2018': holes18,
            '<span style="color: #4daf4a">▇</span> 2017': holes17,
            '<span style="color: #377eb8">▇</span> 2016': holes16,
            '<span style="color: #e41a1c">▇</span> 2015': holes15
        };

        var map = L.map('map', {
            center: [42.323, -71.072],
            zoom: 12,
            layers: [streetMap, holes18],
            scrollWheelZoom: false,
            //zoomControl: false,
            attributionControl: false,
            doubleClickZoom: false,
            //dragging: false,
            //preferCanvas: true
        });

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

        svg.append('g')
            .attr("class", "brush")
            .call(brushX);

        function brushed() {
            if (d3.event.sourceEvent.type === "brush") return;
            var d0 = d3.event.selection.map(scaleX.invert);
            console.log(d0);
            var d1 = d0.map(d3.timeMonth.round);

            console.log(d1);

            // If empty when rounded, use floor instead.
            // if (d1[0] >= d1[1]) {
            //     d1[0] = d3.timeDay.floor(d0[0]);
            //     d1[1] = d3.timeDay.offset(d1[0]);
            // }


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
        console.log(yearData.length);
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
            c = '#377eb8'
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
