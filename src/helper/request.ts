export const createUuidOffer = (connectionId: string, uuid: string) => {
    const offer = {
        "auto_remove": true,
        "comment": "Here's your UUID offer",
        "connection_id": connectionId,
        "credential_preview": {
            "@type": "issue-credential/2.0/credential-preview",
            "attributes": [
            {
                "mime-type": "plain/text",
                "name": "uuid", 
                "value": uuid
            }
            ]
        },
        "filter": {
            "indy": {
            "cred_def_id": "6P15ETqMotkRBHzTopo9xW:3:CL:86:default",
                }
            }
        }
    console.log("OFFER")
    console.log(offer)
    console.log(JSON.stringify(offer))
    
    return JSON.stringify(offer);
}

export const createProofRequest = (connectionId: string) => {
    const date = new Date();
    const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
    //Create month with MM format
    const month = date.getMonth() < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
    //Create year with YY format
    const year = (date.getFullYear()-18).toString();

    const eighteenYearsAgoTimestamp = parseInt(`${year}${month}${day}`);
    console.log("connectionId", connectionId)
    console.log("18 years ago timestamp", eighteenYearsAgoTimestamp)
    const currentUnixTimestamp = Math.floor(Date.now() / 1000);

    const request = {
        "auto_remove": true,
        "comment": "Please provide proof of legal age.",
        "connection_id": connectionId,
        "presentation_request": {
          "indy": {
            "name": "Proof of Legal Age",
            "version": "1.0",
            "nonce": "123123124125125123",
            "requested_attributes": {
              
          },
          "requested_predicates":{
              "age_over_18": {
                  "name": "tanggal_lahir_dateint",
                  "p_type": "<",
                  "p_value": eighteenYearsAgoTimestamp,
                  "non_revoked": {
                        "to": currentUnixTimestamp
                    },

                // Use eighteenYearsAgoTimestamp as the value for p_value
                  "restrictions": [
                  {
                      "cred_def_id": "9KFuBaK7Gn9EDbALjS6eVV:3:CL:74:2"  
                  }
                  ]
              }
              
          }
        }
      }
    }

    return JSON.stringify(request)
}