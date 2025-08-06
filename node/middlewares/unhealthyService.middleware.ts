import { json } from "co-body"
import { getSchema } from "../utils/masterdata"
import { addLog } from "../utils/logs"

export async function unhealthyServiceCheck(ctx: any){
const body = await json(ctx.req)
const {
  vtex:{account, authToken}
} = ctx
const schema = await getSchema(authToken,account)
  console.log('body',body)
  const result = await addLog(ctx, {orderId: "test",
    message: 'On Ready for handling hook called!',
    body:JSON.stringify('test')})
  // ctx.body = order
  // ctx.status = 200
  return {message:'Already Awake',schema,result}
}
