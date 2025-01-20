import { RedisBatch } from "./redisBatch";
import { RedisLock, RedisTransaction } from "./redisTransaction";

/**
 * Construct a type with a set of properties K of type T
 */
export type Record<K extends keyof any, T> = {
    [P in K]: T;
};

export type KeyType = string | Buffer;
export type ValueType = string | Buffer | number | any[];

export class RedisTemplate {

  public static reconnectAll(): any;

  constructor(configMapPrefix?: string);
  constructor(cfg: {
    /** 主机信息, 多台主机则为集群模式. */
    clusterServers: { host: string, port: number }[],
    db: number,
    password: string,
    /** 秒, 默认5分钟. (默认的过期时间对hash表无效, hash需单独设置) */
    ttl: number,
    /** ttl时间增加这个抖动范围, 默认10秒 */
    ttl_tolerance: number,
    conn_timeout: number,
  });

  reconnect(): Promise<void>;

  /**
  * @desc: 设置指定键的超时时间.
  * @param ttl: 秒数; 不指定, 则使用默认的值.
  */
  expire(key: KeyType, ttl?: number): Promise<boolean>;

  /**
  * @desc: 移除指定key的ttl.
  */
  persist(key: KeyType): Promise<boolean>;
  
  /**
  * @desc: 获取指定key的剩余过期时间 (秒).
  * @return: 
  */
  ttl(key: KeyType): Promise<number>;

  /**
  * @desc: 列出匹配的keys.
  */
  keys(pattern: string): Promise<string[]>;

  //#region hash操作
  
  /**
  * @desc: 设置hash表数据.
  *         不会设置默认ttl; ttl设置在hash表上.
  * @param key: 设置的键.
  * @param field: 设置的字段.
  * @param value: 设置的值.
  * @return 
  *    表明是否成功设置.
  * 
  *    redis
  *     1 if field is a new field in the hash and value was set.
  *     0 if field already exists in the hash and the value was updated.
  */
  hset(key: KeyType, field: string, value: any): Promise<boolean>;

  /**
  * @desc: 获取hash表指定的数据.
  */
  hget(key: KeyType, field: string): Promise<string>;

  /**
  * @desc: 获取hash表指定key的所有字段和值.
  */
  hgetall(key: KeyType): Promise<Record<string, string>>;

  /**
   * 返回哈希表指定key的所有值。
   */
  hvals(key: KeyType): Promise<string[]>;

  /**
   * 返回哈希表字段的数量。
   */
  hlen(key: KeyType): Promise<number>;

  
  /**
  * @desc: 获取hash表的keys.
  */
  hkeys(key: KeyType): Promise<string[]>;

  /**
  * @desc: 清理hash表指定的数据.
  */
  hdel(key: KeyType, ...fields: string[]): Promise<any>;

  /**
  * @desc: 指定的额feild是否存在.
  */
  hexists(key: KeyType, field: string): Promise<boolean>;

  //#endregion

  //#region 集合操作

  /**
  * @desc: 在集合中插入值.
  */
  sadd(key: KeyType, value: ValueType): Promise<any>;

  /**
  * @desc: 在集合中移除指定成员.
  */
  sremove(key: KeyType, ...values: string[]): Promise<any>;

  /**
  * @desc: 返回集合中的元素个数.
  */
  scard(key: KeyType): Promise<number>;

  /**
  * @desc: 判读是否是集合中的元素.
  */
  sismember(key: KeyType, member: string): Promise<boolean>;

  /**
  * @desc: 返回集合中的所有成员.
  */
  smembers(key: KeyType): Promise<any>;

  //#endregion

  //#region string 操作

  /**
  * @desc: 设置数据, 会设置默认ttl.
  * @param key: 设置的键.
  * @param value: 设置的值.
  * @param ttl: ttl in second, 如果指定0,则使用默认值. -1则不设置.
  */
  set(key: KeyType, value: ValueType, ttl?: number/* = 0 */): Promise<boolean>;

  /**
  * @desc: 获取指定的数据.
  */
  get(key: KeyType): Promise<string>;

  /**
  * @desc: 清理指定的数据.
  */
  del(key: KeyType): Promise<any>;

  /**
  * @desc: key是否存在.
  */
  exists(key: KeyType): Promise<boolean>;

  //#endregion


  //#region 事务.

  /**
  * @desc: 开始事务.
  *   cache.multi()
  *        .set('key', 'value')
  *        .exec((e, res)=>{ });
  */
  multi(): RedisTransaction;

  /**
  * @desc: 获得分布式锁 (redlock).
  * @param resource: 对此字符串进行加锁
  * @param maxTTL2Lock: 最多在此ms时间内保持锁.
  * @return: 
  */
  lock(resource: string, maxTTL2Lock: number): Promise<RedisLock>;

  //#endregion



  //#region 批量处理.

  /**
  * @desc: 开始事务.
  *   cache.batch()
  *        .set('key', 'value')
  *        .exec((e, res)=>{ });
  */
  batch(): RedisBatch;

  //#endregion
}