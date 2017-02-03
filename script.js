var chromosomesData = [
    {
        "size": 160,
        "centromere": 40,
        "phenotype":
        [
            { "pos": 20, "label": "Teste 1", }
        ]
    },
    {
        "size": 120,
        "centromere": 60,
        "phenotype":
        [
            { "pos": 20, "label": "Teste 1", },
            { "pos": 100, "label": "Teste 2", }
        ]
    },
    {
        "size": 180,
        "centromere": 100,
        "phenotype":
        [
            { "pos": 40, "label": "Teste 1", },
            { "pos": 43, "label": "Teste 2", },
            { "pos": 46, "label": "Teste 3", },
            { "pos": 120, "label": "Teste 4", },
            { "pos": 125, "label": "Teste 5", }
        ]
    },
    {
        "size": 120,
        "centromere": 60,
        "phenotype":
        [
            { "pos": 20, "label": "Teste 1", },
            { "pos": 100, "label": "Teste 2", }
        ]
    },
    {
        "size": 180,
        "centromere": 100,
        "phenotype":
        [
            { "pos": 40, "label": "Teste 1", },
            { "pos": 120, "label": "Teste 2", },
            { "pos": 125, "label": "Teste 3", },
            { "pos": 130, "label": "Teste 4", },
            { "pos": 135, "label": "Teste 5", }
        ]
    },
    { "size": 180, "centromere": 100, "phenotype": [ { "pos": 40, "label": "Teste 1", }, { "pos": 120, "label": "Teste 2", }, { "pos": 125, "label": "Teste 3", } ] },
    { "size": 180, "centromere": 100, "phenotype": [ { "pos": 40, "label": "Teste 1", }, { "pos": 120, "label": "Teste 2", }, { "pos": 125, "label": "Teste 3", } ] },
    { "size": 180, "centromere": 100, "phenotype": [ { "pos": 40, "label": "Teste 1", }, { "pos": 120, "label": "Teste 2", }, { "pos": 125, "label": "Teste 3", } ] },
];

chromosomesData = chromosomesData.sort(function(x, y){
   return d3.descending(x.size, y.size);
})

function pl(arr){
    return(arr.map(function(x){return x.join()}).join(" "));
}

var marginRight = 100;
var marginLeft = 100;
var marginTop = 25;
var marginBottom = 25;

var ySpacing = 50;

var outerWidth = 720;
var outerHeight = 480;
var innerWidth = outerWidth - marginLeft - marginRight;
var innerHeight = outerHeight - marginTop - marginBottom;

var chrWidth = 22;
var borderRadius = 10;
var spacing = 10;
var labelMargin = 10;

var tipOffSetX = 20;
var tipOffSetY = 10;
var tipCircleRadius = 8;
var overlapThreshold = 1.5 * tipCircleRadius;

var blurAmount = 3;
var blurAlpha = 0.4;
var blurOffsetX = 3;
var blurOffsetY = 3;

var chromosomesPerLine = 6;

var x = d3.scaleLinear()
        .domain([0, chromosomesPerLine - 1])
        .range([marginLeft, outerWidth - marginRight]);

var maxLineIndex = Math.ceil(chromosomesData.length / chromosomesPerLine) - 1;
var yMax = maxLineIndex * (ySpacing + d3.max(chromosomesData,function(d){ return d.size }));

var y = d3.scaleLinear()
        .domain([0, maxLineIndex])
        .range([marginTop, yMax]);

var svg = d3.select("body").append("svg")
                           .attr("width", outerWidth)
                           .attr("height", outerHeight);

/******************************
/* filters go in defs element
******************************/
var defs = svg.append("defs");
var filter = defs.append("filter")
    .attr("id", "dropshadow")
    .attr("x", "-50%")
    .attr("y", "-50%")
    .attr("width", "200%")
    .attr("height", "200%");
filter.append("feGaussianBlur")
    .attr("in", "SourceAlpha")
    .attr("stdDeviation", blurAmount);
filter.append("feOffset")
    .attr("dx", blurOffsetX)
    .attr("dy", blurOffsetY);
filter.append("feComponentTransfer")
    .append("feFuncA")
    .attr("type", "linear")
    .attr("slope", blurAlpha);
var feMerge = filter.append("feMerge");
feMerge.append("feMergeNode");
feMerge.append("feMergeNode").attr("in", "SourceGraphic");
/******************************
/* ending filters
******************************/

var chromosomes = svg.selectAll("g")
                    .data(chromosomesData)
                    .enter()
                    .append("g")
                    .attr("class","chromosome-group")
                    .attr("transform", function(d,i) {
                        var xPos = (x(i % chromosomesPerLine) - chrWidth/2 - tipOffSetX/2 - tipCircleRadius/2);
                        var yPos = y(Math.floor(i/chromosomesPerLine));
                        return "translate(" + xPos + "," + yPos + ")"
                    });

var upperArms = chromosomes.append("rect")
                        .attr("rx", borderRadius)
                        .attr("ry", borderRadius)
                        .attr("width", chrWidth)
                        .attr("height", function(d){ return d.centromere });

var lowerArms = chromosomes.append("rect")
                        .attr("rx", borderRadius)
                        .attr("ry", borderRadius)
                        .attr("width", chrWidth)
                        .attr("transform", function(d,i) { return "translate(0," + d.centromere + ")"; })
                        .attr("height", function(d){ return (d.size - d.centromere) });

var annotation = chromosomes.selectAll("g")
                            .data(function(d){
                                d.phenotype = d.phenotype.sort(function(x, y){ return d3.ascending(x.pos, y.pos) });
                                var offsets = 0;
                                var offsetsBeforeCentromere = 0;
                                var phenotype = d.phenotype.map(function(p, i){
                                    var overlapOffset = 0;
                                    var direction = (p.pos > d.centromere ? 1 : -1);
                                    if (i>0){
                                        var dist = d.phenotype[i].pos - d.phenotype[i-1].pos;
                                        overlapOffset = dist < overlapThreshold ? overlapThreshold - dist : 0;
                                        offsets += overlapOffset;
                                        offsetsBeforeCentromere += direction == -1 ? overlapOffset : 0;
                                    }
                                    return {
                                        pos: p.pos,
                                        label: p.label,
                                        direction: direction,
                                        overlapOffset: offsets
                                    }
                                });                                
                                phenotype = phenotype.map(function(p){
                                    p.offsetFix = offsetsBeforeCentromere;
                                    return p
                                })
                                return phenotype
                            })
                            .enter()
                            .append("g")
                            .attr("class","annot");

var annotationLines = annotation.append("polyline")
                                .attr("points", function(d) {
                                    return pl([
                                        [0, d.pos],
                                        [chrWidth, d.pos],
                                        [chrWidth + tipOffSetX, d.overlapOffset + d.pos + (d.direction * tipOffSetY) - d.offsetFix]
                                    ])
                                });

var annotationCircles = annotation.append("circle")   
                                .attr("cx", chrWidth + tipOffSetX )
                                .attr("cy", function(d) { return d.overlapOffset + d.pos + (d.direction * tipOffSetY) - d.offsetFix })
                                .attr("r", tipCircleRadius)
                                .attr("class", "tip-human");
