define([
    'jquery',
    'underscore',
    'app/plugin'
], function ($,
             _,
             JetSortClass) {


    $.deparam = function (params, coerce) {
        var obj = {},
            coerce_types = {'true': !0, 'false': !1, 'null': null};

        // Iterate over all name=value pairs.
        $.each(params.replace(/\+/g, ' ').split('&'), function (j, v) {
            var param = v.split('='),
                key = decodeURIComponent(param[0]),
                val,
                cur = obj,
                i = 0,

            // If key is more complex than 'foo', like 'a[]' or 'a[b][c]', split it
            // into its component parts.
                keys = key.split(']['),
                keys_last = keys.length - 1;

            // If the first keys part contains [ and the last ends with ], then []
            // are correctly balanced.
            if (/\[/.test(keys[0]) && /\]$/.test(keys[keys_last])) {
                // Remove the trailing ] from the last keys part.
                keys[keys_last] = keys[keys_last].replace(/\]$/, '');

                // Split first keys part into two parts on the [ and add them back onto
                // the beginning of the keys array.
                keys = keys.shift().split('[').concat(keys);

                keys_last = keys.length - 1;
            } else {
                // Basic 'foo' style key.
                keys_last = 0;
            }

            // Are we dealing with a name=value pair, or just a name?
            if (param.length === 2) {
                val = decodeURIComponent(param[1]);

                // Coerce values.
                if (coerce) {
                    val = val && !isNaN(val) ? +val              // number
                        : val === 'undefined' ? undefined         // undefined
                        : coerce_types[val] !== undefined ? coerce_types[val] // true, false, null
                        : val;                                                // string
                }

                if (keys_last) {
                    // Complex key, build deep object structure based on a few rules:
                    // * The 'cur' pointer starts at the object top-level.
                    // * [] = array push (n is set to array length), [n] = array if n is
                    //   numeric, otherwise object.
                    // * If at the last keys part, set the value.
                    // * For each keys part, if the current level is undefined create an
                    //   object or array based on the type of the next keys part.
                    // * Move the 'cur' pointer to the next level.
                    // * Rinse & repeat.
                    for (; i <= keys_last; i++) {
                        key = keys[i] === '' ? cur.length : keys[i];
                        cur = cur[key] = i < keys_last
                            ? cur[key] || (keys[i + 1] && isNaN(keys[i + 1]) ? {} : [])
                            : val;
                    }

                } else {
                    // Simple key, even simpler rules, since only scalars and shallow
                    // arrays are allowed.

                    if ($.isArray(obj[key])) {
                        // val is already an array, so push on the next value.
                        obj[key].push(val);

                    } else if (obj[key] !== undefined) {
                        // val isn't an array, but since a second value has been specified,
                        // convert val into an array.
                        obj[key] = [obj[key], val];

                    } else {
                        // val is a scalar.
                        obj[key] = val;
                    }
                }

            } else if (key) {
                // No value was defined, so set something meaningful.
                obj[key] = coerce
                    ? undefined
                    : '';
            }
        });

        return obj;
    };

    var demoObj = {
        id: '',
        //address: 'Улица Уличная дом',
        //archive: false,
        price: 5000,
        fieldObject: {
            key1: true,
            key2: ['key21', 'key22', 'key23'],
            key3: false
        },
        counter: 50,
        category: ['cat1', 'cat2', 'cat3', 'cat4', 'cat5', 'cat6', 'cat7', 'cat8']
    };

    var SORTITEMS = [];
    var JT;

    $sortFields = $('#sortFields');
    var $log = $('#log');
    var $area = $('#demoobj');
    $objectsjson = $('#objectsjson');
    var $count = $('#count');


    var createSortForm = function (obj) {

        var $s = $sortFields;
        $s.html('');


        var createInput = function (data) {

            var out = '';


            for (var n in data) {

                if (n === 'id') {
                    continue;
                }

                switch (typeof data[n]) {

                    case 'object':

                        if (Object.prototype.toString.call(data[n]) === '[object Array]') {
                            /**
                             * value is array
                             */

                            var html = '';
                            var keyObj = {};
                            for (var k in data[n]) {
                                keyObj[data[n][k]] = true;
                            }

                            html += createInput(keyObj, out);
                            out += html;

                        }

                        break;

                    case 'number':

                        var html = '';
                        html += '<div class="center-form-sorting-label">';
                        html += '<p>' + n + ': </p>';
                        html += '<span>min:</span>';
                        //html += '<input type="text" name="' + n + '[min]" value="' + data[n] + '">';
                        html += '<input type="text" name="' + n + '[min]" value="0">';
                        html += '<span>max:</span>';
                        //html += '<input type="text" name="' + n + '[max]" value="' + data[n] + '">';
                        html += '<input type="text" name="' + n + '[max]" value="">';
                        html += '</div>';

                        out += html;

                        break;


                    case 'string':
                    case 'boolean':

                        var html = '<label class="center-form-sorting-label">' + n + '<input type="checkbox" name="' + n + '" ></label>';
                        out += html;

                        break;


                    default:
                        break;
                }

            }

            return out;

        };


        var inputs = createInput(obj);

        $s.html(inputs);

    };


    var getRandomItemsFromArray = function (arr) {
        return arr.slice(0, Math.floor(Math.random() * arr.length));
    };


    var createItems = function (defaultItem) {

        var out = [];

        var count = parseInt($count.val());

        for (var i = 0; i < count; i++) {


            (function (num) {

                var item = {};
                _.extend(item, defaultItem);

                for (var n in item) {

                    if (typeof item[n] === 'object') {

                        if (Object.prototype.toString.call(item[n]) === '[object Array]') {
                            /**
                             * value is array
                             */

                            item[n] = getRandomItemsFromArray(item[n]);
                        } else {
                            for (var k in item[n]) {

                                var val = item[n][k];
                                if (Object.prototype.toString.call(val) === '[object Array]') {
                                    /**
                                     * value is array
                                     */

                                    //var newval = getRandomItemsFromArray(val);
                                    //item[n][k] = newval;
                                }
                            }
                        }
                    }

                    if (typeof item[n] === 'boolean') {
                        item[n] = Math.random() >= 0.5;
                    }

                    if (typeof item[n] == 'number') {
                        var newval = Math.ceil(item[n] * Math.random());
                        item[n] = newval;
                    }

                }

                item.id = _.uniqueId('item-' + num);

                out.push(item);


                if (num === count - 1) {

                    var readyjson = JSON.stringify(out);

                    /**
                     * TODO create jt class
                     * @type {JetSort}
                     */
                    JT = new JetSortClass(out);
                    console.log('JT', JT);
                    $objectsjson.val(readyjson);

                }
            })(i);

        }
    };

    $(document).ready(function () {


        /**
         * insert demo object
         */
        $('#demoobj').html(JSON.stringify(demoObj));


        $('#createcache').on('click', function (e) {
            e.preventDefault();
            console.log('create cache');
        });

        /**
         * events
         */
        $('#createlist').on('click', function (e) {
            e.preventDefault();

            var item = $area.val();
            try {
                var json = JSON.parse(item);
            }
            catch (e) {
                alert('ошибка в json');
            }

            if (json) {
                var items = createItems(json);
                createSortForm(json);
            }

        });

        $('#sorting').on('click', function (e) {
            e.preventDefault();

            var sortKeysData = [];

            var d = $sortFields.serialize();
            d = $.deparam(d);

            for (var n in d) {

                if (d[n] === 'on') {
                    sortKeysData.push(
                        {
                            key: [{name: n, value: true}],
                            pattern: '[name=value]'
                        }
                    );
                }

                if (d[n].max) {

                    /**
                     * number field
                     */

                    sortKeysData.push(
                        {
                            key: [{name: n, value: d[n].max}],
                            pattern: '[name<=value]'
                        }
                    );

                    sortKeysData.push(
                        {
                            key: [{name: n, value: d[n].min}],
                            pattern: '[name>=value]'
                        }
                    )
                }

            }

            var items = JT.get(sortKeysData);
            console.log('sortKeysData', sortKeysData);
            console.log('JT', JT);

            $('#log').append('<p>ready! items count:' + items.length + ', time:' + JT.app.attributes.lastTime + 'ms.');
        })

    });
    

});