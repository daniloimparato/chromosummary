d3.tsv("calli_chromosomes.tsv",function(err,chromosomesData){
    if (err) throw error;
    chromosomesData.map(function(x){
        x.size = parseInt(x.size);
        x.phenotype = [];
    });
    getPhenotype(chromosomesData);
});

function getPhenotype(chromosomesData){
    d3.tsv("calli_gwas.tsv",function(err,phenotypeData){
        phenotypeData.map(function(phenotype){
            phenotype.position = parseInt(phenotype.position);
            chromosomesData.filter(function(chromosome){
                return chromosome.chrname==phenotype.chrname;
            })[0].phenotype.push(phenotype);
        })
        console.log(chromosomesData);
        chromosummary(chromosomesData);
    });
}

function pl(arr){
    return(arr.map(function(x){return x.join()}).join(" "));
}

function chromosummary(chromosomesData){
    chromosomesData.sort(function(x, y){
        return d3.descending(x.size, y.size);
    });

    var marginRight = 100;
    var marginLeft = 100;
    var marginTop = 75;
    var marginBottom = 25;

    var ySpacing = 200;

    var outerWidth = 1280;
    var outerHeight = 1080;
    var innerWidth = outerWidth - marginLeft - marginRight;
    var innerHeight = outerHeight - marginTop - marginBottom;

    var chrWidth = 18;
    var borderRadius = 10;
    var spacing = 10;
    var labelMargin = 10;

    var tipOffSetX = 22;
    var tipOffSetY = 10;
    var tipCircleRadius = 4;
    var overlapThreshold = 1.5 * tipCircleRadius;
    var groupThreshold = 2;

    var blurAmount = 3;
    var blurAlpha = 0.4;
    var blurOffsetX = 3;
    var blurOffsetY = 3;

    var chromosomesPerLine = 12;

    var x = d3.scaleLinear()
            .domain([0, chromosomesPerLine - 1])
            .range([marginLeft, outerWidth - marginRight]);

    var chromosomeMaxSize = d3.max(chromosomesData,function(d){ return d.size });

    var chromosomeHeight = d3.scaleLinear()
            .domain([0, chromosomeMaxSize])
            .range([0, 400]);

    var maxLineIndex = Math.ceil(chromosomesData.length / chromosomesPerLine) - 1;
    var yMax = maxLineIndex * (ySpacing + chromosomeHeight(chromosomeMaxSize));

    var y = d3.scaleLinear()
            .domain([0, maxLineIndex])
            .range([marginTop, yMax]);

    var div = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

    var svg = d3.select("#chromosummary").append("svg")
                            .attr("width", outerWidth)
                            .attr("height", outerHeight)
                            .call(d3.zoom().on("zoom", function () {
                                svg.attr("transform", d3.event.transform)
                            }))
                            .append("g");

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
                            .attr("height", function(d){ return chromosomeHeight(d.centromere==0 ? d.size : d.centromere) });

    var lowerArms = chromosomes.append("rect")
                            .attr("rx", borderRadius)
                            .attr("ry", borderRadius)
                            .attr("width", chrWidth)
                            .attr("transform", function(d,i) { return "translate(0," + chromosomeHeight(d.centromere) + ")"; })
                            .attr("height", function(d){ return chromosomeHeight(d.size - d.centromere) });

    var annotation = chromosomes.selectAll("g")
                                .data(function(d){
                                    var upperAnnotation = d.phenotype.filter(function(p){ return p.position <= d.centromere })
                                                                     .sort(function(x, y){ return d3.descending(x.position, y.position) });

                                    upperAnnotation.map(function(p, i){
                                        p.overlapOffset = 0;
                                        p.direction = (p.position > d.centromere ? 1 : -1);
                                        if (i>0){
                                            var dist = (chromosomeHeight(upperAnnotation[i-1].position) + upperAnnotation[i-1].overlapOffset) - chromosomeHeight(upperAnnotation[i].position);
                                            p.overlapOffset = dist < overlapThreshold ? dist - overlapThreshold : 0;
                                            console.log(dist < groupThreshold);
                                        }
                                    });


                                    var lowerAnnotation = d.phenotype.filter(function(p){ return p.position > d.centromere })
                                                                     .sort(function(x, y){ return d3.ascending(x.position, y.position) });

                                    lowerAnnotation.map(function(p, i){
                                        p.overlapOffset = 0;
                                        p.direction = (p.position > d.centromere ? 1 : -1);
                                        if (i>0){
                                            var dist = chromosomeHeight(lowerAnnotation[i].position) - (chromosomeHeight(lowerAnnotation[i-1].position) + lowerAnnotation[i-1].overlapOffset);
                                            p.overlapOffset = dist < overlapThreshold ? overlapThreshold - dist : 0;
                                        }
                                    });
                                    
                                    return upperAnnotation.concat(lowerAnnotation);
                                })
                                .enter()
                                .append("g")
                                .attr("class","annot");

    var annotationLines = annotation.append("polyline")
                                    .attr("points", function(d) {
                                        var pos = chromosomeHeight(d.position);
                                        return pl([
                                            [0, pos],
                                            [chrWidth, pos],
                                            [chrWidth + tipOffSetX, pos + d.overlapOffset + (d.direction * tipOffSetY)]
                                        ])
                                    });

    var annotationCircles = annotation.append("circle")   
                                    .attr("cx", chrWidth + tipOffSetX )
                                    .attr("cy", function(d) { return chromosomeHeight(d.position) + d.overlapOffset + (d.direction * tipOffSetY) })
                                    .attr("r", tipCircleRadius)
                                    .attr("class", "tip-human")
                                    .on("mouseover", function(d) {
                                        var ttHTML = "<b>Gene:</b> "+d.label+"<br/>"
                                                   + "<b>Chromosome:</b> "+d.chrname+"<br/>"
                                                   + "<b>Position:</b> "+d.position+"<br/>"
                                                   + "<hr>";
                                        
                                        div.transition()
                                            .duration(200)
                                            .style("opacity", .95);
                                        div.html(ttHTML)
                                            .style("left", (d3.event.pageX) + "px")
                                            .style("top", (d3.event.pageY - 28) + "px");
                                    })
                                    .on("mouseout", function(d) {
                                        div.transition()
                                            .duration(500)
                                            .style("opacity", 0);
                                    });
}
