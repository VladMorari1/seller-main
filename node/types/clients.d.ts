import type { Context, EventContext, ServiceContext } from '@vtex/api'

import type { Clients } from '../clients'

export type { Clients }

export type VTEXContext =
  | Context<Clients>
  | EventContext<Clients>
  | ServiceContext<Clients>
