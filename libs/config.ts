'use strict';

/**
* Copyright (c) 2021 Copyright bp All Rights Reserved.
* Author: brian.li
* Date: 2021-04-09 18:37
* Desc: 
*/


const SYM_APP = Symbol('SYM_APP');
const SYM_FINISH_CLOUDCONFIG = Symbol('SYM_FINISH_CLOUDCONFIG');

export function isFinishCloudConfig(): boolean {
  return !!(global as any)[SYM_FINISH_CLOUDCONFIG];
}

export function setFinishCloudConfig(finish: boolean): void {
  (global as any)[SYM_FINISH_CLOUDCONFIG] = finish;
}

export function isUseCloudConfig(): boolean|undefined {
  let l = (global as any)[SYM_APP];
  if (l) {
    return l.isCloudConfig();
  } else {
    return undefined;
  }
}

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
