
d3.json("samples.json").then((data) => {
  //   create array of values for dropdown list
  let totalSubjects = data["metadata"].length;
  let userValue = 0;
  subjectIds = [];
  for (var i = 0; i < totalSubjects; i++) {
    subjectIds.push(data["metadata"][i].id);
  };

  //  create dropdown list from array of test subject IDs     //    var selDataset = {subjectIds};
  var select = document.getElementById("selDataset");

  for (index in subjectIds) {
    select.options[select.options.length] = new Option(subjectIds[index], subjectIds[index]);
  }
  buildCharts(subjectIds[0]);
  metadata(subjectIds[0]);
});

function buildCharts(sampleId) {
  d3.json("samples.json").then((data) => {
    const dataValues = data.samples.filter(sample => sample.id == sampleId)[0]

    // create variables
    var sampleValues = dataValues["sample_values"];
    var otuIds = dataValues["otu_ids"];
    var otuLabels = dataValues["otu_labels"];

    // slice data for horizontal bar chart
    var barSampleValues = sampleValues.slice(0, 10).reverse();
    var barOtuIds = otuIds.slice(0, 10).reverse();
    var barOtuLabels = otuLabels.slice(0, 10).reverse();

    // reformat y-axis labels
    newIds = [];
    for (var i = 0; i < barOtuIds.length; i++) {
      newIds.push("OTU " + barOtuIds[i]);
    };

    // create array for bar chart
    var trace1 = [{
      type: "bar",
      x: barSampleValues,
      y: newIds,
      orientation: "h",
      text: barOtuLabels
    }];
    Plotly.newPlot("bar", trace1);

    // create array for bubble chart
    var trace2 = [{
      x: otuIds,
      y: sampleValues,
      text: otuLabels,
      mode: "markers",
      marker: {
        color: otuIds,
        colorscale: "Earth",
        size: sampleValues
      }
    }];

    Plotly.newPlot("bubble", trace2);
  });
}

function metadata(sampleId) {
  d3.json("samples.json").then((data) => {
    const metaData = data.metadata.filter(sample => sample.id == sampleId)[0]

    Object.entries(metaData).forEach(([key, value]) => {
      details = [`${key} : ${value}`]

      // create a <p> node
      var panelUpdate = document.createElement("p");

      // create a text node 
      var newContent = document.createTextNode(details);

      // append the text node to the <p> node
      panelUpdate.appendChild(newContent);

      // append <p> node to panel body
      document.getElementById("sample-metadata").appendChild(panelUpdate);
    });

    // calculate endpoint for the marker
    var wfreq = metaData.wfreq;
    var degrees = (180 - (wfreq) * 20);
    radius = 0.5;
    var radians = degrees * Math.PI / 180;
    var x = radius * Math.cos(radians);
    var y = radius * Math.sin(radians);

    // calculate path to "move" marker
    var mainPath = "M -.0 -0.035 L .0 0.035 L ", // starting point
      pathX = String(x),
      space = " ",
      pathY = String(y),
      pathEnd = " Z";  // shorthand for returning to starting point
    var path = mainPath.concat(pathX, space, pathY, pathEnd);

    // create array for gauge chart
    var trace3 = [{  // create base (dot) for needle
      type: "category",
      x: [0],
      y: [0],
      marker: { size: 20, color: "rgb(133,0,14)" },
      showlegend: false,
      name: "Wash Frequency",
      text: wfreq,
      hoverinfo: "text+name"
    },
    {  // create gauge
      values: [50, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9],
      labels: [" ", "0-1", "1-2", "2-3", "3-4", "4-5", "5-6", "6-7", "7-8", "8-9"],
      marker: {
        colors: ["rgb(255,255,255,0)", "rgba(240,235,210,0.5)",
          "rgba(230,220,210,0.5)", "rgba(200,205,150,0.5)",
          "rgba(200,210,85,0.5)", "rgba(170,200,40,0.5)",
          "rgba(110,155,15,0.5)", "rgba(15,125,0,0.5)",
          "rgba(0,102,40,0.5)", "rgba(0,80,0,0.5)"
        ]
      },
      name: "gauge",
      hole: 0.4,
      type: "pie",
      direction: "clockwise",
      rotation: 90,
      hoverinfo: "label",
      textinfo: "label",
      showlegend: false,
      textposition: "inside"
    }];

    var layout = {
      shapes: [{
        type: "path",
        path: path,  // to move needle
        fillcolor: "rgb(133,0,14)",
        line: {
          color: "rgb(133,0,14)"
        }
      }],
      title: "Belly Button Washing Frequency<br>Scrubs per Week",
      height: 500,
      width: 500,
      xaxis: { visible: false, range: [-1, 1] },
      yaxis: { visible: false, range: [-1, 1] }
    };
    Plotly.newPlot("gauge", trace3, layout);
  });
};

//  create event for selection of test subject ID
document.getElementById("selDataset").onchange = function () {
  document.getElementById("sample-metadata").innerHTML = "";
  buildCharts(this.value);
  metadata(this.value);
};