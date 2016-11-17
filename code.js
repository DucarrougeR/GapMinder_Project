// Variables to be used in various functions
var dataset;		// Store our data
var svg_width = 1200;	// Set canvas width
var svg_height = 600;	// Set canvas height
var padding = 50;	// Set canvas padding
var playInterval;	// Function to play animation
var speed = 500;

var xScale;		// d3 Scale for X-axis
var yScale;		// d3 Scale for Y-axis
var rScale;		// d3 Scale for circle radius

var xAxis;		// X-axis parameters
var yAxis;		// Y-axis parameters

var display_year = 1900;// Year to display information for


// Function to allow filtering by year
function yearFilter(value) {
	return (value.Year == display_year)
};

// Create an svg element to house the visualisation
var svg = d3.select("body")
	.append("svg")
	.attr("width", svg_width)
	.attr("height", svg_height);

// Create a text element to display the year in the background
var title = svg.append("text")
	.text(display_year)
	.attr("x", svg_width/2)
	.attr("y", svg_height/2)
	.attr("text-anchor", "middle")
	.attr("fill", "lightgrey")
	.attr("font-size", "400px")
	.attr("font-family", "Courier New");

var controls = d3.select("body")
	.append("div")
	.style("display", "inline-block")
	.attr("class", "controls")
	.attr("width", svg_width/2)
	.attr("height", 50);

controls.append("button")
	.attr("class", "play_button")
	.style("padding", "10px 40px")
	.style("font-size", "16px")
	.style("margin-left", "50px")
	.text("Play")

controls.append("button")
	.attr("class", "stop_button")
	.style("padding", "10px 40px")
	.style("font-size", "16px")
	.text("Pause")

controls.append("button")
	.attr("class", "reset_button")
	.style("font-size", "16px")
	.style("padding", "10px 40px")
	.text("Reset")

controls.append("button")
	.attr("id", "slow_button")
	.style("padding", "10px 40px")
	.style("font-size", "16px")
	.style("margin-left", "50px")
	.text("Slow")

controls.append("button")
	.attr("id", "medium_button")
	.style("padding", "10px 40px")
	.style("font-size", "16px")
	.text("Medium")

controls.append("button")
	.attr("id", "fast_button")
	.style("font-size", "16px")
	.style("padding", "10px 40px")
	.text("Fast")

// Function to handle and update the data joins
function generateVis() {

	// Select the data for the correct year
	var filtered_data = dataset.filter(yearFilter);

	/*
	=========
	DATA JOIN 
	=========
	*/

	// Create rectangles for legend 
	var legend = svg.selectAll("rect")
			.data(["Europe", "North America", "South America",
					"Central America", "Asia", "Oceania", "Australia"])
			.enter()
			.append("rect")
			.attr("fill", function(d) {
				if (d=="Europe"){return "rgb(255,231,0)";}    //yellow
				else if(d=="North America"){return "orange";}  // dark green
				else if(d=="South America"){return "rgb(127,235,0)";} // light green
				else if(d=="Central America"){return "purple";} // light green
				else if(d=="Asia"){return "rgb(255,88,114)";}     //red
				else if(d=="Oceania"){return "cyan";}     //red
				else {return "rgb(0,213,233)";}  //blue for Australia-Oceania
			})
			.attr("x", svg_width - padding - 100)
			.attr("y", function(d, i) {
				return svg_height - i* 32 - 220;
			})
			.attr("height", 30)
			.attr("width", 100)
			.attr("stroke-width", 1)
			.attr("stroke", "black");


	// Insert text into legend
	var legend = svg.selectAll("text")
			.data(["", "Europe", "N.America", "S.America",
					"C.America", "Asia", "Oceania", "Australia"])
			.enter()
			.append("text")
			.text(function(d) { return d;})
			.attr("text-anchor", "middle")
			.attr("font-size", "14px")
			.attr("fill", "white")
			.attr("paint-order", "stroke")
			.attr("stroke", "black")
			.attr("stroke-width", 2)
			.attr("x", svg_width - padding - 50)
			.attr("y", function(d, i) {
				return svg_height - i*32 - 168;
			})
	// Bubbles
	var circles = svg.selectAll("circle")
		.data(filtered_data, function key(d) { return d.Country;} );

	// Country name text
	var labels = svg.selectAll("text.countries")
		.data(filtered_data, function key(d) { return d.Country;} );

	// Country population text
	var pops = svg.selectAll("text.pops")
		.data(filtered_data, function key(d) { return d.Country;} );

	// Country income text
	var income = svg.selectAll("text.income")
		.data(filtered_data, function key(d) { return d.Country;} );

	// Flag images
	var flags = svg.selectAll("image")
		.data(filtered_data, function key(d) { return d.Country;} );

	/*
	================
	UPDATE SELECTION
	================
	*/
	// Update the circle sizes and coordinates
	circles.transition()
		.ease("linear")
		.duration(speed)
		.attr("cx", function(d) { return xScale(+d.GDP); })
		.attr("cy", function(d) { return yScale(+d.LifeExp); })
		.attr("r", function(d) { return rScale(+d.Population); })
		
	// Update the country names and years
	labels.text(function(d) { return d.Country + ", " + d.Year; });

	// Update the population text
	pops.text(function(d) { return "Population: " + d.Population; });

	// Update the income text
	income.text(function(d) { return "Income: " + d.GDP; });

	/*
	===============
	ENTER SELECTION
	===============
	*/
	
	// For new circles, apply the same properties
	circles.enter()
		.append("circle")
		// On hover, change fade out all other circles and show info for this country
		.on("mouseover", function(d) {
			circles.filter(function(x) { return d.Country != x.Country; })
			.transition()
			.style("opacity", 0.4);

			// Match the currently hovered country to its associated text element
			// Change the opacity of this text so that it is visible
			var temp = labels.filter(function(e) {
				return e.Country === d.Country
			})
			temp.style("opacity", 1);

			// Same for population text
			var temp2 = pops.filter(function(e) {
				return e.Country === d.Country
			})
			temp2.style("opacity", 1);

			// Same for income text
			var temp3 = income.filter(function(e) {
				return e.Country === d.Country
			})
			temp3.style("opacity", 1);

			// Same thing with flag image
			var flag = flags.filter(function(c) {
				return c.Country === d.Country
			})
			flag.style("opacity", 1);

			// Add a manual border to the flags
			d3.selectAll("polygon")
				.attr("stroke", "black");
		})
		
		// Restore original display when not hovered with mouse
		.on("mouseout", function(d) {
			circles.filter(function(x) { return d.Country != x.Country; })
			.transition()
			.style("opacity", 1);

			// As above, change hover properties of various text elements
			var temp = labels.filter(function(e) {
				return e.Country === d.Country
			})
			temp.style("opacity", 0);

			var temp2 = pops.filter(function(e) {
				return e.Country === d.Country
			})
			temp2.style("opacity", 0);

			var temp3 = income.filter(function(e) {
				return e.Country === d.Country
			})
			temp3.style("opacity", 0);
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
			else if(d.Region=="Oceania"){return "cyan";}     //cyan for Oceania
			else {return "rgb(0,213,233)";}  //blue for Australia
		});
	
	// Add country name for any new countries entering
	labels.enter()
		.append("text")
		.attr("font-family", "sans serif")
		.attr("font-size", "20px")
		.attr("fill", "navy")
		.attr("x", svg_width - 9 * padding)
		.attr("y", svg_height - 3 * padding)
		.attr("text-anchor", "start")
		.attr("class", "countries")
		.attr("opacity", 0)
		.text(function(d) { return d.Country + ", " + d.Year; });

	// Add population text
	pops.enter()
		.append("text")
		.attr("font-family", "sans serif")
		.attr("font-size", "16px")
		.attr("fill", "grey")
		.attr("x", svg_width - 9 * padding)
		.attr("y", svg_height - 2.4 * padding)
		.attr("text-anchor", "start")
		.attr("class", "pops")
		.attr("opacity", 0)
		.text(function(d) { return "Population: " + d.Population; });

	// Add income text
	income.enter()
		.append("text")
		.attr("font-family", "sans serif")
		.attr("font-size", "16px")
		.attr("fill", "grey")
		.attr("x", svg_width - 9 * padding)
		.attr("y", svg_height - 1.8 * padding)
		.attr("text-anchor", "start")
		.attr("class", "income")
		.attr("opacity", 0)
		.text(function(d) { return "Income: " + d.GDP; });

	// For each country, add an image element
	// Use the Country Code attribute to retrieve an image of the flag from
	// the API shown below
	//
	// NOTE: South Sudan is not included in the API, owing to it only recently
	// 	 becoming a country.  Therefore, use a locally stored image for this country.
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

	// Add the flag border
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

		// Run the visualisation function to display an initial image
		generateVis();

		// Add in axes last, so that they appear on top
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
			.attr("fill", "navy")
			.attr("transform", "translate("+ (padding/3) +","+(svg_height/2)+")rotate(-90)")
			.text("Life Expectancy (Years)");

		// Add in X-axis label
		svg.append("text")
			.attr("text-anchor", "middle")
			.attr("font-family", "sans serif")
			.attr("fill", "navy")
			.attr("transform", "translate("+ (svg_width/2) +","+(svg_height - padding/4)+")")
			.text("Income per Capita (inflation adjusted USD)");
	}


	// Add a function to the play button that runs the animation when clicked
	d3.select(".play_button")
		.on("click", function() {
			console.log("Play Button clicked!");

			// Interval function
			playInterval = setInterval(function() {
				console.log("Running loop");

				// Update the display year between each loop
				if (display_year < 1950) {
					display_year = display_year + 10;
				} else if (display_year < 2015) {
					display_year = display_year + 1;
				} else {
					clearInterval(playInterval);
				}

				// Change the year that is displayed in the background
				title.text(display_year);

				// Run the visualisation function with the current dispaly year
				generateVis();

				console.log("Year: " + display_year);
			},speed);
		});

	// Stop the animation running
	d3.select(".stop_button")
		.on("click", function(d) {
			console.log("Stop Button clicked!");
			clearInterval(playInterval);
			console.log("Year: " + display_year);
		});

	// Reset the animation back to 1900
	d3.select(".reset_button")
		.on("click", function() {
			clearInterval(playInterval);	// Stops the current animation
			console.log("Reset Button clicked!");
			display_year = 1900;		// Resets the year
			generateVis();			// Runs the visualisation once
			title.text(display_year);	// Reset the background text
		});

	d3.select("#fast_button")
		.on("click", function() {
			speed = 200
			clearInterval(playInterval)
			playInterval = setInterval(function() {
				console.log("Running loop");

				// Update the display year between each loop
				if (display_year < 1950) {
					display_year = display_year + 10;
				} else if (display_year < 2015) {
					display_year = display_year + 1;
				} else {
					clearInterval(playInterval);
				}

				// Change the year that is displayed in the background
				title.text(display_year);

				// Run the visualisation function with the current dispaly year
				generateVis();

				console.log("Year: " + display_year);
			},speed);

		})

	d3.select("#medium_button")
		.on("click", function() {
			speed = 500
			clearInterval(playInterval)
			playInterval = setInterval(function() {
				console.log("Running loop");

				// Update the display year between each loop
				if (display_year < 1950) {
					display_year = display_year + 10;
				} else if (display_year < 2015) {
					display_year = display_year + 1;
				} else {
					clearInterval(playInterval);
				}

				// Change the year that is displayed in the background
				title.text(display_year);

				// Run the visualisation function with the current dispaly year
				generateVis();

				console.log("Year: " + display_year);
			},speed);

		})

	d3.select("#slow_button")
		.on("click", function() {
			speed = 1000
			clearInterval(playInterval)
			playInterval = setInterval(function() {
				console.log("Running loop");

				// Update the display year between each loop
				if (display_year < 1950) {
					display_year = display_year + 10;
				} else if (display_year < 2015) {
					display_year = display_year + 1;
				} else {
					clearInterval(playInterval);
				}

				// Change the year that is displayed in the background
				title.text(display_year);

				// Run the visualisation function with the current dispaly year
				generateVis();

				console.log("Year: " + display_year);
			},speed);

		})
});
