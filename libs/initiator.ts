'use strict';


/**
* Copyright (c) 2021 Copyright bp All Rights Reserved.
* Author: brian.li
* Date: 2021-03-11 13:13
* Desc: 
*/

import { setLogger } from "./logger";
import { setConfigApp } from "./config";
import { RedisTemplate } from "./redis/redisTemplate";

function refreshRemoteEventlistener(ev: any/*: RefreshRemoteEvent*/) {
  RedisTemplate.reconnectAll();
}

export default function (app:any) {
  app._addRefreshRemoteEventListener(refreshRemoteEventlistener);

  setLogger(() => app.getLogger());
  setConfigApp(app);
}