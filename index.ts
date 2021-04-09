'use strict';

/**
* Copyright (c) 2021 Copyright bp All Rights Reserved.
* Author: brian.li
* Date: 2021-03-11 13:53
* Desc: 
*/

import initiator from './libs/initiator';

export {RedisTemplate} from './libs/redis/redisTemplate'

export const name = "middleware-redis";

export const middleware = {
  type: 'koa',
  name: exports.name,
  initiator,
}