import axios from "axios"

const ENTITY = 'wholalogs'
const SCHEMA = 'preorder_sellers'

export async function getSchema(authToken: string, account: string){
  const schema:any = await axios.get(`http://${account}.vtexcommercestable.com.br/api/dataentities/${ENTITY}/schemas/${SCHEMA}`,{
    headers:{
      VtexIdClientAutCookie:authToken
    }
  })
  .then((res)=>{
    return res.data
  })
  .catch((e)=>{
    console.log('error',e.response.data)
    if (e.response.status === 304) {
      return 'true';
    }
    return null
  })
  console.log(schema);

  return schema

}


export async function saveSchema(authToken: string, account: string){
  const schema:any = await axios.put(`http://${account}.vtexcommercestable.com.br/api/dataentities/${ENTITY}/schemas/${SCHEMA}`,
  {
    properties: {
      orderId: {
        type: 'string',
        title: 'Vtex Order Id',
      },
      message: {
        type: 'string',
        title: 'Message',
      },
      body: {
        type: 'string',
        title: 'Body',
      },
    },
    'v-indexed': ['orderId'],
    'v-security': {
      allowGetAll: false,
      publicRead: ['id', 'orderId', 'message', 'body'],
      publicWrite: ['orderId', 'message', 'body'],
      publicFilter: ['orderId', 'message', 'body'],
    },
  }
  ,{
    headers:{
      VtexIdClientAutCookie:authToken
    }
  })
  .then((res)=>{
    return res.data
  })
  .catch((e)=>{
    console.log('error',e.response.data)
    return null
  })
  console.log(schema);

  return schema

}


export async function createDocument(ctx:any,log:{
  orderId: string | null;
  message: string | null;
  body: string | null;
}){
  const {
    vtex:{
      authToken, account
    }
  } = ctx
  const schema:any = await axios.post(`http://${account}.vtexcommercestable.com.br/api/dataentities/${ENTITY}/documents?_schema=${SCHEMA}`,
  {
    orderId: log.orderId ?? '',
    message: log.message ?? '',
    body: log.body ?? '',
  }
  ,{
    headers:{
      VtexIdClientAutCookie:authToken
    }
  })
  .then((res)=>{
    return res.data
  })
  .catch((e)=>{
    console.log('error',e.response.data)
    return null
  })
  console.log(schema);

  return schema

}
