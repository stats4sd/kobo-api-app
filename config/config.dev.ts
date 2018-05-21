// example dev config file
export const config = {
    kobotoolbox: {
        // the server is the full link to the api server (v1)
        // e.g. https://kc.kobotoolbox.org/api/v1
        server: "https://kc.kobotoolbox.org/api/v1",
        // a token can be generated from the web insterface at
        // https://kc.kobotoolbox.org/[username]/api-token
        token: "da5a8cd8039b56319c26e9c2e7a2abb0495168be",
        // alternatively you can use username/pass
        username:"",
        password:""
    },
    pg:{
        db_name:"",
        username:"",
        host:"",
        password:"",
        port:null
    }
}