
/**
* @desc: 批量执行能够提高50~500%的效率
* @return: 
*/
export interface RedisBatch {
  /**
  * @desc: 设置指定键的超时时间.
  * @param ttl: 秒数; 不指定, 则使用默认的值.
  */
  expire(key:string, ttl?:number, callback?:(err:Error,res:any)=>void): RedisBatch;

  /**
  * @desc: 移除指定key的ttl, 使得永不过期.
  */
  persist(key: string, callback?: (err: Error, res: any) => void): RedisBatch;

  //#region hash操作
  
  /**
  * @desc: 设置hash表数据.
  *         不会设置默认ttl; ttl设置在hash表上.
  * @param key: 设置的键.
  * @param field: 设置的字段.
  * @param value: 设置的值.
  */
  hset(key: string, field: string, value: any, callback?: (err: Error, res: any) => void): RedisBatch;

  /**
  * @desc: 获取hash表指定的数据.
  */
  hget(key: string, field: string, callback?: (err: Error, res: any) => void): RedisBatch;

  /**
  * @desc: 获取hash表的keys.
  */
  hkeys(key: string, callback?: (err: Error, res: any) => void): RedisBatch;

  /**
  * @desc: 清理hash表指定的数据.
  */
  hdel(key: string, ...fields: string[]): RedisBatch;

  //#endregion

  //#region 集合操作

  /**
  * @desc: 在集合中插入值.
  */
  sadd(key: string, value: string): RedisBatch;

  /**
  * @desc: 在集合中移除指定成员.
  */
  sremove(key: string, ...values: string[]): RedisBatch;

  /**
  * @desc: 返回集合中的元素个数.
  */
  scard(key: string, callback?: (err: Error, res: any) => void): RedisBatch;

  /**
  * @desc: 判读是否是集合中的元素.
  */
  sismember(key: string, value: string, callback?: (err: Error, res: any) => void): RedisBatch;

  /**
  * @desc: 返回集合中的所有成员.
  */
  smembers(key: string, callback?: (err: Error, res: any) => void): RedisBatch;

  //#endregion

  //#region string 操作

  /**
  * @desc: 设置数据, 会设置默认ttl.
  * @param key: 设置的键.
  * @param value: 设置的值.
  * @param ttl: ttl in second, 如果指定0,则使用默认值. -1则不设置.
  */
  set(key: string, value: any, ttl?: number, callback?: (err: Error, res: any) => void): RedisBatch;

  /**
  * @desc: 获取指定的数据.
  */
  get(key: string, callback?: (err: Error, res: any) => void): RedisBatch;

  /**
  * @desc: 清理指定的数据.
  */
  del(key: string): RedisBatch;

  //#endregion


  //#region 执行.

  /**
  * @desc: 执行所有语句, 并以数组方式返回所有结果.
  * @return: 
  */
  exec(callback?: (err: Error, res: any[]) => void): Promise<any[]>;

  //#endregion
}