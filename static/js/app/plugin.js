/**
 *
 *
 PATTERNS
 "[name]" элементы, содержащие атрибут name
 "[name = value]" элементы, у которых значение атрибута name совпадает с value
 "[name != value]" элементы, у которых значение атрибута name не совпадает с value
 "[name ^= value]" элементы, у которых значение атрибута name начинается с value
 "[name $= value]" элементы, у которых значение атрибута name заканчивается на value
 "[name *= value]" элементы, у которых значение атрибута name содержит подстроку value
 "[name ~= value]" элементы, у которых значение атрибута name содержит слово value
 "[name |= value]" элементы, у которых значение атрибута name имеют префикс value (равен value или имеет вид: "value-*")
 "[first][second][..." элементы, соответствующие всем заданным условиям на атрибуты одновременно

 [name>=value]
 [name<=value]
 [name>value]
 [name<value]

 */


/**
 * TODO need value type
 *
 * WARNING!!!!!!!!!!!!!!!!!!!!!!!!!
 * if item:
 * {key1:value1, key2:{key1:value1}} - it's error index
 * unacceptable child values == parent value
 */


/**
 * demo:
 * var JT = new JetSortClass(items);

 var sorting = JT.get([
 {
     key: [{name: 'vyhod-v-internet', value: true}],
     pattern: '[name=value]'
 },
 {
     key: [{name: 'banketnyy-zal', value: true}],
     pattern: '[name=value]'
 },
 {
     key: [{name: 'bar', value: true}],
     pattern: '[name=value]'
 }
 ]);

 */
define([
    'jquery',
    'underscore'
], function ($,
             _) {

    var JT = {};
    JT.fn = {};

    JT.fn.log = function (data) {
        if (this.attributes.debug) {
            console.log(data);
        }
    };

    JT.fn.cacheSave = function (items, keys) {
        if (!this.cacheGet(keys)) {
            this.data.cache.push({keys: keys, items: items});
        }
    };

    JT.fn.cacheGet = function (keys) {

        return _.find(this.data.cache, function (cacheItem) {
            return _.isEqual(cacheItem.keys, keys);
        });
    };


    JT.fn._get = function (keys) {

        var timeStart = new Date();
        this.log('fast sort _get start');

        var self = this;
        var items = [];
        var tmpItems = [];

        var cache = this.cacheGet(keys);

        if (cache) {

            var timeEnd = new Date();
            var timeProcess = timeEnd - timeStart;
            this.attributes.lastTime = timeProcess;
            this.log('fast sort get end time:' + timeProcess + 'ms., items:' + cache.items.length);

            return cache.items;
        }

        if (!this.data.index || _.isEmpty(this.data.index)) {
            this.data.index = this.indexedItems();
        }

        /**
         * function get items
         */

        var getItemsByPattern = function (key, pattern, items) {


            if (!items) {
                items = [];
            }

            /**
             * todo
             * need array keys
             */

            key = key.slice(0).pop();
            var keyName = key.name;
            var keyValue = key.value.toString();

            var indexObj = self.data.index;

            if (!pattern) {
                pattern = '[name=value]';
            }

            switch (pattern) {

                case '[name=value]':

                    var itemsObjParent = indexObj[keyName];
                    if(itemsObjParent && itemsObjParent.index){
                        var itemsIndex = itemsObjParent.index[keyValue];
                        if (itemsIndex) {
                            items = items.concat(itemsIndex.items);
                        }
                    }


                    break;

                case '[name>value]':

                    /**
                     * todo need performace
                     */
                    var itemsObjParent = indexObj[keyName];
                    if(itemsObjParent && itemsObjParent.index){
                        var itemsIndex = _.filter(itemsObjParent.index, function (item, n) {
                            if (parseInt(n) > parseInt(keyValue)) {
                                return true;
                            }
                        });

                        if (itemsIndex && itemsIndex.length > 0) {

                            itemsIndex = _.reduceRight(itemsIndex, function (a, b) {

                                if (a.items) {
                                    return a.items.concat(b.items);
                                }

                                return a.concat(b.items);
                            });

                            itemsIndex = _.uniq(itemsIndex);
                            items = items.concat(itemsIndex);
                        }
                    }


                    break;

                case '[name<value]':

                    /**
                     * todo need performace
                     */
                    var itemsObjParent = indexObj[keyName];
                    if(itemsObjParent && itemsObjParent.index){
                        var itemsIndex = _.filter(itemsObjParent.index, function (item, n) {
                            if (parseInt(n) < parseInt(keyValue)) {
                                return true;
                            }
                        });

                        if (itemsIndex && itemsIndex.length > 0) {

                            itemsIndex = _.reduceRight(itemsIndex, function (a, b) {

                                if (a.items) {
                                    return a.items.concat(b.items);
                                }

                                return a.concat(b.items);
                            });

                            itemsIndex = _.uniq(itemsIndex);
                            items = items.concat(itemsIndex);
                        }
                    }


                    break;

                case '[name>=value]':

                    /**
                     * todo need performace
                     */
                    var itemsObjParent = indexObj[keyName];
                    if(itemsObjParent && itemsObjParent.index){
                        var itemsIndex = _.filter(itemsObjParent.index, function (item, n) {
                            if (parseInt(n) >= parseInt(keyValue)) {
                                return true;
                            }
                        });

                        if (itemsIndex && itemsIndex.length > 0) {
                            itemsIndex = _.reduceRight(itemsIndex, function (a, b) {

                                if (a.items) {
                                    return a.items.concat(b.items);
                                }

                                return a.concat(b.items);
                            });

                            itemsIndex = _.uniq(itemsIndex);
                            items = items.concat(itemsIndex);
                        }
                    }


                    break;

                case '[name<=value]':

                    /**
                     * todo need performace
                     */
                    var itemsObjParent = indexObj[keyName];
                    if(itemsObjParent && itemsObjParent.index){
                        var itemsIndex = _.filter(itemsObjParent.index, function (item, n) {
                            if (parseInt(n) <= parseInt(keyValue)) {
                                return true;
                            }
                        });

                        if (itemsIndex && itemsIndex.length > 0) {

                            itemsIndex = _.reduceRight(itemsIndex, function (a, b) {

                                if (a.items) {
                                    return a.items.concat(b.items);
                                }

                                return a.concat(b.items);
                            });

                            itemsIndex = _.uniq(itemsIndex);
                            items = items.concat(itemsIndex);
                        }
                    }


                    break;
            }


            return items;
        };

        for (var k in keys) {

            var keyObj = keys[k];
            var pattern = keyObj.pattern;
            var tmpArritems = getItemsByPattern(keyObj.key, pattern);
            tmpItems.push(tmpArritems);
        }

        items = _.intersection.apply(_, tmpItems);

        var timeEndGen = new Date();
        var timeProcess = timeEndGen - timeStart;
        this.attributes.lastTime = timeProcess;
        this.log('fast sort get end time:' + timeProcess + 'ms., items:' + items.length);


        /**
         * save to cache
         */
        this.cacheSave(items, keys);

        return items;
    };

    JT.fn.indexedItems = function () {

        var self = this;

        var startTime = new Date();
        this.log('>>> indexedItems start');

        var createIndexObj = function (obj, saveObj) {

            for (var k in obj) {

                /**
                 * if it's id field - not need indexed
                 */
                if(k === self.options.idField){
                    continue;
                }

                var key = k;

                var value = obj[key];

                if (!saveObj[key]) {
                    saveObj[key] = {};
                }

                if (!saveObj[key].index) {
                    saveObj[key].index = {};
                }


                switch (typeof value) {

                    case 'string':
                        /**
                         * value is string need split (' ')
                         */

                        if (key == self.options.idField) {
                            break;
                        }

                        var val = value.split(' ');
                        var fieldObj = {};

                        if (val.length === 1) {

                            /**
                             * value it's string one word
                             */

                            if (!saveObj[key].index[value]) {
                                saveObj[key].index[value] = {};
                                saveObj[key].index[value].items = new Array();
                            }

                            saveObj[key].index[value].type = 'string';
                            saveObj[key].index[value].value = value;
                            saveObj[key].index[value].items.push(obj[self.options.idField]);


                            break;
                        }


                        /**
                         * field it's long text
                         */


                        break;

                    case 'object':


                        if (Object.prototype.toString.call(value) === '[object Array]') {
                            /**
                             * value is array
                             */

                            var fieldObj = {};
                            for (var v in value) {
                                fieldObj[value[v]] = true;
                            }
                            fieldObj[self.options.idField] = obj[self.options.idField];
                            saveObj = createIndexObj(fieldObj, saveObj);

                        } else {

                            /**
                             * value is object
                             */

                            if (value == null) {

                                /**
                                 * value is null
                                 */

                                var fieldObj = {};
                                fieldObj[key] = false;
                                fieldObj[self.options.idField] = obj[self.options.idField];
                                saveObj = createIndexObj(fieldObj, saveObj);

                                break;
                            }

                            var fieldObj = {};
                            _.extend(fieldObj, value);

                            fieldObj[self.options.idField] = obj[self.options.idField];
                            saveObj = createIndexObj(fieldObj, saveObj);

                        }

                        break;

                    case 'boolean':

                        if (!saveObj[key].index[value]) {
                            saveObj[key].index[value] = {};
                            saveObj[key].index[value].items = new Array();
                        }

                        saveObj[key].index[value].type = 'boolean';
                        saveObj[key].index[value].value = value;
                        saveObj[key].index[value].items.push(obj[self.options.idField]);

                        break;

                    case 'number':

                        if (!saveObj[key].index[value]) {
                            saveObj[key].index[value] = {};
                            saveObj[key].index[value].items = new Array();
                        }

                        saveObj[key].index[value].type = 'number';
                        saveObj[key].index[value].value = value;
                        saveObj[key].index[value].items.push(obj[self.options.idField]);

                        break;

                    case 'undefined':

                        var fieldObj = {};
                        fieldObj[key] = false;
                        fieldObj[self.options.idField] = obj[self.options.idField];
                        saveObj = createIndexObj(fieldObj, saveObj);

                        break;

                    default:

                        break;
                }

            }

            return saveObj;
        };



        if (!this.data.index) {
            this.data.index = {};
        }

        var tmpObject = {};
        var items = this.data.inner.items.slice(0);

        for (var i = 0; i < items.length; i++) {


            (function (obj, outObj, num) {

                tmpObject = createIndexObj(obj, outObj);
                if (num === items.length - 1) {
                    /**
                     * TODO
                     */

                    var endTime = new Date();
                    var timeProcess = endTime - startTime;
                    self.log('indexed objects ready:' + timeProcess + 'ms., items count:' + self.data.inner.length);
                    self.attributes.indexed = true;
                }

            })(items[i], tmpObject, i)


        }

        return tmpObject;
    };

    var Init = function (items) {

        var self = this;

        this.options = {
            idField: 'id'
        };


        this.attributes = {
            debug: true,
            lastTime:'',
            ready: false,
            indexed: false
        };

        this.attributes.id = _.uniqueId('jt-');

        this.data = {};
        this.data.inner = {};
        this.data.out = {};
        this.data.cache = [];
        this.data.index = {};

        this.data.inner.length = items.length;
        this.data.inner.items = items;

        //setTimeout(function(){
        //    self.indexedItems();
        //}, 0);
        return {

            /**
             * app obj
             */
            app: self,

            /**
             * get sorting items
             * @param keys
             */
            get: function (keys, cachePreloadSets) {
                var items = self._get(keys);


                //if (cachePreloadSets) {
                //    for (var i in cachePreloadSets) {
                //
                //        (function (preloadSet) {
                //
                //            setTimeout(function () {
                //                self._get(preloadSet);
                //            }, 0);
                //
                //        })(cachePreloadSets[i]);
                //    }
                //
                //}


                return items;
            },

            /**
             * index items for this keys
             * @param keys
             */
            set: function (keys) {

            }
        }

    };

    Init.prototype = JT.fn;

    var JetSort = function (items) {

        return new Init(items);

    };

    return JetSort;
});