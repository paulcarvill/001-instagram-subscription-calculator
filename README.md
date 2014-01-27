001-instagram-subscription-calculator
=====================================

Works out how many instagram real-time subscriptions (maximum radius is 5000 meters) are needed to fill a polygon drawn on google maps, and gives you their centre point latitudes and longitudes.

**Using it:**

1. run index.html
2. select polygon drawing tool
3. draw a polygon on the map. on completion of the polygon...
4. ...the polygon points are shown as lat/lngs
5. ...the centre points of all 5km radius circles in the polygon are shown as lat/lngs
6. use these points to create instagram subscriptions. there may be a limit on how many subscriptions you can create per API client

demo: [http://paulcarvill.github.com/001-instagram-subscription-calculator](http://paulcarvill.github.com/001-instagram-subscription-calculator)


**Notes and sources:**

*The general approach was informed by some work by iStrategyLabs here:*
[http://istrategylabs.com/2012/08/finding-instagrams-most-wanted/](http://istrategylabs.com/2012/08/finding-instagrams-most-wanted/)

*I also converted their algorithm for calculating distances on the Earth's surface from Python to JavaScript.*

*The complicated maths for calculating distances between lat/lng points and a polyline or polygon on a Google maps was taken from Bill Chadwick's "DISTANCE POINT TO POLYLINE OR POLYGON" script here:*
[http://www.bdcc.co.uk/Gmaps/BdccGmapBits.htm](http://www.bdcc.co.uk/Gmaps/BdccGmapBits.htm)

*I updated Bill's script to work with Google Maps API v3.*


