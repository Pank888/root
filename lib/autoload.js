'use strict';

var fs = require('fs')
	, path = require('path')
	, vhost = require('vhost')
	, U = require(path.join(__dirname, 'utils'))

	, skeleton = require( path.join(__dirname, 'skeleton') )
;

module.exports = function autoload(M) {
	var hosts = M.get('dirs').hosts;
	U.log('autoload M called with dir: ', M.get('dirs').hosts);
	findHosts(M.get('dirs').hosts).forEach( function(map) {
		var p = path.join(map.dir, map.file);

		U.log('mounting host ', map);

		mountHost(M, require(p), map.dir);
	});
}

function mountHost(M, s, dir) {
	var S = skeleton(M, s, dir)
		, hosts = require( path.join(dir, 'package.json') ).config.hosts
	;
	U.log('mounting host')
	for (var subhost in hosts ) {
		M.use( vhost(hosts[subhost], S) );
		U.log('vhosts started for subhost ' + hosts[subhost]);
	}
}

function findHosts (dir) {
	var results = [];
	fs.readdirSync(dir).forEach( function(file) {
		var fileDir = path.join(dir, file)
			, stat = fs.statSync(fileDir)
		;

		if ( stat && stat.isDirectory() ) {
			results = results.concat( findHosts(fileDir) );
		} else {
			if ( file.match(/H.js/) ) {
				results.push({ dir: dir, file: file });
			}
		}
	});
	return results;
}
