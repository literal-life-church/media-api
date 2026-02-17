import { Obj, Str } from "chanfana";

export const AuthSignatureDomainModel = Obj({
    "AZ": Str({
        example: "Bearer abc123",
        description: "The SHA256 HMAC signature for the request. This should be included in the `Authorization` header as a `Bearer token`. It is calculated by creating a SHA256 HMAC signature of the request body, using a shared secret key, and then encoding the result in base64 format. Try it with an online tool, the [HMAC Generator](https://www.magicbell.com/tools/hmac-generator). When doing this by hand, you'll want a JSON body that doesn't have any unnecessary whitespace, as that will change the signature. You can paste your payload over [here](https://jsonformatter.org/) and use the *Minify/Compact* button before piping the output into the [HMAC Generator](https://www.magicbell.com/tools/hmac-generator).",
        required: true
    }),
}, {
    description: "The request's bearer token, which includes the SHA256 HMAC signature for the request.",
});
