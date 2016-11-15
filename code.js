var dataset;
var svg_width = 1200;
var svg_height = 600;
var padding = 30;

var xScale;
var yScale;
var rScale;

var yAxis;
var xAxis;

var display_year = 1900;


// Built-in D3 scale for ordinal values
// Use to colour regions
var c10 = d3.scale.category10()
	.domain(["Asia", "Europe", "Africa", "South America", "North America",
			"Central America", "Australia", "Oceania"]);

function yearFilter(value) {
	return (value.Year == display_year)
};

// Create an svg element to house the visualisation
var svg = d3.select("body")
	.append("svg")
	.attr("width", svg_width)
	.attr("height", svg_height)
	.style("background", "lightblue");

var title = svg.append("text")
	.text(display_year)
	.attr("x", svg_width/2)
	.attr("y", svg_height/2)
	.attr("text-anchor", "middle")
	.style("font-family", "sans-serif");

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
		})
		.on("mouseout", function(d) {
			circles.filter(function(x) { return d.Country != x.Country; })
			.transition()
			.style("opacity", 1);

			var temp = labels.filter(function(e) {
				return e.Country === d.Country
			})
			temp.style("opacity", 0);
		})
		.transition()
		.ease("cubic-in-out")
		.duration(2000)
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
		})
		.on("mouseout", function(d) {
			circles.filter(function(x) { return d.Country != x.Country; })
			.transition()
			.style("opacity", 1);

			var temp = labels.filter(function(e) {
				return e.Country === d.Country
			})
			temp.style("opacity", 0);
		})
		.attr("cx", function(d) { return xScale(+d.GDP); })
		.attr("cy", function(d) { return yScale(+d.LifeExp); })
		.attr("r", function(d) { return rScale(+d.Population); })
		.attr("stroke", "black")
		.attr("stroke-width", "1px")
		.attr("fill", function(d) { return c10(d.Region); } )
	
	labels.enter()
		.append("text")
		.attr("x", svg_width - padding)
		.attr("y", svg_height - 2 * padding)
		.attr("text-anchor", "end")
		.attr("class", "countries")
		.attr("opacity", 0)
		.text(function(d) { return d.Country; });
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
				.range([3, 37]);

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
		},500);
	}
});
