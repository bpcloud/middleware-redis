'use strict';

/**
* Copyright (c) 2021 Copyright bp All Rights Reserved.
* Author: brian.li
* Date: 2021-04-09 18:37
* Desc: 
*/


const SYM_APP = Symbol('SYM_APP');


export function getConfig():{ readonly [key: string]: any } {
  let l = (global as any)[SYM_APP];
  if (l) {
    return l.getConfig();
  } else {
    return {
    }
  }
}

export function setConfigApp(app: any) {
  (global as any)[SYM_APP] = app;
}
