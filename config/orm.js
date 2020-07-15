
var connection = require('./connection.js');
var util = require('util');

var orm = 
{
    /** fetch
     * simply builds sql string by parameters allowed and runs query
     *
     * usage examples:
     * 	fetch( 'table1', ['col1', 'col2', 'col3'], {key1: value1, key2: value2}, ['=', 'NOT LIKE'] )
     *      .then( rows => console.table(rows) );
     * 	fetch( 'table2', ['*'], {key1: value1}, ['>='] ).then( do stuff );
     *  fetch( 'table3', ['*'], {key1: value1}, ['='], [10, 0], 'last_name', 'DESC').then( do stuff );
     *  fetch( 'table3', ['*'], null, null, null, 'last_name').then( do stuff );
     *
     *
     * @param {string} tableName
     * @param {array} colArray
     * @param {object} whereObj
     * @param {array} operators
     * @param {array} limitArray
     * @param {string} orderBy
     * @param {string} orderDir
     */
    fetch: async function(
        tableName,
        colArray = [],
        whereObj = {},
        operators = [],
        limitArray = [],
        orderBy = "",
        orderDir = "ASC"
    ) {
        // make some null corrections for bypass
        if (whereObj === null) whereObj = {};
        if (operators === null) operators = [];
        if (limitArray === null) limitArray = [];
        //if (orderBy === null) orderBy = "";

        // separate now so not doing multiple times
        var whereKeys = Object.keys(whereObj);

        // general validations
        if (!tableName.length) throw "Must enter a table name";
        if (!colArray.length) throw "No columns to fetch from";
        if (whereKeys.length != operators.length) throw "Each where property must have a matching operator";
        if (limitArray && limitArray.length > 2) throw "Only allowed 2 in limit array (min and max)";
        if (orderBy.length && (orderDir != "ASC" && orderDir != "DESC")) throw "Order direction invalid";
        if ( !this._isValidOperators(operators) ) throw "Invalid operator(s)";
        
        // build column string
        var colString = "";
        for (var i = 0; i < colArray.length; i++)
        {
            //colString += "??";
            colString += colArray[i];
            if (i < colArray.length-1) colString += ", ";
        }

        // build where string
		var whereString = this._buildWhereString(whereKeys, operators);

        // build limit string
        var limitString = "";
        for (var i = 0; i < limitArray.length; i++)
        {
            limitString += limitArray[i];
            if (i < limitArray.length-1) limitString += " OFFSET ";
        }

        // build sql string
        var sql = `SELECT ${colString} FROM ??`
            + `${((whereString.length)
                ? ` WHERE ${whereString}`
                : "")}`
            + `${((orderBy.length)
                ? ` ORDER BY ${orderBy} ${orderDir}`
                : "")}`
            + `${((limitString.length)
                ? ` LIMIT ${limitString}`
                : "")}`;

        // build args array
        //var args = colArray; // add cols
        //args.push(tableName); // add table
        var args = [ tableName ];
        args = args.concat(Object.values(whereObj)); // add where values

        console.log(sql, args);

        // run query
        return await this._query(sql, args);
    },

    /** insert
     *
     * @param {string} tableName
     * @param {object} value
     */
    insert: async function(tableName, value = {})
    {
        // general validations
        if (!tableName.length) throw "Must enter a table name";
        if (!value || value == null) throw "Insert value must have a valid object";

        // establish some vars
        var valueKeys = Object.keys(value);
        var keyString = "";
        var bindString = "";
        var i = 1;

        // build key and bind strings
        valueKeys.forEach(
            key =>
            {
                keyString += key;
                bindString += "?";

                if (i < valueKeys.length)
                {
                    keyString += ", ";
                    bindString += ",";
                }
                i++;
            }
        );

        // build sql string and args array
        var sql = `INSERT INTO ${tableName} (${keyString}) VALUES (${bindString})`;
        var args = Object.values(value);

        // run query
        return await this._query(sql, args);
    },

    /** update
     *
     * @param {string} tableName
     * @param {object} updateObj
     * @param {object} whereObj
     * @param {array} operators
     */
    update: async function(tableName, updateObj = {}, whereObj = {}, operators = []) 
    {
        // get keys
        var updateKeys = Object.keys(updateObj);
        var whereKeys = Object.keys(whereObj);
    
    	// general validations
        if (!tableName.length) throw "Must enter a table name";
        if (!updateKeys.length) throw "Update object must exist";
        if (!whereKeys.length || !operators.length) throw "Where object and operators must exist";
        if (whereKeys.length != operators.length) throw "Each where property must have a matching operator";
        if ( !this._isValidOperators(operators) ) throw "Invalid operator(s)";
        
        // build update string
        var updateString = "";
        var i = 1;
        updateKeys.forEach( key => {
            updateString += key +" = ?";
            if (i < updateKeys.length) updateString += ", ";
            i++;
        });
        
        // build where string
        var whereString = this._buildWhereString(whereKeys, operators);
        
        // build sql query
        var sql = `UPDATE ${tableName} SET ${updateString} WHERE ${whereString}`;
        
        // build args array
        var args = Object.values(updateObj);
        args = args.concat( Object.values(whereObj) );

        // run query
        return await this._query(sql, args);
    },

    /** delete
     * delete row by where
     *
     * @param {string} tableName
     * @param {object} whereObj
     * @param {array} operators
     */
    delete: async function(tableName, whereObj = {}, operators = [])
    {
        // separate now so not doing multiple times
        var whereKeys = Object.keys(whereObj);
    
    	// general validations
        if (!tableName.length) throw "Must enter a table name";
        if (!whereKeys.length || !operators.length) throw "Where object and operators must exist";
        if (whereKeys.length != operators.length) throw "Each where property must have a matching operator";
        if ( !this._isValidOperators(operators) ) throw "Invalid operator(s)";
        
        // build where string
        var whereString = this._buildWhereString(whereKeys, operators);
        
        // build sql query
        var sql = `DELETE FROM ${tableName} WHERE ${whereString}`;
        
        // build args array
        var args = Object.values(whereObj);

        // run query
        return await this._query(sql, args);
    },

    /** _query
     * "private" query method utilizing util promise
     *
     * @param {string} sql
     * @param {array} args
     */
    _query: async function(sql, args)
    {
        // simple error check
        if (!sql.length) throw "Invalid SQL query";

        // run query
        return util
            .promisify(connection.query)
            .call(connection, sql, args);
    },

    /** _buildWhereString
     * created so not repeating
     * TODO: add support for OR and grouping
     *      ie (this = that OR other = another) AND blah != bleh
     *
     * @param {object} whereKeys
     * @param {array} operators
     */
    _buildWhereString: function(whereKeys, operators)
    {
        // build the string
        var whereString = "";
        var i = 0;
        whereKeys.forEach( key => {
            whereString += key +" "+ operators[i] + " ?";
            if (i < whereKeys.length-1) whereString + " AND ";
            i++;
        });
		
        // return the string
        return whereString;
    },
    
    /** _isValidOperators
     * operator validation
     * TODO: add more operators
     * 
     * @param {array} operators
     */
    _isValidOperators: function(operators)
    {
        // see if they don't exist
    	const validOperator = ['=','!=','<>','>','<','>=','<=','LIKE','NOT LIKE'];
        operators.forEach(operator => {
            if (validOperator.indexOf( operator.toUpperCase() ) == -1)
                return false;
        });
        
        // they all exist
        return true;
    }
}

module.exports = orm;
