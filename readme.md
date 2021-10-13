# redis middleware in bpframework.

### Middleware specification

https://github.com/bpcloud/middleware

### usage


#### Setup.

```js
import { Application } from 'bpframework';
import * as middleware_redis from '@bpframework/middleware-redis';

Application.use(middleware_redis.middleware)
Application.runKoa(...);
```

#### Config.

```properties
spring.redis:
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

#### Define Bean.

```js
@Service()
class Configure {
  @Bean()
  redisTemplate(): RedisTemplate {
    return new RedisTemplate("spring.redis");
  }
}
```

#### Use.

```js
@Service()
class RedisService {

  @Autowired("redisTemplate")
  redisTemplate: RedisTemplate;

  async foo(): Promise<string[]> {
    return await this.redisTemplate.keys("*");
  }
}
```
```