import { ServiceContext } from "@vtex/api";
import { Clients } from "../../types";

export async function getStripe(ctx: ServiceContext<Clients>) {
  const {
    clients: {paymentApi}
  } = ctx;
  const { orderId } = ctx.query

  const paymentIntent = await paymentApi.getPaymentIntentByOrderId(ctx, orderId as string)

  return { products: paymentIntent.products }
}
