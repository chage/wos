var fs = require('fs');
var csv = require("fast-csv");
var fileName = 'WOS-2010-2014_1018-2.csv';
var mapFileName = 'map_1018-2.csv';
var outFileName = 'out.csv';
var duplicateMark = '$';

var map = {};
var mapStream = fs.createReadStream(mapFileName);

csv.fromStream(mapStream, {headers: true})
.on('data', function(data) {
	//map[filterData(data.英文姓名)] = data.單位.trim();
	if (typeof(map[filterData(data.英文姓名)]) === 'undefined') {
		map[filterData(data.英文姓名)] = [data.單位.trim()];
	} else {
		if ((map[filterData(data.英文姓名)].indexOf(data.單位.trim()) > -1) ||
				(map[filterData(data.英文姓名)].indexOf(markDuplicate(data.單位.trim())) > -1)) {
			//console.log('found:' + data.單位.trim() + ' in ' + map[filterData(data.英文姓名)]);
			return;
		}
		if (map[filterData(data.英文姓名)].length === 1) {
			map[filterData(data.英文姓名)][0] = markDuplicate(map[filterData(data.英文姓名)][0]);
		}
		map[filterData(data.英文姓名)].push(markDuplicate(data.單位.trim()));
	}
})
.on('end', function() {
	//console.log(map);
	//console.log('done');

	csv
	.fromPath(fileName, {headers: true})
	.transform(function(obj){
		var authors = obj.作者.split(';');
		var deps = [];
		for (var i = 0; i < authors.length; i++) {
			if (typeof(map[filterData(authors[i])]) !== 'undefined') {
				//deps.push(map[filterData(authors[i])]);
				deps.push(map[filterData(authors[i])].join(';'));
				console.log('Y,"' + authors[i].trim() + '"');
			} else {
				console.log('N,"' + authors[i].trim() + '"');
			}
		}
		obj['單位'] = deps.join(';');
		return obj;
	})
	.pipe(csv.createWriteStream({headers: true}))
	.pipe(fs.createWriteStream(outFileName, {encoding: 'utf-8'}));
});

function filterData(str) {
	return str.trim().toLowerCase().replace(/[ \-,.']/g, '');
}

function markDuplicate(str) {
	return duplicateMark + str;
}
