$(document).ready(function() {
	let bigData = data;
	let bigData2 = data2;
	let w = 1000;
	let h = 480;

	let hotelGroups = {}
	let hotelGroups2 = {}
	for (let i = 0; i < bigData.length; i++) {
		let groupName = bigData[i].Hotel;
		if (!hotelGroups[groupName] || (hotelGroups[groupName]) && hotelGroups[groupName].lat !== bigData[i].Lat || hotelGroups[groupName].lon !== bigData[i].Lon) {
		  hotelGroups[groupName] = {
			  hotelName: groupName,
			  count: 1,
			  lat: bigData[i].Lat,
			  lon: bigData[i].Lon
		  };
		}else {
			hotelGroups[groupName].count += 1;;
		}
	  }

	  for (let i = 0; i < bigData2.length; i++) {
		let groupName = bigData2[i].Hotel;
		if (!hotelGroups2[groupName] || (hotelGroups2[groupName]) && hotelGroups2[groupName].lat !== bigData[i].Lat || hotelGroups2[groupName].lon !== bigData2[i].Lon) {
			hotelGroups2[groupName] = {
			  hotelName: groupName,
			  count: 1,
			  lat: bigData2[i].Lat,
			  lon: bigData2[i].Lon
		  };
		}else {
			hotelGroups2[groupName].count += 1;;
		}
	  }

	  let locations = Object.values(hotelGroups);
	  locations.sort((a, b) => (a.count < b.count) ? 1 : -1);
	  locations.slice(0, 20);
	  let locations2 = Object.values(hotelGroups2);
	  locations2.sort((a, b) => (a.count < b.count) ? 1 : -1);
	  locations2.slice(0, 20);

	let projection = d3.geo.equirectangular()
	let path = d3.geo.path()
	  .projection(projection);
	let svg = d3.select('#map')
	  .append('svg')
	  .attr('width', w)
	  .attr('height', h)
	svg.append('rect')
	  .attr('width', w)
	  .attr('height', h)
	  .attr('fill', 'white');
	let g = svg.append("g");


	d3.json('https://d3js.org/world-50m.v1.json', function(error, data) {
	  if (error) console.error(error);
	  g.append('path')
		.datum(topojson.feature(data, data.objects.countries))
		.attr('d', path);

	  let zoom = d3.behavior.zoom()
		.on("zoom", function() {
		  g.attr("transform", "translate(" +
			d3.event.translate.join(",") + ")scale(" + d3.event.scale + ")");
		  g.selectAll("path")
			.attr("d", path.projection(projection));
		});
	  svg.call(zoom);

	let hue = 0;
	locations.map(function(d) {
		hue += 2.86;
		d.color = 'hsl(' + hue + ', 100%, 50%)';
	});

	g.selectAll('circle')

	.data(locations)
	.enter()
	.append('circle')

	.attr('cx', function(d) {
		return projection([parseInt(d.lon), parseInt(d.lat)])[0];
	})
	.attr('cy', function(d) {
		return projection([parseInt(d.lon), parseInt(d.lat)])[1];
	})
	.style('fill', function(d) {
	return d.color;
	})


	.on('mouseover', function(d) {
		d3.select(this).style('fill', 'black');
		d3.select('#hotelName').text(d.hotelName);
		d3.select('#lat').text(d.lat);
		d3.select('#lon').text(d.lon);
		d3.select('#count').text(d.count);
		d3.select('#tooltip')
		.style('left', (d3.event.pageX + 20) + 'px')
		.style('top', (d3.event.pageY - 80) + 'px')
		.style('display', 'block')
		.style('opacity', 0.8)
	})
	.on('mouseout', function(d) {
		d3.select(this).style('fill', d.color);
		d3.select('#tooltip')
		.style('display', 'none');
	});
	g.selectAll("circle")
	.transition()
	.duration(100)
	.attr("r", 0)
	.transition()
	.duration(function(d) {
		return d.count * 75;
	})
	.attr("r", function(d) {
		return d.count / 4;
	});

	

	let xScale = d3.scale.linear()
		.domain([0, d3.max(locations2, function(d) { return d.count; })])
		.range([0, 800]);

	let Ucanvas = d3.select("#chart")
		.append('svg')
			.attr('width', w)
			.attr('height', 450);


	let rects = Ucanvas.selectAll('rect')
		.data(locations2)
		.enter()
		.append('rect')
			.attr('width', 0)
			.attr('height', 450/10 - 2)
			.attr('y', function (d, i) { return i * 50; })
			.attr('fill', '#FDBB30');

	rects.transition()
		.duration(3000)
		.delay(200)
		.ease('linear')
		.attr('width', function (d) { return xScale(d.count); });

	//  Ucanvas.selectAll('text')
	// 	.data(locations2)
	// 	.enter()
	// 	.append("text")
	// 		.attr('y', function (d, i) { return (i * 50) +30; })
	// 		.attr('x', 3)
	// 		.attr('fill', '#130C0E')
	// 		.text(function (d) { return d.hotelName + " [" + d.count + "]"; });

	  });
  });