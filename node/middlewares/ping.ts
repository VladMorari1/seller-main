import { ServiceContext } from "@vtex/api"
import { Clients } from "../types"

export async function pong (ctx: ServiceContext<Clients>) {
    ctx.status = 200
    ctx.body = { response: 'pong' }

    return
}
