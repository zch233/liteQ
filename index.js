/**
 * @Author: richen 
 * @Date: 2018-01-31 14:07:54 
 * @Copyright (c) - <richenlin(at)gmail.com>
 * @Last Modified by: richen
 * @Last Modified time: 2018-02-23 19:25:52
 */

global.Promise = require('bluebird');
const logger = require('think_logger');
const helper = require('./lib/helper.js');
const adapter = require('./lib/adapter.js');
/**
 * 
 * 
 * @class liteQ
 */
class liteQ {
    /**
     * Creates an instance of liteQ.
     * @param {any} args 
     * @memberof liteQ
     */
    constructor(...args) {
        // 是否开启迁移(migrate方法可用)
        this.safe = true;
        // 数据表字段信息
        this.fields = {
            id: {
                type: 'integer',
                primaryKey: true
            }
        };
        // 主键
        this.pk = 'id';
        // init
        this.init(...args);
        // 数据源配置
        this.config = this.config || args[0] || {};
        // 模型名称
        if (!this.modelName) {
            throw Error('modelName is undefined.');
        }
        // 数据表名
        this.tableName = this.tableName || this.getTableName();
        // SQL操作项
        this.options = {};
        // Adapter实例
        this.instance = null;
    }
    /**
     * 
     * 
     * @param {any} config 
     * @memberof liteQ
     */
    init(config) {
        this.config = config;
    }
    /**
     * 
     * 
     * @param {boolean} [forceNew=false] 
     * @returns 
     * @memberof liteQ
     */
    getInstance(forceNew = false) {
        if (!this.instance) {
            this.instance = adapter.getInstance(this.config, forceNew);
        }
        return this.instance;
    }
    /**
     * 
     * 
     * @param {any} err 
     * @returns 
     * @memberof liteQ
     */
    error(err) {
        let msg = err;
        if (msg) {
            if (!helper.isError(msg)) {
                if (!helper.isString(msg)) {
                    msg = JSON.stringify(msg);
                }
                msg = new Error(msg);
            }
            logger.error(msg);
        }
        return Promise.reject(msg);
    }
    /**
     * 获取表名
     * 
     * @returns 
     * @memberof liteQ
     */
    getTableName() {
        if (helper.isEmpty(this.modelName)) {
            return this.error('modelName is undefined.');
        }
        if (!this.tableName) {
            let tableName = this.config.db_prefix || '';
            tableName += helper.parseName(this.modelName);
            this.tableName = tableName.toLowerCase();
        }
        return this.tableName;
    }
    /**
     * 获取主键
     * 
     * @returns 
     * @memberof liteQ
     */
    getPk() {
        try {
            if (helper.isEmpty(this.pk) && helper.isEmpty(this.fields)) {
                for (let n in this.fields) {
                    if (this.fields[n].primaryKey !== undefined && this.fields[n].primaryKey) {
                        this.pk = n;
                    }
                }
            }
            return this.pk;
        } catch (e) {
            return this.error(e);
        }
    }
    /**
     * 分拣列
     * field(['aaa', 'bbb', 'ccc'])
     * @param {any} values 
     * @returns 
     * @memberof liteQ
     */
    field(values) {
        try {
            if (!values) {
                return this;
            }
            if (helper.isString(values)) {
                values = values.replace(/ +/g, '').split(',');
            }
            if (helper.isArray(values)) {
                this.options.field = this.options.field ? helper.extend(this.options.field, values) : values;
            }
            return this;
        } catch (e) {
            return this.error(e);
        }
    }
    /**
     * 别名
     * alias('xxx')
     * @param {any} values 
     * @returns 
     * @memberof liteQ
     */
    alias(values) {
        try {
            if (!values) {
                return this;
            }
            if (helper.isString(values)) {
                this.options.alias = this.options.alias ? helper.extend(this.options.alias, values) : values;
            }
            return this;
        } catch (e) {
            return this.error(e);
        }
    }
    /**
     * 查询条件
     * or:  where({or: [{...}, {...}]})
     * not: where({not: {name: '', id: 1}})
     * notin: where({notin: {'id': [1,2,3]}})
     * in: where({id: [1,2,3]})
     * and: where({id: 1, name: 'a'},)
     * operator: where({id: {'<>': 1}})
     * operator: where({id: {'<>': 1, '>=': 0, '<': 100, '<=': 10}})
     * like: where({name: {'like': '%a'}})
     * @param {any} values 
     * @returns 
     * @memberof liteQ
     */
    where(values) {
        try {
            if (!values) {
                return this;
            }
            if (helper.isObject(values)) {
                this.options.where = this.options.where ? helper.extend(this.options.where, values) : values;
            }
            return this;
        } catch (e) {
            return this.error(e);
        }
    }
    /**
     * 区间
     * limit(1)
     * limit(10, 20)
     * limit([10, 10])
     * @param {any} skip 
     * @param {any} limit 
     * @returns 
     * @memberof liteQ
     */
    limit(skip, limit) {
        try {
            if (skip === undefined) {
                skip = 0;
            }
            if (skip && limit === undefined) {
                if (helper.isArray(skip)) {
                    limit = skip[1];
                    skip = skip[0];
                } else {
                    skip = 0;
                    limit = skip;
                }
            }
            if (limit === undefined) {
                limit = 1;
            }
            skip = helper.toInt(skip);
            limit = helper.toInt(limit);
            this.options.limit = this.options.limit ? helper.extend(this.options.limit, [skip, limit]) : [skip, limit];
            return this;
        } catch (e) {
            return this.error(e);
        }
    }
    /**
     * 排序
     * order({xxx: 'desc'})
     * @param {any} values 
     * @returns 
     * @memberof liteQ
     */
    order(values) {
        try {
            if (!values) {
                return this;
            }
            if (helper.isObject(values)) {
                this.options.order = this.options.order ? helper.extend(this.options.order, values) : values;
            }
            return this;
        } catch (e) {
            return this.error(e);
        }
    }
    /**
     * 分组
     * group('xxx')
     * group(['xxx', 'xxx'])
     * @param {any} values 
     * @returns 
     * @memberof liteQ
     */
    group(values) {
        try {
            if (!values) {
                return this;
            }
            if (helper.isString(values) || helper.isArray(values)) {
                this.options.group = this.options.group ? helper.extend(this.options.group, values) : values;
            }
            return this;
        } catch (e) {
            return this.error(e);
        }
    }
    /**
     * 关联
     * join([{from: 'Test', alias: 'test', on: {aaa: bbb, ccc: ddd}, field: ['id', 'name'], type: 'inner'}])
     * join([{from: 'Test', alias: 'test', on: {or: [{aaa: bbb}, {ccc: ddd}]}, field: ['id', 'name'], type: 'left'}])
     * join([{from: 'Test', alias: 'test', on: {aaa: bbb, ccc: ddd}, field: ['id', 'name'], type: 'right'}])
     * @param {any} values 
     * @returns 
     * @memberof liteQ
     */
    join(values) {
        try {
            if (!values) {
                return this;
            }
            if (helper.isArray(values)) {
                this.options.join = this.options.join ? helper.extend(this.options.join, values) : values;
            }
            return this;
        } catch (e) {
            return this.error(e);
        }
    }
    /**
     * 新增数据
     * 
     * @param {any} data 
     * @param {any} options 
     * @returns 
     * @memberof liteQ
     */
    async add(data, options) {
        try {
            if (helper.isEmpty(data)) {
                throw Error('Data can not be empty');
            }
            let parsedOptions = helper.parseOptions(this, options);
            // copy data
            let _data = helper.clone(data, true);
            _data = await this._beforeAdd(data, parsedOptions);
            let result = await this.getInstance().add(_data, parsedOptions);
            _data[this.pk] = _data[this.pk] ? _data[this.pk] : result;
            await this._afterAdd(_data, parsedOptions);
            return _data[this.pk] || 0;
        } catch (e) {
            return this.error(e);
        }
    }
    /**
     * 删除数据
     * 
     * @param {any} options 
     * @returns 
     * @memberof liteQ
     */
    async delete(options) {
        try {
            let parsedOptions = helper.parseOptions(this, options);
            if (helper.isEmpty(parsedOptions.where)) {
                return this.error('The deletion condition can not be empty');
            }
            let result = await this.getInstance().delete(parsedOptions);
            return result || 0;
        } catch (e) {
            return this.error(e);
        }
    }
    /**
     * 更新数据
     * 
     * @param {any} data 
     * @param {any} options 
     * @returns 
     * @memberof liteQ
     */
    async update(data, options) {
        try {
            let parsedOptions = helper.parseOptions(this, options);
            // copy data
            let _data = helper.clone(data, true);
            // 如果存在主键数据 则自动作为更新条件
            this.pk = this.getPk();
            if (helper.isEmpty(parsedOptions.where)) {
                if (!helper.isEmpty(_data[this.pk])) {
                    parsedOptions.where = {};
                    parsedOptions.where[this.pk] = _data[this.pk];
                    delete _data[this.pk];
                } else {
                    throw Error('Update condition error');
                }
            } else {
                if (!helper.isEmpty(_data[this.pk])) {
                    delete _data[this.pk];
                }
            }
            let result = await this.getInstance().update(_data, parsedOptions);
            return result || [];
        } catch (e) {
            return this.error(e);
        }
    }
    /**
     * 字段自增
     * 
     * @param {any} field 
     * @param {number} [step=1] 
     * @param {any} options 
     * @returns 
     * @memberof liteQ
     */
    async increment(field, step = 1, options) {
        try {
            let parsedOptions = helper.parseOptions(this, options);
            if (helper.isEmpty(field)) {
                return this.error('Field name error');
            }
            let result = await this.getInstance().increment({ [field]: step }, field, parsedOptions);
            return result || [];
        } catch (e) {
            return this.error(e);
        }
    }
    /**
     * 字段自减
     * 
     * @param {any} field 
     * @param {number} [step=1] 
     * @param {any} options 
     * @returns 
     * @memberof liteQ
     */
    async decrement(field, step = 1, options) {
        try {
            let parsedOptions = helper.parseOptions(this, options);
            if (helper.isEmpty(field)) {
                return this.error('Field name error');
            }
            let result = await this.getInstance().decrement({ [field]: step }, field, parsedOptions);
            return result || [];
        } catch (e) {
            return this.error(e);
        }
    }
    /**
     * 统计数据条数
     * 
     * @param {any} field 
     * @param {any} options 
     * @returns 
     * @memberof liteQ
     */
    async count(field, options) {
        try {
            let parsedOptions = helper.parseOptions(this, options);
            let result = await this.getInstance().count(field, parsedOptions);
            return result || 0;
        } catch (e) {
            return this.error(e);
        }
    }
    /**
     * 统计字段求和
     * 
     * @param {any} field 
     * @param {any} options 
     * @returns 
     * @memberof liteQ
     */
    async sum(field, options) {
        try {
            let parsedOptions = helper.parseOptions(this, options);
            let result = await this.getInstance().sum(field, parsedOptions);
            return result || 0;
        } catch (e) {
            return this.error(e);
        }
    }
    /**
     * 查询单条数据
     * 
     * @param {any} options 
     * @memberof liteQ
     */
    async find(options) {
        try {
            let parsedOptions = helper.parseOptions(this, options);
            let result = await this.getInstance().find(parsedOptions);
            return (helper.isArray(result) ? result[0] : result) || {};
        } catch (e) {
            return this.error(e);
        }
    }
    /**
     * 查询多条数据
     * 
     * @param {any} options 
     * @returns 
     * @memberof liteQ
     */
    async select(options) {
        try {
            let parsedOptions = helper.parseOptions(this, options);
            let result = await this.getInstance().select(parsedOptions);
            return result;
        } catch (e) {
            return this.error(e);
        }
    }
    /**
     * 分页查询
     * 
     * @param {any} options 
     * @returns 
     * @memberof liteQ
     */
    async countSelect(options) {
        try {
            let parsedOptions = helper.parseOptions(this, options);
            this.instance = this.getInstance();
            let countNum = await this.instance.count(null, parsedOptions);
            let pageOptions = helper.parsePage(parsedOptions.page || 1, parsedOptions.num || 10);
            let totalPage = Math.ceil(countNum / pageOptions.num);
            if (pageOptions.page > totalPage) {
                pageOptions.page = totalPage;
            }
            //传入分页参数
            let offset = (pageOptions.page - 1) < 0 ? 0 : (pageOptions.page - 1) * pageOptions.num;
            parsedOptions.limit = [offset, pageOptions.num];
            let result = helper.extend({ count: countNum, total: totalPage }, pageOptions);
            result.data = await this.instance.select(parsedOptions);
            return result;
        } catch (e) {
            return this.error(e);
        }
    }
    /**
     * 原生语句查询
     * mysql  TestModel.query('select ?, ? from test where id=?', ['id', 'name', 1]);
     * mongo  TestModel.query('db.test.find()');
     * @param {any} sqlStr 
     * @param {any} [params=[]] 
     * @returns 
     * @memberof liteQ
     */
    async query(sqlStr, params = []) {
        try {
            let result = await this.getInstance().native(this.tableName, sqlStr, params);
            return result;
        } catch (e) {
            return this.error(e);
        }
    }
    /**
     * 执行事务
     * 
     * @param {any} fn 
     * @returns 
     * @memberof liteQ
     */
    async transaction(fn) {
        this.instance = await this.getInstance(true);
        if (!this.instance.startTrans){
            return this.error('Adapter is not support transaction');
        }
        try {
            await this.instance.startTrans();
            let result = await helper.thinkco(fn(this.instance));
            await this.instance.commit();
            return result;
        } catch (e) {
            await this.instance.rollback();
            return this.error(e);
        }
    }
}

liteQ.helper = helper;
liteQ.logger = logger;
module.exports = liteQ;