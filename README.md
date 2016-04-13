#NG Admin restify

AngularJS module providing configuration settings for `ng-admin`.

## Install
npm install --save ng-admin-restify

## Setup

You basically reference `ng-admin` and `ng-admin-restify` scripts and setup `angularJS` application by configuring the `ngAdminRestifyProvider`.

```
<!doctype html>
<html lang="en">
  <head>
    <title>ngAdmin Restify</title>
    <link rel="stylesheet" href="node_modules/ng-admin/build/ng-admin.min.css">
  </head>
  <body ng-app="myApp">
    <div ui-view></div>

    <script src="node_modules/ng-admin/build/ng-admin.min.js"></script>
    <script src="node_modules/ng-admin-restify/build/app.js"></script>

    <script type="text/javascript">
        angular
            .module('myApp', ['ng-admin-restify'])
            .config(function(ngAdminRestifyProvider) {
                // specify options
                var options = {
                    site: 'My Blogs',
                    url: '/v1/',
                    entities: {}
                };
                // setup ngAdmin and get application handle
                var app = ngAdminRestifyProvider.configure(options);
            })
        ;
    </script>
```

## Develop
npm install
cd build && npm install --production
cd .. && gulp
