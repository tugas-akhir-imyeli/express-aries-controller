import axios from 'axios';

export const getInvitation = async () => {
    const response = await axios.post(`${process.env.ARIES_URL}/out-of-band/create-invitation`, {
        "handshake_protocols": [
            "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/didexchange/1.0"
        ],
        "auto_accept": "auto"
    });
    const invitation = response.data.invitation;
 
    return JSON.stringify(invitation);
}