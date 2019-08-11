function pl(arr){
    return(arr.map(function(x){return x.join()}).join(" "));
}

function sortChromosomesByName(a,b) {
    a = parseInt(a.substring(3));
    b = parseInt(b.substring(3));
    if(isNaN(a) && isNaN(b)) {
        return 1;
    } else if(isNaN(a) && !isNaN(b)) {
        return 1;
    } else if(!isNaN(a) && isNaN(b)) {
        return -1;
    } else {
        return a > b ? 1 : -1;
    }
}

function chromosummary(data, colorCallback){
    // chromosomesData.sort(function(x, y){
    //     return d3.descending(x.size, y.size);
    // });
    var chromosomesData = data.chromosomesData;
    
    var labelColor = {};
    
    var numberOfLabels = data.labels.length;

    data.labels.map(function(d,i){
        labelColor[d] = {
            id: i,
            color: d3.hsl((360/numberOfLabels)*i,1,0.5,1)
        };
    });

    // colorCallback(labelColor);
    typeof colorCallback == 'function' && colorCallback(labelColor);;

    chromosomesData.sort(function(a, b){
        return sortChromosomesByName(a.chrname, b.chrname);
    });

    var marginRight = 200;
    var marginLeft = 100;
    var marginTop = 75;
    var marginBottom = 25;

    var ySpacing = 150;

    var outerWidth = 1280;
    var outerHeight = 1080;
    var innerWidth = outerWidth - marginLeft - marginRight;
    var innerHeight = outerHeight - marginTop - marginBottom;

    var chrWidth = 20;
    var borderRadius = 10;
    var spacing = 10;
    var labelMargin = 10;
    var chrMinHeight = 0;
    var chrMaxHeight = 200;

    var tipOffSetX = 22;
    var tipOffSetY = 9;
    var tipCircleRadius = 4;
    var overlapThreshold = 1.5 * tipCircleRadius;
    var groupThreshold = 2;

    var blurAmount = 1;
    var blurAlpha = 0.25;
    var blurOffsetX = 0;
    var blurOffsetY = 2;

    var chromosomesPerLine = 12;

    var x = d3.scaleLinear()
            .domain([0, chromosomesPerLine - 1])
            .range([marginLeft, outerWidth - marginRight]);

    var chromosomeMaxSize = d3.max(chromosomesData,function(d){ return d.size });

    var chromosomeHeight = d3.scaleLinear()
            .domain([0, chromosomeMaxSize])
            .range([chrMinHeight, chrMaxHeight]);

    var maxLineIndex = Math.ceil(chromosomesData.length / chromosomesPerLine) - 1;
    var yMax = maxLineIndex * (ySpacing + chromosomeHeight(chromosomeMaxSize));

    var y = d3.scaleLinear()
            .domain([0, maxLineIndex])
            .range([marginTop, yMax]);

    var div = d3.select("body").append("div")
                .attr("class", "tooltip")
                // .style("max-width", 100)
                .style("opacity", 0);

    var chromosummaryDiv = document.getElementById("chromosummary");

    var svg = d3.select(chromosummaryDiv).append("svg")
                            .attr("width", chromosummaryDiv.clientWidth)
                            .attr("height", chromosummaryDiv.clientHeight)
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

    var chromosomeNames = chromosomes.append("text")
                                    .attr("x", chrWidth/2)
                                    .attr("y", "-20px")
                                    .attr("text-anchor","middle")
                                    .attr("font-weight","bold")
                                    .attr("fill","#CCC")
                                    .text(function(d){
                                        return d.chrname;
                                    })

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
                                .attr("data-phenotype", function(d) { return labelColor[d.label].id} )
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
                                    .attr("fill", function(d) { return labelColor[d.label].color} )
                                    .attr("class", "tip-human")
                                    .on("mouseover", function(d) {

                                        d3.json("https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term="+d.gene+"&retmax=3&retmode=json", function(pids) {
                                            
                                            d3.json("https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id="+pids.esearchresult.idlist.join(',')+"&retmode=json", function(psum) {
                                            
                                                console.log(psum);
                                                
                                                var titles = [];

                                                for(var i=0;i<psum.result.uids.length;i++){

                                                    var current = psum.result.uids[i]; 
                                                    
                                                    titles.push(psum.result[current].title);

                                                }

                                                d3.select('#pubmed').html(titles.join('<hr>'));

                                            });

                                        });

                                        var ttHTML = "<b>Gene:</b> "+d.gene+"<br/>"
                                                   + "<b>Phenotype:</b> "+d.label+"<br/>"
                                                   + "<b>Chromosome:</b> "+d.chrname+"<br/>"
                                                   + "<b>Position:</b> "+d.position+"<br/>"
                                                   + "<hr>"
                                                   + "<div id='pubmed'></div>";
                                        
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
