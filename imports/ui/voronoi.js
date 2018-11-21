////////////////////////////////////////////
// FUNCTIONS RELATED TO VORONOI ANIMATION
////////////////////////////////////////////

// this is no longer in use

// function voronoiAnimation(){
//
//   let c = ["#446633","#44AA33","#338833","#227733","#448822","#448855","#447733","#337733","#888844"];
//
//   var width = 725,
//       height = 250,
//       color_qtd = 9;
//   var vertices = d3.range(300).map(function(d) {
//     // return [Math.min(Math.tan(Math.random()*Math.PI/2)/50,1)* width, Math.random() * height];
//     return [Math.min(Math.random()**2,1)*width, Math.random() * height];
//   });
//   var voronoi = d3.voronoi();
//   var svg = d3.select("#arbol-text");
//   var path = svg.append("g").selectAll("path");
//   redraw();
//
//   function redraw() {
//     path = path.data(voronoi.polygons(vertices), polygon);
//     path.exit().remove();
//     path.enter().append("path")
//         .attr("clip-path","url(#arbol-clip)")
//         .attr("fill", function(d, i) { return c[i%color_qtd];})
//         .attr("stroke","none")
//         .attr("d", polygon);
//     path.order();
//   }
//
//   function polygon(d) {
//     return "M" + d.join("L") + "Z";
//   }
// }