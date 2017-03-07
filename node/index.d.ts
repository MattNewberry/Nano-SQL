import { Promise } from "es6-promise";
/**
 * Standard object placeholder with string key.
 *
 * @export
 * @interface StdObject
 * @template T
 */
export interface StdObject<T> {
    [key: string]: T;
}
/**
 * This is the format used for actions and views
 *
 * @export
 * @interface ActionOrView
 */
export interface ActionOrView {
    name: string;
    args?: Array<string>;
    extend?: any;
    call: (args?: any, db?: SomeSQLInstance) => Promise<any>;
}
/**
 * You need an array of these to declare a data model.
 *
 * @export
 * @interface DataModel
 */
export interface DataModel {
    key: string;
    type: "string" | "int" | "float" | "array" | "map" | "bool" | "uuid" | "blob" | string;
    default?: any;
    props?: Array<any>;
}
/**
 * Used to represent a single query command.
 *
 * @export
 * @interface QueryLine
 */
export interface QueryLine {
    type: string;
    args?: any;
}
/**
 * Returned by the event listener when it's called.
 *
 * @export
 * @interface DatabaseEvent
 */
export interface DatabaseEvent {
    table: string;
    query: Array<QueryLine>;
    time: number;
    result: Array<any>;
    name: "change" | "delete" | "upsert" | "drop" | "select" | "error";
    actionOrView: string;
    changeType: string;
    changedRows: DBRow[];
}
/**
 * The arguments used for the join command.
 *
 * Type: join type to use
 * Query: A select query to use for the right side of the join
 * Where: Conditions to use to merge the data
 *
 * @export
 * @interface JoinArgs
 */
export interface JoinArgs {
    type: "left" | "inner" | "right" | "cross";
    table: string;
    where: Array<string>;
}
export interface DBRow {
    [key: string]: any;
}
/**
 * The primary abstraction class, there is no database implimintation code here.
 * Just events, quries and filters.
 *
 * @export
 * @class SomeSQLInstance
 */
export declare class SomeSQLInstance {
    /**
     * Most recent selected table.
     *
     * @type {string}
     * @memberOf SomeSQLInstance
     */
    activeTable: string;
    /**
     * The backend currently being used
     *
     * @public
     * @type {SomeSQLBackend}
     * @memberOf SomeSQLInstance
     */
    backend: SomeSQLBackend;
    /**
     * Holds custom filters implimented by the user
     *
     * @private
     *
     * @memberOf SomeSQLInstance
     */
    private _filters;
    constructor();
    /**
     * Changes the table pointer to a new table.
     *
     * @param {string} [table]
     * @returns {SomeSQLInstance}
     *
     * @memberOf SomeSQLInstance
     */
    table(table?: string): SomeSQLInstance;
    /**
     * Inits the backend database for use.
     *
     * Optionally include a custom database driver, otherwise the built in memory driver will be used.
     *
     * @param {SomeSQLBackend} [backend]
     * @returns {(Promise<Object | string>)}
     *
     * @memberOf SomeSQLInstance
     */
    connect(backend?: SomeSQLBackend): Promise<Object | string>;
    /**
     * Adds an event listener to the selected database table.
     *
     * @param {("change"|"delete"|"upsert"|"drop"|"select"|"error")} actions
     * @param {Function} callBack
     * @returns {SomeSQLInstance}
     *
     * @memberOf SomeSQLInstance
     */
    on(actions: "change" | "delete" | "upsert" | "drop" | "select" | "error", callBack: (event: DatabaseEvent, database: SomeSQLInstance) => void): SomeSQLInstance;
    /**
     * Remove a specific event handler from being triggered anymore.
     *
     * @param {Function} callBack
     * @returns {SomeSQLInstance}
     *
     * @memberOf SomeSQLInstance
     */
    off(callBack: Function): SomeSQLInstance;
    /**
     * Set a filter to always be applied, on every single query.
     *
     * @param {string} filterName
     * @returns {SomeSQLInstance}
     *
     * @memberOf SomeSQLInstance
     */
    alwaysApplyFilter(filterName: string): SomeSQLInstance;
    /**
     * Declare the data model for the current selected table.
     *
     * Please reference the DataModel interface for how to impliment this, a quick example:
     *
     * ```ts
     * .model([
     *  {key:"id",type:"int",props:["ai","pk"]} //auto incriment and primary key
     *  {key:"name",type:"string"}
     * ])
     * ```
     *
     * @param {Array<DataModel>} dataModel
     * @returns {SomeSQLInstance}
     *
     * @memberOf SomeSQLInstance
     */
    model(dataModel: Array<DataModel>): SomeSQLInstance;
    /**
     * Declare the views for the current selected table.  Must be called before connect()
     *
     * Views are created like this:
     *
     * ```ts
     * .views([
     *  {
     *      name:"view-name",
     *      args: ["array","of","arguments"],
     *      call: function(args) {
     *          // Because of our "args" array the args input of this function will look like this:
     *          // SomeSQL will not let any other arguments into this function.
     *          args:{
     *              array:'',
     *              of:'',
     *              arguments:''
     *          }
     *          //We can use them in our query
     *          return this.query('select').where(['name','IN',args.array]).exec();
     *      }
     *  }
     * ])
     * ```
     *
     * Then later in your app..
     *
     * ```ts
     * SomeSQL("users").getView("view-name",{array:'',of:"",arguments:""}).then(function(result) {
     *  console.log(result) <=== result of your view will be there.
     * })
     * ```
     *
     * Optionally you can type cast the arguments at run time typescript style, just add the types after the arguments in the array.  Like this:
     *
     * ```ts
     * .views[{
     *      name:...
     *      args:["name:string","balance:float","active:bool"]
     *      call:...
     * }]
     * ```
     *
     * SomeSQL will force the arguments passed into the function to those types.
     *
     * Possible types are string, bool, float, int, map, array and bool.
     *
     * @param {Array<ActionOrView>} viewArray
     * @returns {SomeSQLInstance}
     *
     * @memberOf SomeSQLInstance
     */
    views(viewArray: Array<ActionOrView>): SomeSQLInstance;
    /**
     * Execute a specific view.  Refernece the "views" function for more description.
     *
     * Example:
     * ```ts
     * SomeSQL("users").getView('view-name',{foo:"bar"}).then(function(result) {
     *  console.log(result) <== view result.
     * })
     * ```
     *
     * @param {string} viewName
     * @param {any} viewArgs
     * @returns {(Promise<Array<Object>>)}
     *
     * @memberOf SomeSQLInstance
     */
    getView(viewName: string, viewArgs?: any): Promise<Array<Object>>;
    /**
     * Declare the actions for the current selected table.  Must be called before connect()
     *
     * Actions are created like this:
     * ```ts
     * .actions([
     *  {
     *      name:"action-name",
     *      args: ["array","of","arguments"],
     *      call: function(args) {
     *          // Because of our "args" array the args input of this function will look like this:
     *          // SomeSQL will not let any other arguments into this function.
     *          args:{
     *              array:'',
     *              of:'',
     *              arguments:''
     *          }
     *          //We can use them in our query
     *          return this.query("upsert",{balance:0}).where(['name','IN',args.array]).exec();
     *      }
     *  }
     * ])
     * ```
     *
     * Then later in your app..
     *
     * ```ts
     * SomeSQL("users").doAction("action-name",{array:'',of:"",arguments:""}).then(function(result) {
     *  console.log(result) <=== result of your view will be there.
     * })
     * ```
     *
     * Optionally you can type cast the arguments at run time typescript style, just add the types after the arguments in the array.  Like this:
     * ```ts
     * .actions[{
     *      name:...
     *      args:["name:string","balance:float","active:bool"]
     *      call:...
     * }]
     * ```
     *
     * SomeSQL will force the arguments passed into the function to those types.
     *
     * Possible types are string, bool, float, int, map, array and bool.
     *
     * @param {Array<ActionOrView>} actionArray
     * @returns {SomeSQLInstance}
     *
     * @memberOf SomeSQLInstance
     */
    actions(actionArray: Array<ActionOrView>): SomeSQLInstance;
    /**
     * Init an action for the current selected table. Reference the "actions" method for more info.
     *
     * Example:
     * ```ts
     * SomeSQL("users").doAction('action-name',{foo:"bar"}).then(function(result) {
     *      console.log(result) <== result of your action
     * });
     * ```
     *
     * @param {string} actionName
     * @param {any} actionArgs
     * @returns {(Promise<Array<Object>>)}
     *
     * @memberOf SomeSQLInstance
     */
    doAction(actionName: string, actionArgs?: any): Promise<Array<Object>>;
    /**
     * Add a filter to the usable list of filters for this database.  Must be called BEFORE connect().
     * Example:
     *
     * ```ts
     * SomeSQL().addFilter('addBalance',function(rows) {
     *      return rows.map((row) => row.balance + 1);
     * })
     * ```
     *
     * Then to use it in a query:
     * ```ts
     * SomeSQL("users").query("select").filter('addOne').exec();
     * ```
     *
     * @param {string} filterName
     * @param {(rows: Array<Object>) => Array<Object>} filterFunction
     * @returns {SomeSQLInstance}
     *
     * @memberOf SomeSQLInstance
     */
    addFilter(filterName: string, filterFunction: (rows: Array<Object>) => Array<Object>): SomeSQLInstance;
    /**
     * Start a query into the current selected table.
     * Possibl querys are "select", "upsert", "delete", and "drop";
     *
     * ### Select
     *
     * Select is used to pull a set of rows or other data from the table.
     * When you use select the optional second argument of the query is an array of strings that allow you to show only specific columns.
     *
     * Examples:
     * ```ts
     * .query("select") // No arguments, select all columns
     * .query("select",['username']) // only get the username column
     * .query("select",["username","balance"]) //Get two columns, username and balance.
     * ```
     *
     * ### Upsert
     *
     * Upsert is used to add or modify data in the database.
     * If the primary key rows are null or undefined, the data will always be added in a new row. Otherwise, you might be updating existing rows.
     * The second argument of the query with upserts is always an Object of the data to upsert.
     *
     * Examples:
     * ```ts
     * .query("upsert",{id:1, username:"Scott"}) //If row ID 1 exists, set the username to scott, otherwise create a new row with this data.
     * .query("upsert",{username:"Scott"}) //Add a new row to the db with this username in the row.
     * .query("upsert",{balance:-35}).where(["balance","<",0]) // If you use a WHERE statement this data will be applied to the rows found with the where statement.
     * ```
     *
     * ### Delete
     *
     * Delete is used to remove data from the database.
     * It works exactly like select, except it removes data instead of selecting it.  The second argument is an array of columns to clear.  If no second argument is passed, the database is dropped.
     *
     * Examples:
     * ```ts
     * .query("delete",['balance']) //Clear the contents of the balance column on ALL rows.
     * .query("delete",['comments']).where(["accountType","=","spammer"]) // If a where statment is passed you'll only clear the columns of the rows selected by the where statement.
     * .query("delete") // same as drop statement
     * ```
     *
     * ### Drop
     *
     * Drop is used to completely clear the contents of a database.  There are no arguments.
     *
     * Drop Examples:
     * ```ts
     * .query("drop")
     * ```
     *
     * @param {("select"|"upsert"|"delete"|"drop")} action
     * @param {any} [args]
     * @returns {SomeSQLInstance}
     *
     * @memberOf SomeSQLInstance
     */
    query(action: "select" | "upsert" | "delete" | "drop", args?: any): SomeSQLInstance;
    /**
     * Used to select specific rows based on a set of conditions.
     * You can pass in a single array with a conditional statement or an array of arrays seperated by "and", "or" for compound selects.
     * A single where statement has the column name on the left, an operator in the middle, then a comparison on the right.
     *
     * Where Examples:
     *
     * ```ts
     * .where(['username','=','billy'])
     * .where(['balance','>',20])
     * .where(['catgory','IN',['jeans','shirts']])
     * .where([['name','=','scott'],'and',['balance','>',200]])
     * .where([['id','>',50],'or',['postIDs','IN',[12,20,30]],'and',['name','LIKE','Billy']])
     * ```
     *
     * @param {(Array<any|Array<any>>)} args
     * @returns {SomeSQLInstance}
     *
     * @memberOf SomeSQLInstance
     */
    where(args: Array<any | Array<any>>): SomeSQLInstance;
    /**
     * Order the results by a given column or columns.
     *
     * Examples:
     *
     * ```ts
     * .orderBy({username:"asc"}) // order by username column, ascending
     * .orderBy({balance:"desc",lastName:"asc"}) // order by balance descending, then lastName ascending.
     * ```
     *
     * @param {Object} args
     * @returns {SomeSQLInstance}
     *
     * @memberOf SomeSQLInstance
     */
    orderBy(args: {
        [key: string]: "asc" | "desc";
    }): SomeSQLInstance;
    /**
     * Join command.
     *
     * Example:
     *
     * ```ts
     *  SomeSQL("orders").query("select",["orders.id","orders.title","users.name"]).join({
     *      type:"inner",
     *      table:"users",
     *      where:["orders.customerID","=","user.id"]
     *  }).exec();
     *```
     * A few notes on the join command:
     * 1. You muse use dot notation with the table names in all "where", "select", and "orderby" arguments.
     * 2. Possible join types are `inner`, `left`, and `right`.
     * 3. The "table" argument lets you determine the data on the right side of the join.
     * 4. The "where" argument lets you set what conditions the tables are joined on.
     *
     *
     *
     * @param {JoinArgs} args
     * @returns {SomeSQLInstance}
     *
     * @memberOf SomeSQLInstance
     */
    join(args: JoinArgs): SomeSQLInstance;
    /**
     * Limits the result to a specific amount.  Example:
     *
     * ```ts
     * .limit(20) // Limit to the first 20 results
     * ```
     *
     * @param {number} args
     * @returns {SomeSQLInstance}
     *
     * @memberOf SomeSQLInstance
     */
    limit(args: number): SomeSQLInstance;
    /**
     * Offsets the results by a specific amount from the beginning.  Example:
     *
     * ```ts
     * .offset(10) // Skip the first 10 results.
     * ```
     *
     * @param {number} args
     * @returns {SomeSQLInstance}
     *
     * @memberOf SomeSQLInstance
     */
    offset(args: number): SomeSQLInstance;
    /**
     * Adds a custom filter to the query.  The filter you use MUST be supported by the database driver OR a custom filter you provided before the connect method was called.
     * The built in memory DB supports sum, min, max, average, and count
     *
     * Example:
     * ```ts
     * //get number of rows
     * SomeSQL("users").query("select").filter("count"").exec().then(function(rows) {
     *  console.log(rows) // <= [{count:300}]
     * });
     * ```
     *
     * @param {string} name
     * @param {*} [args]
     * @returns {SomeSQLInstance}
     *
     * @memberOf SomeSQLInstance
     */
    filter(name: string, args?: any): SomeSQLInstance;
    /**
     * Trigger a database event
     *
     * @param {DatabaseEvent} eventData
     *
     * @memberOf SomeSQLInstance
     */
    triggerEvent(eventData: DatabaseEvent, triggerEvents: Array<string>): void;
    /**
     * Executes the current pending query to the db engine, returns a promise with the rows as objects in an array.
     * The second argument of the promise is always the SomeSQL variable, allowing you to chain commands.
     *
     * Example:
     * SomeSQL("users").query("select").exec().then(function(rows, db) {
     *     console.log(rows) // <= [{id:1,username:"Scott",password:"1234"},{id:2,username:"Jeb",password:"1234"}]
     *     return db.query("upsert",{password:"something more secure"}).where(["id","=",1]).exec();
     * }).then(function(rows, db) {
     *  ...
     * })...
     *
     * @returns {(Promise<Array<Object>>)}
     *
     * @memberOf SomeSQLInstance
     */
    exec(): Promise<Array<Object | SomeSQLInstance>>;
    /**
     * Configure the database driver, must be called before the connect() method.
     *
     * @param {any} args
     * @returns {SomeSQLInstance}
     *
     * @memberOf SomeSQLInstance
     */
    config(args: any): SomeSQLInstance;
    /**
     * Perform a custom action supported by the database driver.
     *
     * @param {...Array<any>} args
     * @returns {*}
     *
     * @memberOf SomeSQLInstance
     */
    extend(...args: Array<any>): any | SomeSQLInstance;
    /**
     * Load JSON directly into the DB.
     * JSON must be an array of maps, like this:
     * ```ts
     * [
     *  {"name":"billy","age":20},
     *  {"name":"johnny":"age":30}
     * ]
     * ```
     *
     * Rows must align with the data model.  Row data that isn't in the data model will be ignored.
     *
     * @param {Array<Object>} rows
     * @returns {(Promise<Array<Object>>)}
     *
     * @memberOf SomeSQLInstance
     */
    loadJS(rows: Array<Object>): Promise<Array<Object>>;
    /**
     * Adds a filter to rows going into the database, allows you to control the range and type of inputs.
     *
     * This function will be called on every upsert and you'll recieve the upsert data as it's being passed in.
     *
     * SomeSQL will apply the "default" row data to each column and type cast each column BEFORE calling this function.
     *
     * @param {(row: object) => object} callBack
     *
     * @memberOf SomeSQLInstance
     */
    rowFilter(callBack: (row: any) => any): this;
    /**
     * Load a CSV file into the DB.  Headers must exist and will be used to identify what columns to attach the data to.
     *
     * This function performs a bunch of upserts, so expect appropriate behavior based on the primary key.
     *
     * Rows must align with the data model.  Row data that isn't in the data model will be ignored.
     *
     * @param {string} csv
     * @returns {(Promise<Array<Object>>)}
     *
     * @memberOf SomeSQLInstance
     */
    loadCSV(csv: string): Promise<Array<Object>>;
    /**
     * RFC4122 compliant UUID v4, 9 randomly generated 16 bit numbers.
     *
     * @static
     * @returns {string}
     *
     * @memberOf SomeSQLInstance
     */
    static uuid(): string;
    /**
     * Export the current query to a CSV file, use in place of "exec()";
     *
     * Example:
     * SomeSQL("users").query("select").toCSV(true).then(function(csv, db) {
     *   console.log(csv);
     *   // Returns something like:
     *   id,name,pass,postIDs
     *   1,"scott","1234","[1,2,3,4]"
     *   2,"jeb","5678","[5,6,7,8]"
     * });
     *
     * @param {boolean} [headers]
     * @returns {Promise<string>}
     *
     * @memberOf SomeSQLInstance
     */
    toCSV(headers?: boolean): Promise<string>;
}
/**
 * This object is passed into a the database connect function to activate it.
 *
 * @export
 * @interface DBConnect
 */
export interface DBConnect {
    _models: StdObject<Array<DataModel>>;
    _actions: StdObject<Array<ActionOrView>>;
    _views: StdObject<Array<ActionOrView>>;
    _filters: {
        [key: string]: (rows: Array<DBRow>) => Array<DBRow>;
    };
    _config: Array<any>;
    _parent: SomeSQLInstance;
    _onSuccess: Function;
    _onFail?: Function;
}
/**
 * These variables are passed into the database execution function.
 *
 * @export
 * @interface DBExec
 */
export interface DBExec {
    _table: string;
    _query: Array<QueryLine>;
    _viewOrAction: string;
    _onSuccess: (rows: Array<Object>, type: string, affectedRows: DBRow[]) => void;
    _onFail: (rows: Array<Object>) => void;
}
export interface SomeSQLBackend {
    /**
     * Inilitize the database for use, async so you can connect to remote stuff as needed.
     *
     * This is called by SomeSQL once to the DB driver once the developer calls "connect()".
     *
     * Models, Views, Actions, and added Filters are all sent in at once.  Once the "onSuccess" function is called the database should be ready to use.
     *
     * The "preCustom" var contains an array of calls made to the "custom" method before connect() was called.  All subsequent custom() calls will pass directly to the database "custom()" method.
     *
     * @param {DBConnect} connectArgs
     *
     * @memberOf SomeSQLBackend
     */
    _connect(connectArgs: DBConnect): void;
    /**
     * Executes a specific query on the database with a specific table
     *
     * This is called on "exec()" and all the query parameters are passed in as an array of Objects containing the query parameters.
     *
     * The syntax is pretty straightforward, for example a query like this: SomeSQL("users").query("select").exec() will turn into this:
     * ```ts
     * [{type:'select',args:undefined}]
     * ```
     *
     * Let's say the person using the system gets crazy and does SomeSQL("users").query("select",['username']).orderBy({name:'desc'}).exec();
     * Then you get this:
     * ```ts
     * [{type:'select',args:['username']},{type:"orderBy",args:{name:'desc}}]
     * ```
     *
     * With that information and the table name you can create the query as needed, then return it through the onSuccess function.
     *
     * @param {DBExec} execArgs
     *
     * @memberOf SomeSQLBackend
     */
    _exec(execArgs: DBExec): void;
    /**
     * Optional extension for the database.
     * The extend method for SomeSQL is just a passthrough to this method.
     * An entirely different and new API can be built around this.
     *
     * @param {SomeSQLInstance} instance
     * @param {...Array<any>} args
     * @returns {*}
     *
     * @memberOf SomeSQLBackend
     */
    _extend?(instance: SomeSQLInstance, ...args: Array<any>): any;
}
export declare function SomeSQL(setTablePointer?: string): SomeSQLInstance;
