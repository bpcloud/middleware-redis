'use strict';

/**
* Copyright (c) 2017 Copyright tj All Rights Reserved.
* Author: lipengxiang
* Date: 2018-11-16
* Desc: redis操作.
*/


import * as febs from 'febs';
import * as IORedis from 'ioredis';
import { CacheTransaction } from './transaction';
import { CacheBatch } from './batch';
import { CacheLock } from './lock';
import { getLogger } from '../logger';
import { getConfig } from '../config';

const TTL_tolerance = 10; // ttl时间增加这个抖动范围.
export const TTL_default = 60 * 5; // 默认5分钟.


/**
* @desc: 
*   1. 批量语句.
*         cache.batch()
               .set(...)
               .get(...)
               .exec((err, res)=>{});
*   2. 事务语句.
*         cache.multi()
               .set(...)
               .get(...)
               .exec((err, res)=>{});
            or .discard();
*/
export class RedisTemplate {

  private redis_ttl:number;
  private redis:IORedis.Redis|IORedis.Cluster;
  private cfg:any;
  private ttl_tolerance: number;
  private configMapPrefix: string;

  private static instances: RedisTemplate[] = [];

  public static reconnectAll() {
    for (let i = 0; i < this.instances.length; i++) {
      this.instances[i].reconnect().then();
    }
  }

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
  constructor(...args: any[]) {
    RedisTemplate.instances.push(this);
    let cfg: any;
    if (args.length == 0 || typeof args[0] === 'string') {

      let configMapPrefix: string = args[0] ? args[0] : 'spring.redis';
      cfg = this.readCfgFromConfig(configMapPrefix);
      this.configMapPrefix = configMapPrefix;
    } else {
      cfg = args[0];
    }

    let cfgg: {
      host?: string,
      port?: number,
      clusterServers?: { host: string, port: number }[],
      db: number,
      password: string,
      ttl: number,
      connectTimeout?: number,
    } = {db: cfg.db, password: cfg.password, ttl: cfg.ttl||TTL_default};
    
    cfgg.connectTimeout = cfg.conn_timeout || 0;
    this.ttl_tolerance = febs.utils.isNull(cfg.ttl_tolerance) ? TTL_tolerance : cfg.ttl_tolerance;

    (<any>cfgg).reconnectOnError = ()=>1;
    this.cfg = cfgg;
  }

  private readCfgFromConfig(configMapPrefix: string): any {
    let cfg: any;
    let configs = getConfig();
      
    let config = configs[configMapPrefix];
    if (!config) {
      throw new febs.exception(`config '${configMapPrefix}' miss`, febs.exception.ERROR, __filename, __line, __column);
    }

    cfg = {};
    cfg.db = config.database || 0;
    cfg.password = config.password;
    cfg.conn_timeout = config.timeout || 0;
    cfg.ttl = config.defaultTtl || TTL_default;
    cfg.ttl_tolerance = config.defaultTtlTolerance || TTL_tolerance;

    if (!Array.isArray(config.nodes)) {
      throw new febs.exception(`config '${configMapPrefix}.nodes' miss`, febs.exception.ERROR, __filename, __line, __column);
    }
      
    cfg.clusterServers = [] as any[];
    for (let i = 0; i < config.nodes.length; i++) {
      let host = {
        host: config.nodes[i].host,
        port: config.nodes[i].port,
      };
      if (typeof host.host !== 'string' || !Number.isInteger(host.port)) {
        throw new febs.exception(`config '${configMapPrefix}.nodes' error`, febs.exception.ERROR, __filename, __line, __column);
      }
      cfg.clusterServers.push(host);
    }
    return cfg;
  }

  async reconnect(): Promise<void> {

    if (!this.configMapPrefix)
      return;

    let cfg = this.readCfgFromConfig(this.configMapPrefix);

    let cfgg: {
      host?: string,
      port?: number,
      clusterServers?: { host: string, port: number }[],
      db: number,
      password: string,
      ttl: number,
      connectTimeout?: number,
    } = { db: cfg.db, password: cfg.password, ttl: cfg.ttl || TTL_default };
    
    cfgg.connectTimeout = cfg.conn_timeout || 0;
    this.ttl_tolerance = febs.utils.isNull(cfg.ttl_tolerance) ? TTL_tolerance : cfg.ttl_tolerance;

    (<any>cfgg).reconnectOnError = () => 1;
    
    if (this.cfg.host == cfgg.host
      && this.cfg.port == cfgg.port
      && this.cfg.db == cfgg.db
      && this.cfg.password == cfgg.password
      && this.cfg.ttl == cfgg.ttl
      && this.cfg.connectTimeout == cfgg.connectTimeout) {
      if ((!!this.cfg.clusterServers) == (!!cfgg.clusterServers)) {
        if (!this.cfg.clusterServers) {
          return
        }

        if (this.cfg.clusterServers.length == cfgg.clusterServers.length) {
          let i = 0
          for (; i < cfgg.clusterServers.length; i++) {
            if (cfgg.clusterServers[i].host != this.cfg.clusterServers[i].host
              || cfgg.clusterServers[i].port != this.cfg.clusterServers[i].port) {
              break;
            }
          }
          if (i >= cfgg.clusterServers.length) {
            return;
          }
        }
      }
    }

    this.cfg = cfgg;
    await this.connect();
  }
  
  /**
  * @desc: connect
  */
  private async connect():Promise<void> {

    let useCluster = false;

    let connectInfo = '';
    if (this.cfg.host) {
      connectInfo = this.cfg.host + ':' + this.cfg.port;
    }
    else {
      useCluster = true;
      this.cfg.clusterServers.forEach((element:any) => {
        connectInfo += `${element.host}:${element.port},`;
      });
    }

    return new Promise((resolve:any, reject:any)=>{
      this.dispose()
        .then((res:any) => {
          this.redis_ttl = this.cfg.ttl;
          if (useCluster) {
            this.redis = new IORedis.Cluster(this.cfg.clusterServers, {scaleReads:'slave', ...this.cfg});
          }
          else {
            this.redis = new IORedis(this.cfg);
          }
          this.redis.on('error', (e:any) => {
            getLogger().error('[Redis error]: ', e);
          });

          let on_connect = ()=>{
            getLogger().info('[Redis connected]: ' + `${connectInfo}`);
          }
          this.redis.once('connect', ()=>{
            on_connect();
            resolve();
            this.redis.on('connect', on_connect);
          });
          this.redis.on('reconnecting', ()=>{
            getLogger().warn('[Redis reconnect]: ' + `${connectInfo}`);
          });
        });
    });
  }

  /**
  * @desc: 退出redis连接.
  */
  private async dispose():Promise<string> {
    if (this.redis) {
      return this.redis.quit();
    } else {
      return new Promise((resolve, reject) => { resolve(null); });
    }
  }

  /**
  * @desc: 设置指定键的超时时间.
  * @param ttl: 秒数; 不指定, 则使用默认的值.
  */
  async expire(key:string, ttl?:number):Promise<boolean> {
    let tolerance = Math.floor(Math.random() * this.ttl_tolerance);

    return this.masterNode.expire(key, ttl?ttl:(this.redis_ttl + tolerance))
    .then((res:any)=>{
      return !!res;
    })
  }

  /**
  * @desc: 移除指定key的ttl.
  */
  async persist(key:string):Promise<boolean> {
    return this.masterNode.persist(key)
    .then((res:any)=>{
      return true;
    })
    .catch((e:any)=>{
      return false;
    });
  }
  
  /**
  * @desc: 获取指定key的剩余过期时间 (秒).
  * @return: 
  */
  async ttl(key:string):Promise<number> {
    return await this.masterNode.ttl(key);
  }

  /**
  * @desc: 列出匹配的keys.
  */
  async keys(pattern:string):Promise<string[]> {
    return this.masterNode.keys(pattern);
  }

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
  async hset(key:string, field:string, value:any):Promise<boolean> {
    return this.masterNode.hset(key, field, value)
      .then((res:any) => {
        return true;
      })
      .catch((e:any)=>{
        return false;
      });
  }

  /**
  * @desc: 获取hash表指定的数据.
  */
  async hget(key:string, field:string):Promise<string> {
    return this.slaveNode.hget(key, field);
  };

  /**
  * @desc: 获取hash表的keys.
  */
  async hkeys(key:string):Promise<string[]> {
    return this.slaveNode.hkeys(key);
  }

  /**
  * @desc: 清理hash表指定的数据.
  */
  async hdel(key:string, ...fields:string[]):Promise<any> {
    return this.masterNode.hdel(key, ...fields);
  };

  /**
  * @desc: 指定的额feild是否存在.
  */
  async hexists(key:string, field:string):Promise<boolean> {
    return this.slaveNode.hexists(key, field).then((res:any)=>!!res);
  }

  //#endregion

  //#region 集合操作

  /**
  * @desc: 在集合中插入值.
  */
  async sadd(key:string, value:string):Promise<any> {
    return this.masterNode.sadd(key, value);
  }

  /**
  * @desc: 在集合中移除指定成员.
  */
  async sremove(key:string, ...values:string[]):Promise<any> {
    return this.masterNode.srem(key, ...values);
  }

  /**
  * @desc: 返回集合中的元素个数.
  */
  async scard(key:string):Promise<number> {
    return this.slaveNode.scard(key);
  }

  /**
  * @desc: 判读是否是集合中的元素.
  */
  async sismember(key:string, value:string):Promise<boolean> {
    return this.slaveNode.sismember(key, value).then((res:any)=>!!res);
  }

  /**
  * @desc: 返回集合中的所有成员.
  */
  async smembers(key:string):Promise<any> {
    return this.slaveNode.smembers(key);
  }

  //#endregion

  //#region string 操作

  /**
  * @desc: 设置数据, 会设置默认ttl.
  * @param key: 设置的键.
  * @param value: 设置的值.
  * @param ttl: ttl in second, 如果指定0,则使用默认值. -1则不设置.
  */
  async set(key:string, value:any, ttl:number = 0):Promise<boolean> {
    ttl = ttl || this.redis_ttl + Math.floor(Math.random() * this.ttl_tolerance);
    if (ttl == -1) {
      return this.masterNode.set(key, value).then((res:any)=>!!res);
    }
    else {
      return this.masterNode.set(key, value, 'EX', ttl).then((res:any)=>!!res);
    }
  }

  /**
  * @desc: 获取指定的数据.
  */
  async get(key:string):Promise<string> {
    return this.slaveNode.get(key);
  };

  /**
  * @desc: 清理指定的数据.
  */
  async del(key:string):Promise<any> {
    return this.masterNode.del(key);
  };

  /**
  * @desc: key是否存在.
  */
  async exists(key:string):Promise<boolean> {
    return this.slaveNode.exists(key).then((res:any)=>!!res);
  }

  //#endregion


  //#region 事务.

  /**
  * @desc: 开始事务.
  *   cache.multi()
  *        .set('key', 'value')
  *        .exec((e, res)=>{ });
  */
  multi(): CacheTransaction {
    return new CacheTransaction(this.masterNode.multi(), this.redis_ttl, this.ttl_tolerance);
  }

  /**
  * @desc: 获得分布式锁 (redlock).
  * @param resource: 对此字符串进行加锁
  * @param maxTTL2Lock: 最多在此ms时间内保持锁.
  * @return: 
  */
  async lock(resource:string, maxTTL2Lock:number):Promise<CacheLock> {
    if (this.redis instanceof IORedis.Cluster) {
      return await (new CacheLock(this.redis.nodes('master')))._lock(resource, maxTTL2Lock);
    }
    else {
      return await (new CacheLock(this.masterNode))._lock(resource, maxTTL2Lock);
    }
  }

  //#endregion



  //#region 批量处理.

  /**
  * @desc: 开始事务.
  *   cache.batch()
  *        .set('key', 'value')
  *        .exec((e, res)=>{ });
  */
  batch(): CacheBatch {
    return new CacheBatch(this.masterNode.pipeline(), this.redis_ttl, this.ttl_tolerance);
  }

  //#endregion


  private get masterNode() {
    if (this.redis instanceof IORedis.Cluster) {
      let nodes = this.redis.nodes('master');
      return nodes[(Math.floor(Math.random()*nodes.length))%nodes.length];
    }
    else {
      return this.redis;
    }
  }

  private get slaveNode() {
    if (this.redis instanceof IORedis.Cluster) {
      let nodes = this.redis.nodes('slave');
      return nodes[(Math.floor(Math.random()*nodes.length))%nodes.length];
    }
    else {
      return this.redis;
    }
  }
}