'use strict';

/**
* Copyright (c) 2021 Copyright bp All Rights Reserved.
* Author: brian.li
* Date: 2021-04-09 15:26
* Desc: 
*/

const SYM_LOGGER = Symbol('SYM_LOGGER');


export function getLogger():{
  error(...msg:any[]): any
  info(...msg:any[]): any
  warn(...msg:any[]): any
  debug(...msg:any[]): any
} {
  let l = (global as any)[SYM_LOGGER];
  if (l) {
    return l();
  } else {
    return {
      error: console.error,
      info: console.log,
      warn: console.warn,
      debug: console.debug,
    }
  }
}

export function setLogger(logger: any) {
  (global as any)[SYM_LOGGER] = logger;
}
