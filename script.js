var marginRight = 10;
var marginLeft = 10;
var marginTop = 10;
var marginBottom = 10;

var outerWidth = 720;
var outerHeight = 480;
var innerWidth = outerWidth - marginLeft - marginRight;
var innerHeight = outerHeight - marginTop - marginBottom;

var chrWidth = 22;
var spacing = 10;
var strokeColor = "#BBB";
var labelMargin = 10;

var chromosomesData = [
    {
        "size": 160,
        "centromere": 40,
        "phenotype":
        [
            {
                "pos": 20,
                "label": "Teste 1",
            }
        ]
    },
    {
        "size": 120,
        "centromere": 60,
        "phenotype":
        [
            {
                "pos": 20,
                "label": "Teste 1",
            },
            {
                "pos": 100,
                "label": "Teste 2",
            }
        ]
    },
    {
        "size": 180,
        "centromere": 100,
        "phenotype":
        [
            {
                "pos": 40,
                "label": "Teste 1",
            },
            {
                "pos": 120,
                "label": "Teste 2",
            },
            {
                "pos": 125,
                "label": "Teste 3",
            }
        ]
    }
];

chromosomesData.sort(function(a,b) { return b.size - a.size });

// var xScale = d3.scale.linear().range([0,innerWidth]).domain([0,outerWidth]);
// var yScale = d3.scale.linear().range([0,innerHeight]).domain([0,outerHeight]);

var svg = d3.select("body").append("svg")
                           .attr("width", outerWidth)
                           .attr("height", outerHeight);

var chromosomes = svg.selectAll("g")
                     .data(chromosomesData)
                     .enter()
                     .append("g")
                     .attr("transform", function(d,i) { return "translate(" + (chrWidth + spacing)*i + "," + marginTop + ")"; });

var upperArms = chromosomes.append("g")
                      .append("rect")
                      .attr("rx", 10)
                      .attr("ry", 10)
                      .attr("width", chrWidth)
                      .attr("height", function(d){ return d.centromere })
                      .attr("fill", "none")
                      .attr("stroke", strokeColor);

var lowerArms = chromosomes.append("g")
                      .append("rect")
                      .attr("rx", 10)
                      .attr("ry", 10)
                      .attr("width", chrWidth)
                      .attr("transform", function(d,i) { return "translate(0," + d.centromere + ")"; })
                      .attr("height", function(d){ return (d.size - d.centromere) })
                      .attr("fill", "none")
                      .attr("stroke", strokeColor);

var annot = chromosomes.selectAll("line")
                     .data(function(d){ console.log(d); return d.phenotype; })
                     .enter()
                     .append("line")
                     .style("stroke", "#000")
                     .attr("x1", 0)
                     .attr("y1", function(d) { return d.pos; })
                     .attr("x2", chrWidth)
                     .attr("y2", function(d) { return d.pos; })
                     .attr("x3", 200)
                     .attr("y3", function(d) { return d.pos; });

function labelLine(){

}

// var rectangle = svg.selectAll("rect")
//                             .data(chromosomes)
//                             .enter()
//                             .append("rect")
//                             .attr("y", 10)
//                             .attr("rx", 10)
//                             .attr("ry", 10)
//                             .attr("width", 25)
//                             .attr("fill", "#FFF")
//                             .attr("stroke", "#999");

// var rectangleAttributes = rectangle
//                           .attr("height", function(d,i) { return d.size; })
//                           .attr("x", function(d,i) { return (parseInt(d3.select(this).attr('width'))+10)*i; });