import { makeRouteHandler } from '@keystatic/next/route-handler';
import config from '../../../../keystatic.config';

const enabled = process.env.NODE_ENV !== 'production' || !!process.env.KEYSTATIC_ENABLE;
const handler = makeRouteHandler({ config });
const off = () => new Response('Not found', { status: 404 });

export const GET = enabled ? handler.GET : off;
export const POST = enabled ? handler.POST : off;
