const config = require('../config'); 
const { Client } = require('pg');
const {v4: uuid4} = require('uuid');

/**
 * config.postgres is the config value currently
 */

/**
 * 
 * from Python code
 * import src.config as config
import src.server_logic.sqlalchemy.conneciton as connection

"""
What we have now
********************************
select_one by id
select_many_by ids
insert --- dict
bulk insert --- list of dicts, all dicts must have the same dict schema
update --- dict with id
bulk update --- list of dicts with ids,  all dicts must have the same dict schema
upsert --- dict with id or no id
bulk upsert --- list of dicts with or without id,  all dicts must have the same dict schema


TODO
****************************************
Updates given a where clause
Upserts given an where clause
bulk updates for Dates and timestamp values
using json or jsonb to load dates and timestamps to natural python code
"""
__connection = None


def create():
    global __connection
    if __connection:
        return __connection
    else:
        cnf = config.get_config()
        __connection = connection.CON(cnf['DB_Equities'])
        __connection.setup_postgres()
        return __connection


class SQL(object):

    @staticmethod
    def select_many(t, columns, primary_id, p_ids):
        sql = (
            "SELECT %s FROM %s WHERE %s IN (%s)" %
            (SQL.columns(columns), t, primary_id, ', '.join(["%s" % p_id for p_id in p_ids]))
        )
        return sql

    @staticmethod
    def select_many_where(t, columns, where):
        sql = (
            "SELECT %s FROM %s WHERE %s" %
            (SQL.columns(columns), t, where)
        )
        return sql

    @staticmethod
    def select_distinct(t, column):
        sql = 'SELECT DISTINCT(%s) FROM %s' % (column, t)
        return sql

    @staticmethod
    def bulk_insert(t, records):
        if len(records) > 0:
            sql = (
                "INSERT INTO " + t + " (" + ",".join(
                    [SQL._escape_string(key) for key in records[0].keys()]
                )
                + ") " + SQL.values(records)
            )
            return sql
        else:
            return None

    @staticmethod
    def bulk_update(t, records, columns, primary_id):
        """
        1. values needs to contain all the values except for the primary id
        2. need to create the set portion of the code
        """
        sets = SQL.equal_keys('v2', records[0], primary_id)
        values = SQL.value_strict(records, columns)
        columns = SQL.keys(records[0])
        sql = "update %s as u SET %s FROM (%s) as v2(%s) where v2.%s=u.%s" % (
            t, sets, values, columns, primary_id, primary_id
        )
        return sql

    @staticmethod
    def value_strict(records, columns):
        vs = list()
        funcs = [columns[key] for key in records[0]]
        for record in records:
            vs.append("(%s)" % ", ".join([funcs[i](record[key]) for i, key in enumerate(record)]))
        return " VALUES " + ",".join(vs)

    @staticmethod
    def keys(record):
        return ", ".join([key for key in record])

    @staticmethod
    def equal_keys(t, record, p_key):
        return ", ".join([("%s = %s.%s" % (key, t, key)) for key in record if key != p_key])

class RepoAbstract(object):
    PRIMARY_KEY_ERROR = ValueError('The primary id is not in the record, cannot perform an update')

    def _bulk_insert(self, records):
        sql = SQL.bulk_insert(self.t, records)
        self.execute(sql)

    def _bulk_update(self, records):
        """
        WARNING make sure all values have a value, this does not merge if the columns value is null for any of the records
        WARNING all records must contain the exact number of dictionary keys as well.
        """
        for record in records:
            if self.primary_id not in record:
                raise self.PRIMARY_KEY_ERROR
        else:
            sql = SQL.bulk_update(self.t, records, self.column_funcs, self.primary_id)
            self.execute(sql)

    def _select_one(self, p_id):
        # https://docs.sqlalchemy.org/en/13/core/connections.html#sqlalchemy.engine.ResultProxy
        sql = SQL.select_one(self.t, self.columns, self.primary_id, p_id)
        result = self.execute(sql)
        if result.returns_rows:
            keys = result.keys()
            row = result.first()
            if row:
                d = dict()
                for k in keys:
                    d[k] = row[k]
                return d
            else:
                return None
        else:
            return None

    def _select_many(self, p_ids):
        sql = SQL.select_many(self.t, self.columns, self.primary_id, p_ids)
        return self.__execute_select_many(sql)

    def _select_many_where(self, where):
        sql = SQL.select_many_where(self.t, self.columns, where)
        return self.__execute_select_many(sql)

    def _select_many_primary_only(self, p_ids):
        """
        Return only the primary ids of the p_ids that you are looking for
        """
        sql = SQL.select_many(self.t, [self.primary_id], self.primary_id, p_ids)
        return self.__execute_select_many_no_dict(sql)

    def _select_distinct(self, column):
        sql = SQL.select_distinct(self.t, column)
        return self.__execute_select_many_no_dict(sql)

    def _bulk_upsert(self, records):
        # seperate the records with ids from those that do not have ids
        dict_of_records_with_p_id = dict()
        list_of_records_without_p_id = []
        for record in records:
            if self.primary_id in record:
                dict_of_records_with_p_id[record[self.primary_id]] = record
            else:
                list_of_records_without_p_id.append(record)

        # find out what records with ids exist in the database, and seperate those as well
        ids_in_records = [p_id for p_id in dict_of_records_with_p_id]
        result = self._select_many_primary_only(ids_in_records)

        set_of_ids_in_db = set(result)
        list_of_records_with_p_id_in_db = []
        list_of_records_with_p_id_not_in_db = []
        for p_id in dict_of_records_with_p_id:
            if p_id in set_of_ids_in_db:
                list_of_records_with_p_id_in_db.append(dict_of_records_with_p_id[p_id])
            else:
                list_of_records_with_p_id_not_in_db.append(dict_of_records_with_p_id[p_id])

        # add the list of records with ids but not in the db, to the list without ids
        list_of_records_without_p_id.extend(list_of_records_with_p_id_not_in_db)

        # insert and update
        if len(list_of_records_without_p_id) > 0:
            self._bulk_insert(list_of_records_without_p_id)
        if len(list_of_records_with_p_id_in_db) > 0:
            self._bulk_update(list_of_records_with_p_id_in_db)

    def __execute_select_many(self, sql):
        sql = sql + ' LIMIT %s' % self.limit if self.limit else sql
        result = self.execute(sql)
        if result.returns_rows:
            keys = result.keys()
            rows = []
            for row in result:
                d = dict()
                for k in keys:
                    d[k] = row[k]
                rows.append(d)
            return rows
        else:
            return []

    def __execute_select_many_no_dict(self, sql):
        sql = sql + ' LIMIT %s' % self.limit if self.limit else sql
        result = self.execute(sql)
        if result.returns_rows:
            return [row[0] for row in result.fetchall()]
        else:
            return []
 */

const COLUMNS ={
  JSONB: 1,
  INTEGER: 2,
  STRING: 3,
  DATE: 4,
  TIMESTAMP: 5,
  BOOLEAN: 6,
  JSON: 7,
  FLOAT: 8,
  ARRAY: 9,



  getDataTypeFunction (col) {
    if (col === this.INTEGER) {
      return (x) => { return String(x) }
    } else if (col === this.STRING) {
      return (x) => { return `'${SQL._toSQLString(x)}'`}
    } else if (col === this.BOOLEAN) {
      return (x) => { return x ? 'true' : 'false'}
    } else if (col === this.JSONB) {
      return (x) => { return `'${SQL._toSQLString(x)}'::JSONB`}
    } else if (col === this.JSON) {
      return (x) => { return `'${SQL._toSQLString(x)}'::JSON`}
    } else if (col === this.DATE) {
      // TODO need to ensure this
      return (x) => { return x.getTime()}
    } else if (col === this.TIMESTAMP) {
      // TODO need to ensure this
      return (x) => { return x.getTime()}
    } else if (col === this.FLOAT) {
      return (x) => { return x }
    }
  }
}

const SQL = {
  selectOne (t, columns, PID, pId) {
    let sqlColumns = SQL.columns(columns)
    let sql = `SELECT ${sqlColumns} FROM ${t} WHERE ${PID.whereFromRecord(pId)}`
    return sql
  },
  selectMany (t, columns, primaryIdColumn, pIds) {
    let sqlColumns = SQL.columns(columns)
    let sql = `SELECT ${sqlColumns} FROM ${t} WHERE ${primaryIdColumn} ${SQL.__in(pIds)}`
    return sql
  },
  selectAll (t) {
    return `SELECT * FROM ${t}`
  },
  selectWhere (t, columns, where) {
    let sqlColumns = SQL.columns(columns)
    let sql = `SELECT ${sqlColumns} FROM ${t} WHERE ${where}`
    return sql
  },
  countAll (t) {
    let sql = `SELECT COUNT(*) FROM ${t}`
    return sql
  },
  /**
   * This one needs to allow multiple keys, not just one
   * @param {*} t 
   * @param {*} columns 
   * @param {*} key 
   * @param {*} records - list of values to query on
   */
  selectInOneKey (t, columns, key, records) {
    let sqlColumns = SQL.columns(columns)
    let sql = `SELECT ${sqlColumns} FROM ${t} WHERE ${key} ${SQL.__in(records)}`
    return sql
  },
  selectManyFromKeyWithWhere (t, columns, key, records, where) {
    return this.selectInOneKey(t, columns, key, records) + ` AND ${where}`
  },
  insertObject (table, record) {
    // NOTE must contain all keys for the record
    const sql = (
      `INSERT INTO ${table}(${Object.keys(record)}) 
      VALUES (${Object.keys(record).map((c, i) => `$${i + 1}`)}) ${suffix}`
    );
    return sql
  },

  insert (t, record) {
    let columns = Object.keys(record).map(key => SQL._toSQLString(key)).join(',')
    let values = SQL.values([record])
    let sql = `INSERT INTO ${t} (${columns}) VALUES ${values}`
    return sql
  },

  update (t, record, PID) {
   let columnsToUpdate = PID.filterPrimaryIds(record)
    let columnsSetValues = columnsToUpdate.map(key => {
      // TODO NOTE that the columns will be set differently based off the Column Type
      return `${key} = '${SQL._toSQLString(record[key])}'`
    })
    console.log(record)
    let sql = `UPDATE ${t} SET ${columnsSetValues.join(', ')} WHERE ${PID.whereFromRecord(record)}`
    return sql
  },

  delete (t, pid, primaryIDColumn) {
    let sql = `DELETE FROM ${t} where ${primaryIDColumn}='${pid}'`
    return sql
  },

  deleteBulk (t, pids, primaryIDColumn) {
    let sql = `DELETE FROM ${t} where ${primaryIDColumn} ${SQL.__in(pids)}`
    return sql
  },

  /**
   * 
   * @param {*} table 
   * @param {*} primaryIdColumn 
   * @param {*} primaryId 
   * @param {*} jsonColumn 
   * @param {*} record 
   */
  spread (table, primaryIdColumn, primaryId, jsonColumn, record) {
    // ASSUMES that primaryIdColumn is of type string.... and that it is only 1 thing
    // TODO we need to construct the primaryIdColumn in a way that it is an object, that can handle itself
    // if the primary column has many or more than 1 column specific to itself
    const sql = `update ${table} set ${jsonColumn}= coalesce(${jsonColumn}, '{}') ||
      '${SQL._toSQLString(JSON.stringify(record))}' where ${primaryIdColumn}='${primaryId}'`
    return sql
  },
  values (records) {
    let setOfValues = records.map(rec => {
      let values = Object.keys(rec).map(key => SQL._toSQLString(rec[key])).join("', '")
      return `('${values}')`
    })
    return setOfValues.join(',')
  },
  columns (cols) {
    return cols.join(', ')
  },
  _toSQLString (s) {
    if (typeof s === 'string') {
      return s.replace(/'/g, "''")
    } else if (s === null || s === undefined) {
      return 'NULL'
    } else if (typeof s === "object") {
      if (Array.isArray(s)) {
        return JSON.stringify(s).replace('[', '{').replace(']', '}')
      } else {
        return JSON.stringify(s).replace(/'/g, "''")
      }
    } else {
      return s
    }
  },
  __in (strings) {
    return `IN ('${strings.join("', '")}')`
  }
}

class RDSTools {
  constructor (con) {
    this.con = con
  }

  async createTable ({schema, tableName, columns}) {
    await this.createSchema(schema)
    await this._createTable({schema, tableName, columns})
  }

  async _createTable ({schema, tableName, columns}) {
    // TODO it looks like to create the table, we might want the COLUMNS to be objects themsevles
    let columnSQL = Object.keys(columns).map(key => {
      return `${key} ${COLUMNS}`
    })
    let sql = `CREATE TABLE ${schema}.${tableName} ()`
  }

  async createSchema (schema) {
    let schemaName = await this.getSchemaName(schema)
    if (!schemaName) {
      let sql = `CREATE SCHEMA ${schema}`
      return this.execute(sql)
    } else {
      return true
    }
  }

  async getSchemaName (schema) {
    let sql = `SELECT schema_name FROM information_schema.schemata WHERE schema_name = '${schema}'`
    return this.execute(sql)
  }

  execute (sql) {
    console.log(sql)
    return this.con.query(sql)
    .catch(ex => {
        console.error(ex);
        return ex;
    }) 
  }
}

const PRIMARY_TYPES = {
  UUID: {
    autoGen: true,
    generate: () => { return uuid4() }
  },  // assumed to be auto generated all the times
  INTEGER: 10,
  INTEGER_AUTO_GENERATED: 11,   // assumes that there is a SERIAL generating the values already
  MULTI: 50,
  NULL: 1000
}
// have found no use yet
class PrimaryID {
  /**
   * @param {*} param0 
   */
  constructor({columns, PrimaryType}) {
    if (!columns) {
      this.columnName = 'id'
    } else {  // is an array
      this.columnName = columns
    }
    this.__isAutoGenerated = this.__setAutoGeneratedFlag(PrimaryType)
  }

  generate () {
    return this.isAutoGenerated() ? this.pt.generate() : null
  }

  isAutoGenerated () {
    return this.__isAutoGenerated
  }

  __setAutoGeneratedFlag (pt) {
    switch (pt) {
      case PRIMARY_TYPES.UUID:
      case PRIMARY_TYPES.INTEGER_AUTO_GENERATED:
        return true
      default:
        return false
    }
  }
}

const CONNECTION = {
  con: null,
  async close () {
    if (this.con) {
      const resp = await this.con.end();
      this.con = null
      return resp
    } else {
      return null
    }
  },

  async __setup () {
    if (!this.con) {
      // FUTURE we might need to have this connection set up done differently
      let c = config.DBs.authenticationServer
      this.con = new Client(c);
      await this.con.connect()
    }
    return this.con
  },

  async query (data) {
    await this.__setup()
    return this.con.query(data)
  },

  async queryObject (data, record) {
    await this.__setup()
    return this.con.query(data, record)
  }
}

/**
 * Look up the "class PrimaryID {" class to see if we can use that code to compelte the job as well.
 * I will need to get some of this done.
 */
class PrimaryIDClass {
 constructor (primaryId, primaryIdTypes, table) {
  if (!Array.isArray(primaryId)) {
   primaryId = [primaryId]
  }
  if (!Array.isArray(primaryIdTypes)) {
   primaryIdTypes = [primaryIdTypes]
  }
  this.primaryId = primaryId
  this.primaryIdTypes = primaryIdTypes
  this.table = table
  this.dictOfPrimaryIds = this.primaryId.reduce((obj, pid) => {
   obj[pid] = true
   return obj
  }, {})
 }

 filterPrimaryIds (record) {
  return Object.keys(record).filter(key => !this.dictOfPrimaryIds[key])
 }

 whereFromRecord (record) {
  if (typeof record === 'string') {
   if (this.primaryId.length === 1) {
    return `${this.primaryId[0]}='${record}'`
   } else {
    throw Error(`There are more than 1 primary Ids for the table ${this.table}`)
   }
  } else {
   return this.primaryId.map(pid => {
    return `${pid}='${record[pid]}'`
   }).join(' AND ')
  }
 }
}


class RDS1 {
  /**
    rds = new RDS1({
      tableName: 'testtable',
      schema: 'testschema',
      columns: ['first_name', 'last_name', 'income', 'data', 'create_date', 'updated'],
      primaryIDColumn: 'id'
    })
   * @param {tableName, schema, columns, primaryIDColumn} 
   */
  constructor ({
    tableName,
    schema,
    columns,  // {<columnName>: <columnType>, ......}
    primaryIDColumn,
    primaryType // NEED TO GET RID OF THE PrimaryType in the next round, and have something figured out
  }) {
    this.tableName = tableName
    this.schema = schema
    this.t = `${this.schema}.${this.tableName}`
    this.columns = columns
    this.primaryIDColumn = primaryIDColumn
    // Sets the primaryType to UUID, all the time unless prescribed
    this.primaryType = primaryType ? primaryType : PRIMARY_TYPES.UUID
    this.limit = null
    this.columnFuncs = {}   // only used in the bulk updates
    this.con = CONNECTION

    this.primaryIDObject = new PrimaryIDClass(this.primaryIDColumn, this.primaryType, this.t)
    /**
     * FINISH UP
     * the folowing have been added to using the primaryIdObject
     * 1. _update
     * 2. _selectOnePid
     */

    if (this.columns && Array.isArray(this.columns) && typeof this.columns[0] === 'object') {
      Object.keys(this.columns).forEach(key => {
        this.columnFuncs[key] = COLUMNS.getDataTypeFunction(columns[key])
      })
    }
  }

  async close () {
    await this.con.close()
  }

  set_limit (x) {
    this.limit = x
  }

  _selectOnePid (pid) {
    let sql = SQL.selectOne(this.t, this.columns, this.primaryIDObject, pid)
    return this._execute(sql).then(resp => {
      return this.__return1(resp)
    })
  }

  _selectManyPid (pids) {
    let sql = SQL.selectMany(this.t, this.columns, this.primaryIDColumn, pids)
    return this._execute(sql).then(resp => {
      return this.__returnMany(resp)
    })
  }

  _selectAll () {
    let sql = SQL.selectAll(this.t)
    return this._execute(sql).then(resp => {
      return this.__returnMany(resp)
    })
  }

  _selectWhere (where) {
    let sql = SQL.selectWhere(this.t, this.columns, where)
    return this._execute(sql).then(resp => {
      return this.__returnMany(resp)
    })
  }

  _countAll () {
    let sql = SQL.countAll(this.t)
    return this._execute(sql).then(resp => {
      return this.__return1(resp).count
    })
  }
  /**
   * {V2} should be called selectManyFromColumn
   * @param {string} key The column name
   * @param {Array} records the records, array of things not objects
   */
  _selectManyFromKey (key, records, otherColumns) {
    if (!Array.isArray(records)) {
      // TODO cannot be an object....
      // if (typeof(records) !== 'string') {
      //   throw Error('records must be type of string _selectManyFromKey')
      // }
      records = [records]
    }
    let columns = [key]
    if (otherColumns) {
      otherColumns.push(key)
      columns = otherColumns
    } 
    if (records.length > 0) {
      let sql = SQL.selectInOneKey(this.t, columns, key, records)
      return this._execute(sql).then(resp => {
        return this.__returnMany(resp)
      })
    } else {
      return []
    }
  }

  /**
   * Selects * FROM where key in records
   * @param {*} key - the column to look up
   * @param {*} records - list of values
   * @param {*} where - the where clause added
   */
  _selectManyFromKeyWithWhere (key, records, where) {
    let columns = this.columns.filter(col => col !== key)
    columns.push(key)
    let sql = SQL.selectManyFromKeyWithWhere(this.t, columns, key, records, where)
    return this._execute(sql).then(resp => {
      return this.__returnMany(resp)
    })
  }

  _insert (record) {
    this.__setPrimaryKey(record)
    let sql = SQL.insert(this.t, record)
    // TODO returning should return the object, not the rows object from postgres
    return this._executeReturning(sql).then(resp => {
      return this.__return1(resp)
    })
  }

  _insertBulk () {

  }

  _insertObject (record) {
    let sql = SQL.insertObject(this.t, record)
    return this._executeObject(sql, record)
  }

  _update (record) {
    let sql = SQL.update(this.t, record, this.primaryIDObject)
    return this._execute(sql)
  }

  _updateBulk (record) {
  }

  async _upsert () {
    let pid = record[this.primaryIDColumn]
    if (pid) {
      let data = await this._selectOnePid(pid)
      if (data) {
        return this._update(record)
      } else {
        return this._insert(record)
      }
    } else {
      return this._insert(record)
    }
  }

  _upsertBulk () {

  }

  _delete (pid) {
    let sql = SQL.delete(this.t, pid, this.primaryIDColumn)
    return this._execute(sql)
  }

  _deleteTheOldest (timestampColumn) {
    // has to be on a timestamp cloumn
    let sql = `DELETE FROM ${this.t} where ${timestampColumn}=(SELECT MIN(${timestampColumn}) from ${this.t})`
    return this._execute(sql)
  }

  _deleteBulk () {
    let sql = SQL.deleteBulk(this.t, pids, this.primaryIDColumn)
    return this._execute(sql)
  }

  _spreadJSON (column, record, primaryId) {
    let sql = SQL.spread(this.t, this.primaryIDColumn, primaryId, column, record)
    return this._execute(sql)
  }

  _spreadJSONBulk () {

  }

  _executeReturning (sql) {
    return this._execute(sql + ' RETURNING *')
  }

  async _execute (sql) {
    console.log(sql);
    return this.con.query(sql).catch(ex => {
      console.error(ex);
      return ex
    });
  }

  async _executeObject (sql, record) {
    console.log(sql)
    console.log(JSON.stringify(record))
    return this.con.queryObject(sql, Object.values(record))
    .catch(ex => {
        console.error(ex);
        return ex;
    })
  }

  async __setup () {
    await this.con.__setup()
  }

  /**
   * Only adds a UUID if the record does not contain a UUID itself
   * @param {*} record 
   */
  __setPrimaryKey (record) {
    if (this.primaryType === PRIMARY_TYPES.UUID) {
      if (!record[this.primaryIDColumn]) {
        record[this.primaryIDColumn] = uuid4()
      }
    }
  }

  __return1 (resp) {
    if (resp.rows && resp.rows.length >= 1) {
      return resp.rows[0]
    } else {
      return null
    }
  }

  __returnMany (resp) {
    if (resp.rows && resp.rows.length >= 1) {
      return resp.rows
    } else {
      return []
    }
  }

  _selectMax (column) {
    let sql = `SELECT * from ${this.t} where ${column} = (SELECT MAX(${column}) from ${this.t})`
    return this._execute(sql).then(resp => {
      return this.__return1(resp)
    })
  }
  _selectMin (column) {
    let sql = `SELECT * from ${this.t} where ${column} = (SELECT MIN(${column}) from ${this.t})`
    return this._execute(sql).then(resp => {
      return this.__return1(resp)
    })
  }
}

module.exports = {
  RDS1,
  COLUMNS,
  CONNECTION,
  PRIMARY_TYPES
}
