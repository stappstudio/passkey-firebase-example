/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

// import { generateRegistrationOptions, verifyRegistrationResponse } from '@simplewebauthn/server'

import { getRegistrationOptions } from './registration/registration_options'
import { verifyRegistration } from './registration/verify_registration'
import { jsonResponseDefaultOptions } from './helpers'

const REGISTER_PATH = '/register'
const REGISTER_OPTIONS_PATH = REGISTER_PATH + '/options'
const VERIFY_REGISTER_PATH = REGISTER_PATH + '/verify'

export interface Env {
	// @ts-ignore
	USER_CHALLENGES: USER_CHALLENGES;
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
}

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext
	): Promise<Response> {
		

		console.log('Running fetch')
		console.log('Request METHOD: ' + request.method)
		if (request.method == 'OPTIONS') {
			return new Response(
				'',
				jsonResponseDefaultOptions()
			);
		}

		let url = new URL(request.url);
		if (request.method == 'GET') {
			if (url.pathname == REGISTER_OPTIONS_PATH) {
				return getRegistrationOptions(request, env.USER_CHALLENGES);
			}
		}

		if (request.method == 'POST') {
			if (url.pathname == VERIFY_REGISTER_PATH) {
				return verifyRegistration(request, env.USER_CHALLENGES);
			}
		}

		// console.log(await request.json());
		return new Response("Hello World!");
	},
};
