import { generateRegistrationOptions } from '@simplewebauthn/server'
import { RP_ID, RP_NAME } from '../constants'

async function getRegistrationOptions(
	request: Request
): Promise<Response> {
	let url = new URL(request.url);
	let params = url.searchParams;

	// We need id and name
	let userID = params.get('id');
	let userName = params.get('name');

	if (!userID || !userName) {
		return new Response(
			JSON.stringify({
				"error": "Missing parameters"
			}),
			{
				status: 400,
				headers: {
					'content-type': 'application/json;charset=UTF-8'
				}
			}
		)
	}

	const options = generateRegistrationOptions({
		rpName: RP_NAME,
		rpID: RP_ID,
		userID,
		userName,
		attestationType: 'none',
		challenge: '1234'
	});

	return new Response(
		JSON.stringify(options),
		{
			headers: {
				'content-type': 'application/json;charset=UTF-8'
			}
		}
	);
}

export { getRegistrationOptions }