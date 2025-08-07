import { Apps } from '@vtex/api'
import { AxiosBasicCredentials } from 'axios'

import type { VTEXContext } from '../types'

interface PreOrderAppSettings {
  api__accessToken: string
  stripe_account_id: string
  notifications__emailList: string[]
}

export async function getVtexAppSettings(
  ctx: VTEXContext,
  account?:string
): Promise<PreOrderAppSettings> {
  const apps = new Apps(ctx.vtex)

  const settings = await apps.getAppSettings(ctx.vtex.userAgent)
  // TODO: delete this code
  // if(account==='Etikette'||account==='etikette'){
  //   return {...settings, stripe_account_id:'acct_1OKDt4CnFxLsVZLw'}
  // }

  console.log(account);
  return settings
}

export async function getMongoCredentials(
  context: VTEXContext
): Promise<AxiosBasicCredentials> {
  const username = context.vtex.account
  const { api__accessToken: password } = await getVtexAppSettings(context)

  let updatedName=username
  // TODO: delete this code
  // if(username==='etikette'){
  //   updatedName= username.charAt(0).toUpperCase() + username.slice(1);
  // }

  return {
    username:updatedName,
    password,
  }
}
