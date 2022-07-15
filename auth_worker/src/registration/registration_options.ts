import { generateRegistrationOptions } from '@simplewebauthn/server'
import { RP_ID, RP_NAME } from '../constants'
import { jsonResponseDefaultOptions } from '../helpers'

async function getRegistrationOptions(
	request: Request,
	challengeKV: KVNamespace
): Promise<Response> {
	let url = new URL(request.url);
	let params = url.searchParams;

	// We need id and name because simplewebauthn/server requires both of them
	let userID = params.get('id');
	let userName = params.get('name');

	if (!userID || !userName) {
		return new Response(
			JSON.stringify({
				"error": "Missing parameters"
			}),
			{
				...jsonResponseDefaultOptions(),
				status: 400,
			}
		)
	}

	// Because of workers runtime being different than node runtime,
	//     the built-in challenge generation on simplewebauthn/server does not work
	// So, we create our own challenge with the same entropy 
	// https://github.com/MasterKale/SimpleWebAuthn/blob/master/packages/server/src/helpers/generateChallenge.ts
	let baseArray = new Int8Array(32)
	let challenge = crypto.getRandomValues(baseArray)

	const options = generateRegistrationOptions({
		rpName: RP_NAME,
		rpID: RP_ID,
		userID,
		userName,
		attestationType: 'none',
		challenge: challenge
	});

	// Save challenge
	await challengeKV.put(userID, options.challenge)

	return new Response(
		JSON.stringify(options),
		jsonResponseDefaultOptions()
	);
}

export { getRegistrationOptions }