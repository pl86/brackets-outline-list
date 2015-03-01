/*global define, $ */

define(function (require, exports, module) {
    "use strict";

    function _getTypeClass(name) {
        var classes = {
            "#": "id",
            ".": "class",
            "@": "at-rules",
            "[": "attribute"
        };
        return " outline-entry-css-" + (classes[name[0]] || "tag");
    }

    function _createListEntry(name, line, ch) {
        var $elements = [];
        var $name = $(document.createElement("span"));
        var typeClass = _getTypeClass(name);
        $name.text(name);
        $elements.push($name);
        return {
            name: name,
            line: line,
            ch: ch,
            classes: "outline-entry-css outline-entry-icon" + typeClass,
            $html: $elements
        };
    }

    /**
     * Create the entry list of functions language dependent.
     * @param   {String} documentContent document content.
     * @returns {Array} List of outline entries.
     */
    function getOutlineList(documentContent) {
        var regex =  /([^\r\n,{}]+)((?=[^}]*\{)|\s*\{)/g;
        var result = [];
        documentContent.replace(/(\n*)\{/g, "{$1").split("\n").forEach(function (line, index) {
            var match = regex.exec(line);
            while (match !== null) {
                var name = match[1].trim();
                result.push(_createListEntry(name, index, line.length));
                match = regex.exec(line);
            }
        });
        return result;
    }

    function compare(a, b) {
        if (a.name > b.name) {
            return 1;
        }
        if (a.name < b.name) {
            return -1;
        }
        return 0;
    }

    module.exports = {
        getOutlineList: getOutlineList,
        compare: compare
    };
});
