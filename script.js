var chromosomes = [
    { "size": 160, "centromere": 40 },
    { "size": 100, "centromere": 25 },
    { "size": 180, "centromere": 45 }
];

var svg = d3.select("body").append("svg")
                                    .attr("width", 200)
                                    .attr("height", 200);

var rectangle = svg.selectAll("rect")
                            .data(chromosomes)
                            .enter()
                            .append("rect")
                            .attr("y", 10)
                            .attr("rx", 10)
                            .attr("ry", 10)
                            .attr("width", 25)
                            .attr("fill", "#FFF")
                            .attr("stroke", "#999");

var rectangleAttributes = rectangle
                          .attr("height", function(d,i) { return d.size; })
                          .attr("x", function(d,i) { return (parseInt(d3.select(this).attr('width'))+10)*i; });