/*global define, $ */

define(function (require, exports, module) {
    "use strict";

    var defaultVisibilty = "public",
        unnamedPlaceholder = "function";

    function createListEntry(name, args, vis, line, ch) {
        var $elements = [],
            $name = $(document.createElement("span")),
            $arguments = $(document.createElement("span"));
        $name.text(name);
        $elements.push($name);
        $arguments.addClass("outline-entry-php-arg");
        $arguments.text(args);
        $elements.push($arguments);
        return {
            name: name,
            line: line,
            ch: ch,
            classes: "outline-entry-php outline-entry-icon outline-entry-php-" + vis,
            $html: $elements
        };
    }

    /**
     * Create the entry list of functions language dependent.
     * @param   {String}  documentContent document content.
     * @param   {Boolean} showArguments args Preference.
     * @param   {Boolean} showUnnamed   unnamed Preference.
     * @returns {Array}   List of outline entries.
     */
    function getOutlineList(documentContent, showArguments, showUnnamed) {
        var re,
            matchesLnr = [],
            indCls = 0,
            indFun = 0,
            lCls = 0,
            lFun = 0,
            outline = [],
            outlinesFun = [],
            outlinesCls = [],
            list = [];

        re = /\n[\t ]*(final)?[\t ]*(public|protected|private)?[\t ]*(static)?[\t ]*function[\t ]+(\w*)[\t ]*(\([\w,\s&$='"\\()]*\))\s*\{/g;
        documentContent.replace(re, function (match, p1, p2, p3, p4, p5, offset) {
            outline = {name: p4, offset: offset, match: match};
            outline.args = p5;
            outline.visibility = p2 ||  defaultVisibilty;
            outlinesFun.push(outline);
        });

        re = /\n[\t ]*class\s+(\w*)\s*\{/g;
        documentContent.replace(re, function (match, p1, offset) {
            outline = {name: p1, offset: offset, match: match};
            outlinesCls.push(outline);
        });

        re = /\n/g;
        documentContent.replace(re, function (match, offset) {
            matchesLnr.push(offset);
        });
        lCls = outlinesCls.length;
        lFun = outlinesFun.length;
        matchesLnr.forEach(function (offset, index) {
            for (indFun; indFun < lFun; indFun += 1) {
                if (outlinesFun[indFun].offset < offset) {
                    outlinesFun[indFun].line = index;
                } else {
                    break;
                }
            }
            for (indCls; indCls < lCls; indCls += 1) {
                if (outlinesCls[indCls].offset < offset) {
                    outlinesCls[indCls].line = index;
                } else {
                    break;
                }
            }
        });

        list = [];
        outlinesFun.forEach(function (outline, index) {
            var name = outline.name,
                args = (showArguments && outline.args) ? outline.args : '',
                vis = outline.visibility || defaultVisibilty,
                line = outline.line,
                ch = 0;
            list.push(createListEntry(name, args, vis, line, ch));
        });
        outlinesCls.forEach(function (outline, index) {
            var name = outline.name,
                args = '',
                vis = 'class',
                line = outline.line,
                ch = 0;
            list.push(createListEntry(name, args, vis, line, ch));
        });
        list.sort(function (a, b) {
            return a.line - b.line;
        });
        return list;
    }

    function compare(a, b) {
        if (b.name === unnamedPlaceholder) {
            return 1;
        }
        if (a.name === unnamedPlaceholder) {
            return -1;
        }
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
