/// <reference types="node" />

export * from './redisTemplate.d'

interface BpframeworkMiddleware {
  type: string,
  name: string,
  afterRoute: (app:any)=>Promise<boolean>,
  beforeRoute: (app:any)=>Promise<boolean>,
  initiator: (app:any)=>void,
}

export const name: string;

export const middleware: BpframeworkMiddleware;