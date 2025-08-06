import { getMongoCredentials } from '../../utils'

export async function getTransfersInfo(context: any): Promise<any> {
  const config = await getMongoCredentials(context)
  const queryParams = new URLSearchParams(context.query)
  const limit = Number(queryParams.get('limit'))
  const offset = Number(queryParams.get('offset'))
  console.log({ limit, offset })
  return context.clients.transfersApi.getTransferInfo({
    sellerId: config.username,
    limit,
    offset,
  })
}
