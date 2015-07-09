var csCodeUrlByPath = 'http://cs.baidu.com/s?cql=path%3Aapp%2Fsearch%2Fforum%2Ftrunk%2Ffe%2F+';

var modelUrl = 'http://tbfe.baidu.com:8081/s?wd=';

// 格式化代码
var tbCodeFormatUrl = 'http://fedev.baidu.com/~liudaoyu/getJsCode.php?jspath=';

var codeSearchUrl = {
    tieba: 'http://tbfe.baidu.com:8081/searchCode?wd=',
    // 百度寻码
    baidu: 'http://cs.baidu.com/s?cql=',
    // github 代码搜索
    github: 'https://github.com/search?l=javascript&ref=simplesearch&type=Code&q=',

    searchcode: 'https://searchcode.com/?q='

};

var queryPath = codeSearchUrl['tieba'];

// Function executed in the context of the inspected page, the function has access
// to the $0 variable containing the selected element in the devtools elements panel.
// Returns the corresponding view index if exists, otherwise returns undefined.
// Note: assumes that the backbone agent is active.
var getSelectElementData = function () {
    var dom = $0;
    var cls = dom.classList || [];
    var id = dom.id || '';
    var data = {
        type: dom.nodeName,
        content: dom.innerText || '',
        cls: cls,
        id: id,
        attributes: []
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

    };

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

                } else {

                    data.type = 'INLINE-SCRIPT';
                    data.content = dom.innerText;
                    getScriptModulePath(dom.innerText);

                }


            }


            break;

        case 'LINK':
            if (dom.rel && dom.rel.toLowerCase() === 'stylesheet') {
                data.src = dom.href;
            }

            break;

        default:

            if (dom && dom.attributes && dom.attributes['ng-controller']) {

                data.attributes.push(dom.attributes['ng-controller'].value);

            }

            break;

    }

    var storage = window.localStorage;
    data['extraData'] = {
        hostname: window.location.hostname,
        isUsedInTieba: storage.getItem('isUsedInTieba') || 'enable',
        csProvider: storage.getItem('csProvider') || 'tieba'
    };

    return data;
};


window.onload = function () {

    // check if the backbone agent is active
    chrome.devtools.inspectedWindow.eval("(" + getSelectElementData + ")()", function (result, isException) {
        if (isException) throw result;
        if (!result) {
            return;
        }

        main(result);

    });
};

function saveData(isUsedInTieba, csProvider) {

    var storage = window.localStorage;
    storage.setItem('isUsedInTieba', isUsedInTieba);
    storage.setItem('csProvider', csProvider);

}

function saveDataInspectedWindow(isUsedInTieba, csProvider) {
    // check if the backbone agent is active
    chrome.devtools.inspectedWindow.eval("(" + saveData.toString() + ")('" + isUsedInTieba + "','" + csProvider + "')", function (result, isException) {
    });
}


function main(result) {


    var isUsedInTieba = result.extraData.isUsedInTieba;
    var csProvider = result.extraData.csProvider;
    initSetting(isUsedInTieba, csProvider);


    var hostname = result.extraData.hostname;


    queryPath = codeSearchUrl[csProvider];
    var isTiebaPage = hostname.indexOf('baidu.com') > -1;
    isUsedInTieba = (isUsedInTieba != 'disenable') && isTiebaPage;

    if (isUsedInTieba) {
        generatorClassBtn(result);
    }

    bindModalEvent();
}


function generatorClassBtn(result) {

    if (!result) {
        return;
    }

    var cls = result.cls;
    var domId = result.id;
    var nodeType = result.type;
    var attributes = result.attributes;

    if (!cls && !domId) {
        return;
    }


    var btnList = "";


    switch (nodeType) {

        case 'INLINE-SCRIPT':


            hideQueryCode();

            if (result.modules) {

                // 只是模块路径

                btnList += '<a class="btn btn-info j-class-btn ">' + result.modules + '<a>';
                //queryPath = modelUrl;

                queryModule(result.modules);

            } else if (result.content) {

            }


            // 只是代码

            var js_source_text = document.getElementById('code');
            js_source_text.textContent = js_beautify(result.content);

            $('pre code').each(function (i, block) {
                hljs.highlightBlock(block);
            });


            break;


        case 'REL-SCRIPT':


            var rel_url = result.src;
            if (rel_url) {
                formatCode(rel_url);
            }


            break;


        case 'LINK':

            var rel_url = result.src;
            if (rel_url) {
                formatCode(rel_url);
            }

            break;

        default:

            for (var i = 0, len = cls.length; i < len; i++) {
                btnList += '<a class="btn btn-primary j-class-btn ">' + cls[i] + '<a>';
            }

            for (var i = 0, len = attributes.length; i < len; i++) {
                btnList += '<a class="btn btn-success j-class-btn ">' + attributes[i] + '<a>';
            }

            if (domId != "") {
                btnList += '<a class="btn btn-info j-class-btn ">' + domId + '<a>';
            }

            //queryPath = csCodeUrlByPath;
            queryCode(cls[0] || domId);

            break;

    }


    $('.navbar-btn').html(btnList);


    bindBtnEvent();
}


function bindModalEvent() {

    $('#saveSetting').click(function () {

        var useInTieba = $(".useInTieba input[type='radio']:checked").val();
        var csProvider = $(".csProvider input[type='radio']:checked").val();

        saveDataInspectedWindow(useInTieba, csProvider);


        $('#myModal').modal('hide');

    });

}

function initSetting(isUsedInTieba, csProvider) {
    $(".useInTieba input[value='" + isUsedInTieba + "']").attr('checked', 'true');
    $(".csProvider input[value='" + csProvider + "']").attr('checked', 'true');
}


function bindBtnEvent() {
    $('.navbar-header').on('click', '.j-class-btn', function () {
        var cls = $(this).html();
        queryCode(cls);
    });

}


var $csCode = $('#cs-code-iframe');

function queryCode(key) {

    showQueryCode();
    if (!key) {
        return;
    }

    var url = queryPath + key;
    $csCode.attr('src', url);
}

function queryModule(key) {

    showQueryCode();

    if (!key) {
        return;
    }


    // 需要吧user/widget/SingleIcons 转换成 user/widget/single_icons
    var widgetPath = key;
    var widgetName = widgetPath.substr(widgetPath.lastIndexOf('/') + 1, widgetPath.length);
    var namePart = widgetName.replace(/[A-Z]/g, function (w) {
        w = w.toLowerCase();
        return '_' + w;
    });
    if (namePart.substr(0, 1) === '_') {
        namePart = namePart.substr(1);
    }
    widgetPath = widgetPath.replace(widgetName, namePart);


    var url = modelUrl + widgetPath;
    $csCode.attr('src', url);


}

function formatCode(jspath) {
    showQueryCode();
    if (!jspath) {
        return;
    }

    var url = tbCodeFormatUrl + jspath;
    $csCode.attr('src', url);

}


function hideQueryCode() {

    $csCode.hide();

}

function showQueryCode() {

    $csCode.show();

}






