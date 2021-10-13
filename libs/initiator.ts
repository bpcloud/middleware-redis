'use strict';


/**
* Copyright (c) 2021 Copyright bp All Rights Reserved.
* Author: brian.li
* Date: 2021-03-11 13:13
* Desc: 
*/

import { setLogger } from "./logger";
import { setConfigApp, setFinishCloudConfig } from "./config";
import { RedisTemplate } from "./redis/redisTemplate";

function refreshRemoteEventlistener(ev: any/*: RefreshRemoteEvent*/) {
  setFinishCloudConfig(true);
  RedisTemplate.reconnectAll();
}

export default function (app:any, bpApp:any) {
  bpApp._addRefreshRemoteEventListener(refreshRemoteEventlistener);

  setLogger(() => bpApp.getLogger());
  setConfigApp(bpApp);
  
  return false;
}