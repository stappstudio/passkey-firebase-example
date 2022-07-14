import { verifyRegistrationResponse } from '@simplewebauthn/server'
import { RegistrationCredentialJSON } from '@simplewebauthn/typescript-types'
import { RP_ID, RP_NAME, ORIGIN } from '../constants'
import { jsonResponseDefaultOptions } from '../helpers'

async function verifyRegistration(
	request: Request,
	challengeKV: KVNamespace
): Promise<Response> {
	// TODO: Is there a better way to save this user id without needing to pass it as query param?
	let url = new URL(request.url);
	let params = url.searchParams;

	let userID = params.get('id');
	
	if (!userID) {
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
	
	let expectedChallenge = await challengeKV.get(userID)

	if (!expectedChallenge) {
		return new Response(
			JSON.stringify({
				"error": "Could not find challenge for user " + userID
			}),
			{
				...jsonResponseDefaultOptions(),
				status: 400,
			}
		)
	}

	let jsonBody: RegistrationCredentialJSON = await request.json()

	try {
		let verification = await verifyRegistrationResponse({
			credential: jsonBody,
			expectedChallenge,
			expectedOrigin: ORIGIN,
			expectedRPID: RP_ID
		})

		return new Response(
			JSON.stringify(verification),
			jsonResponseDefaultOptions()
		);
	}
	catch (error) {
		return new Response(
			JSON.stringify({
				"error": (error instanceof Error) ? error.message : "Unknown Error"
			}),
			{
				...jsonResponseDefaultOptions(),
				status: 400,
			}
		)
	}
}

export { verifyRegistration }