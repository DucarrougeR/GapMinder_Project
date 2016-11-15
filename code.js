var dataset;
var svg_width = 1200;
var svg_height = 600;
var padding = 50;

var xScale;
var yScale;
var rScale;

var yAxis;
var xAxis;

var display_year = 1900;

function yearFilter(value) {
	return (value.Year == display_year)
};

// Create an svg element to house the visualisation
var svg = d3.select("body")
	.append("svg")
	.attr("width", svg_width)
	.attr("height", svg_height);

var title = svg.append("text")
	.text(display_year)
	.attr("x", svg_width/2)
	.attr("y", svg_height/2)
	.attr("text-anchor", "middle")
	.attr("fill", "lightgrey")
	.attr("font-size", "400px")
	.attr("font-family", "Courier New");

// Function to perform the data joins
function generateVis() {

	// Select the data for the correct year
	var filtered_data = dataset.filter(yearFilter);

	/*
	=========
	DATA JOIN 
	=========
	*/

	var circles = svg.selectAll("circle")
		.data(filtered_data, function key(d) { return d.Country;} );

	var labels = svg.selectAll("text.countries")
		.data(filtered_data, function key(d) { return d.Country;} );

	var flags = svg.selectAll("image")
		.data(filtered_data, function key(d) { return d.Country;} );

	/*
	================
	UPDATE SELECTION
	================
	*/
	circles.on("mouseover", function(d) {
			circles.filter(function(x) { return d.Country != x.Country; })
			.transition()
			.style("opacity", 0.4);

			var temp = labels.filter(function(e) {
				return e.Country === d.Country
			})
			temp.style("opacity", 1);

			var flag = flags.filter(function(c) {
				return c.Country === d.Country
			})
			flag.style("opacity", 1);
			d3.selectAll("polygon")
				.attr("stroke", "black");
		})
		.on("mouseout", function(d) {
			circles.filter(function(x) { return d.Country != x.Country; })
			.transition()
			.style("opacity", 1);

			var temp = labels.filter(function(e) {
				return e.Country === d.Country
			})
			temp.style("opacity", 0);

			var flag = flags.filter(function(c) {
				return c.Country === d.Country
			})
			flag.style("opacity", 0);
			d3.selectAll("polygon")
				.attr("stroke", "none");
		})
		.transition()
		.ease("cubic-in-out")
		.duration(4000)
		.attr("cx", function(d) { return xScale(+d.GDP); })
		.attr("cy", function(d) { return yScale(+d.LifeExp); })
		.attr("r", function(d) { return rScale(+d.Population); })
		
	labels.attr("x", svg_width - padding)
		.attr("y", svg_height - 2 * padding)
		.attr("text-anchor", "end")
		.attr("opacity", 0)
		.text(function(d) { return d.Country; });

	/*
	===============
	ENTER SELECTION
	===============
	*/
	circles.enter()
		.append("circle")
		.on("mouseover", function(d) {
			circles.filter(function(x) { return d.Country != x.Country; })
			.transition()
			.style("opacity", 0.4);

			var temp = labels.filter(function(e) {
				return e.Country === d.Country
			})
			temp.style("opacity", 1);

			var flag = flags.filter(function(c) {
				return c.Country === d.Country
			})
			flag.style("opacity", 1);
			d3.selectAll("polygon")
				.attr("stroke", "black");
		})
		.on("mouseout", function(d) {
			circles.filter(function(x) { return d.Country != x.Country; })
			.transition()
			.style("opacity", 1);

			var temp = labels.filter(function(e) {
				return e.Country === d.Country
			})
			temp.style("opacity", 0);

			var flag = flags.filter(function(c) {
				return c.Country === d.Country
			})
			flag.style("opacity", 0);
			d3.selectAll("polygon")
				.attr("stroke", "none");
		})
		.transition()
		.attr("cx", function(d) { return xScale(+d.GDP); })
		.attr("cy", function(d) { return yScale(+d.LifeExp); })
		.attr("r", function(d) { return rScale(+d.Population); })
		.attr("stroke", "black")
		.attr("stroke-width", "1px")
	    	.attr("fill", function(d) {
			if (d.Region=="Europe"){return "rgb(255,231,0)";}    //yellow
			else if(d.Region=="North America"){return "orange";}  // dark green
			else if(d.Region=="South America"){return "rgb(127,235,0)";} // light green
			else if(d.Region=="Central America"){return "purple";} // light green
			else if(d.Region=="Asia"){return "rgb(255,88,114)";}     //red
			else {return "rgb(0,213,233)";}  //blue for Australia-Oceania
		});
	
	labels.enter()
		.append("text")
		.attr("x", svg_width - padding)
		.attr("y", svg_height - 2 * padding)
		.attr("text-anchor", "end")
		.attr("class", "countries")
		.attr("opacity", 0)
		.text(function(d) { return d.Country; });

	flags.enter()
		.append("image")
		.attr("xlink:href", function(d) {
			if (d.Code == "SS") {
				return "./Flag_of_South_Sudan.svg";
			} else {
			return "http://www.geognos.com/api/en/countries/flag/"+ d.Code + ".png";}} )
		.attr("height", "150px")
		.attr("width", "150px")
		.attr("x", svg_width - padding - 150)
		.attr("y", svg_height - 4 * padding)
		.style("opacity", 0);

	svg.append("polygon")
		.attr("points", "1000,437, 1150,437, 1150,513, 1000,513")
		.attr("fill", "none")
		.attr("stroke", "none");
	/*
	==============
	EXIT SELECTION
	==============
	*/
	circles.exit()
		.transition()
		.attr("r", 0)
		.remove();
	labels.exit().remove();


	// Add in the axes.  Performed last, so that they appear on top
};


// Loading in the data
d3.csv("./Gapminder_All_Time.csv", function(error, data) {

	// Handle errors
	if (error) {
		console.log("Something went wrong while attempting to load the data");
	} else {
		console.log("Data loaded successfully");

		// Assign the loaded data to a variable
		dataset = data;

		// Set up axes and scales
		yScale = d3.scale.linear()
				.domain([0, d3.max(dataset, function(d) { return +d.LifeExp; })])
				.range([svg_height - padding, padding]);

		xScale = d3.scale.log()
			.domain([100, 200000])
			.range([padding, svg_width - padding]);

		rScale = d3.scale.sqrt()
				.domain([d3.min(dataset, function(d) { return +d.Population;} ),
				d3.max(dataset, function(d) { return +d.Population; })])
				.range([5, 45]);

		xAxis = d3.svg.axis()
			.scale(xScale)
			.tickFormat(function(d) {
				return xScale.tickFormat(5, d3.format(",d"))(d)
			})
			.orient("bottom");

		yAxis = d3.svg.axis()
			.scale(yScale)
			.orient("left");

		// Run the visualisation function
		generateVis();

		svg.append("g")
			.attr("class", "yaxis")
			.attr("id", "yaxis")
			.attr("transform", "translate("+ padding +",0)")
			.call(yAxis);

		svg.append("g")
			.attr("class", "xaxis")
			.attr("id", "xaxis")
			.attr("transform", "translate(0,"+ (svg_height - padding) +")")
			.call(xAxis);

		// Add in Y-axis label
		svg.append("text")
			.attr("text-anchor", "middle")
			.attr("font-family", "sans serif")
			.attr("transform", "translate("+ (padding/3) +","+(svg_height/2)+")rotate(-90)")
			.text("Life Expectancy (Years)");

		// Add in X-axis label
		svg.append("text")
			.attr("text-anchor", "middle")
			.attr("font-family", "sans serif")
			.attr("transform", "translate("+ (svg_width/2) +","+(svg_height - padding/4)+")")
			.text("Income per Capita (inflation adjusted USD)");

		// Run through all of the years
		setInterval(function() {
//			console.log((dataset.filter(function(d) { return d.Year == display_year; })).length);
			if (display_year < 1950) {
				display_year = display_year + 10;
			} else if (display_year < 2010) {
				display_year = display_year + 1;
			} else {
				display_year = 2010;
			}

			// Change the year that is displayed in the background
			title.text(display_year);

			generateVis();
		},4000);
	}
});
