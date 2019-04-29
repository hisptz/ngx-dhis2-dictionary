export const COMPLETENESS_FUNCTION =
  '//Example of function implementation\n$.ajax({\n\turl: "../../../api/analytics.json?dimension=dx:" + parameters.rule.json.data + ".REPORTING_RATE&' +
  'dimension=pe:" + parameters.pe + "&dimension=ou:" + parameters.ou,\n\ttype: "GET",\n\t' +
  'success: function(analyticsResults) {\n\t    var rows = [];\n\t    analyticsResults.rows.' +
  'forEach(function(row){\n\tif(parseFloat(row[3]) > 100){\n\trow[3] = "100";\n\t}\n\trows.push' +
  '(row);\n\t    })\n\t    analyticsResults.rows = rows;\n\t\tparameters.success(analyticsResults)' +
  ';\n\t},\n\terror:function(error){\n\t\t  parameters.error(error);\n\t}\n});';
