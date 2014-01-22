function generate_circle_centers(lat, lng, radius) {

    // FIRST DRAW A RECTANGLE AROUND THE POLYGON, BASED ON ITS WIDEST POINTS. // THEN SPLIT IT INTO A GRID BASED ON THE SIZE OF THE INSTAGRAM MAX
    // SUBSCRIPTION DISTANCE: 5000 METRES

    // One side of a unit of the grid measures the distance of the side of the
    // largest square that will fit in an Instagram search circle.
    var unit = (2 * 5000) / Math.sqrt(2)

    // Find bounds of the grid. Bounds exceed desired radius by less
    // than one unit.
    var x_max = y_max = parseInt(Math.ceil(radius / unit))

    // Generate centers for the grid without considering latitude
    // or longitude yet.
    var pts = [];
    for (i  = -x_max; i < x_max+1; i++) {
        for (j  = -y_max; j < y_max+1; j++) {
            if ( (i+0.5) < x_max && (j+0.5) < y_max ) {
                pts.push( [ unit * (i+0.5), unit*(j+0.5) ] )
            }
        }
    }

    // some useful maths
    var toDegrees = function(angle) {
        return angle * (180 / Math.PI);
    }

    // more useful maths
    var toRadians = function(angle) {
      return angle * (Math.PI / 180);
    }

    // useful hard maths to map the centers to lat lng values, in degrees.
    lng_change = function(x, lat1, lat2) {
        return toDegrees( x / ( 6371000 * Math.cos( toRadians( (lat1 + lat2) / 2 ) ) ) )
    }

    // same as above
    lat_change = function(y) {
        return toDegrees(y/6371000)
    }
      
    // create an array to hold our subscription circle centre points  
    centers = [];

    // look at each circle. if the centre 
    for(i = 0; i < pts.length; i++) {
        var x = pts[i][1];
        var y = pts[i][0];
        if (Math.sqrt(x*2 + y*2) > radius + 5000) {
            continue;
        }
    
        centers.push( [
                lat_change(y) + lat,
                lng_change(x, lat, lat+lat_change(y)) + lng
            ]
        )
    }

    // DRAW CIRCLES!
    for(i = 0; i < centers.length; i++){

        var circleCentre = new google.maps.LatLng( centers[i][0], centers[i][1] )

        if ( google.maps.geometry.poly.containsLocation( circleCentre, drawnPolygon) || bdccGeoDistanceToPolyMtrs(drawnPolygon, circleCentre) < unit ) {

            cityCircle = new google.maps.Circle({
                strokeColor: '#999',
                strokeOpacity: 0.8,
                strokeWeight: 1,
                fillColor: '#ff9900',
                fillOpacity: 0.35,
                map: map,
                center: circleCentre,
                radius: 5000
            });
        }
    };

    // we've drawn the circles, but let's return the points so we can display
    // them somewhere on the screen
    return centers;
}





// Code to find the distance in metres between a lat/lng point and a polyline
// of lat/lng points
// All in WGS84. Free for any use.
//
// Bill Chadwick 2007
        
// Construct a bdccGeo from its latitude and longitude in degrees
function bdccGeo(lat, lon) 
{
    var theta = (lon * Math.PI / 180.0);
    var rlat = bdccGeoGeocentricLatitude(lat * Math.PI / 180.0);
    var c = Math.cos(rlat); 
    this.x = c * Math.cos(theta);
    this.y = c * Math.sin(theta);
    this.z = Math.sin(rlat);        
}

bdccGeo.prototype = new bdccGeo();


// Methods =================================================

//Maths
bdccGeo.prototype.dot = function( b) {
    return ((this.x * b.x) + (this.y * b.y) + (this.z * b.z));
}

//More Maths
bdccGeo.prototype.scale = function( s) {
    var r = new bdccGeo(0,0);
    r.x = this.x * s;
    r.y = this.y * s;
    r.z = this.z * s;
    return r;
}

//distance in radians from this point to point v2
bdccGeo.prototype.distance = function( v2) {
    return Math.atan2(v2.crossLength(this), v2.dot(this));
}

// point on opposite side of the world to this point
bdccGeo.prototype.antipode = function() {
    return this.scale(-1.0);
}


// internal helper functions =========================================

//from Radians to Meters
function bdccGeoRadiansToMeters(rad) {
    return rad * 6378137.0; // WGS84 Equatorial Radius in Meters
}


//More Maths
bdccGeo.prototype.crossLength = function( b) {
    var x = (this.y * b.z) - (this.z * b.y);
    var y = (this.z * b.x) - (this.x * b.z);
    var z = (this.x * b.y) - (this.y * b.x);
    return Math.sqrt((x * x) + (y * y) + (z * z));
}

// Convert from geographic to geocentric latitude (radians).
function bdccGeoGeocentricLatitude(geographicLatitude) {
    var flattening = 1.0 / 298.257223563;//WGS84
    var f = (1.0 - flattening) * (1.0 - flattening);
    return Math.atan((Math.tan(geographicLatitude) * f));
}

// Returns the two antipodal points of intersection of two great
// circles defined by the arcs geo1 to geo2 and
// geo3 to geo4. Returns a point as a Geo, use .antipode to get the other point
function bdccGeoGetIntersection( geo1,  geo2,  geo3,  geo4) {
    var geoCross1 = geo1.crossNormalize(geo2);
    var geoCross2 = geo3.crossNormalize(geo4);
    return geoCross1.crossNormalize(geoCross2);
}

// More Maths
bdccGeo.prototype.crossNormalize = function( b) {
    var x = (this.y * b.z) - (this.z * b.y);
    var y = (this.z * b.x) - (this.x * b.z);
    var z = (this.x * b.y) - (this.y * b.x);
    var L = Math.sqrt((x * x) + (y * y) + (z * z));
    var r = new bdccGeo(0,0);
    r.x = x / L;
    r.y = y / L;
    r.z = z / L;
    return r;
}

// returns in meters the minimum of the perpendicular distance of this point
// from the line segment geo1-geo2
// and the distance from this point to the line segment ends in geo1 and geo2 
bdccGeo.prototype.distanceToLineSegMtrs = function(geo1, geo2) {            

    //point on unit sphere above origin and normal to plane of geo1,geo2
    //could be either side of the plane
    var p2 = geo1.crossNormalize(geo2); 

    // intersection of GC normal to geo1/geo2 passing through p with GC geo1/geo2
    var ip = bdccGeoGetIntersection(geo1,geo2,this,p2); 

    //need to check that ip or its antipode is between p1 and p2
    var d = geo1.distance(geo2);
    var d1p = geo1.distance(ip);
    var d2p = geo2.distance(ip);
    //window.status = d + ", " + d1p + ", " + d2p;
    if ((d >= d1p) && (d >= d2p)) 
        return bdccGeoRadiansToMeters(this.distance(ip));
    else
    {
        ip = ip.antipode(); 
        d1p = geo1.distance(ip);
        d2p = geo2.distance(ip);
    }
    if ((d >= d1p) && (d >= d2p)) 
        return bdccGeoRadiansToMeters(this.distance(ip)); 
    else 
        return bdccGeoRadiansToMeters(Math.min(geo1.distance(this),geo2.distance(this))); 
}

// distance in meters from GLatLng point to GPolyline or GPolygon poly
function bdccGeoDistanceToPolyMtrs(poly, point) {
    var d = 999999999;
    var i;
    var p = new bdccGeo(point.lat(),point.lng());

    for( i = 0; i < (poly.getPath().getLength()-1); i++ ) {

        xxx = poly.getPath();

        var p1 = poly.getPath().getAt(i);
        var l1 = new bdccGeo(p1.lat(),p1.lng());
        var p2 = poly.getPath().getAt(i+1);

        var l2 = new bdccGeo(p2.lat(),p2.lng());
        var dp = p.distanceToLineSegMtrs(l1,l2);

        if(dp < d)
            d = dp;    
    }
    return d;
}





function initialize() {
    
    var mapOptions = {
      center: new google.maps.LatLng(51.5072, -0.1275),
      zoom: 8
    };

    //draw map
    map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

    var drawingManager = new google.maps.drawing.DrawingManager({
        drawingControlOptions: {
          position: google.maps.ControlPosition.TOP_LEFT,
          drawingModes: [
            google.maps.drawing.OverlayType.POLYGON
          ]
        }
    });

    drawingManager.setMap(map);

    var polygonPoints = [];

    google.maps.event.addListener(drawingManager,
                                    'overlaycomplete',
                                        function(event) {
        // create a bounds object from which we can calculate the
        // centroid of the polygon
        var bounds = new google.maps.LatLngBounds();

        drawnPolygon = event.overlay;
        
        drawnPolygon.getPath().forEach(function(latlng){
            // to calculate the centroid, first add each point to a bounds object
            bounds.extend(latlng);
        
            // push lat/lngs of the polygon points into our array
            polygonPoints.push( [ latlng.lat(), latlng.lng() ]);
        });

        document.getElementById('polygonPoints').innerText = polygonPoints.join('\n');
            
        // get diameter of polygon
        var diameter = google.maps.geometry.spherical.computeDistanceBetween(bounds.getNorthEast(), bounds.getSouthWest());

        // fit circles into the polygon
        var circlePoints = generate_circle_centers( bounds.getCenter().lat(), bounds.getCenter().lng(), diameter/2 );

        document.getElementById('circlePoints').innerText = circlePoints.join('\n');
    });
}

google.maps.event.addDomListener(window, 'load', initialize);



