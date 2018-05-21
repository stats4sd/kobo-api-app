// ******   YOU DO NOT NEED TO CHANGE THIS FILE DIRECTLY   ******
// it will be copied from config.dev.ts or config.prod.ts automatically
export const config = {
    kobotoolbox: {
        // the server is the full link to the api server (v1)
        // e.g. https://kc.kobotoolbox.org/api/v1
        server: "",
        // a token can be generated from the web insterface at
        // https://kc.kobotoolbox.org/[username]/api-token
        token: "",
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
