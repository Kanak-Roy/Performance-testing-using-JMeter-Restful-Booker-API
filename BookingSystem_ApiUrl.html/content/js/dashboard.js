/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 60.0, "KoPercent": 40.0};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "CreateToken "], "isController": false}, {"data": [0.0, 500, 1500, "GetBookingIds"], "isController": false}, {"data": [1.0, 500, 1500, "PartialUpdateBooking"], "isController": false}, {"data": [0.0, 500, 1500, "DeleteBooking"], "isController": false}, {"data": [0.0, 500, 1500, "CreateBooking"], "isController": false}, {"data": [0.75, 500, 1500, "GetSpecificBooking"], "isController": false}, {"data": [1.0, 500, 1500, "UpdateBooking"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 50, 20, 40.0, 480.0, 231, 3642, 236.0, 1962.9999999999973, 2582.7499999999995, 3642.0, 8.567511994516792, 40.643306363519535, 2.2506452407470867], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["CreateToken ", 5, 5, 100.0, 232.8, 231, 235, 232.0, 235.0, 235.0, 235.0, 4.142502071251036, 3.1182037075393536, 1.0234892812758907], "isController": false}, {"data": ["GetBookingIds", 5, 0, 0.0, 2663.6, 2151, 3642, 2549.0, 3642.0, 3642.0, 3642.0, 1.372872048325096, 54.670875377539815, 0.18769735035694673], "isController": false}, {"data": ["PartialUpdateBooking", 5, 0, 0.0, 237.2, 235, 238, 238.0, 238.0, 238.0, 238.0, 4.088307440719542, 3.644342804578904, 1.3334909035159443], "isController": false}, {"data": ["DeleteBooking", 5, 5, 100.0, 237.8, 232, 246, 233.0, 246.0, 246.0, 246.0, 4.032258064516129, 2.9635521673387095, 1.1183215725806452], "isController": false}, {"data": ["CreateBooking", 5, 5, 100.0, 240.2, 236, 248, 239.0, 248.0, 248.0, 248.0, 4.00320256204964, 3.6912342373899114, 1.8295886709367493], "isController": false}, {"data": ["GetSpecificBooking", 20, 5, 25.0, 236.95000000000002, 232, 271, 234.5, 242.4, 269.59999999999997, 271.0, 6.837606837606837, 5.849692841880342, 1.1418269230769231], "isController": false}, {"data": ["UpdateBooking", 5, 0, 0.0, 240.6, 233, 256, 234.0, 256.0, 256.0, 256.0, 4.088307440719542, 3.6523277800490592, 2.104041036385936], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: code expected to equal /\\n\\n****** received  : 20[[[1]]]\\n\\n****** comparison: 20[[[0]]]\\n\\n/", 5, 25.0, 10.0], "isController": false}, {"data": ["Test failed: code expected to equal /\\n\\n****** received  : 20[[[0]]]\\n\\n****** comparison: 20[[[1]]]\\n\\n/", 10, 50.0, 20.0], "isController": false}, {"data": ["404/Not Found", 5, 25.0, 10.0], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 50, 20, "Test failed: code expected to equal /\\n\\n****** received  : 20[[[0]]]\\n\\n****** comparison: 20[[[1]]]\\n\\n/", 10, "Test failed: code expected to equal /\\n\\n****** received  : 20[[[1]]]\\n\\n****** comparison: 20[[[0]]]\\n\\n/", 5, "404/Not Found", 5, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["CreateToken ", 5, 5, "Test failed: code expected to equal /\\n\\n****** received  : 20[[[0]]]\\n\\n****** comparison: 20[[[1]]]\\n\\n/", 5, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["DeleteBooking", 5, 5, "Test failed: code expected to equal /\\n\\n****** received  : 20[[[1]]]\\n\\n****** comparison: 20[[[0]]]\\n\\n/", 5, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["CreateBooking", 5, 5, "Test failed: code expected to equal /\\n\\n****** received  : 20[[[0]]]\\n\\n****** comparison: 20[[[1]]]\\n\\n/", 5, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GetSpecificBooking", 20, 5, "404/Not Found", 5, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
