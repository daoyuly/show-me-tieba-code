// @file $0 是选择的那个元素
var page_getProperties = function (count) {
    var data1 = window.jQuery && $0 ? jQuery.data($0) : {};


    var httpRequest = function (url, postData, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open("get", url, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                callback(xhr.responseText);
            }
        };
        xhr.send(postData);
    };


    var getData = function (cql) {
        var url = 'http://fedev.baidu.com/~liudaoyu/cq.php?cql=' + cql;

        httpRequest(url, {cql: cql}, function (response) {


            console.log(response);

        });

    };


    var parseData = function (response) {
        var data = {'a': "<a>a\r\naa</a>"};

        var cls = $0.classList;
        data.cls = cls;
        //getData('aaa');

        return data;
    };


     //var patt=/(?<=_.Module.use\(')[\w/]+/g;
     //var patt=/_.Module.use\('[^,]*'/g;
     var dom = $0;
     var data = {'demo':dom};
    
     var dom = $0;
     var cls = dom.classList || [];
     var id = dom.id || '';
     var data = {
         'dd':data1,
         'demo': dom,
         type: dom.nodeName,
         content:dom.innerText || '',
         cls: cls,
         id: id
     };



    //var pattModule=new RegExp("_.Module.use\\('[^,]*'",'g');
     var pattModule = new RegExp("_.Module.use\\(('|\")[^,]*('|\")", 'g');
     var getScriptModulePath = function (text) {

         if (!text) {
             return;
         }

         var match = pattModule.exec(text);
         if (match != null) {

             var moduleKey = match[0]
             var separator = moduleKey.indexOf("'") > 0 ? "'" : '"';
             data['modules'] = moduleKey.split(separator)[1];
         }

     }

     switch (dom.nodeName) {
         case '#text':

             if (!!dom.parentNode && dom.parentNode.nodeName == 'SCRIPT') {
                 data.type = 'INLINE-SCRIPT';
                 data.content = dom.nodeValue;
                 getScriptModulePath(dom.nodeValue);
             }

             break;

         case "SCRIPT":

             if (dom.type === 'text/template') {

                 data.type = 'tpl';

             } else {

                 if (dom.innerText == '') {

                     data.type = 'REL-SCRIPT';
                     data.content = dom.innerText;
                     data.src = dom.src;

                   console.log(data.src);

                    $.get(data.src,{}, function(response){
                          console.log(response);

                     });


                 } else {

                     data.type = 'INLINE-SCRIPT';
                     data.content = dom.innerText;
                     getScriptModulePath(dom.innerText);

                 }


             }

            
             break;

         case 'LINK':
             if (dom.rel === 'stylesheet') {
                 data.src = dom.href;
             }
             
             break;

         default:

            if (dom.attributes['ng-controller']){
                data['attributes'] = data['attributes'] || [];
                data['attributes'].push(dom.attributes['ng-controller'].value);
                console.log(dom.attributes['ng-controller'].value);

            }

             break;

     }
     
     




  

    // Make a shallow copy with a null prototype, so that sidebar does not
    // expose prototype.
    
    var props = Object.getOwnPropertyNames(data);
    var copy = {__proto__: null};
    for (var i = 0; i < props.length; ++i)
        copy[props[i]] = data[props[i]];
    
    //return dom;
    
    // 测试类型
    console.log(data);

    return data;


    //return {'a':'code query'};
};


var count = 1;

chrome.devtools.panels.elements.createSidebarPane(
    "Show Me Tieba Code",
    function (sidebar) {

        function updateElementProperties() {
            
             sidebar.setHeight('1000px');
            sidebar.setPage('/devtools-page.html');
           // sidebar.setExpression("(" + page_getProperties.toString() + ")()");


        }

        updateElementProperties();

        chrome.devtools.panels.elements.onSelectionChanged.addListener(function(){
            updateElementProperties();
        });
    });




