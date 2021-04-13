import { RedisBatch } from "./redisBatch";
import { RedisLock, RedisTransaction } from "./redisTransaction";

export class RedisTemplate {
  /**
   * 构造RedisTemplate
   * 
   * @description
   * 相关的配置为:
   * 
   * ```properties
        database: 0     # Redis数据库索引（默认为0)
        host: 127.0.0.1 # 单机模式host (优先使用此配置).
        port: 6379      # 单机模式port.
        cluster:        # 集群模式主机信息.
          nodes:          # Redis服务器地址列表
          - host: 127.0.0.1
            port: 6379
          - host: 127.0.0.1
            port: 6380
          - host: 127.0.0.1
            port: 6381
        password:       # Redis服务器连接密码（默认为空） 
        timeout: 0      # 连接超时时间（毫秒）
        default-ttl:           5    # 默认的ttl; 单位秒, 默认5分钟. (默认的过期时间对hash表无效, hash需单独设置) 
        default-ttl-tolerance: 10   # 单位秒; ttl时间增加这个抖动范围, 默认10秒
    ```
   * 
   * @param configMapPrefix 指定此配置作为redis配置. 默认为 'spring.redis'
   */
  constructor(configMapPrefix?: string);

  /**
  * @desc: 设置指定键的超时时间.
  * @param ttl: 秒数; 不指定, 则使用默认的值.
  */
  expire(key: string, ttl?: number): Promise<boolean>;
  
  /**
  * @desc: 移除指定key的ttl, 使得key永不过期.
  */
  persist(key: string): Promise<boolean>;

  /**
  * @desc: 获取指定key的剩余过期时间 (秒).
  * @return: 
  */
  ttl(key: string): Promise<number>;

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
  * 
  *     - 1 if field is a new field in the hash and value was set.
  *     - 0 if field already exists in the hash and the value was updated.
  */
  hset(key: string, field: string, value: any): Promise<boolean>;

  /**
  * @desc: 获取hash表指定的数据.
  */
  hget(key: string, field: string): Promise<string>;

  /**
  * @desc: 获取hash表的keys.
  */
  hkeys(key: string): Promise<string[]>;

  /**
  * @desc: 清理hash表指定的数据.
  */
  hdel(key: string, ...fields: string[]): Promise<any>;

  /**
  * @desc: 指定的额feild是否存在.
  */
  hexists(key: string, field: string): Promise<boolean>;

  //#endregion

  //#region 集合操作

  /**
  * @desc: 在集合中插入值.
  */
  sadd(key: string, value: string): Promise<any>;

  /**
  * @desc: 在集合中移除指定成员.
  */
  sremove(key: string, ...values: string[]): Promise<any>;

  /**
  * @desc: 返回集合中的元素个数.
  */
  scard(key: string): Promise<number>;

  /**
  * @desc: 判读是否是集合中的元素.
  */
  sismember(key: string, value: string): Promise<boolean>;

  /**
  * @desc: 返回集合中的所有成员.
  */
  smembers(key: string): Promise<any>;

  //#endregion

  //#region string 操作

  /**
  * @desc: 设置数据, 会设置默认ttl.
  * @param key: 设置的键.
  * @param value: 设置的值.
  * @param ttl: ttl in second, 如果指定0,则使用默认值. -1则不设置.
  */
  set(key: string, value: any, ttl?: number): Promise<boolean>;

  /**
  * @desc: 获取指定的数据.
  */
  get(key: string): Promise<string>;

  /**
  * @desc: 清理指定的数据.
  */
  del(key: string): Promise<any>;

  /**
  * @desc: key是否存在.
  */
  exists(key: string): Promise<boolean>;

  //#endregion

  
  //#region 事务及批量处理.

  /**
  * @desc: 开始事务.
  * 
  * ```javascript
  *   cache.multi()
  *        .set('key', 'value')
  *        .exec((e, res)=>{ });
  * ```
  */
  multi(): RedisTransaction;

  /**
  * @desc: 获得分布式锁 (redlock).
  * @param resource: 对此字符串进行加锁
  * @param maxTTL2Lock: 最多在此ms时间内保持锁.
  * @return: 
  */
  lock(resource: string, maxTTL2Lock: number): Promise<RedisLock>;

  
  /**
  * @desc: 开始批量处理.
  * 
  * ```javascript
  *   cache.batch()
  *        .set('key', 'value')
  *        .exec((e, res)=>{ });
  * ```
  */
  batch(): RedisBatch;

  //#endregion
}